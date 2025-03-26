import pandas as pd

def load_csv_with_auto_header(path):
    preview = pd.read_csv(path, header=None, nrows=5)
    for i in range(len(preview)):
        row = preview.iloc[i]
        if "MatchStatus" in row.values and "TRADEID" in row.values:
            return pd.read_csv(path, skiprows=i)
    raise ValueError("Could not detect proper header row with expected columns like 'MatchStatus' or 'TRADEID'.")
