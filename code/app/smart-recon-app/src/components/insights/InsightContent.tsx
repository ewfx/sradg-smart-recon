
import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightContentProps {
  insight: {
    title: string;
    description: string;
    category: string;
    content: string;
  };
  renderInsightIcon: (category: string) => JSX.Element;
  onCopy: () => void;
}

const InsightContent: React.FC<InsightContentProps> = ({ 
  insight, 
  renderInsightIcon, 
  onCopy 
}) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            {renderInsightIcon(insight.category)}
            <span className="ml-2">{insight.title}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="mt-1">
          {insight.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 my-2">
          <div className="whitespace-pre-line text-sm">
            {insight.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightContent;
