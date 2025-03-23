import os
import pandas as pd
from src.mapping import map_anomaly_to_bucket
from src.config import DATA_DIR, ANOMALY_BUCKETS
from src.anomaly_detection import predict_anomaly

def run_anomaly_prediction_pipeline(realtime_df, entity_models, full_output="anomalies_full_output.csv"):
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

        balance_diff = row['GL Balance'] - row['iHub Balance']

        prediction = {
            **new_entry,
            'Balance Difference': balance_diff,
            'predicted_label': label,
            'anomaly_score': score,
            'anomaly_bucket': map_anomaly_to_bucket({
                **new_entry,
                'Balance Difference': balance_diff
            }) if label == "Anomaly" else None
        }

        realtime_predictions.append(prediction)

    pred_df = pd.DataFrame(realtime_predictions)

    # Filter anomalies only
    anomalies_df = pred_df[pred_df['predicted_label'] == "Anomaly"].copy()
    anomalies_df['Bucket Description'] = anomalies_df['anomaly_bucket'].apply(
        lambda x: ANOMALY_BUCKETS.get(x, "") if pd.notnull(x) else ""
    )

    # ✅ Save full anomalies output for insight generation
    full_output_path = os.path.join(DATA_DIR, full_output)
    anomalies_df.to_csv(full_output_path, index=False)

    # ✅ Prepare filtered version for API/UI
    export_df = anomalies_df.drop(columns=["predicted_label", "anomaly_score", "anomaly_bucket"], errors="ignore")
    export_df = export_df.rename(columns={"Bucket Description": "Comments"})

    return export_df, full_output_path