import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      // In a real app, you'd have a proper JWT token
      config.headers.Authorization = `Bearer ${user.id}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const endTime = new Date();
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
      console.log(`API Request to ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show access denied message
          console.error('Access denied:', data.message || 'Insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.config.url);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data.message || error.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
};

// Specific API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  resetPassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

export const eventsAPI = {
  getAll: () =>
    api.get('/events'),
  
  getById: (id: string) =>
    api.get(`/events/${id}`),
  
  create: (eventData: any) =>
    api.post('/events', eventData),
  
  update: (id: string, eventData: any) =>
    api.put(`/events/${id}`, eventData),
  
  delete: (id: string) =>
    api.delete(`/events/${id}`),
};

export const attendeesAPI = {
  getAll: () =>
    api.get('/attendees'),
  
  getByEventId: (eventId: string) =>
    api.get(`/attendees/event/${eventId}`),
  
  create: (attendeeData: any) =>
    api.post('/attendees', attendeeData),
  
  update: (id: string, attendeeData: any) =>
    api.put(`/attendees/${id}`, attendeeData),
  
  approve: (id: string) =>
    api.patch(`/attendees/${id}/approve`),
  
  reject: (id: string, reason: string) =>
    api.patch(`/attendees/${id}/reject`, { reason }),
  
  delete: (id: string) =>
    api.delete(`/attendees/${id}`),
};

export const vouchersAPI = {
  getAll: () =>
    api.get('/vouchers'),
  
  getByEventId: (eventId: string) =>
    api.get(`/vouchers/event/${eventId}`),
  
  getByAttendeeId: (attendeeId: string) =>
    api.get(`/vouchers/attendee/${attendeeId}`),
  
  claimDrink: (voucherId: string, claimData: { drinkType: 'soft' | 'hard'; itemName?: string }) =>
    api.patch(`/vouchers/${voucherId}/claim`, claimData),
};

export const usersAPI = {
  getAll: () =>
    api.get('/users'),
  
  create: (userData: any) =>
    api.post('/users', userData),
  
  update: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  
  updateStatus: (id: string, status: 'active' | 'disabled') =>
    api.patch(`/users/${id}/status`, { status }),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

export const subsidiariesAPI = {
  getAll: () =>
    api.get('/subsidiaries'),
  
  create: (subsidiaryData: any) =>
    api.post('/subsidiaries', subsidiaryData),
  
  update: (id: string, subsidiaryData: any) =>
    api.put(`/subsidiaries/${id}`, subsidiaryData),
  
  delete: (id: string) =>
    api.delete(`/subsidiaries/${id}`),
  
  uploadEmployees: (id: string, employees: any[]) =>
    api.post(`/subsidiaries/${id}/employees`, { employees }),
  
  getEmployees: (id: string) =>
    api.get(`/subsidiaries/${id}/employees`),
};

export const reportsAPI = {
  getOverview: () =>
    api.get('/reports/overview'),
  
  getEventBreakdown: () =>
    api.get('/reports/events'),
  
  getDepartmentAnalysis: () =>
    api.get('/reports/departments'),
  
  getVoucherUsage: () =>
    api.get('/reports/vouchers'),
  
  exportAttendees: (eventId?: string) =>
    api.get('/reports/export/attendees', { 
      params: { eventId },
      responseType: 'blob' 
    }),
  
  exportVouchers: (eventId?: string) =>
    api.get('/reports/export/vouchers', { 
      params: { eventId },
      responseType: 'blob' 
    }),
};

// Utility functions
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

export const isServerError = (error: any): boolean => {
  return error.response && error.response.status >= 500;
};

export default apiClient;