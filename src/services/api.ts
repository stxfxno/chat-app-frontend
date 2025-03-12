// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configuración básica de axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para incluir el token en cada solicitud
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta y reintentos
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si no tiene propiedad _retry, es el primer intento
    if (error.response && error.response.status === 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Detectado error 500, reintentando solicitud...');
      
      // Esperar un segundo antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reintentar la solicitud
      return api(originalRequest);
    }
    
    // Si el error es 401 (No autorizado), podría ser un token expirado
    if (error.response && error.response.status === 401) {
      // Limpiar token y redirigir a login si es necesario
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;