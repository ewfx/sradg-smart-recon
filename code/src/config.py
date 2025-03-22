import os

# Base directory is one level up from src
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Data file paths
HISTORICAL_DATA_PATH = os.path.join(DATA_DIR, 'historical_reconciliation_data.csv')
CURRENT_DATA_PATH = os.path.join(DATA_DIR, 'current_reconciliation_data.csv')

# IsolationForest hyperparameters (adjust as needed)
ISOLATION_FOREST_PARAMS = {
    'n_estimators': 100,
    'contamination': 0.1,  # adjust based on expected anomaly rate
    'random_state': 42
}

# Thresholds for mapping anomaly buckets (example values; adjust these based on domain insights)
THRESHOLD_HUGE_SPIKE = 50000         # Bucket 3: Huge spike in outstanding balances
THRESHOLD_SUDDEN_DROP = -30000       # Bucket 6: Sudden drop in outstanding balances
THRESHOLD_VOLATILITY = 20000         # Bucket 7: High volatility in account balances over time
THRESHOLD_SMALL_DELTA = 5000         # Bucket 2: Consistent increase/decrease if delta is small

# Key Columns used for reconciliation matching
KEY_COLUMNS = ["Company", "Account", "AU", "Currency"]

# Criteria Columns used to determine reconciliation match or break
CRITERIA_COLUMNS = ["GL Balance", "iHub Balance"]

# Derived Columns: Here we define a mapping where the key is the new column name and
# the value is a lambda function that computes it from an existing row.
DERIVED_COLUMNS = {
    "Balance Difference": lambda row: row["GL Balance"] - row["iHub Balance"]
}

# Historical Columns (can be used for trend analysis)
HISTORICAL_COLUMNS = ["Account", "Secondary Account", "Primary Account"]

# Date Columns used to study trends over time
DATE_COLUMNS = ["As of Date"]
