
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, MoreHorizontal, FileSearch, Download } from 'lucide-react';
import { DynamicColumnData } from '@/lib/csv-parser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TableFilters from './table/TableFilters';
import TablePagination from './table/TablePagination';
import { TableCellFormatter } from './table/TableCellFormatter';

interface DynamicTableProps {
  data: DynamicColumnData[];
  headers: string[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({ data, headers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all');
  const itemsPerPage = 10;

  // Deduplicate headers to ensure no duplicates in column display
  const deduplicateHeaders = (headers: string[]): string[] => {
    const seen = new Map<string, string>();
    return headers.filter(header => {
      const normalized = header.toLowerCase().replace(/[\s_-]+/g, '');
      if (seen.has(normalized)) {
        return false;
      }
      seen.set(normalized, header);
      return true;
    });
  };

  // Get all columns, prioritizing important ones and ensuring status/source are at the end
  const columns = useMemo(() => {
    // Make a prioritized list of columns
    const priorityColumns = ['id', 'date', 'description', 'category', 'amount'];
    const endColumns = ['dataType', 'status', 'source'];
    
    // Get all unique keys from data objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Deduplicate headers to ensure no duplicates in the actual displayed columns
    const deduplicatedHeaders = deduplicateHeaders(headers);
    
    // Start with priority columns (that exist in the data)
    const result: string[] = priorityColumns.filter(col => allKeys.has(col));
    
    // Add deduplicated headers that aren't already in the result or in endColumns
    deduplicatedHeaders.forEach(header => {
      if (!result.includes(header) && !endColumns.includes(header)) {
        result.push(header);
      }
    });
    
    // Add any remaining keys from the data that aren't already included
    Array.from(allKeys).forEach(key => {
      if (!result.includes(key) && !endColumns.includes(key)) {
        result.push(key);
      }
    });
    
    // End with dataType, status and source (if they exist in the data)
    endColumns.forEach(col => {
      if (allKeys.has(col)) {
        result.push(col);
      }
    });
    
    return result;
  }, [data, headers]);

  // Sorting function
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  // Apply filtering
  const filteredData = data.filter(item => {
    // Apply status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    
    // Apply data type filter
    if (dataTypeFilter !== 'all' && item.dataType !== dataTypeFilter) {
      return false;
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Search through all properties
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Apply sorting and pagination
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    // Convert to strings for comparison if types don't match
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDataTypeFilter('all');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Reconciliation Data</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          {data.length} records found from uploaded files
        </p>
      </div>

      {/* Filters */}
      <TableFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dataTypeFilter={dataTypeFilter}
        setDataTypeFilter={setDataTypeFilter}
        resetFilters={resetFilters}
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column} className={column === 'amount' ? 'text-right' : ''}>
                  <div className={`flex items-center ${column === 'amount' ? 'justify-end' : ''} cursor-pointer`} 
                       onClick={() => handleSort(column)}>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.id}>
                {columns.map(column => (
                  <TableCell 
                    key={`${item.id}-${column}`} 
                    className={column === 'amount' ? 'text-right' : (column === 'source' ? 'text-center' : '')}
                  >
                    <TableCellFormatter value={item[column]} columnName={column} />
                  </TableCell>
                ))}
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        filteredDataLength={filteredData.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default DynamicTable;
