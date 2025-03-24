
import { MailPlus, Download, Brain } from 'lucide-react';

// Mock data for AI insights
export const mockInsights = [
  {
    id: 1,
    title: 'Balance Discrepancy Analysis',
    description: 'We\'ve analyzed the $1,240.50 discrepancy between your GL and bank statement.',
    category: 'analysis',
    content: `The balance discrepancy of $1,240.50 appears to be caused by:

1. Three outstanding checks (numbers #2205, #2208, #2212) totaling $875.25 that have not cleared the bank.
2. Two electronic payments recorded in the GL but not yet processed by the bank ($365.25).

**Recommendation**: Record these as reconciling items on your bank reconciliation and monitor for clearing in the next statement cycle.`,
  },
  {
    id: 2,
    title: 'Duplicate Transaction Alert',
    description: 'Our algorithms detected duplicate payment for invoice #INV-2023-0542.',
    category: 'alert',
    content: `Invoice #INV-2023-0542 was paid twice:
- First payment: May 12, 2023 ($458.75)
- Second payment: May 17, 2023 ($458.75)

**Impact**: Overpayment of $458.75 to vendor "OfficeSupplyCo"

**Recommendation**: Contact OfficeSupplyCo to request a refund or credit for future purchases. Update your accounts payable process to include a duplicate payment check.`,
  },
  {
    id: 3,
    title: 'Process Improvement Suggestion',
    description: 'We\'ve identified patterns that could be optimized in your reconciliation workflow.',
    category: 'suggestion',
    content: `Based on the reconciliation patterns in your data, we've identified these improvement opportunities:

1. **Weekly Reconciliation**: Switching from monthly to weekly reconciliations could reduce the average discrepancy amount by 64% based on your historical data.

2. **Missing Documentation**: 23% of reconciliation issues are due to missing or incomplete documentation.

3. **Approval Workflow**: Implementing a dual-approval process for transactions above $1,000 could prevent 88% of the high-impact reconciliation issues.

**Recommendation**: Implement weekly reconciliation checks and enhance your documentation requirements.`,
  },
  {
    id: 4,
    title: 'Training Opportunity Identified',
    description: 'We\'ve identified specific training needs based on reconciliation patterns.',
    category: 'training',
    content: `Our analysis indicates that most reconciliation errors (72%) originate from transactions classified under "Prepaid Expenses" and "Accrued Liabilities".

This suggests that team members may benefit from additional training on:
1. Proper timing of expense recognition
2. Accrual accounting principles
3. Documentation requirements for prepaid items

**Recommendation**: Schedule a focused training session covering these topics with the accounting team.`,
  },
  {
    id: 5,
    title: 'Regulatory Compliance Alert',
    description: 'Potential compliance issues identified in reconciliation data.',
    category: 'compliance',
    content: `We've detected patterns that may indicate compliance risks:

1. Several transactions with round dollar amounts ($5,000, $10,000) were split into multiple smaller transactions on the same day.

2. Three transactions exceeding the $10,000 reporting threshold lack proper documentation.

**Risk**: These patterns could trigger regulatory scrutiny.

**Recommendation**: Review your transaction approval process and documentation requirements for large transactions. Consider implementing automated alerts for transactions that approach reporting thresholds.`,
  }
];

// Mock actions
export const suggestedActions = [
  {
    id: 1,
    title: 'Request Refund for Duplicate Payment',
    description: 'Send automated email to vendor requesting refund for duplicate invoice payment',
    icon: MailPlus,
    actionType: 'email',
  },
  {
    id: 2,
    title: 'Generate Reconciliation Report',
    description: 'Create detailed reconciliation report with all identified discrepancies',
    icon: Download,
    actionType: 'report',
  },
  {
    id: 3,
    title: 'Schedule Training Session',
    description: 'Book training session on proper expense classification for accounting team',
    icon: Brain,
    actionType: 'training',
  },
];
