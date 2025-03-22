import os

# Base directory: adjust as needed
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

# File paths for data (used if no upload is performed)
HISTORICAL_DATA_PATH = os.path.join(DATA_DIR, 'historical_reconciliation_data_001.csv')
CURRENT_DATA_PATH = os.path.join(DATA_DIR, 'realtime_reconciliation_data_001.csv')

# Predefined anomaly buckets (bucket id : description)
ANOMALY_BUCKETS = {
    1: "Inconsistent variations in outstanding balances",
    2: "Consistent increase or decrease in outstanding balances",
    3: "Huge spike in outstanding balances",
    4: "Outstanding balances are not in line with previous months",
    5: "Gradual deviation beyond threshold over multiple periods",
    6: "Sudden drop in outstanding balances",
    7: "High volatility in account balances over time",
    8: "Reversal or correction entry detected",
    9: "New account or currency not seen in historical data",  # Handled separately
    10: "Large single-month fluctuation with no prior history",
    11: "No clear pattern, but deviation exceeds threshold"
}

# Example threshold values for mapping (all values are illustrative)
THRESHOLD_INCONSISTENT = 5000          # Bucket 1 if |diff| < 5000
THRESHOLD_CONSISTENT = 10000           # Bucket 2 if 5000 <= |diff| < 10000
THRESHOLD_HUGE_SPIKE = 50000           # Bucket 3 if diff >= 50000
THRESHOLD_SUDDEN_DROP = -30000         # Bucket 6 if diff <= -30000
THRESHOLD_LARGE_FLUCTUATION = 70000    # Bucket 10 if |diff| >= 70000

# For buckets that require moderate ranges:
THRESHOLD_NOT_IN_LINE_LOWER = 10000    # Lower bound for bucket 4 (positive diff)
THRESHOLD_NOT_IN_LINE_UPPER = 15000    # Upper bound for bucket 4
THRESHOLD_GRADUAL_DEVIATION = 20000    # Bucket 5 if diff between 15000 and 20000

# Bucket 7: High volatility if |diff| is moderately high
THRESHOLD_HIGH_VOLATILITY_LOWER = 20000
THRESHOLD_HIGH_VOLATILITY_UPPER = 25000

# Bucket 8: Reversal if negative diff is within this range
THRESHOLD_REVERSAL_LOWER = 10000       # e.g., if |diff| is between 10000 and 15000 (for negative diff)
THRESHOLD_REVERSAL_UPPER = 15000

# Bucket 11 fallback: if no other condition matches and |diff| >= some threshold
THRESHOLD_NO_PATTERN = 11000
