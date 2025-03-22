import argparse
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models, predict_anomaly
import pandas as pd

def main(historical_path=None, realtime_path=None):
    # Load or generate historical data
    historical_df = get_historical_data(historical_path)
    
    # Load or generate real-time data
    realtime_df = get_realtime_data(historical_df, realtime_path)
    
    # Train anomaly detection models on historical data
    entity_models = train_entity_models(historical_df)
    
    # Predict anomaly for each real-time entry
    realtime_predictions = []
    for _, row in realtime_df.iterrows():
        new_entry = {
            'Company': row['Company'],
            'Account': row['Account'],
            'AU': row['AU'],
            'Primary Account': row['Primary Account'],
            'Secondary Account': row['Secondary Account'],
            'GL Balance': row['GL Balance'],
            'iHub Balance': row['iHub Balance']
        }
        label, score = predict_anomaly(new_entry, entity_models)
        realtime_predictions.append({
            'Company': row['Company'],
            'Account': row['Account'],
            'AU': row['AU'],
            'Primary Account': row['Primary Account'],
            'Secondary Account': row['Secondary Account'],
            'predicted_label': label,
            'anomaly_score': score
        })
    
    pred_df = pd.DataFrame(realtime_predictions)
    print("Sample Predictions:")
    print(pred_df.head(10))
    print("\nReal-Time Prediction Counts:")
    print(pred_df['predicted_label'].value_counts())
    print("\nAnomaly Scores Summary:")
    print(pred_df['anomaly_score'].describe())

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reconciliation Anomaly Detection Pipeline")
    parser.add_argument("--historical_path", type=str, default=None, help="Path to historical data CSV file")
    parser.add_argument("--realtime_path", type=str, default=None, help="Path to real-time data CSV file")
    args = parser.parse_args()
    
    main(args.historical_path, args.realtime_path)
