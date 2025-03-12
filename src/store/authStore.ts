// src/store/authStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import api from '../services/api';

// Tu tipo User
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
}

// DTO para actualizar perfil
interface UpdateProfileDto {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

// Función para convertir SupabaseUser a tu tipo User
function mapSupabaseUser(user: SupabaseUser | null): User | null {
  if (!user) return null;
  
  // Obtener datos de usuario de los metadatos
  const userData = user.user_metadata || {};
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: userData.full_name || '',
    avatar_url: userData.avatar_url || '',
    phone_number: userData.phone_number || '',
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone_number: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (userId: string, updateProfileDto: UpdateProfileDto) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  
  signIn: async (email, password) => {
    try {
      // 1. Autenticación usando Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // 2. Extraer el token de la sesión de Supabase
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error("No se pudo obtener token de autenticación");
      }
      
      // 3. Guardar token en localStorage
      localStorage.setItem('authToken', token);
      
      // 4. Configurar headers por defecto para todas las solicitudes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 5. También guardar el refresh token si está disponible
      if (data.session?.refresh_token) {
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }
      
      // 6. Registrar en consola para debugging
      console.log("Auth successful - Token stored:", token.substring(0, 10) + "...");
      
      set({ user: mapSupabaseUser(data.user) });
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  },
  
  signUp: async (email, password, fullName, phoneNumber) => {
    try {
      // 1. Registro usando Supabase (mantener para compatibilidad)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            phone_number: phoneNumber
          },
        }
      });
      
      if (error) {
        console.error("Error de registro:", error.message);
        throw error;
      }
      
      // También podrías llamar a tu API de registro personalizada aquí
      
      console.log("Registro exitoso");
    } catch (err) {
      console.error("Error en registro:", err);
      throw err;
    }
  },
  
  signOut: async () => {
    // 1. Cerrar sesión en Supabase
    await supabase.auth.signOut();
    
    // 2. Limpiar el token almacenado
    localStorage.removeItem('authToken');
    
    // 3. Eliminar el encabezado de autenticación
    delete api.defaults.headers.common['Authorization'];
    
    set({ user: null });
  },
  
  // Función checkAuth mejorada para verificar y refrescar tokens
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // 1. Verificar si hay token almacenado
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Configurar el token en el cliente API
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Intentar obtener la sesión actual usando el token existente
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error verificando sesión:', error);
          
          // Si hay error, intentar refrescar el token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            try {
              const { data: refreshData } = await supabase.auth.refreshSession();
              
              if (refreshData.session?.access_token) {
                localStorage.setItem('authToken', refreshData.session.access_token);
                api.defaults.headers.common['Authorization'] = `Bearer ${refreshData.session.access_token}`;
                
                if (refreshData.session.refresh_token) {
                  localStorage.setItem('refreshToken', refreshData.session.refresh_token);
                }
                
                set({ 
                  user: mapSupabaseUser(refreshData.session.user),
                  isLoading: false 
                });
                return;
              }
            } catch (refreshError) {
              console.error('Error al refrescar el token:', refreshError);
            }
          }
          
          // Si no se pudo refrescar, limpiar y redireccionar
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isLoading: false });
          return;
        }
        
        set({ 
          user: mapSupabaseUser(data.session?.user || null),
          isLoading: false 
        });
      } else {
        // Sin token, intentar obtener sesión de Supabase directamente
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.access_token) {
          // Guardar el token encontrado
          localStorage.setItem('authToken', data.session.access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.session.access_token}`;
          
          if (data.session.refresh_token) {
            localStorage.setItem('refreshToken', data.session.refresh_token);
          }
          
          set({ 
            user: mapSupabaseUser(data.session.user),
            isLoading: false 
          });
        } else {
          // Sin sesión activa
          set({ user: null, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // En caso de error, limpiar usuario y token
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isLoading: false });
    }
  },
  
  updateProfile: async (userId, updateProfileDto) => {
    try {
      // Usar la API con el token incluido automáticamente por el interceptor
      const response = await api.put(`/users/${userId}/profile`, updateProfileDto);
      
      if (response.data) {
        // Actualizar también los metadatos de supabase si es necesario
        await supabase.auth.updateUser({
          data: updateProfileDto
        });
        
        // Actualizar el estado del usuario
        set(state => ({
          user: state.user ? { ...state.user, ...updateProfileDto } : null
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}));