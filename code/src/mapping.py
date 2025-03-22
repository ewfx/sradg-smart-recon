from src.config import (
    THRESHOLD_INCONSISTENT,
    THRESHOLD_CONSISTENT,
    THRESHOLD_HUGE_SPIKE,
    THRESHOLD_SUDDEN_DROP,
    THRESHOLD_LARGE_FLUCTUATION,
    THRESHOLD_NOT_IN_LINE_LOWER,
    THRESHOLD_NOT_IN_LINE_UPPER,
    THRESHOLD_GRADUAL_DEVIATION,
    THRESHOLD_HIGH_VOLATILITY_LOWER,
    THRESHOLD_HIGH_VOLATILITY_UPPER,
    THRESHOLD_REVERSAL_LOWER,
    THRESHOLD_REVERSAL_UPPER,
    THRESHOLD_NO_PATTERN
)

def map_anomaly_to_bucket(row):
    """
    Map an aggregated anomaly row to one of the predefined buckets using threshold-based logic.
    The primary feature used is the 'Balance Difference' (GL Balance - iHub Balance).
    Returns an integer bucket ID.
    """
    diff = row.get("Balance Difference", 0)
    
    # Bucket 10: Large single-month fluctuation with no prior history
    if abs(diff) >= THRESHOLD_LARGE_FLUCTUATION:
        return 10
    # Bucket 3: Huge spike in outstanding balances
    if diff >= THRESHOLD_HUGE_SPIKE:
        return 3
    # Bucket 6: Sudden drop in outstanding balances
    if diff <= THRESHOLD_SUDDEN_DROP:
        return 6
    # Bucket 1: Inconsistent variations if difference is very small
    if abs(diff) < THRESHOLD_INCONSISTENT:
        return 1
    # Bucket 2: Consistent increase or decrease if difference is small to moderate
    if THRESHOLD_INCONSISTENT <= abs(diff) < THRESHOLD_CONSISTENT:
        return 2
    # Bucket 4: Outstanding balances not in line with previous months
    # (for example, if diff is positive and between the lower and upper bounds)
    if diff >= THRESHOLD_NOT_IN_LINE_LOWER and diff < THRESHOLD_NOT_IN_LINE_UPPER:
        return 4
    # Bucket 5: Gradual deviation beyond threshold over multiple periods
    if diff >= THRESHOLD_NOT_IN_LINE_UPPER and diff < THRESHOLD_GRADUAL_DEVIATION:
        return 5
    # Bucket 7: High volatility in account balances (if |diff| is in a moderate range)
    if abs(diff) >= THRESHOLD_HIGH_VOLATILITY_LOWER and abs(diff) < THRESHOLD_HIGH_VOLATILITY_UPPER:
        return 7
    # Bucket 8: Reversal or correction entry detected (for negative differences in a specific range)
    if diff < 0 and abs(diff) >= THRESHOLD_REVERSAL_LOWER and abs(diff) < THRESHOLD_REVERSAL_UPPER:
        return 8
    # Bucket 11: No clear pattern, but deviation exceeds threshold (fallback condition)
    if abs(diff) >= THRESHOLD_NO_PATTERN:
        return 11
    # Default fallback (should not normally reach here)
    return 11
