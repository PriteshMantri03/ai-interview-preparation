import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Attach Bearer token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const register = async ({ username, email, password }) => {
    const response = await api.post("/api/auth/register", {
        username,
        email,
        password
    });

    if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
    }

    return response.data;
};

export const login = async ({ email, password }) => {
    const response = await api.post("/api/auth/login", {
        email,
        password
    });

    if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
    }

    return response.data;
};

export const logout = async () => {
    try {
        const response = await api.get("/api/auth/logout");
        return response.data;
    } finally {
        localStorage.removeItem("token");
    }
};

export const getMe = async () => {
    const response = await api.get("/api/auth/get-me");
    return response.data;
};

export default api;
