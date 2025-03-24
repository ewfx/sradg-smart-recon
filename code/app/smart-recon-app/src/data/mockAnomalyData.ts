
export const mockCsvData = `Company,Account,AU,PrimaryAccount,SecondaryAccount,GLBalance,iHubBalance,BalanceDifference,Comments
Doyle Ltd,740,4457,COMMERCIAL LOANS,INTEREST RECEIVABLE,83000,83000,0,Inconsistent variations
Galloway-Wyatt,493,9115,ALL LOB LOANS,PRINCIPAL,22000,22000,0,Inconsistent variations
Abbott-Munoz,327,3108,RETAIL LOANS,DEFERRED COSTS,88000,105000,-17000,Inconsistent variations
Mcclain Miller Henderson,298,7026,RETAIL LOANS,INTEREST RECEIVABLE,32000,23000,9000,Inconsistent variations
Guzman Hoffman Baldwin,365,3735,COMMERCIAL LOANS,DEFERRED COSTS,82000,93000,-11000,Inconsistent variations`;

export const mockInsightsData = [
  {
    bucket_id: 1,
    bucket_description: "Inconsistent variations in outstanding balances",
    anomaly_count: 17,
    sample_companies: ["Doyle Ltd", "Galloway-Wyatt"],
    root_cause: "Timing differences in transaction entries.",
    recommendation: "Implement stricter transaction time controls."
  },
  {
    bucket_id: 11,
    bucket_description: "No clear pattern, but deviation exceeds threshold",
    anomaly_count: 7,
    sample_companies: ["Abbott-Munoz"],
    root_cause: "Unusual transactions that do not follow historical patterns.",
    recommendation: "Investigate each case individually to identify unique causes."
  },
  {
    bucket_id: 2,
    bucket_description: "Consistent increase or decrease in outstanding balances",
    anomaly_count: 6,
    sample_companies: ["Mcclain Miller Henderson"],
    root_cause: "Systematic errors in transaction processing.",
    recommendation: "Audit transaction processing systems for systematic errors."
  },
  {
    bucket_id: 8,
    bucket_description: "Reversal or correction entry detected",
    anomaly_count: 3,
    sample_companies: ["Guzman Hoffman Baldwin"],
    root_cause: "Reversal entries made to correct prior errors.",
    recommendation: "Ensure all reversal and correction entries are properly documented."
  },
  {
    bucket_id: 4,
    bucket_description: "Outstanding balances not in line with previous months",
    anomaly_count: 3,
    sample_companies: [],
    root_cause: "Seasonal fluctuations not accounted for in analysis.",
    recommendation: "Incorporate seasonal adjustments into analysis."
  }
];
