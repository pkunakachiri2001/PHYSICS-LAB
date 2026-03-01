import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ar_lab_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ar_lab_token');
      localStorage.removeItem('ar_lab_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: object) => api.put('/users/me', data),
  getMyProgress: () => api.get('/users/me/progress'),
  getAllUsers: (params?: object) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  toggleUserStatus: (id: string, isActive?: boolean) => api.patch(`/users/${id}/status`, { isActive }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Experiments ─────────────────────────────────────────────────────────────
export const experimentsAPI = {
  getAll: (params?: object) => api.get('/experiments', { params }),
  getById: (id: string) => api.get(`/experiments/${id}`),
  create: (data: object) => api.post('/experiments', data),
  startSession: (id: string, data?: object) => api.post(`/experiments/${id}/session`, data),
  updateSession: (sessionId: string, data: object) =>
    api.put(`/experiments/sessions/${sessionId}`, data),
  getMySessions: (experimentId: string) => api.get(`/experiments/${experimentId}/sessions`),
  delete: (id: string) => api.delete(`/experiments/${id}`),
  update: (id: string, data: object) => api.put(`/experiments/${id}`, data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics/me'),
  getStudentAnalytics: (studentId: string) => api.get(`/analytics/student/${studentId}`),
  getClassAnalytics: (classGroup: string) => api.get(`/analytics/class/${classGroup}`),
  getPlatformOverview: () => api.get('/analytics/overview'),
};

// ─── Progress ────────────────────────────────────────────────────────────────
export const progressAPI = {
  getMyProgress: () => api.get('/progress/me'),
  getStudentProgress: (studentId: string) => api.get(`/progress/student/${studentId}`),
};

export default api;
