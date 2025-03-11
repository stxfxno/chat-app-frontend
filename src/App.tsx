import { useEffect, JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { User as SupabaseUser } from '@supabase/supabase-js';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { MessageSubscriptionProvider } from './context/MessageSubscriptionProvider.tsx';
import { supabase } from './lib/supabase';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const setCurrentUser = useChatStore(state => state.setCurrentUser);
  
  useEffect(() => {
    checkAuth();
    
    const checkAndSyncUser = async () => {
      const authUser = useAuthStore.getState().user;
      
      if (authUser) {
        console.log("Usuario encontrado en AuthStore:", authUser);
        // Usar aserción de tipos
        setCurrentUser(authUser as unknown as SupabaseUser);
      } else {
        console.log("Verificando sesión con Supabase...");
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          console.log("Usuario recuperado de sesión Supabase:", data.session.user);
          setCurrentUser(data.session.user);
        }
      }
    };
    
    checkAndSyncUser();
  }, [checkAuth, setCurrentUser]);
  
  return (
    <ThemeProvider>
      <MessageSubscriptionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MessageSubscriptionProvider>
    </ThemeProvider>
  );
}

export default App;