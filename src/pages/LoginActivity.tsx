import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout';
import { Card, Input, Select, Badge, Loading } from '../components/ui';
import { apiService } from '../services/api';
import { LoginActivity, LoginActivityFilters, LoginActivityStatistics } from '../types';
import { Search, RefreshCw, CheckCircle, XCircle, User, Shield, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'user' | 'admin';

export const LoginActivities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [statistics, setStatistics] = useState<LoginActivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<LoginActivityFilters>({
    page: 1,
    per_page: 15,
    user_type: 'user', // Default to user tab
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });

  const fetchActivities = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [activitiesRes, statsRes] = await Promise.all([
        apiService.getLoginActivities(filters),
        apiService.getLoginActivityStatistics(),
      ]);

      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data.data || []);
        setPagination(activitiesRes.data.pagination || {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 15,
        });
      }

      if (statsRes.success && statsRes.data) {
        setStatistics(statsRes.data);
      }
    } catch (error: any) {
      console.error('Error fetching login activities:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch login activities');
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.per_page, filters.user_type, filters.status, filters.start_date, filters.end_date, filters.search]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      user_type: tab,
      page: 1, // Reset to first page when tab changes
    }));
  };

  const handleFilterChange = (key: keyof LoginActivityFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'Active';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: 'success' | 'failed') => {
    return status === 'success' ? (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Success
      </Badge>
    ) : (
      <Badge variant="danger" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Failed
      </Badge>
    );
  };

  const getUserTypeBadge = (userType: 'user' | 'admin') => {
    return userType === 'admin' ? (
      <Badge variant="warning" className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="info" className="flex items-center gap-1">
        <User className="w-3 h-3" />
        User
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Login Activity</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor user and admin login attempts</p>
          </div>
          <button
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('user')}
              className={`${
                activeTab === 'user'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <User className="w-4 h-4" />
              User App Logins
              {statistics && (
                <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  {statistics.user_logins}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              className={`${
                activeTab === 'admin'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <Shield className="w-4 h-4" />
              Admin Logins
              {statistics && (
                <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  {statistics.admin_logins}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <p className="text-sm text-gray-500">
                  {activeTab === 'user' ? 'Total User Logins' : 'Total Admin Logins'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeTab === 'user' ? statistics.user_logins : statistics.admin_logins}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statistics.successful_logins}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{statistics.failed_logins}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={activeTab === 'user' ? 'Search by user ID or name...' : 'Search by email or name...'}
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'success', label: 'Success' },
                  { value: 'failed', label: 'Failed' },
                ]}
              />
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
              />
            </div>
          </div>
        </Card>

        {/* Activities Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No login activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.user_name || 'Unknown'}
                          </div>
                          {activity.user_type === 'admin' ? (
                            <div className="text-sm text-gray-500">{activity.email}</div>
                          ) : (
                            <div className="text-sm text-gray-500 font-mono">User ID: {activity.user_id || 'N/A'}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserTypeBadge(activity.user_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(activity.status)}
                        {activity.failure_reason && (
                          <div className="text-xs text-red-600 mt-1">{activity.failure_reason}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDateTime(activity.login_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(activity.session_duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.ip_address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.device_name || 'N/A'}</div>
                        {activity.device_id && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {activity.device_id}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.last_page ||
                      Math.abs(page - pagination.current_page) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-3 py-1">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          pagination.current_page === page
                            ? 'bg-rose-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default LoginActivities;
