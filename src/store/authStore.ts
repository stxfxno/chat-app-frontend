// Actualización para src/store/authStore.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import axios from 'axios';

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    set({ user: mapSupabaseUser(data.user) });
  },
  
  signUp: async (email, password, fullName, phoneNumber) => {
    try {
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
      
      console.log("Registro exitoso");
      // Opcional: navegar a la página de login o mostrar mensaje de éxito
    } catch (err) {
      console.error("Error en registro:", err);
      throw err;
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    const { data } = await supabase.auth.getSession();
    set({ 
      user: mapSupabaseUser(data.session?.user || null),
      isLoading: false 
    });
  },
  
  updateProfile: async (userId, updateProfileDto) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.put(`${API_URL}/users/${userId}/profile`, updateProfileDto);
      
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