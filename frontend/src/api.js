import axios from 'axios';

// Tüm isteklerin gideceği ana adres
const api = axios.create({
    baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;