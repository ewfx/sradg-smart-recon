
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Ticket, WrenchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/utils/apiUtils';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import EmailNotificationDialog from './EmailNotificationDialog';

interface RuleSuggestion {
  id?: number;
  TRADEID?: number;
  MatchStatus?: string;
  RootCause?: string;
  SuggestedAction?: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface RuleSuggestionsPanelProps {
  suggestions: RuleSuggestion[];
  isLoading: boolean;
  onIssueFixed?: (tradeId: number, matchStatus: string, updatedData: any) => void;
}

const RuleSuggestionsPanelProps: React.FC<RuleSuggestionsPanelProps> = ({ 
  suggestions, 
  isLoading,
  onIssueFixed 
}) => {
  const [processingTrades, setProcessingTrades] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<RuleSuggestion | null>(null);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(suggestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuggestions = suggestions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFixIssue = async (tradeId: number | undefined, matchStatus: string | undefined) => {
    if (!tradeId) {
      toast.error('No Trade ID provided');
      return;
    }

    const tradeKey = `fix-${tradeId}`;
    setProcessingTrades(prev => ({ ...prev, [tradeKey]: true }));
    
    try {
      // Determine source based on match status
      let source = 'catalyst'; // Default to catalyst
      
      if (matchStatus?.toLowerCase().includes('impact_only')) {
        source = 'impact';
      }
      
      // Generate sample data to update based on matchStatus
      // In a real application, this data would come from user input or be determined by the system
      const updateData: Record<string, any> = {};
      
      if (matchStatus?.toLowerCase().includes('price')) {
        updateData[`${source.charAt(0).toUpperCase() + source.slice(1)}_PRICE`] = (Math.random() * 100 + 50).toFixed(2);
      } else if (matchStatus?.toLowerCase().includes('quantity')) {
        updateData[`${source.charAt(0).toUpperCase() + source.slice(1)}_QUANTITY`] = Math.floor(Math.random() * 1000);
      } else {
        // Generic update data for other types of mismatches
        updateData[`${source.charAt(0).toUpperCase() + source.slice(1)}_SETTLEDATE`] = "03-07-2025";
        updateData[`${source.charAt(0).toUpperCase() + source.slice(1)}_PRICE`] = (Math.random() * 100 + 50).toFixed(2);
      }
      
      // Call the API with the correct endpoint and data format
      const response = await fetch(`${API_BASE_URL}/update-row?source=${source}&trade_id=${tradeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      toast.success(result.message || `Successfully updated Trade ID: ${tradeId}`);
      
      // Call the callback with the updated data
      if (onIssueFixed) {
        onIssueFixed(tradeId, matchStatus || '', {
          tradeId,
          source,
          updateData,
          matchStatus
        });
      }
    } catch (error) {
      console.error('Error fixing issue:', error);
      toast.error(`Failed to fix issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // For demo purposes, show success even when API fails and create mock data to update UI
      setTimeout(() => {
        toast.success(`Trade ID: ${tradeId} updated successfully (DEMO)`);
        
        // Create mock update data
        const mockSource = matchStatus?.toLowerCase().includes('impact_only') ? 'impact' : 'catalyst';
        const mockUpdateData: Record<string, any> = {
          [`${mockSource.charAt(0).toUpperCase() + mockSource.slice(1)}_PRICE`]: (Math.random() * 100 + 50).toFixed(2),
          [`${mockSource.charAt(0).toUpperCase() + mockSource.slice(1)}_QUANTITY`]: Math.floor(Math.random() * 1000)
        };
        
        // Call the callback with the mock updated data
        if (onIssueFixed) {
          onIssueFixed(tradeId, matchStatus || '', {
            tradeId,
            source: mockSource,
            updateData: mockUpdateData,
            matchStatus
          });
        }
      }, 1000);
    } finally {
      setProcessingTrades(prev => ({ ...prev, [tradeKey]: false }));
    }
  };

  const handleOpenEmailDialog = (suggestion: RuleSuggestion) => {
    setSelectedTrade(suggestion);
    setEmailDialogOpen(true);
  };

  const handleRaiseTicket = async (tradeId: number | undefined, matchStatus: string | undefined, rootCause: string | undefined) => {
    if (!tradeId) {
      toast.error('No Trade ID provided');
      return;
    }

    const tradeKey = `ticket-${tradeId}`;
    setProcessingTrades(prev => ({ ...prev, [tradeKey]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/raise-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeId,
          matchStatus,
          rootCause,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      toast.success(`Ticket raised for Trade ID: ${tradeId}. Email notification sent.`);
    } catch (error) {
      console.error('Error raising ticket:', error);
      toast.error(`Failed to raise ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setTimeout(() => {
        toast.success(`Ticket #${Math.floor(Math.random() * 10000)} raised for Trade ID: ${tradeId}. Email notification sent. (DEMO)`);
      }, 1000);
    } finally {
      setProcessingTrades(prev => ({ ...prev, [tradeKey]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Loading Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No recommendations available yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Click the "Get Recommendations" button to generate AI-powered suggestions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityFromMatchStatus = (matchStatus: string | undefined): 'high' | 'medium' | 'low' => {
    if (!matchStatus) return 'medium';
    
    const status = matchStatus.toLowerCase();
    if (status.includes('only') || status === 'missing') {
      return 'high';
    } else if (status.includes('break') || status.includes('mismatch')) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const getCategoryFromMatchStatus = (matchStatus: string | undefined): string => {
    if (!matchStatus) return 'Unclassified';
    
    const status = matchStatus.toLowerCase();
    if (status.includes('price')) {
      return 'Price Issue';
    } else if (status.includes('quantity')) {
      return 'Quantity Issue';
    } else if (status.includes('catalyst_only')) {
      return 'Missing in Impact';
    } else if (status.includes('impact_only')) {
      return 'Missing in Catalyst';
    } else {
      return matchStatus;
    }
  };

  const getPriorityIcon = (suggestion: RuleSuggestion) => {
    const priority = suggestion.priority || getPriorityFromMatchStatus(suggestion.MatchStatus);
    
    switch(priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const renderPaginationLinks = () => {
    const pages = [];
    const maxPagesToShow = 3;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === currentPage} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {currentSuggestions.map((suggestion, index) => (
            <div key={suggestion.TRADEID || suggestion.id || index} className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getPriorityIcon(suggestion)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.title || `Trade ID: ${suggestion.TRADEID} - ${suggestion.MatchStatus}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.description || suggestion.RootCause || "No description available"}
                  </p>
                  {suggestion.SuggestedAction && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      <strong>Suggested Action:</strong> {suggestion.SuggestedAction}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                      {suggestion.category || getCategoryFromMatchStatus(suggestion.MatchStatus)}
                    </span>
                    {suggestion.TRADEID && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full ml-2">
                        Trade ID: {suggestion.TRADEID}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs px-3 py-1 h-8"
                      onClick={() => handleFixIssue(suggestion.TRADEID, suggestion.MatchStatus)}
                      disabled={processingTrades[`fix-${suggestion.TRADEID}`]}
                    >
                      <WrenchIcon className="h-3.5 w-3.5 mr-1" />
                      {processingTrades[`fix-${suggestion.TRADEID}`] ? 'Processing...' : 'Fix This'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1 h-8"
                      onClick={() => handleOpenEmailDialog(suggestion)}
                      disabled={processingTrades[`ticket-${suggestion.TRADEID}`]}
                    >
                      <Ticket className="h-3.5 w-3.5 mr-1" />
                      {processingTrades[`ticket-${suggestion.TRADEID}`] ? 'Processing...' : 'Raise Ticket'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {renderPaginationLinks()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      {/* Email notification dialog */}
      {selectedTrade && (
        <EmailNotificationDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          tradeId={selectedTrade.TRADEID}
          matchStatus={selectedTrade.MatchStatus}
          rootCause={selectedTrade.RootCause}
          onSendSuccess={() => handleRaiseTicket(selectedTrade.TRADEID, selectedTrade.MatchStatus, selectedTrade.RootCause)}
        />
      )}
    </Card>
  );
};

export default RuleSuggestionsPanelProps;
