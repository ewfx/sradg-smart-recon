import openai
import pandas as pd

# Set your OpenAI API key (ideally via environment variable)
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with your key or set via env variable

def generate_insights(anomalies_df: pd.DataFrame) -> str:
    """
    Generate aggregated insights on anomalies using GPT-4.
    This function is an aggregated version that analyzes overall statistics.
    """
    summary_stats = anomalies_df['anomaly_bucket'].value_counts().to_dict()
    avg_score = anomalies_df['anomaly_score'].mean()
    
    prompt = f"""I have the following anomalies data from a financial reconciliation process:

Total anomalies: {len(anomalies_df)}
Anomaly counts by bucket: {summary_stats}
Average anomaly score: {avg_score:.2f}

Below are a few sample anomaly records in JSON format:
{anomalies_df.head(5).to_json(orient='records', lines=True)}

Please provide a detailed analysis of these anomalies, including potential root causes, trends, and corrective action suggestions.
Answer in clear, plain language."""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a financial reconciliation expert."},
            {"role": "user", "content": prompt}
        ],
        max_new_tokens=500
    )
    insights = response["choices"][0]["message"]["content"]
    return insights

def generate_insight_for_row(row: pd.Series) -> str:
    """
    Generate a concise insight for a single anomaly record using GPT-4.
    This function builds a prompt with key details from the anomaly row.
    """
    # Ensure we have a computed Balance Difference
    balance_diff = row.get("Balance Difference", row["GL Balance"] - row["iHub Balance"])
    
    prompt = f"""Analyze the following anomaly record from our financial reconciliation process:

Company: {row['Company']}
Account: {row['Account']}
AU: {row['AU']}
Currency: {row.get('Currency', 'USD')}
Primary Account: {row['Primary Account']}
Secondary Account: {row['Secondary Account']}
GL Balance: {row['GL Balance']}
iHub Balance: {row['iHub Balance']}
Balance Difference: {balance_diff}

Please provide a concise insight on the possible root cause for this anomaly and suggest a next step for investigation.
Answer in clear, plain language."""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a financial reconciliation expert."},
            {"role": "user", "content": prompt}
        ],
        max_new_tokens=200
    )
    insight = response["choices"][0]["message"]["content"]
    return insight
