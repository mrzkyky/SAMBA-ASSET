import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API Methods
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyEmailOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-email', { email, otp });
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

// User Management API Methods (Super Admin)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Dashboard Stats & Hierarchy
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data.data;
};

export const getHierarchy = async (branchId = '') => {
  const response = await api.get('/hierarchy', {
    params: { branch_id: branchId },
  });
  return response.data.data;
};

// Branch API
export const getBranches = async () => {
  const response = await api.get('/branches');
  return response.data.data;
};

export const createBranch = async (data) => {
  const response = await api.post('/branches', data);
  return response.data;
};

export const updateBranch = async (id, data) => {
  const response = await api.put(`/branches/${id}`, data);
  return response.data;
};

export const deleteBranch = async (id) => {
  const response = await api.delete(`/branches/${id}`);
  return response.data;
};

// Site API
export const getSites = async (branchId = '') => {
  const response = await api.get('/sites', {
    params: { branch_id: branchId },
  });
  return response.data.data;
};

export const createSite = async (data) => {
  const response = await api.post('/sites', data);
  return response.data;
};

export const updateSite = async (id, data) => {
  const response = await api.put(`/sites/${id}`, data);
  return response.data;
};

export const deleteSite = async (id) => {
  const response = await api.delete(`/sites/${id}`);
  return response.data;
};

// Category API
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Asset API
export const getAssets = async (params = {}) => {
  const response = await api.get('/assets', { params });
  return response.data;
};

export const createAsset = async (data) => {
  const response = await api.post('/assets', data);
  return response.data;
};

export const updateAsset = async (id, data) => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

export const getExportAssetsUrl = (branchId = '') => {
  const token = localStorage.getItem('token');
  let url = `${API_BASE_URL}/assets/export`;
  if (branchId) {
    url += `?branch_id=${branchId}`;
  }
  return { url, token };
};

// Asset Transfer & Mutation API
export const getTransfers = async (params = {}) => {
  const response = await api.get('/transfers', { params });
  return response.data;
};

export const createTransfer = async (data) => {
  const response = await api.post('/transfers', data);
  return response.data;
};

// Segment API (Kemitraan, POP, Local Loop, Corporate)
export const getSegments = async () => {
  const response = await api.get('/segments');
  return response.data.data;
};

export const createSegment = async (data) => {
  const response = await api.post('/segments', data);
  return response.data;
};

export const updateSegment = async (id, data) => {
  const response = await api.put(`/segments/${id}`, data);
  return response.data;
};

export const deleteSegment = async (id) => {
  const response = await api.delete(`/segments/${id}`);
  return response.data;
};

// Audit Trail Logs API
export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};

export default api;
