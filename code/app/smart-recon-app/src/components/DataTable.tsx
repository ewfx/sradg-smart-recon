
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileSearch, Download, MoreHorizontal, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data for the table
const mockData = [
  { id: 1, transactionId: 'TRX-001', date: '2023-05-15', account: 'Accounts Payable', description: 'Invoice Payment', amount: 5400.00, status: 'Reconciled' },
  { id: 2, transactionId: 'TRX-002', date: '2023-05-16', account: 'Accounts Receivable', description: 'Customer Payment', amount: 2750.00, status: 'Reconciled' },
  { id: 3, transactionId: 'TRX-003', date: '2023-05-17', account: 'Accounts Payable', description: 'Supplier Payment', amount: 3200.00, status: 'Pending' },
  { id: 4, transactionId: 'TRX-004', date: '2023-05-18', account: 'Revenue', description: 'Service Fee', amount: 1500.00, status: 'Reconciled' },
  { id: 5, transactionId: 'TRX-005', date: '2023-05-19', account: 'Expenses', description: 'Office Supplies', amount: 350.00, status: 'Unmatched' },
  { id: 6, transactionId: 'TRX-006', date: '2023-05-20', account: 'Accounts Receivable', description: 'Client Payment', amount: 4800.00, status: 'Reconciled' },
  { id: 7, transactionId: 'TRX-007', date: '2023-05-21', account: 'Payroll', description: 'Salary Payment', amount: 12000.00, status: 'Pending' },
  { id: 8, transactionId: 'TRX-008', date: '2023-05-22', account: 'Expenses', description: 'Travel Expenses', amount: 890.00, status: 'Unmatched' },
];

// Define column structure
const columns = [
  { id: 'transactionId', label: 'Transaction ID', sortable: true },
  { id: 'date', label: 'Date', sortable: true },
  { id: 'account', label: 'Account', sortable: true },
  { id: 'description', label: 'Description', sortable: false },
  { id: 'amount', label: 'Amount', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
];

const DataTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 5;

  // Sorting function
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  // Apply sorting and pagination
  const sortedData = [...mockData].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reconciled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Unmatched':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Reconciliation Data</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          View and manage your reconciliation transactions
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                {columns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.id)}
                          className="ml-2 focus:outline-none"
                        >
                          {sortBy === column.id ? (
                            sortDirection === 'asc' ? (
                              <SortAsc className="h-4 w-4 text-blue-500" />
                            ) : (
                              <SortDesc className="h-4 w-4 text-blue-500" />
                            )
                          ) : (
                            <div className="h-4 w-4 text-gray-300 dark:text-gray-700">
                              <SortAsc className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {row.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {row.account}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {row.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(row.status)
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center cursor-pointer">
                          <FileSearch className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center cursor-pointer">
                          <Download className="mr-2 h-4 w-4" />
                          <span>Export</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, mockData.length)}
                </span>{' '}
                of <span className="font-medium">{mockData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                  className="rounded-l-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    className="hidden md:inline-flex"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="icon"
                  className="rounded-r-md"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
