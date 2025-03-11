// src/components/chat/MessageList.tsx
import { useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { Contact } from '../../types';

// Extender la interfaz Contact para incluir los nuevos campos
interface ExtendedContact extends Contact {
  last_message?: string;
  last_message_time?: string;
}

const MessageList = () => {
  const { messages, activeContact, loadMessages, isLoading, isInitialLoad, activeConversationId, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useTheme();
  const [previousContactId, setPreviousContactId] = useState<string | null>(null);
  
  // Convertir activeContact al tipo extendido
  const activeContactExtended = activeContact as ExtendedContact | null;
  
  // Determine if contact is online
  const isContactOnline = activeContact ? onlineUsers[activeContact.id] || false : false;
  
  // Ensure messages is always an array
  const messageArray = Array.isArray(messages) ? messages : [];
  
  // Load messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      // Track contact changes
      if (previousContactId !== activeContact.id) {
        setPreviousContactId(activeContact.id);
      }
      
      // Only load messages if we have an active conversation ID
      if (activeConversationId) {
        loadMessages(activeConversationId, true); // Carga inicial
      }
    }
  }, [activeContact, activeConversationId, loadMessages, previousContactId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageArray]);
  
  if (!activeContact) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${
        darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'
      }`}>
        <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-4 ${
          darkMode 
            ? 'bg-gradient-to-r from-violet-800/30 to-fuchsia-800/30' 
            : 'bg-gradient-to-r from-indigo-100 to-purple-100'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${
            darkMode ? 'text-violet-400' : 'text-indigo-500'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>No hay chat activo</h3>
        <p className={`text-center max-w-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Selecciona un contacto para iniciar una conversación
        </p>
      </div>
    );
  }
  
  return (
    <div className={`flex-1 flex flex-col ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Chat header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b shadow-sm`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
            darkMode 
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
          }`}>
            {activeContact.avatar_url ? (
              <img 
                src={activeContact.avatar_url} 
                alt={activeContact.full_name} 
                className="h-10 w-10 object-cover"
              />
            ) : (
              <span className="font-medium text-lg text-white">
                {activeContact.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>{activeContact.full_name}</h3>
            <p className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {activeContact.email}
            </p>
          </div>
        </div>
        
        {/* Contact online status */}
        {isContactOnline ? (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode 
              ? 'bg-green-900 text-green-300' 
              : 'bg-green-100 text-green-800'
          } flex items-center`}>
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            En línea
          </span>
        ) : activeContactExtended?.last_message_time ? (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-800'
          } flex items-center`}>
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
            {`Último mensaje ${formatDistanceToNow(new Date(activeContactExtended.last_message_time), { addSuffix: true, locale: es })}`}
          </span>
        ) : activeContact.last_seen ? (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-800'
          } flex items-center`}>
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
            {`Últ. vez ${formatDistanceToNow(new Date(activeContact.last_seen), { addSuffix: true, locale: es })}`}
          </span>
        ) : (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-800'
          } flex items-center`}>
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
            No disponible
          </span>
        )}
      </div>
      
      {/* Message container with absolute layout strategy */}
      <div className="relative flex-1">
        {/* Scrollable area with fixed position */}
        <div 
          className={`absolute inset-0 overflow-y-auto p-4 ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          {/* Solo mostrar loading spinner durante la carga inicial */}
          {isLoading && isInitialLoad ? (
            <div className="flex justify-center items-center h-full">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                darkMode ? 'border-violet-500' : 'border-indigo-500'
              }`}></div>
            </div>
          ) : messageArray.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
                darkMode 
                  ? 'bg-gray-800' 
                  : 'bg-white'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  darkMode ? 'text-violet-400' : 'text-indigo-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-center ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No hay mensajes aún. ¡Envía el primero!
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-end min-h-full">
              <div className="space-y-3">
                {messageArray.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  
                  // Determine actual message content
                  let messageContent;
                  if (message.content && message.content.indexOf('-') !== -1 && message.content.length > 30) {
                    messageContent = message.image_url || "Sin contenido";
                  } else {
                    messageContent = message.content || message.image_url || "Sin contenido";
                  }
                  
                  return (
                    <div 
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm ${
                        isOwn 
                          ? darkMode 
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                          : darkMode 
                            ? 'bg-gray-800 text-gray-200' 
                            : 'bg-white text-gray-800'
                      }`}>
                        {/* Message content */}
                        <p className="text-sm">{messageContent}</p>
                        
                        {/* Attached image if it exists */}
                        {message.image_url && 
                         message.image_url !== message.content &&
                         message.image_url !== messageContent &&
                         message.image_url.startsWith('http') && (
                          <div className="mt-2 rounded-lg overflow-hidden">
                            <img 
                              src={message.image_url} 
                              alt="Imagen adjunta" 
                              className="max-w-full rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Message time */}
                        <div className={`text-xs mt-1.5 ${
                          isOwn 
                            ? 'text-white/70' 
                            : darkMode 
                              ? 'text-gray-400' 
                              : 'text-gray-500'
                        }`}>
                          {message.created_at ? 
                            format(new Date(message.created_at), 'HH:mm') : 
                            format(new Date(), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageList;