import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card, CardContent, Badge, Button, EmptyState, Loading, Select } from '../components/ui';
import { useDevices, useDeleteDevice, useLogoutDevice } from '../hooks/useDevices';
import { Device, DeviceFilters } from '../types';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
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
  Shield
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

const getConnectionBadgeVariant = (type: string | null) => {
  if (type === 'wifi') return 'success';
  if (type === 'mobile') return 'warning';
  return 'default';
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

  const [filters, setFilters] = useState<DeviceFilters>({
    page: 1,
    per_page: 20,
  });

  // Fetch users from manager's branch to get their IDs
  const { data: usersData } = useQuery({
    queryKey: ['users-for-devices', admin?.branch_id],
    queryFn: async () => {
      if (admin?.admin_role === 'manager' && admin.branch_id) {
        const response = await apiService.getUsers({
          branch_id: admin.branch_id,
        });
        return response.data || [];
      }
      return [];
    },
    enabled: admin?.admin_role === 'manager' && !!admin?.branch_id,
  });

  const { data, isLoading } = useDevices(filters);
  const deleteDevice = useDeleteDevice();
  const logoutDevice = useLogoutDevice();

  // Only super_admin can delete/logout devices
  const canManageDevices = admin?.admin_role === 'super_admin';

  // Get user IDs from manager's branch
  const branchUserIds = usersData ? usersData.map(user => user.id) : [];

  const handleStatusFilterChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : (value as 'online' | 'offline'),
      page: 1,
    });
  };

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
          <Badge variant={allGranted ? 'success' : noneGranted ? 'danger' : 'warning'}>
            {grantedCount}/{totalCount}
          </Badge>
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
      </div>
    );
  };

  // Filter devices based on admin role
  const getFilteredDevices = (): Device[] => {
    if (!data || !data.pagination || !data.pagination.data) return [];

    const devices = data.pagination.data;

    // Manager can only see devices from users in their branch
    if (admin?.admin_role === 'manager') {
      return devices.filter((device: Device) => {
        // Check if device's user ID is in the branch user IDs list
        return device.user && branchUserIds.includes(device.user.id);
      });
    }

    // Super admin can see all devices
    return devices;
  };

  const filteredDevices = getFilteredDevices();

  return (
    <Layout title="Devices">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-semibold">Installed Devices</h2>
                {data && data.pagination && (
                  <span className="text-sm text-neutral-500">
                    ({filteredDevices.length} total)
                  </span>
                )}
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-neutral-700">Status:</label>
                  <select
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={filters.status || 'all'}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                  >
                    <option value="all">All Devices</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device: Device) => (
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
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <User className="w-4 h-4" />
                        <span>{device.user.name}</span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-neutral-500 font-mono">ID: {device.user.id}</span>
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
      </div>
    </Layout>
  );
};

export default Devices;
