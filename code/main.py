import argparse
import pandas as pd
import os
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models, predict_anomaly
from src.mapping import map_anomaly_to_bucket
from src.insights import generate_insights
from src.config import DATA_DIR, ANOMALY_BUCKETS
from src.insights_hf import generate_insight_for_row_hf

def main(historical_path=None, realtime_path=None):
    # Load or generate historical data
    historical_df = get_historical_data(historical_path)
    
    # Load or generate real-time data
    realtime_df = get_realtime_data(historical_df, realtime_path)
    
    # Train anomaly detection models on historical data
    entity_models = train_entity_models(historical_df)
    
    # Predict anomaly for each real-time entry and collect predictions
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
        prediction = {
            'Company': row['Company'],
            'Account': row['Account'],
            'AU': row['AU'],
            'Primary Account': row['Primary Account'],
            'Secondary Account': row['Secondary Account'],
            'GL Balance': row['GL Balance'],
            'iHub Balance': row['iHub Balance'],
            'predicted_label': label,
            'anomaly_score': score
        }
        if label == "Anomaly":
            prediction["Balance Difference"] = row['GL Balance'] - row['iHub Balance']
            prediction["anomaly_bucket"] = map_anomaly_to_bucket(prediction)
        else:
            prediction["anomaly_bucket"] = None
        realtime_predictions.append(prediction)
    
    pred_df = pd.DataFrame(realtime_predictions)
    print("Sample Predictions:")
    print(pred_df.head(10))
    print("\nReal-Time Prediction Counts:")
    print(pred_df['predicted_label'].value_counts())
    print("\nAnomaly Scores Summary:")
    print(pred_df['anomaly_score'].describe())
    
    # Filter only anomalies and add bucket description
    anomalies_df = pred_df[pred_df['predicted_label'] == "Anomaly"].copy()
    anomalies_df['Bucket Description'] = anomalies_df['anomaly_bucket'].apply(
        lambda x: ANOMALY_BUCKETS.get(x, "") if pd.notnull(x) else ""
    )
    
    # Export anomalies to CSV
    output_file = os.path.join(DATA_DIR, "anomalies_output.csv")
    anomalies_df.to_csv(output_file, index=False)
    print(f"Anomaly predictions exported to {output_file}")
    
    # Generate insights using OpenAI GPT-4 based on the anomalies
    # insights_text = generate_insights(anomalies_df)
    # insights_file = os.path.join(DATA_DIR, "insights_output.txt")
    # with open(insights_file, "w") as f:
    #     f.write(insights_text)
    # print(f"Insights exported to {insights_file}")
    # Generate insights using the Hugging Face model
    insights_text_hf = generate_insight_for_row_hf(anomalies_df)
    insights_file_hf = os.path.join(DATA_DIR, "insights_output_hf.txt")
    with open(insights_file_hf, "w") as f:
        f.write(insights_text_hf)
    print(f"Hugging Face insights exported to {insights_file_hf}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reconciliation Anomaly Detection Pipeline with Insights")
    parser.add_argument("--historical_path", type=str, default=None, help="Path to historical data CSV file")
    parser.add_argument("--realtime_path", type=str, default=None, help="Path to real-time data CSV file")
    args = parser.parse_args()
    
    main(args.historical_path, args.realtime_path)
