import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL - use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
    console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Token storage key
const TOKEN_KEY = 'minihub_token';

// Get token from storage
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Set token in storage
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

// Remove token from storage
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log(`✅ ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error: AxiosError<{ error?: string; message?: string }>) => {
        // Log errors in development for debugging
        if (import.meta.env.DEV) {
            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                code: error.code,
            });
        }

        const status = error.response?.status;
        const message = error.response?.data?.error || error.response?.data?.message;

        // Handle token expiration
        if (status === 401 && message === 'Token expired') {
            removeToken();
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please log in again.'));
        }

        // Handle unauthorized
        if (status === 401) {
            removeToken();
            return Promise.reject(new Error(message || 'Authentication required'));
        }

        // Handle forbidden
        if (status === 403) {
            return Promise.reject(new Error(message || 'Access denied'));
        }

        // Handle validation errors
        if (status === 400) {
            return Promise.reject(new Error(message || 'Invalid request'));
        }

        // Handle network errors (ERR_CONNECTION_REFUSED, etc.)
        if (!error.response) {
            let networkErrorMessage = 'Network error. Please check your connection.';

            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                networkErrorMessage = `Unable to connect to server at ${API_BASE_URL}. \n\nPossible causes:\n1. Backend server is not running\n2. Database connection failed preventing server startup\n3. CORS blocking the request`;
            }

            console.error('🚨 Network Error Details:', error);
            return Promise.reject(new Error(networkErrorMessage));
        }

        // Handle server errors
        if (status && status >= 500) {
            return Promise.reject(new Error('Server error. Please try again later.'));
        }

        return Promise.reject(new Error(message || 'Something went wrong'));
    }
);

// API functions
export const authApi = {
    register: async (data: { name: string; email: string; password: string; role?: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token: string, password: string) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    },
    verifyEmail: async (token: string) => {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    },
};

export const postsApi = {
    getAll: async (type?: string) => {
        const params = type && type !== 'all' ? { type } : {};
        const response = await api.get('/posts', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },
    create: async (data: { type: string; title: string; description: string; tags?: string[] }) => {
        const response = await api.post('/posts', data);
        return response.data;
    },
    update: async (id: string, data: { type?: string; title?: string; description?: string; tags?: string[] }) => {
        const response = await api.put(`/posts/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },
    like: async (id: string) => {
        const response = await api.post(`/posts/${id}/like`);
        return response.data;
    },
    addComment: async (id: string, text: string) => {
        const response = await api.post(`/posts/${id}/comments`, { text });
        return response.data;
    },
};

export const usersApi = {
    updateProfile: async (data: { name?: string; bio?: string }) => {
        const response = await api.put('/users/me', data);
        return response.data;
    },
    search: async (query: string) => {
        const response = await api.get('/users', { params: { search: query } });
        return response.data;
    },
};

export default api;

