import streamlit as st
import pandas as pd

def main():
    st.title("Reconciliation Monitoring Dashboard")
    
    # Load anomaly report
    report = pd.read_csv('data/reports/anomaly_report.csv')
    
    # Add interactive filters
    selected_company = st.sidebar.selectbox("Select Company", report['Company'].unique())
    filtered = report[report['Company'] == selected_company]
    
    # Display metrics
    st.metric("Total Anomalies", len(filtered))
    
    # Show detailed view
    st.dataframe(filtered)

if __name__ == "__main__":
    main()