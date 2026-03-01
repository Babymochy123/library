import axios from 'axios';

export const API_BASE_URL =
    process.env.REACT_APP_API_URL || 'https://library-rcvv.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh');
                const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
                    refresh: refreshToken,
                });
                localStorage.setItem('token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (username, password) =>
        axios.post(`${API_BASE_URL}/api/token/`, { username, password }),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
    },
};

// Book APIs
export const bookAPI = {
    getBooks: () => api.get('/api/books/'),
    getBook: (id) => api.get(`/api/books/${id}/`),
    createBook: (data) => api.post('/api/books/', data),
    updateBook: (id, data) => api.patch(`/api/books/${id}/`, data),
    deleteBook: (id) => api.delete(`/api/books/${id}/`),
};

// Borrow APIs
export const borrowAPI = {
    getBorrows: () => api.get('/api/borrow/'),
    getBorrow: (id) => api.get(`/api/borrow/${id}/`),
    createBorrow: (data) => api.post('/api/borrow/', data),
    issueBook: (id) => api.post(`/api/borrow/${id}/issue_book/`),
    issueToUser: (data) => api.post('/api/borrow/issue_to_user/', data),
    returnBook: (id, returnDate) =>
        api.post(`/api/borrow/${id}/return_book/`, { return_date: returnDate }),
};

// Admin APIs
export const adminAPI = {
    getStats: () => api.get('/api/admin/stats/'),
    getUsers: () => api.get('/api/admin/users/'),
    createUser: (data) => api.post('/api/admin/users/', data),
};

export default api;
