// src/services/api.ts
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL;

// Configuración básica de axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para incluir el token en cada solicitud
// Cerca de la línea 20, en el interceptor de solicitud
api.interceptors.request.use(async config => {
  // Primero intentamos obtener el token almacenado
  let token = localStorage.getItem('authToken');
  
  // Si no hay token almacenado, intentamos obtenerlo de Supabase
  if (!token) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
    
    // Si encontramos un token, lo guardamos para futuras solicitudes
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }
  
  // Añadir el token a los headers si existe
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Añadir debug para ver los headers que se están enviando
  console.log(`Request a ${config.url}:`, {
    headers: config.headers,
    hasToken: !!config.headers.Authorization,
    method: config.method
  });
  
  if (token) {
    console.log('🔑 Token enviado en la solicitud:', token.substring(0, 15) + '...');
  } else {
    console.warn('⚠️ No hay token disponible para la solicitud');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Mejorar el interceptor de respuesta para mejor manejo de errores
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Lógica detallada de error para debugging
    if (error.response) {
      console.error(`Error API (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('No se recibió respuesta:', error.request);
    } else {
      console.error('Error de configuración:', error.message);
    }

    // Si no tiene propiedad _retry, es el primer intento para errores 500
    if (error.response && error.response.status === 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Detectado error 500, reintentando solicitud...');
      
      // Esperar un segundo antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refrescar el token antes de reintentar
      try {
        const { data } = await supabase.auth.getSession();
        const newToken = data.session?.access_token;
        
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);
      }
      
      // Reintentar la solicitud
      return api(originalRequest);
    }
    
    // Si el error es 401 (No autorizado), puede ser un token expirado
    if (error.response && error.response.status === 401) {
      try {
        // Intentar refrescar el token usando Supabase
        const { data } = await supabase.auth.refreshSession();
        const newToken = data.session?.access_token;
        
        if (newToken) {
          // Actualizar el token almacenado
          localStorage.setItem('authToken', newToken);
          
          // Actualizar el token en la solicitud original y reintentar
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Si no se pudo refrescar, limpiar token y redirigir a login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;