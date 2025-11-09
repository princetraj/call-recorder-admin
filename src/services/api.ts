import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  LoginRequest,
  AdminLoginResponse,
  CallLog,
  CallLogsResponse,
  CallLogFilters,
  Recording,
  UploadRecordingRequest,
  Device,
  DevicesResponse,
  DeviceFilters,
  Branch,
  CreateBranchRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<any>>) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear auth token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('admin');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Admin Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
    const response = await this.api.post<ApiResponse<AdminLoginResponse>>('/admin/login', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/admin/logout');
    return response.data;
  }

  async getMe(): Promise<ApiResponse<{ admin: Admin }>> {
    const response = await this.api.get<ApiResponse<{ admin: Admin }>>('/admin/me');
    return response.data;
  }

  // Call Logs endpoints
  async getCallLogs(filters?: CallLogFilters): Promise<ApiResponse<CallLogsResponse>> {
    const response = await this.api.get<ApiResponse<CallLogsResponse>>('/admin/call-logs', {
      params: filters,
    });
    return response.data;
  }

  async getCallLog(id: number): Promise<ApiResponse<{ call_log: CallLog }>> {
    const response = await this.api.get<ApiResponse<{ call_log: CallLog }>>(`/admin/call-logs/${id}`);
    return response.data;
  }

  async deleteCallLog(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/call-logs/${id}`);
    return response.data;
  }

  // Recordings endpoints
  async getRecordings(callLogId: number): Promise<ApiResponse<{ recordings: Recording[] }>> {
    const response = await this.api.get<ApiResponse<{ recordings: Recording[] }>>(
      `/admin/call-logs/${callLogId}/recordings`
    );
    return response.data;
  }

  async deleteRecording(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/call-recordings/${id}`);
    return response.data;
  }

  // Devices endpoints
  async getDevices(filters?: DeviceFilters): Promise<ApiResponse<DevicesResponse>> {
    const response = await this.api.get<ApiResponse<DevicesResponse>>('/admin/devices', {
      params: filters,
    });
    return response.data;
  }

  async getDevice(id: number): Promise<ApiResponse<{ device: Device }>> {
    const response = await this.api.get<ApiResponse<{ device: Device }>>(`/admin/devices/${id}`);
    return response.data;
  }

  async deleteDevice(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/devices/${id}`);
    return response.data;
  }

  // Branch endpoints
  async getBranches(filters?: { status?: string; search?: string }): Promise<ApiResponse<Branch[]>> {
    const response = await this.api.get<ApiResponse<Branch[]>>('/admin/branches', {
      params: filters,
    });
    return response.data;
  }

  async getBranch(id: number): Promise<ApiResponse<Branch>> {
    const response = await this.api.get<ApiResponse<Branch>>(`/admin/branches/${id}`);
    return response.data;
  }

  async createBranch(data: CreateBranchRequest): Promise<ApiResponse<Branch>> {
    const response = await this.api.post<ApiResponse<Branch>>('/admin/branches', data);
    return response.data;
  }

  async updateBranch(id: number, data: CreateBranchRequest): Promise<ApiResponse<Branch>> {
    const response = await this.api.put<ApiResponse<Branch>>(`/admin/branches/${id}`, data);
    return response.data;
  }

  async deleteBranch(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/branches/${id}`);
    return response.data;
  }

  // User management endpoints (Android app users)
  async getUsers(filters?: { branch_id?: number; status?: string; search?: string }): Promise<ApiResponse<User[]>> {
    const response = await this.api.get<ApiResponse<User[]>>('/admin/users', {
      params: filters,
    });
    return response.data;
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  }

  // Admin management endpoints
  async getAdmins(filters?: { admin_role?: string; branch_id?: number; status?: string; search?: string }): Promise<ApiResponse<Admin[]>> {
    const response = await this.api.get<ApiResponse<Admin[]>>('/admin/admins', {
      params: filters,
    });
    return response.data;
  }

  async getAdmin(id: number): Promise<ApiResponse<Admin>> {
    const response = await this.api.get<ApiResponse<Admin>>(`/admin/admins/${id}`);
    return response.data;
  }

  async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<Admin>> {
    const response = await this.api.post<ApiResponse<Admin>>('/admin/admins', data);
    return response.data;
  }

  async updateAdmin(id: number, data: UpdateAdminRequest): Promise<ApiResponse<Admin>> {
    const response = await this.api.put<ApiResponse<Admin>>(`/admin/admins/${id}`, data);
    return response.data;
  }

  async deleteAdmin(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/admin/admins/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
