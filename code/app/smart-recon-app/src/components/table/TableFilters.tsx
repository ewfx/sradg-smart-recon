
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dataTypeFilter: string;
  setDataTypeFilter: (value: string) => void;
  resetFilters: () => void;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dataTypeFilter,
  setDataTypeFilter,
  resetFilters
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-48">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Reconciled">Reconciled</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Unmatched">Unmatched</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-48">
        <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Data Types</SelectItem>
            <SelectItem value="current">Current Data</SelectItem>
            <SelectItem value="historical">Historical Data</SelectItem>
            <SelectItem value="anomaly">Anomaly Data</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        onClick={resetFilters}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default TableFilters;
