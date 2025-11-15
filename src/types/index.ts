// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Admin types
export type AdminRole = 'super_admin' | 'manager' | 'trainee';

export interface Admin {
  id: number;
  name: string;
  email: string;
  admin_role: AdminRole;
  status: 'active' | 'inactive';
  branch_id?: number | null;
  branch?: Branch | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  admin_role: AdminRole;
  status?: 'active' | 'inactive';
  branch_id?: number | null;
}

export interface UpdateAdminRequest {
  name: string;
  email: string;
  password?: string;
  admin_role: AdminRole;
  status?: 'active' | 'inactive';
  branch_id?: number | null;
}

// User types (for Android app users)
export interface User {
  id: number;
  name: string;
  email?: string | null;
  mobile: string | null;
  status: 'active' | 'inactive';
  branch_id?: number | null;
  branch?: Branch | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  password: string;
  mobile?: string;
  status?: 'active' | 'inactive';
  branch_id?: number | null;
}

export interface UpdateUserRequest {
  name: string;
  password?: string;
  mobile?: string;
  status?: 'active' | 'inactive';
  branch_id?: number | null;
}

// Branch types (merged branch and center)
export interface Branch {
  id: number;
  name: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  users?: User[];
  admins?: Admin[];
}

export interface CreateBranchRequest {
  name: string;
  location?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: Admin;
  token: string;
}

export interface UserLoginResponse {
  user: User;
  token: string;
}

// Call Log types
export type CallType = 'incoming' | 'outgoing' | 'missed' | 'rejected';

export interface CallLogStatistics {
  period: 'daily' | 'weekly' | 'monthly';
  total_calls: number;
  incoming: number;
  outgoing: number;
  missed: number;
  rejected: number;
  total_duration: number;
  average_duration: number;
}

export interface CallLog {
  id: number;
  user_id: number;
  caller_name: string | null;
  caller_number: string;
  call_type: CallType;
  call_duration: number;
  call_timestamp: string;
  sim_slot_index: number | null;
  sim_name: string | null;
  sim_number: string | null;
  sim_serial_number: string | null;
  notes: string | null;
  recordings_count?: number;
  created_at: string;
  updated_at: string;
  recordings?: Recording[];
  user?: User;
}

export interface CreateCallLogRequest {
  caller_name?: string;
  caller_number: string;
  call_type: CallType;
  call_duration: number;
  call_timestamp: string;
  notes?: string;
}

// Recording types
export interface Recording {
  id: number;
  call_log_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  duration: number | null;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export interface UploadRecordingRequest {
  call_log_id: number;
  recording: File;
  duration?: number;
}

// Pagination types
export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  data?: any[];
}

export interface CallLogsResponse {
  call_logs: CallLog[];
  pagination: Pagination;
}

// Filter types
export interface CallLogFilters {
  page?: number;
  per_page?: number;
  call_type?: CallType;
  date_from?: string;
  date_to?: string;
  date?: string;
  time_from?: string;
  time_to?: string;
  duration_min?: number;
  duration_max?: number;
  user_id?: number;
  branch_id?: number;
  number?: string;
  search?: string;
  sort_by?: 'call_type' | 'call_duration' | 'call_timestamp';
  sort_order?: 'asc' | 'desc';
}

// Device types
export type ConnectionType = 'wifi' | 'mobile' | 'none';
export type AppRunningStatus = 'active' | 'background' | 'stopped';
export type ConnectionStatus = 'online' | 'offline';
export type BatteryStatus = 'good' | 'medium' | 'low' | 'unknown';
export type SignalStrengthLabel = 'great' | 'good' | 'moderate' | 'poor' | 'none' | 'unknown';

export type CallStatus = 'idle' | 'in_call';

export interface Device {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  device_id: string;
  device_model: string | null;
  manufacturer: string | null;
  os_version: string | null;
  app_version: string | null;
  connection_type: ConnectionType | null;
  battery_percentage: number | null;
  signal_strength: number | null;
  signal_strength_label: SignalStrengthLabel;
  is_charging: boolean;
  app_running_status: AppRunningStatus;
  last_updated_at: string | null;
  registered_at: string;
  connection_status: ConnectionStatus;
  battery_status: BatteryStatus;
  is_online: boolean;
  current_call_status: CallStatus;
  current_call_number: string | null;
  call_started_at: string | null;
}

export interface DevicesResponse {
  pagination: Pagination & { data: Device[] };
}

export interface DeviceFilters {
  page?: number;
  per_page?: number;
  status?: 'online' | 'offline';
  user_id?: number;
}

// Login Activity types
export interface LoginActivity {
  id: number;
  user_type: 'user' | 'admin';
  user_id: number | null;
  email: string | null;
  user_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_name: string | null;
  device_id: string | null;
  status: 'success' | 'failed';
  failure_reason: string | null;
  login_at: string;
  logout_at: string | null;
  session_duration: number | null;
}

export interface LoginActivitiesResponse {
  data: LoginActivity[];
  pagination: Pagination;
}

export interface LoginActivityFilters {
  page?: number;
  per_page?: number;
  user_type?: 'user' | 'admin';
  status?: 'success' | 'failed';
  user_id?: number;
  admin_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface LoginActivityStatistics {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  user_logins: number;
  admin_logins: number;
  success_rate: number;
  recent_activities: Array<{
    id: number;
    user_type: 'user' | 'admin';
    email: string;
    user_name: string | null;
    status: 'success' | 'failed';
    login_at: string;
  }>;
}
