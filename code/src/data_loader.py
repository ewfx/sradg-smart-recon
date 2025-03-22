import os
import pandas as pd
from datetime import datetime
from src.config import HISTORICAL_DATA_PATH, CURRENT_DATA_PATH
from src.data_generator import generate_historical_data, generate_realtime_data

def load_csv(file_path, date_cols=["As of Date"]):
    df = pd.read_csv(file_path, parse_dates=date_cols, dayfirst=True)
    return df

def get_historical_data(historical_path=None):
    """
    If a valid historical_path is provided, load the data.
    Otherwise, use the config path; if the file doesn't exist, generate synthetic data.
    """
    if historical_path is None:
        historical_path = HISTORICAL_DATA_PATH

    if os.path.exists(historical_path):
        historical_df = load_csv(historical_path)
        print(f"Historical data loaded from '{historical_path}'. Shape: {historical_df.shape}")
    else:
        print("No valid historical data file provided. Generating synthetic historical data.")
        historical_df = generate_historical_data(num_entities=100, num_transactions=200)
        historical_df['Date'] = pd.to_datetime(historical_df['As of Date'], dayfirst=True)
        historical_df = historical_df[historical_df['Date'] < datetime.now()].drop(columns='Date')
        historical_df.to_csv(historical_path, index=False)
        print(f"Synthetic historical data generated and saved to '{historical_path}'.")
    return historical_df

def get_realtime_data(historical_df, realtime_path=None):
    """
    If a valid realtime_path is provided, load the data.
    Otherwise, use the config path; if the file doesn't exist, generate synthetic realtime data.
    """
    if realtime_path is None:
        realtime_path = CURRENT_DATA_PATH

    if os.path.exists(realtime_path):
        realtime_df = load_csv(realtime_path)
        print(f"Real-time data loaded from '{realtime_path}'. Shape: {realtime_df.shape}")
    else:
        print("No valid real-time data file provided. Generating synthetic real-time data.")
        realtime_df = generate_realtime_data(historical_df)
        realtime_df.to_csv(realtime_path, index=False)
        print(f"Synthetic real-time data generated and saved to '{realtime_path}'.")
    return realtime_df
