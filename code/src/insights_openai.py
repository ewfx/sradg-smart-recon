import openai 
import pandas as pd
import json
import os
import numpy as np
from src.config import ANOMALY_BUCKETS, DATA_DIR

# Load your OpenAI API key from environment variable
openai.api_key = "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"

def convert_to_builtin(obj):
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

def generate_insights():
    anomalies_path = os.path.join(DATA_DIR, "anomalies_full_output.csv")
    if not os.path.exists(anomalies_path):
        return {"error": "Anomalies file not found. Please run the detection pipeline first."}

    anomalies_df = pd.read_csv(anomalies_path)

    # Count anomalies by bucket
    bucket_counts = anomalies_df["anomaly_bucket"].value_counts().to_dict()

    # Build bucket summary with descriptions
    bucket_details = []
    for bucket_id, count in bucket_counts.items():
        description = ANOMALY_BUCKETS.get(int(bucket_id), "Unknown")
        companies = anomalies_df[anomalies_df["anomaly_bucket"] == bucket_id]["Company"].dropna().unique().tolist()
        sample_companies = companies[:3]
        bucket_details.append({
            "bucket_id": int(bucket_id),
            "bucket_description": description,
            "anomaly_count": int(count),
            "sample_companies": sample_companies
        })

    total_anomalies = int(len(anomalies_df))
    total_impact = float(anomalies_df["Balance Difference"].sum())

    prompt = f"""
You are a financial reconciliation expert.

You are given anomaly records grouped by anomaly buckets.
Each bucket has:
- a unique bucket ID
- a description
- a count of anomalies
- a few sample company names

🎯 Your task is to generate structured insights in **valid JSON array format only**. Do not include explanations or markdown. Just return JSON.

Use this format:
[
  {{
    "bucket_id": 1,
    "bucket_description": "Inconsistent variations in outstanding balances",
    "anomaly_count": 12,
    "sample_companies": ["Company A", "Company B"],
    "root_cause": "Explain the likely cause in one sentence.",
    "recommendation": "Short, clear next step."
  }},
  ...
]

Here is the bucket summary:
{json.dumps(bucket_details, indent=2)}

Here are the first 5 anomaly records:
{anomalies_df.head(5).to_json(orient='records', lines=True)}

✅ Only output a valid JSON array, no markdown or commentary.
"""

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a financial reconciliation expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=1500
    )

    raw_output = response.choices[0].message.content.strip()
    print("GPT raw output:\n", raw_output)

    # Clean Markdown code block wrappers if present
    if raw_output.startswith("```json"):
        raw_output = raw_output[len("```json"):].strip()
    if raw_output.endswith("```"):
        raw_output = raw_output[:-3].strip()

    try:
        insights_list = json.loads(raw_output)
        insights_payload = {
            "total_anomalies": total_anomalies,
            "total_impact": total_impact,
            "insights": insights_list
        }

        # ✅ Save insights with type conversion
        insights_path = os.path.join(DATA_DIR, "insights_output.json")
        with open(insights_path, "w") as f:
            json.dump(insights_payload, f, indent=2, default=convert_to_builtin)

        return insights_payload

    except json.JSONDecodeError as e:
        print("❌ JSON parsing failed:", e)
        return {"error": "Failed to parse insights as JSON."}
