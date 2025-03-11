// src/pages/ChatPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ContactList from '../components/chat/ContactList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { useChatStore } from '../store/chatStore';
import { LogOut, ArrowLeft, Users, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, signOut } = useAuthStore();
  const { activeContact } = useChatStore();
  const [showContacts, setShowContacts] = useState(!isMobile || !activeContact);
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Cuando cambia de móvil a desktop, mostrar ambos paneles
  useEffect(() => {
    if (!isMobile) {
      setShowContacts(true);
    }
  }, [isMobile]);
  
  // En móvil, cuando se selecciona un contacto, mostrar la conversación
  useEffect(() => {
    if (isMobile && activeContact) {
      setShowContacts(false);
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
          
          <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-white/10">
            <span className="text-sm max-w-[150px] truncate">
              {user?.email}
            </span>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      {/* Contenedor principal con posición relativa y altura fija */}
      <div className="flex-1 relative overflow-hidden">
        {/* Panel de contactos */}
        {(!isMobile || showContacts) && (
          <div 
            className={`${isMobile ? 'w-full' : 'w-1/3 md:w-2/5 lg:w-1/3'} absolute top-0 bottom-0 left-0 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } border-r z-10 bg-inherit`}
            style={{
              height: '100%',
              maxHeight: '100%'
            }}
          >
            <ContactList 
              onSelectContact={() => isMobile && setShowContacts(false)} 
            />
          </div>
        )}
        
        {/* Panel de mensajes */}
        {(!isMobile || !showContacts) && (
          <div 
            className={`${isMobile ? 'w-full' : 'w-2/3 md:w-3/5 lg:w-2/3 ml-[33.333%] lg:ml-1/3 md:ml-[40%]'} 
              absolute top-0 bottom-0 ${isMobile || showContacts ? 'left-0' : 'left-[33.333%] md:left-[40%] lg:left-1/3'}
              right-0 flex flex-col`}
            style={{
              height: '100%',
              maxHeight: '100%'
            }}
          >
            <div className="flex-1 overflow-hidden flex flex-col">
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