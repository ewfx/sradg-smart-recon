
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionItemProps {
  action: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    actionType: string;
  };
  onExecute: (actionType: string) => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ action, onExecute }) => {
  const { icon: Icon } = action;
  
  return (
    <div className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg border">
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 shrink-0">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{action.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {action.description}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="shrink-0 h-8 w-8 mt-1"
        onClick={() => onExecute(action.actionType)}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActionItem;
