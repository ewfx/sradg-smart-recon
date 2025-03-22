import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def train_entity_models(historical_df):
    # Compute Balance Difference in historical data
    historical_df['Balance Difference'] = historical_df['GL Balance'] - historical_df['iHub Balance']
    
    # Define entity grouping columns (using historical columns as well)
    group_cols = ['Company', 'Account', 'AU', 'Primary Account', 'Secondary Account']
    
    entity_models = {}
    for key, group in historical_df.groupby(group_cols):
        if len(group) >= 5:
            group = group.sort_values(by='As of Date')
            features = group[['GL Balance', 'iHub Balance', 'Balance Difference']].copy()
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            model = IsolationForest(contamination=0.01, random_state=42)
            model.fit(features_scaled)
            entity_models[key] = {'model': model, 'scaler': scaler}
    print("Trained models for", len(entity_models), "entities.")
    return entity_models

def predict_anomaly(new_entry, entity_models):
    key = (
        new_entry['Company'],
        new_entry['Account'],
        new_entry['AU'],
        new_entry['Primary Account'],
        new_entry['Secondary Account']
    )
    if key not in entity_models:
        return "No historical data", None
    
    scaler = entity_models[key]['scaler']
    model = entity_models[key]['model']
    balance_diff = new_entry['GL Balance'] - new_entry['iHub Balance']
    
    feature_df = pd.DataFrame({
        'GL Balance': [new_entry['GL Balance']],
        'iHub Balance': [new_entry['iHub Balance']],
        'Balance Difference': [balance_diff]
    })
    features_scaled = scaler.transform(feature_df)
    anomaly_score = model.decision_function(features_scaled)[0]
    prediction = model.predict(features_scaled)[0]
    predicted_label = "Anomaly" if prediction == -1 else "Normal"
    return predicted_label, anomaly_score
