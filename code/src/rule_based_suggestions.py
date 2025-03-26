
import pandas as pd
from src.utils import load_csv_with_auto_header

QUANTITY_TOLERANCE = 2
PRICE_TOLERANCE = 0.01

def clean_column(col):
    return col.strip().replace("\u200b", "").replace("\ufeff", "")

def generate_rule_based_suggestions(csv_path):
    
    df = load_csv_with_auto_header(csv_path)
    df = pd.read_csv(csv_path)

    # Clean all column names
    df.columns = [clean_column(col) for col in df.columns]

    suggestions = []

    for idx, row in df.iterrows():
        match_status = str(row.get("MatchStatus", "")).strip()
        trade_id = row.get("TRADEID", None)
        catalyst_qty = row.get("Catalyst_QUANTITY")
        impact_qty = row.get("Impact_QUANTITY")
        catalyst_price = row.get("Catalyst_PRICE")
        impact_price = row.get("Impact_PRICE")

        suggestion = {
            "TRADEID": trade_id,
            "MatchStatus": match_status,
            "RootCause": "",
            "SuggestedAction": ""
        }

        if match_status == "Quantity_Break":
            if pd.notna(catalyst_qty) and pd.notna(impact_qty):
                diff = abs(catalyst_qty - impact_qty)
                suggestion["RootCause"] = f"Quantity mismatch: Catalyst={catalyst_qty}, Impact={impact_qty}"
                suggestion["SuggestedAction"] = (
                    "Minor delta due to rounding. Tolerable." if diff <= QUANTITY_TOLERANCE
                    else "Investigate booking differences and update lower quantity."
                )

        elif match_status in ["Price_Break", "Price Break"]:
            if pd.notna(catalyst_price) and pd.notna(impact_price):
                diff = abs(catalyst_price - impact_price)
                suggestion["RootCause"] = f"Price mismatch: Catalyst={catalyst_price}, Impact={impact_price}"
                suggestion["SuggestedAction"] = (
                    "Price difference due to rounding. Acceptable." if diff <= PRICE_TOLERANCE
                    else "Review trade price source and align systems."
                )

        elif match_status == "Catalyst_Only":
            suggestion["RootCause"] = "Trade exists in Catalyst but missing in Impact."
            suggestion["SuggestedAction"] = "Check if trade ingestion failed in Impact. Trigger sync."

        elif match_status == "Impact_Only":
            suggestion["RootCause"] = "Trade exists in Impact but missing in Catalyst."
            suggestion["SuggestedAction"] = "Verify if trade was cancelled or not yet created in Catalyst."

        else:
            suggestion["RootCause"] = "Unrecognized MatchStatus"
            suggestion["SuggestedAction"] = "Manual review needed."

        suggestions.append(suggestion)
        print("Sanitized columns:", df.columns.tolist())

    return suggestions
