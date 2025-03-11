// src/components/chat/StatusIndicator.tsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useChatStore } from '../../store/chatStore';
import { Contact } from '../../types';

interface StatusIndicatorProps {
  contact: Contact;
  showText?: boolean;
}

// Extendemos el tipo Contact para asegurarnos de que incluya las propiedades necesarias
interface ExtendedContact extends Contact {
  last_message?: string;
  last_message_time?: string;
}

const StatusIndicator = ({ contact, showText = true }: StatusIndicatorProps) => {
  const { darkMode } = useTheme();
  const { onlineUsers } = useChatStore();
  const [isActive, setIsActive] = useState(false);
  
  // Verificar el estado activo cada 30 segundos
  useEffect(() => {
    // Verificar inmediatamente
    checkActiveStatus();
    
    // Configurar un intervalo para verificar periódicamente
    const intervalId = setInterval(checkActiveStatus, 30000);
    
    return () => clearInterval(intervalId);
    
    function checkActiveStatus() {
      // Si está marcado como online en onlineUsers
      if (onlineUsers[contact.id]) {
        setIsActive(true);
        return;
      }
      
      // Si tiene actividad reciente (mensaje en los últimos 30 minutos)
      const extendedContact = contact as ExtendedContact;
      if (extendedContact.last_message_time) {
        const lastMessageTime = new Date(extendedContact.last_message_time);
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        
        if (lastMessageTime > thirtyMinutesAgo) {
          setIsActive(true);
          return;
        }
      }
      
      // Si tiene conexión reciente (últimos 5 minutos)
      if (contact.last_seen) {
        const lastSeenDate = new Date(contact.last_seen);
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        
        if (lastSeenDate > fiveMinutesAgo) {
          setIsActive(true);
          return;
        }
      }
      
      setIsActive(false);
    }
  }, [contact, onlineUsers]);
  
  if (!showText) {
    // Solo mostrar el indicador visual
    return isActive ? (
      <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
    ) : null;
  }
  
  // Mostrar con texto
  return isActive ? (
    <span className={`flex items-center ${
      darkMode ? 'text-green-400' : 'text-green-600'
    }`}>
      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
      Activo
    </span>
  ) : null;
};

export default StatusIndicator;