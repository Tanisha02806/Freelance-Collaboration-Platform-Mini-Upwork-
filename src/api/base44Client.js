// src/api/api.js

// Ignore TypeScript module resolution error when running in JS files without axios types
// @ts-ignore
import axios from 'axios';
// @ts-ignore

// Backend API URL
const API_BASE_URL =
  // @ts-ignore
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  /** @param {any} config */
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  /** @param {any} error */
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  /** @param {any} response */
  (response) => response,
  /** @param {any} error */
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }

    return Promise.reject(error);
  }
);

// =========================
// AUTH APIS
// =========================

export const loginUser = async (/** @type {any} */ data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (/** @type {any} */ data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// =========================
// TASK APIS
// =========================

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (/** @type {any} */ data) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (/** @type {any} */ id, /** @type {any} */ data) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (/** @type {any} */ id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// =========================
// NOTES APIS
// =========================

export const getNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

export const createNote = async (/** @type {any} */ data) => {
  const response = await api.post('/notes', data);
  return response.data;
};

// =========================
// ATTENDANCE APIS
// =========================

export const getAttendance = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

// =========================
// EXPORT DEFAULT
// =========================

export default api;