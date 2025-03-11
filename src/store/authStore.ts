import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Tu tipo User
interface User {
  id: string;
  email: string;
}

// Función para convertir SupabaseUser a tu tipo User
function mapSupabaseUser(user: SupabaseUser | null): User | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',  // Proporciona un valor por defecto
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone_number: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
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
}));