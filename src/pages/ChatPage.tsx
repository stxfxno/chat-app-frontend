// Corrección para ChatPage.tsx para evitar que el modal de perfil se abra automáticamente en móvil

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ContactList from '../components/chat/ContactList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import ProfileButton from '../components/ui/ProfileButton';
import { useChatStore } from '../store/chatStore';
import { LogOut, ArrowLeft, Users} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, signOut } = useAuthStore();
  const { activeContact } = useChatStore();
  const [showContacts, setShowContacts] = useState(!isMobile || !activeContact);
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Ref para evitar efectos no deseados al montar el componente
  const initialRenderRef = useRef(true);
  
  // Cuando cambia de móvil a desktop, mostrar ambos paneles
  useEffect(() => {
    if (!initialRenderRef.current) {
      if (!isMobile) {
        setShowContacts(true);
      }
    } else {
      initialRenderRef.current = false;
    }
  }, [isMobile]);
  
  // En móvil, cuando se selecciona un contacto, mostrar la conversación
  useEffect(() => {
    if (!initialRenderRef.current) {
      if (isMobile && activeContact) {
        setShowContacts(false);
      }
    }
  }, [activeContact, isMobile]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <header className={`px-4 py-3 flex items-center justify-between shadow-md z-10 ${
        darkMode 
          ? 'bg-gradient-to-r from-violet-900 to-indigo-900 text-white' 
          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
      }`}>
        <div className="flex items-center">
          {isMobile && activeContact && !showContacts && (
            <button 
              onClick={() => setShowContacts(true)}
              className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center">
            <div className="hidden sm:flex h-8 w-8 rounded-full items-center justify-center bg-white/20 mr-2">
              <Users size={16} className="text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide">Chat App</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón de tema */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Botón de perfil */}
          {user && <ProfileButton user={user} />}
          
          {/* Email del usuario (solo en desktop) */}
          <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-white/10">
            <span className="text-sm max-w-[150px] truncate">
              {user?.email}
            </span>
          </div>
          
          {/* Botón de cerrar sesión */}
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      {/* Usando un enfoque de grid para la disposición de los paneles */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Panel de contactos */}
        {(!isMobile || showContacts) && (
          <div className={`${isMobile ? 'col-span-12' : 'col-span-4 lg:col-span-3'} border-r ${
            darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
          } overflow-hidden h-full z-10`}>
            <ContactList 
              onSelectContact={() => isMobile && setShowContacts(false)} 
            />
          </div>
        )}
        
        {/* Panel de mensajes */}
        {(!isMobile || !showContacts) && (
          <div className={`${
            isMobile 
              ? 'col-span-12' 
              : showContacts 
                ? 'col-span-8 lg:col-span-9' 
                : 'col-span-12'
          } h-full`}>
            <div className="h-full flex flex-col">
              <MessageList />
              {activeContact && <MessageInput />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;