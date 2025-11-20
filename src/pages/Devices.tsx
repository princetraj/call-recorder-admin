import React, { useState, useMemo } from 'react';
import { Layout } from '../components/layout';
import { Card, CardContent, Badge, Button, EmptyState, Loading, Modal } from '../components/ui';
import { useDevices, useDeleteDevice, useLogoutDevice } from '../hooks/useDevices';
import { Device, DeviceFilters } from '../types';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import {
  Phone,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Clock,
  User,
  Trash2,
  MonitorSmartphone,
  LogOut,
  CheckCircle2,
  XCircle,
  Shield,
  Building2,
  LayoutGrid,
  List
} from 'lucide-react';

// Helper functions moved outside component to prevent recreation on every render
const formatLastSeen = (lastUpdated: string | null): string => {
  if (!lastUpdated) return 'Never';

  const date = new Date(lastUpdated);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleString();
};

const getBatteryIcon = (percentage: number | null, isCharging: boolean) => {
  if (isCharging) return <BatteryCharging className="w-4 h-4" />;
  if (percentage === null) return <Battery className="w-4 h-4" />;
  if (percentage <= 20) return <BatteryLow className="w-4 h-4" />;
  if (percentage <= 50) return <BatteryMedium className="w-4 h-4" />;
  return <Battery className="w-4 h-4" />;
};

const getBatteryColor = (percentage: number | null, isCharging: boolean) => {
  if (isCharging) return 'text-green-600';
  if (percentage === null) return 'text-neutral-400';
  if (percentage <= 20) return 'text-red-600';
  if (percentage <= 50) return 'text-amber-600';
  return 'text-green-600';
};

const getSignalIcon = (strength: number | null) => {
  if (strength === null || strength === 0) return <SignalZero className="w-4 h-4" />;
  if (strength === 1) return <SignalLow className="w-4 h-4" />;
  if (strength === 2) return <SignalMedium className="w-4 h-4" />;
  if (strength === 3) return <Signal className="w-4 h-4" />;
  return <SignalHigh className="w-4 h-4" />;
};

const getSignalColor = (strength: number | null) => {
  if (strength === null || strength === 0) return 'text-neutral-400';
  if (strength === 1) return 'text-red-600';
  if (strength === 2) return 'text-amber-600';
  if (strength === 3) return 'text-green-600';
  return 'text-green-700';
};

const renderConnectionIcon = (type: string | null) => {
  if (type === 'wifi') return <Wifi className="w-4 h-4" />;
  if (type === 'mobile') return <Signal className="w-4 h-4" />;
  return <WifiOff className="w-4 h-4" />;
};

const getPermissionLabel = (key: string): string => {
  const labels: Record<string, string> = {
    read_call_log: 'Call Logs',
    read_phone_state: 'Phone State',
    read_contacts: 'Contacts',
    read_external_storage: 'Storage',
    read_media_audio: 'Media Audio',
    post_notifications: 'Notifications',
  };
  return labels[key] || key;
};

const Devices: React.FC = () => {
  const { admin } = useAuthStore();

  // Initialize filters with branch_id for managers (backend filtering)
  const [filters, setFilters] = useState<DeviceFilters>({
    page: 1,
    per_page: 20,
    // Automatically filter by manager's branch on backend
    ...(admin?.admin_role === 'manager' && admin.branch_id ? { branch_id: admin.branch_id } : {}),
  });

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDeviceForPermissions, setSelectedDeviceForPermissions] = useState<Device | null>(null);

  // Fetch branches for filter dropdown - Only for super_admin
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiService.getBranches();
      return response.data || [];
    },
    enabled: admin?.admin_role === 'super_admin', // Only load for super_admin
  });

  // Fetch users for filter dropdown - Only for super_admin
  const { data: usersDataForFilter } = useQuery({
    queryKey: ['users-all'],
    queryFn: async () => {
      const response = await apiService.getUsers();
      return response.data || [];
    },
    enabled: admin?.admin_role === 'super_admin', // Only load for super_admin
  });

  const { data, isLoading } = useDevices(filters);
  const deleteDevice = useDeleteDevice();
  const logoutDevice = useLogoutDevice();

  // Only super_admin can delete/logout devices
  const canManageDevices = admin?.admin_role === 'super_admin';

  const handleDelete = (id: number, deviceModel: string) => {
    if (window.confirm(`Are you sure you want to delete ${deviceModel}?`)) {
      deleteDevice.mutate(id);
    }
  };

  const handleLogout = (id: number, deviceModel: string) => {
    if (window.confirm(`Are you sure you want to logout ${deviceModel}? The device will be logged out on its next status update.`)) {
      logoutDevice.mutate(id);
    }
  };

  const renderCallStatus = (device: Device) => {
    if (device.current_call_status === 'idle') {
      return null;
    }

    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-blue-50 border-blue-200 text-blue-700 mb-3">
        <Phone className="w-4 h-4" />
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase">In Call</div>
          {device.current_call_number && (
            <div className="text-sm font-mono">{device.current_call_number}</div>
          )}
        </div>
      </div>
    );
  };

  const renderPermissions = (device: Device) => {
    if (!device.permissions) return null;

    const allGranted = Object.values(device.permissions).every(p => p === true);
    const noneGranted = Object.values(device.permissions).every(p => p === false);
    const grantedCount = Object.values(device.permissions).filter(p => p === true).length;
    const totalCount = Object.keys(device.permissions).length;

    return (
      <div className="pt-3 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-semibold text-neutral-700">Permissions</span>
          </div>
          <button
            onClick={() => setSelectedDeviceForPermissions(device)}
            className="hover:scale-105 transition-transform"
            title="View permission details"
          >
            <Badge variant={allGranted ? 'success' : noneGranted ? 'danger' : 'warning'}>
              {grantedCount}/{totalCount}
            </Badge>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(device.permissions).map(([key, granted]) => (
            <div key={key} className="flex items-center gap-1.5">
              {granted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              )}
              <span className={`text-xs ${granted ? 'text-green-700' : 'text-red-700'}`}>
                {getPermissionLabel(key)}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSelectedDeviceForPermissions(device)}
          className="mt-3 w-full text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
        >
          View All Details
        </button>
      </div>
    );
  };

  // Pre-calculate permission stats for devices - Memoized for performance
  // Note: Backend already filters devices by branch for managers via branch_id filter
  const filteredDevices = useMemo(() => {
    if (!data || !data.pagination || !data.pagination.data) return [];

    const devices = data.pagination.data;

    // Pre-calculate permission stats for each device to avoid recalculation in render
    return devices.map((device: Device) => {
      if (!device.permissions) return device;

      const permissionValues = Object.values(device.permissions);
      const permissionStats = {
        allGranted: permissionValues.every(p => p === true),
        noneGranted: permissionValues.every(p => p === false),
        grantedCount: permissionValues.filter(p => p === true).length,
        totalCount: Object.keys(device.permissions).length,
      };

      return { ...device, _permissionStats: permissionStats };
    });
  }, [data]);

  return (
    <Layout title="Devices">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-semibold">Installed Devices</h2>
                  {data && data.pagination && (
                    <span className="text-sm text-neutral-500">
                      ({filteredDevices.length} total)
                    </span>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 border border-neutral-300 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-rose-600 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-rose-600 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`grid gap-4 ${admin?.admin_role === 'super_admin' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                {/* Status Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <select
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    value={filters.status || 'all'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value as 'online' | 'offline', page: 1 })}
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Branch Filter - Only for super_admin */}
                {admin?.admin_role === 'super_admin' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700">Branch</label>
                    <select
                      className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                      value={filters.branch_id || 'all'}
                      onChange={(e) => setFilters({ ...filters, branch_id: e.target.value === 'all' ? undefined : parseInt(e.target.value), page: 1 })}
                    >
                      <option value="all">All Branches</option>
                      {branchesData?.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* User Filter - Only for super_admin */}
                {admin?.admin_role === 'super_admin' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700">User</label>
                    <select
                      className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                      value={filters.user_id || 'all'}
                      onChange={(e) => setFilters({ ...filters, user_id: e.target.value === 'all' ? undefined : parseInt(e.target.value), page: 1 })}
                    >
                      <option value="all">All Users</option>
                      {usersDataForFilter?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Permission Status Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-700">Permissions</label>
                  <select
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    value={filters.permission_status || 'all'}
                    onChange={(e) => setFilters({ ...filters, permission_status: e.target.value === 'all' ? undefined : e.target.value as 'all_granted' | 'some_denied' | 'all_denied', page: 1 })}
                  >
                    <option value="all">All Permissions</option>
                    <option value="all_granted">All Granted</option>
                    <option value="some_denied">Some Denied</option>
                    <option value="all_denied">All Denied</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices List */}
        {isLoading ? (
          <Loading />
        ) : filteredDevices.length === 0 ? (
          <EmptyState title="No devices found" description="No devices have been registered yet." />
        ) : viewMode === 'list' ? (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Branch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Battery</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Signal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Permissions</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Last Seen</th>
                      {canManageDevices && (
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredDevices.map((device: any) => {
                      // Use pre-calculated permission stats for better performance
                      const allGranted = device._permissionStats?.allGranted || false;
                      const grantedCount = device._permissionStats?.grantedCount || 0;
                      const totalCount = device._permissionStats?.totalCount || 0;

                      return (
                        <tr key={device.id} className="hover:bg-neutral-50">
                          {/* Device */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${device.is_online ? 'bg-green-100' : 'bg-neutral-100'}`}>
                                <Smartphone className={`w-5 h-5 ${device.is_online ? 'text-green-600' : 'text-neutral-400'}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-neutral-900">{device.device_model || 'Unknown'}</div>
                                <div className="text-sm text-neutral-500">{device.manufacturer || 'Unknown'}</div>
                                <div className="text-xs text-neutral-400 font-mono">{device.device_id.substring(0, 12)}...</div>
                              </div>
                            </div>
                          </td>

                          {/* User */}
                          <td className="px-4 py-4">
                            {device.user ? (
                              <div>
                                <div className="font-medium text-neutral-900">{device.user.name}</div>
                                <div className="text-sm text-neutral-500">{device.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>

                          {/* Branch */}
                          <td className="px-4 py-4">
                            {device.user?.branch ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-neutral-500" />
                                <span className="text-sm text-neutral-700">{device.user.branch.name}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <Badge variant={device.is_online ? 'success' : 'default'}>
                                {device.is_online ? 'Online' : 'Offline'}
                              </Badge>
                              {device.current_call_status !== 'idle' && (
                                <div className="flex items-center gap-1 text-xs text-blue-700">
                                  <Phone className="w-3 h-3" />
                                  <span>In Call</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Battery */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className={getBatteryColor(device.battery_percentage, device.is_charging)}>
                                {getBatteryIcon(device.battery_percentage, device.is_charging)}
                              </div>
                              <span className="text-sm text-neutral-700">
                                {device.battery_percentage !== null ? `${device.battery_percentage}%` : 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Signal */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className={getSignalColor(device.signal_strength)}>
                                {getSignalIcon(device.signal_strength)}
                              </div>
                              <span className="text-sm text-neutral-700 capitalize">
                                {device.signal_strength_label}
                              </span>
                            </div>
                          </td>

                          {/* Permissions */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setSelectedDeviceForPermissions(device)}
                              className="hover:scale-105 transition-transform"
                              title="View permission details"
                            >
                              <Badge variant={allGranted ? 'success' : grantedCount === 0 ? 'danger' : 'warning'}>
                                {grantedCount}/{totalCount}
                              </Badge>
                            </button>
                          </td>

                          {/* Last Seen */}
                          <td className="px-4 py-4">
                            <div className="text-sm text-neutral-700">
                              {formatLastSeen(device.last_updated_at)}
                            </div>
                          </td>

                          {/* Actions */}
                          {canManageDevices && (
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleLogout(device.id, device.device_model || 'this device')}
                                  className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Logout Device"
                                >
                                  <LogOut className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(device.id, device.device_model || 'this device')}
                                  className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Device"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device: any) => (
              <Card key={device.id}>
                <CardContent>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${device.is_online ? 'bg-green-100' : 'bg-neutral-100'}`}>
                          <Smartphone className={`w-6 h-6 ${device.is_online ? 'text-green-600' : 'text-neutral-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {device.device_model || 'Unknown Device'}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {device.manufacturer || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={device.is_online ? 'success' : 'default'}>
                        {device.is_online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>

                    {/* User Info */}
                    {device.user && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <User className="w-4 h-4" />
                          <span>{device.user.name}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-500 font-mono">ID: {device.user.id}</span>
                        </div>
                        {device.user.branch && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Building2 className="w-4 h-4" />
                            <span>{device.user.branch.name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Device Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
                      {/* Connection */}
                      <div className="flex items-center gap-2">
                        {renderConnectionIcon(device.connection_type)}
                        <div>
                          <div className="text-xs text-neutral-500">Connection</div>
                          <div className="text-sm font-medium">
                            {device.connection_type?.toUpperCase() || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Battery */}
                      <div className="flex items-center gap-2">
                        <div className={getBatteryColor(device.battery_percentage, device.is_charging)}>
                          {getBatteryIcon(device.battery_percentage, device.is_charging)}
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">Battery</div>
                          <div className="text-sm font-medium">
                            {device.battery_percentage !== null ? `${device.battery_percentage}%` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Signal */}
                      <div className="flex items-center gap-2">
                        <div className={getSignalColor(device.signal_strength)}>
                          {getSignalIcon(device.signal_strength)}
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">Signal</div>
                          <div className="text-sm font-medium capitalize">
                            {device.signal_strength_label}
                          </div>
                        </div>
                      </div>

                      {/* Last Seen */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <div>
                          <div className="text-xs text-neutral-500">Last Seen</div>
                          <div className="text-sm font-medium">
                            {formatLastSeen(device.last_updated_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Call Status */}
                    {renderCallStatus(device)}

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-neutral-200 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">OS Version:</span>
                        <span className="font-medium">Android {device.os_version || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">App Version:</span>
                        <span className="font-medium">{device.app_version || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Device ID:</span>
                        <span className="font-mono text-xs">{device.device_id.substring(0, 12)}...</span>
                      </div>
                    </div>

                    {/* Permissions */}
                    {renderPermissions(device)}

                    {/* Actions - Only for super_admin */}
                    {canManageDevices && (
                      <div className="pt-3 border-t border-neutral-200 space-y-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleLogout(device.id, device.device_model || 'this device')}
                          className="w-full"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout Device
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(device.id, device.device_model || 'this device')}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Device
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination && data.pagination.last_page > 1 && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Showing {data.pagination.from} to {data.pagination.to} of {data.pagination.total} devices
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={filters.page === data.pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permissions Detail Modal */}
        <Modal
          isOpen={!!selectedDeviceForPermissions}
          onClose={() => setSelectedDeviceForPermissions(null)}
          title="Device Permissions"
          size="md"
        >
          {selectedDeviceForPermissions && (
            <div className="space-y-4">
              {/* Device Info */}
              <div className="pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-5 h-5 text-neutral-600" />
                  <div>
                    <div className="font-semibold text-neutral-900">
                      {selectedDeviceForPermissions.device_model || 'Unknown Device'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {selectedDeviceForPermissions.manufacturer || 'Unknown'}
                    </div>
                  </div>
                </div>
                {selectedDeviceForPermissions.user && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <User className="w-4 h-4" />
                    <span>{selectedDeviceForPermissions.user.name}</span>
                  </div>
                )}
              </div>

              {/* Permissions List */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Permission Status
                </h3>
                <div className="space-y-2">
                  {selectedDeviceForPermissions.permissions && Object.entries(selectedDeviceForPermissions.permissions).map(([key, granted]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        granted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {granted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${granted ? 'text-green-900' : 'text-red-900'}`}>
                          {getPermissionLabel(key)}
                        </span>
                      </div>
                      <Badge variant={granted ? 'success' : 'danger'}>
                        {granted ? 'Granted' : 'Denied'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Total Permissions:</span>
                  <span className="font-semibold text-neutral-900">
                    {selectedDeviceForPermissions.permissions ? Object.keys(selectedDeviceForPermissions.permissions).length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neutral-600">Granted:</span>
                  <span className="font-semibold text-green-600">
                    {selectedDeviceForPermissions.permissions ? Object.values(selectedDeviceForPermissions.permissions).filter(p => p === true).length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neutral-600">Denied:</span>
                  <span className="font-semibold text-red-600">
                    {selectedDeviceForPermissions.permissions ? Object.values(selectedDeviceForPermissions.permissions).filter(p => p === false).length : 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Devices;
