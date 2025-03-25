
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ActionItem from './ActionItem';
import { FileText, BarChartBig, GraduationCap } from 'lucide-react';

interface ActionsListProps {
  actions: Array<{
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    actionType: string;
    fullText?: string;
  }>;
  onExecuteAction: (actionType: string) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({ actions, onExecuteAction }) => {
  // Use provided actions or display placeholder actions if none available
  const displayActions = actions && actions.length > 0 
    ? actions 
    : [
        {
          id: 1,
          title: 'Request Refund for Duplicate Payment',
          description: 'Send automated email to vendor requesting refund for duplicate invoice payment',
          icon: FileText,
          actionType: 'request-refund'
        },
        {
          id: 2,
          title: 'Generate Reconciliation Report',
          description: 'Create detailed reconciliation report with all identified discrepancies',
          icon: BarChartBig,
          actionType: 'generate-report'
        },
        {
          id: 3,
          title: 'Schedule Training Session',
          description: 'Book training session on proper expense classification for accounting team',
          icon: GraduationCap,
          actionType: 'schedule-training'
        }
      ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Suggested Actions</CardTitle>
        <CardDescription>
          Recommended next steps based on our analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActions.length > 0 ? (
          displayActions.map(action => (
            <ActionItem 
              key={action.id} 
              action={action} 
              onExecute={onExecuteAction} 
            />
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No suggested actions available for this insight.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
        >
          View More Actions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionsList;
