
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ActionItem from './ActionItem';

interface ActionsListProps {
  actions: Array<{
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    actionType: string;
  }>;
  onExecuteAction: (actionType: string) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({ actions, onExecuteAction }) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Suggested Actions</CardTitle>
        <CardDescription>
          Recommended next steps based on our analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map(action => (
          <ActionItem 
            key={action.id} 
            action={action} 
            onExecute={onExecuteAction} 
          />
        ))}
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
