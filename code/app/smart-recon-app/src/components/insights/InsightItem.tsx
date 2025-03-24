
import React from 'react';
import { Lightbulb, MessageSquare, Brain, CheckCircle } from 'lucide-react';

interface InsightItemProps {
  insight: {
    id: number;
    title: string;
    description: string;
    category: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const InsightItem: React.FC<InsightItemProps> = ({ insight, isSelected, onSelect }) => {
  const renderInsightIcon = (category: string) => {
    switch (category) {
      case 'analysis':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <MessageSquare className="h-5 w-5 text-red-500" />;
      case 'suggestion':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'training':
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-start ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      onClick={onSelect}
    >
      <div className="mr-3 mt-1">
        {renderInsightIcon(insight.category)}
      </div>
      <div>
        <h3 className="font-medium text-sm">{insight.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {insight.description}
        </p>
      </div>
    </div>
  );
};

export default InsightItem;
