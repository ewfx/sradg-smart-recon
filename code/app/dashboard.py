# app/dashboard.py
import streamlit as st
import pandas as pd

st.title("Reconciliation Anomaly Detection & Resolution Insights")

# Load final results
@st.cache_data
def load_data():
    return pd.read_csv('data/final_anomaly_results.csv')

df = load_data()

st.write("### Anomaly Overview")
st.write(df[['Account', 'GL Balance', 'iHub Balance', 'Balance Difference', 'predicted_label', 'resolution_suggestion']].head(20))

st.write("### Anomaly Counts")
st.bar_chart(df['predicted_label'].value_counts())
