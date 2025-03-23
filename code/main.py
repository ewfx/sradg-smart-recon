import argparse
import pandas as pd
import os
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models
from src.config import DATA_DIR
from src.predict_anomaly import run_anomaly_prediction_pipeline
from src.insights_openai import generate_insights

def main(historical_path=None, realtime_path=None):
    # Load or generate historical data
    historical_df = get_historical_data(historical_path)

    # Load or generate real-time data
    realtime_df = get_realtime_data(historical_df, realtime_path)

    # Train anomaly detection models on historical data
    entity_models = train_entity_models(historical_df)

    # Run anomaly prediction pipeline and export
    anomalies_df, output_file = run_anomaly_prediction_pipeline(realtime_df, entity_models)
    # Drop unwanted columns and rename Bucket Description
    export_df = anomalies_df.drop(columns=["predicted_label", "anomaly_score", "anomaly_bucket"], errors="ignore")
    export_df = export_df.rename(columns={"Bucket Description": "Comments"})
    
     # ✅ Generate aggregated GPT-4 insight
    insight_summary = generate_insights()
    print("\nInsight Summary:\n", insight_summary)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reconciliation Anomaly Detection Pipeline")
    parser.add_argument("--historical_path", type=str, default=None, help="Path to historical data CSV file")
    parser.add_argument("--realtime_path", type=str, default=None, help="Path to real-time data CSV file")
    args = parser.parse_args()

    main(args.historical_path, args.realtime_path)