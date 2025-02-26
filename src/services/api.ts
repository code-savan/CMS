import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { uploadContractPDF } from './supabase';
import { supabase } from '../lib/supabase';

// Extract environment variables for better clarity
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh & errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // If refresh endpoint itself 401s, don't re-try forever. Just sign out.
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes('/token/refresh/')
    ) {
      console.error('Refresh token request failed with 401. Logging out...');
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await authApi.refreshToken(refreshToken);
        const { access, refresh: newRefresh } = response.data;

        localStorage.setItem('accessToken', access);
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
        }

        // Ensure headers are initialized
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// TypeScript interface for contract data
interface ContractData {
  title: string;
  description: string;
  expiry_date: string;
  status: 'active' | 'pending' | 'expired';
  parties_involved: string[];
  pdf_url?: string;
}

// Contract API endpoints
export const contractsApi = {
  getAll: async () => {
    const response = await api.get('/contracts/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response;
  },

  getById: (id: string) => api.get(`/contracts/${id}/`),

  create: async (data: ContractData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/contracts/', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Contract creation error:', error.response?.data);
        throw new Error(error.response?.data?.detail || 'Failed to create contract');
      }
      throw error;
    }
  },

  update: (id: string, data: Partial<ContractData>) => api.put(`/contracts/${id}/`, data),

  delete: (id: string) => api.delete(`/contracts/${id}/`),

  uploadPdf: async (contractId: string, file: File) => {
    try {
      // First upload to Supabase
      const pdfUrl = await uploadContractPDF(file, contractId);

      // Then update contract with PDF URL
      const response = await api.patch(`/contracts/${contractId}/`, {
        pdf_url: pdfUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('PDF upload error:', error);
      throw error;
    }
  },

  downloadPdf: async (id: string, fileName: string) => {
    const { data, error } = await supabase
      .storage
      .from('contracts')
      .download(`${id}/${fileName}`);

    if (error) {
      console.error('Storage error:', error);
      throw new Error('Failed to download file');
    }
    return data;
  },

  getPdfUrl: async (id: string, fileName: string) => {
    // Create signed URL valid for 1 hour
    const { data, error } = await supabase
      .storage
      .from('contracts')
      .createSignedUrl(`${id}/${fileName}`, 3600);

    if (error) {
      console.error('Signed URL error:', error);
      throw new Error('Failed to get file URL');
    }
    return data.signedUrl;
  }
};

// Auth API endpoints
export const authApi = {
  register: async (data: { email: string; password: string }) => {
    try {
      // First register the user
      const registerResponse = await api.post('/register/', data);

      // Then immediately login to get tokens
      const loginResponse = await api.post('/token/', data);
      const { access, refresh } = loginResponse.data;

      // Save tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return registerResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to create account');
      }
      throw error;
    }
  },

  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post('/token/', data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data);
        throw new Error(error.response?.data?.detail || 'Invalid email or password');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  refreshToken: async (refresh: string) => {
    try {
      return await api.post('/token/refresh/', { refresh });
    } catch (error) {
      return handleApiError(error, 'Token refresh failed');
    }
  },
};

// Helper function for better error handling
const handleApiError = (error: unknown, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    return Promise.reject(new Error(error.response?.data?.detail || defaultMessage));
  }
  return Promise.reject(new Error(defaultMessage));
};
