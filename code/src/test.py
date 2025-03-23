# import os
# import pandas as pd
# from faker import Faker
# import random
# from datetime import datetime, timedelta
# from dateutil.relativedelta import relativedelta

# fake = Faker()
# random.seed(42)
# Faker.seed(42)

# def generate_historical_data(num_entities=100, num_transactions=200):
#     primary_accounts = ["ALL LOB LOANS", "COMMERCIAL LOANS", "RETAIL LOANS"]
#     secondary_accounts = ["DEFERRED COSTS", "PRINCIPAL", "INTEREST RECEIVABLE"]
#     data = []
    
#     # Define a one-year period for historical data
#     end_date = datetime.now() - relativedelta(days=1)
#     start_date = end_date - relativedelta(years=1)
#     total_days = (end_date - start_date).days  # ~365 days
    
#     for _ in range(num_entities):
#         company = fake.company()
#         account_number = random.randint(100, 999)
#         au = random.randint(1000, 9999)
#         primary_account = random.choice(primary_accounts)
#         secondary_account = random.choice(secondary_accounts)
#         base_balance = random.randint(20000, 100000)
        
#         # Generate exactly num_transactions random days in the period
#         transaction_days = sorted(random.sample(range(total_days), num_transactions))
        
#         for day_offset in transaction_days:
#             current_date = start_date + timedelta(days=day_offset)
#             as_of_date = current_date.strftime('%d-%m-%Y')
            
#             gl_balance = base_balance * random.uniform(0.9, 1.1)
#             gl_balance = int(round(gl_balance, -3))
            
#             # Use 60% chance to generate a "Break" (non-zero difference)
#             if random.random() < 0.6:
#                 ihub_balance = gl_balance * random.uniform(0.7, 1.3)
#                 ihub_balance = int(round(ihub_balance, -3))
#             else:
#                 ihub_balance = gl_balance
            
#             data.append({
#                 "As of Date": as_of_date,
#                 "Company": company,
#                 "Account": account_number,
#                 "AU": au,
#                 "Currency": "USD",
#                 "Primary Account": primary_account,
#                 "Secondary Account": secondary_account,
#                 "GL Balance": gl_balance,
#                 "iHub Balance": ihub_balance
#             })
#     return pd.DataFrame(data)

# # Define the output file path
# output_file = 'historical_reconciliation_data_001.csv'

# # If file exists, load it; otherwise generate and save
# if os.path.exists(output_file):
#     historical_df = pd.read_csv(output_file, parse_dates=['As of Date'], dayfirst=True)
#     print(f"File '{output_file}' already exists. Data loaded. Historical data shape: {historical_df.shape}")
# else:
#     historical_df = generate_historical_data(num_entities=100, num_transactions=200)
#     historical_df['Date'] = pd.to_datetime(historical_df['As of Date'], dayfirst=True)
#     historical_df = historical_df[historical_df['Date'] < datetime.now()].drop(columns='Date')
#     historical_df.to_csv(output_file, index=False)
#     print("Historical data generated and saved to '{}'.".format(output_file))

# # Continue with your further processing...


# ######################################################################

# import os
# import pandas as pd
# import random
# from datetime import datetime, timedelta

# def generate_realtime_data(historical_df):
#     realtime_data = []
#     entity_cols = ["Company", "Account", "AU", "Primary Account", "Secondary Account"]
#     unique_entities = historical_df[entity_cols].drop_duplicates()
    
#     # Use tomorrow's date as the real-time date
#     realtime_date = (datetime.now() + timedelta(days=1)).strftime('%d-%m-%Y')
    
#     for _, row in unique_entities.iterrows():
#         base_balance = random.randint(20000, 100000)
#         gl_balance = base_balance * random.uniform(0.9, 1.1)
#         gl_balance = int(round(gl_balance, -3))
        
#         # Here we use a 50% chance to simulate a perturbed transaction (anomaly) in real-time
#         if random.random() < 0.5:
#             ihub_balance = gl_balance * random.uniform(0.7, 1.3)
#             ihub_balance = int(round(ihub_balance, -3))
#         else:
#             ihub_balance = gl_balance
        
#         realtime_data.append({
#             "As of Date": realtime_date,
#             "Company": row["Company"],
#             "Account": row["Account"],
#             "AU": row["AU"],
#             "Currency": "USD",
#             "Primary Account": row["Primary Account"],
#             "Secondary Account": row["Secondary Account"],
#             "GL Balance": gl_balance,
#             "iHub Balance": ihub_balance
#         })
#     return pd.DataFrame(realtime_data)

# # Define the realtime output file path
# realtime_file = 'realtime_reconciliation_data_001.csv'

# # Check if file exists; if so, read it; otherwise, generate and save the realtime data
# if os.path.exists(realtime_file):
#     realtime_df = pd.read_csv(realtime_file, parse_dates=['As of Date'], dayfirst=True)
#     print(f"File '{realtime_file}' already exists. Real-time data loaded. Shape: {realtime_df.shape}")
# else:
#     realtime_df = generate_realtime_data(historical_df)
#     realtime_df.to_csv(realtime_file, index=False)
#     print(f"Real-time data generated and saved to '{realtime_file}'.")



# ######################################################################
# # ---------------------------------
# # Data Upload or Generation Options
# # ---------------------------------

# def get_historical_data(historical_path=None):
#     """
#     If a valid historical_path is provided, load the data.
#     Otherwise, generate synthetic historical data.
#     """
#     if historical_path and os.path.exists(historical_path):
#         historical_df = pd.read_csv(historical_path, parse_dates=['As of Date'], dayfirst=True)
#         print(f"Historical data loaded from '{historical_path}'. Shape: {historical_df.shape}")
#     else:
#         print("No valid historical data file provided. Generating synthetic historical data.")
#         historical_df = generate_historical_data(num_entities=100, num_transactions=200)
#         # Convert date column and filter if needed
#         historical_df['Date'] = pd.to_datetime(historical_df['As of Date'], dayfirst=True)
#         historical_df = historical_df[historical_df['Date'] < datetime.now()].drop(columns='Date')
#         # Optionally, save the generated data for future use
#         output_file = 'historical_reconciliation_data_001.csv'
#         historical_df.to_csv(output_file, index=False)
#         print(f"Synthetic historical data generated and saved to '{output_file}'.")
#     return historical_df

# def get_realtime_data(historical_df, realtime_path=None):
#     """
#     If a valid realtime_path is provided, load the data.
#     Otherwise, generate synthetic realtime data based on historical_df.
#     """
#     if realtime_path and os.path.exists(realtime_path):
#         realtime_df = pd.read_csv(realtime_path, parse_dates=['As of Date'], dayfirst=True)
#         print(f"Real-time data loaded from '{realtime_path}'. Shape: {realtime_df.shape}")
#     else:
#         print("No valid real-time data file provided. Generating synthetic real-time data.")
#         realtime_df = generate_realtime_data(historical_df)
#         output_file = 'realtime_reconciliation_data_001.csv'
#         realtime_df.to_csv(output_file, index=False)
#         print(f"Synthetic real-time data generated and saved to '{output_file}'.")
#     return realtime_df

# ######################################################################

# from sklearn.ensemble import IsolationForest
# from sklearn.preprocessing import StandardScaler

# # Compute Balance Difference in historical data
# historical_df['Balance Difference'] = historical_df['GL Balance'] - historical_df['iHub Balance']

# # Define entity grouping columns
# group_cols = ['Company', 'Account', 'AU', 'Primary Account', 'Secondary Account']

# # Train a model for each entity (only if there are at least 5 transactions)
# entity_models = {}
# for key, group in historical_df.groupby(group_cols):
#     if len(group) >= 5:
#         group = group.sort_values(by='As of Date')
#         features = group[['GL Balance', 'iHub Balance', 'Balance Difference']].copy()
#         scaler = StandardScaler()
#         features_scaled = scaler.fit_transform(features)
#         model = IsolationForest(contamination=0.01, random_state=42)
#         model.fit(features_scaled)
#         entity_models[key] = {'model': model, 'scaler': scaler}
# print("Trained models for", len(entity_models), "entities.")


# ######################################################################

# def predict_anomaly(new_entry, entity_models):
#     key = (
#         new_entry['Company'],
#         new_entry['Account'],
#         new_entry['AU'],
#         new_entry['Primary Account'],
#         new_entry['Secondary Account']
#     )
#     if key not in entity_models:
#         return "No historical data", None
    
#     scaler = entity_models[key]['scaler']
#     model = entity_models[key]['model']
#     balance_diff = new_entry['GL Balance'] - new_entry['iHub Balance']
    
#     # Prepare feature DataFrame with proper column names
#     feature_df = pd.DataFrame({
#         'GL Balance': [new_entry['GL Balance']],
#         'iHub Balance': [new_entry['iHub Balance']],
#         'Balance Difference': [balance_diff]
#     })
#     features_scaled = scaler.transform(feature_df)
#     anomaly_score = model.decision_function(features_scaled)[0]
#     prediction = model.predict(features_scaled)[0]
#     predicted_label = "Anomaly" if prediction == -1 else "Normal"
#     return predicted_label, anomaly_score

# # Evaluate each real-time transaction
# realtime_predictions = []
# for _, row in realtime_df.iterrows():
#     new_entry = {
#         'Company': row['Company'],
#         'Account': row['Account'],
#         'AU': row['AU'],
#         'Primary Account': row['Primary Account'],
#         'Secondary Account': row['Secondary Account'],
#         'GL Balance': row['GL Balance'],
#         'iHub Balance': row['iHub Balance']
#     }
#     label, score = predict_anomaly(new_entry, entity_models)
#     realtime_predictions.append({
#         'Company': row['Company'],
#         'Account': row['Account'],
#         'AU': row['AU'],
#         'Primary Account': row['Primary Account'],
#         'Secondary Account': row['Secondary Account'],
#         'predicted_label': label,
#         'anomaly_score': score
#     })

# pred_df = pd.DataFrame(realtime_predictions)
# print(pred_df.head(10))


# # Count predictions
# counts = pred_df['predicted_label'].value_counts()
# print("Real-Time Prediction Counts:")
# print(counts)

# # Print anomaly score summary statistics
# print("Anomaly Scores Summary:")
# print(pred_df['anomaly_score'].describe())

# ######################################################################

import requests
print(requests.get("https://huggingface.co").status_code)
