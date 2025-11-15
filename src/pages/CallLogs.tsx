import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  CallTypeBadge,
  Loading,
  EmptyState,
  Modal,
} from '../components/ui';
import { Search, Filter, Eye, Trash2, Phone, X, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useCallLogs, useCallLog, useDeleteCallLog } from '../hooks/useCallLogs';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import type { CallLogFilters, CallType, User, Branch } from '../types';

export const CallLogs: React.FC = () => {
  const { admin } = useAuthStore();
  const [filters, setFilters] = useState<CallLogFilters>({
    page: 1,
    per_page: 20,
  });
  const [pendingFilters, setPendingFilters] = useState<CallLogFilters>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const { data, isLoading, refetch } = useCallLogs(filters);
  const { data: selectedLog } = useCallLog(selectedLogId || 0);
  const deleteCallLog = useDeleteCallLog();

  // Load users and branches for filter dropdowns
  useEffect(() => {
    const loadFilterData = async () => {
      setLoadingDropdowns(true);
      try {
        // Load users (agents) based on admin role
        const usersResponse = await apiService.getUsers({ status: 'active' });
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }

        // Load branches only for super admin
        if (admin?.admin_role === 'super_admin') {
          const branchesResponse = await apiService.getBranches({ status: 'active' });
          if (branchesResponse.data) {
            setBranches(branchesResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    if (showFilters) {
      loadFilterData();
    }
  }, [showFilters, admin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search, page: 1 });
  };

  const handleFilterChange = (key: keyof CallLogFilters, value: any) => {
    setPendingFilters({ ...pendingFilters, [key]: value || undefined });
  };

  const applyFilters = () => {
    // Validate: if time filters are set, date must be selected
    if ((pendingFilters.time_from || pendingFilters.time_to) &&
        !pendingFilters.date_from && !pendingFilters.date_to) {
      alert('Please select a date when using time filters');
      return;
    }

    setFilters({ ...filters, ...pendingFilters, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ page: 1, per_page: 20 });
    setPendingFilters({});
    setSearch('');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this call log?')) {
      deleteCallLog.mutate(id);
    }
  };

  const handleSort = (column: 'call_type' | 'call_duration' | 'call_timestamp') => {
    let newSortOrder: 'asc' | 'desc' = 'asc';

    // If clicking the same column, toggle the sort order
    if (filters.sort_by === column) {
      newSortOrder = filters.sort_order === 'asc' ? 'desc' : 'asc';
    }

    setFilters({
      ...filters,
      sort_by: column,
      sort_order: newSortOrder,
      page: 1, // Reset to first page when sorting
    });
  };

  const getSortIcon = (column: 'call_type' | 'call_duration' | 'call_timestamp') => {
    if (filters.sort_by !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    }
    return filters.sort_order === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      await apiService.exportCallLogsExcel(filters);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting('pdf');
      await apiService.exportCallLogsPdf(filters);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF file. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout title="Call Logs">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search by name or number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-5 h-5" />}
                >
                  Filters
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleExportExcel}
                  disabled={exporting !== null}
                  icon={<Download className="w-5 h-5" />}
                >
                  {exporting === 'excel' ? 'Exporting...' : 'Excel'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleExportPdf}
                  disabled={exporting !== null}
                  icon={<Download className="w-5 h-5" />}
                >
                  {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
                </Button>
              </form>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-neutral-700">Advanced Filters</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      icon={<X className="w-4 h-4" />}
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Agent Filter */}
                    <Select
                      label="Agent"
                      value={pendingFilters.user_id?.toString() || ''}
                      onChange={(e) =>
                        handleFilterChange('user_id', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      disabled={loadingDropdowns}
                      options={[
                        { value: '', label: 'All Agents' },
                        ...users.map((user) => ({
                          value: user.id.toString(),
                          label: `${user.name}${user.branch ? ` (${user.branch.name})` : ''}`,
                        })),
                      ]}
                    />

                    {/* Branch Filter - Only for Super Admin */}
                    {admin?.admin_role === 'super_admin' && (
                      <Select
                        label="Branch"
                        value={pendingFilters.branch_id?.toString() || ''}
                        onChange={(e) =>
                          handleFilterChange('branch_id', e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        disabled={loadingDropdowns}
                        options={[
                          { value: '', label: 'All Branches' },
                          ...branches.map((branch) => ({
                            value: branch.id.toString(),
                            label: branch.name,
                          })),
                        ]}
                      />
                    )}

                    {/* Call Type Filter */}
                    <Select
                      label="Call Type"
                      value={pendingFilters.call_type || ''}
                      onChange={(e) =>
                        handleFilterChange('call_type', e.target.value as CallType)
                      }
                      options={[
                        { value: '', label: 'All Types' },
                        { value: 'incoming', label: 'Incoming' },
                        { value: 'outgoing', label: 'Outgoing' },
                        { value: 'missed', label: 'Missed' },
                        { value: 'rejected', label: 'Rejected' },
                      ]}
                    />

                    {/* Caller Number Filter */}
                    <Input
                      type="text"
                      label="Caller Number"
                      placeholder="Search by number..."
                      value={pendingFilters.number || ''}
                      onChange={(e) => handleFilterChange('number', e.target.value)}
                    />

                    {/* Date Range */}
                    <Input
                      type="date"
                      label="From Date"
                      value={pendingFilters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="To Date"
                      value={pendingFilters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    />

                    {/* Time Range */}
                    <Input
                      type="time"
                      label="From Time"
                      value={pendingFilters.time_from || ''}
                      onChange={(e) => handleFilterChange('time_from', e.target.value)}
                    />
                    <Input
                      type="time"
                      label="To Time"
                      value={pendingFilters.time_to || ''}
                      onChange={(e) => handleFilterChange('time_to', e.target.value)}
                    />

                    {/* Duration Range */}
                    <Input
                      type="number"
                      label="Min Duration (seconds)"
                      placeholder="0"
                      min="0"
                      value={pendingFilters.duration_min?.toString() || ''}
                      onChange={(e) =>
                        handleFilterChange('duration_min', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                    <Input
                      type="number"
                      label="Max Duration (seconds)"
                      placeholder="3600"
                      min="0"
                      value={pendingFilters.duration_max?.toString() || ''}
                      onChange={(e) =>
                        handleFilterChange('duration_max', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </div>

                  {/* Apply Filters Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={applyFilters}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call History</CardTitle>
              {data && (
                <span className="text-sm text-neutral-600">
                  Showing {data.pagination.from}-{data.pagination.to} of{' '}
                  {data.pagination.total}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading />
            ) : !data?.call_logs.length ? (
              <EmptyState
                icon={<Phone className="w-16 h-16" />}
                title="No call logs found"
                description="There are no call logs matching your criteria."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Caller
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          SIM
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                          onClick={() => handleSort('call_type')}
                        >
                          <div className="flex items-center">
                            Type
                            {getSortIcon('call_type')}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                          onClick={() => handleSort('call_duration')}
                        >
                          <div className="flex items-center">
                            Duration
                            {getSortIcon('call_duration')}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                          onClick={() => handleSort('call_timestamp')}
                        >
                          <div className="flex items-center">
                            Date & Time
                            {getSortIcon('call_timestamp')}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Recordings
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {data.call_logs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">
                              {log.caller_name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {log.caller_number}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">
                              {log.user?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {log.user?.branch?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {log.sim_name ? (
                                <div>
                                  <div className="font-medium">{log.sim_name}</div>
                                  {log.sim_number && (
                                    <div className="text-xs text-neutral-500">{log.sim_number}</div>
                                  )}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <CallTypeBadge type={log.call_type} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {formatDuration(log.call_duration)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {formatDate(log.call_timestamp)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {log.recordings_count || 0} recording(s)
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Eye className="w-4 h-4" />}
                                onClick={() => setSelectedLogId(log.id)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => handleDelete(log.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data.pagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() =>
                        setFilters({ ...filters, page: (filters.page || 1) - 1 })
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-neutral-600">
                      Page {filters.page} of {data.pagination.last_page}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={filters.page === data.pagination.last_page}
                      onClick={() =>
                        setFilters({ ...filters, page: (filters.page || 1) + 1 })
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call Log Detail Modal */}
      <Modal
        isOpen={selectedLogId !== null}
        onClose={() => setSelectedLogId(null)}
        title="Call Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Call Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Caller Name</label>
                <p className="text-base text-neutral-900 mt-1">
                  {selectedLog.caller_name || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Phone Number</label>
                <p className="text-base text-neutral-900 mt-1">
                  {selectedLog.caller_number}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Call Type</label>
                <div className="mt-1">
                  <CallTypeBadge type={selectedLog.call_type} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Duration</label>
                <p className="text-base text-neutral-900 mt-1">
                  {formatDuration(selectedLog.call_duration)}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-neutral-600">Date & Time</label>
                <p className="text-base text-neutral-900 mt-1">
                  {formatDate(selectedLog.call_timestamp)}
                </p>
              </div>
              {(selectedLog.sim_name || selectedLog.sim_number) && (
                <>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">SIM Name</label>
                    <p className="text-base text-neutral-900 mt-1">
                      {selectedLog.sim_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">SIM Number</label>
                    <p className="text-base text-neutral-900 mt-1">
                      {selectedLog.sim_number || 'N/A'}
                    </p>
                  </div>
                  {selectedLog.sim_slot_index !== null && (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">SIM Slot</label>
                      <p className="text-base text-neutral-900 mt-1">
                        Slot {selectedLog.sim_slot_index + 1}
                      </p>
                    </div>
                  )}
                </>
              )}
              {selectedLog.notes && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-neutral-600">Notes</label>
                  <p className="text-base text-neutral-900 mt-1">{selectedLog.notes}</p>
                </div>
              )}
            </div>

            {/* Recordings */}
            {selectedLog.recordings && selectedLog.recordings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Recordings ({selectedLog.recordings.length})
                </h3>
                <div className="space-y-4">
                  {selectedLog.recordings.map((recording) => (
                    <AudioPlayer key={recording.id} recording={recording} />
                  ))}
                </div>
              </div>
            )}

            {(!selectedLog.recordings || selectedLog.recordings.length === 0) && (
              <EmptyState
                title="No recordings available"
                description="This call log doesn't have any recordings."
              />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};
