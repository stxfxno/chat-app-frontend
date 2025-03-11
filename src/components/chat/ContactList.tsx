// src/components/chat/ContactList.tsx
import { useState, useEffect, useMemo } from 'react';
import { useChatStore } from '../../store/chatStore';
import SearchInput from './SearchInput';
import { Contact } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactListProps {
  onSelectContact?: () => void;
}

// Extendemos el tipo Contact para asegurarnos de que incluya las propiedades necesarias
interface ExtendedContact extends Contact {
  last_message?: string;
  last_message_time?: string;
}

const ContactList = ({ onSelectContact }: ContactListProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { contacts, loadContacts, searchContacts, setActiveContact, activeContact, onlineUsers } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode, themeColors } = useTheme();

  // Verificar activos manualmente para cada contacto
  const [activeContacts, setActiveContacts] = useState<Record<string, boolean>>({});

  // Tratar contacts como ExtendedContact[]
  const extendedContacts = contacts as ExtendedContact[];

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Cuando cambia el término de búsqueda
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchContacts(searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchContacts]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        await loadContacts();
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [loadContacts]);

  // Actualizar el estado activo de los contactos
  useEffect(() => {
    const updateActiveStatus = () => {
      const newActiveContacts: Record<string, boolean> = {};

      contacts.forEach(contact => {
        // 1. Si está en onlineUsers, está activo
        if (onlineUsers[contact.id]) {
          newActiveContacts[contact.id] = true;
          return;
        }

        // 2. Si tiene un mensaje reciente (últimos 30 minutos)
        const extContact = contact as ExtendedContact;
        if (extContact.last_message_time) {
          const lastMessageTime = new Date(extContact.last_message_time);
          const thirtyMinutesAgo = new Date();
          thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

          if (lastMessageTime > thirtyMinutesAgo) {
            newActiveContacts[contact.id] = true;
            return;
          }
        }

        // 3. Si se conectó recientemente (últimos 5 minutos)
        if (contact.last_seen) {
          const lastSeenDate = new Date(contact.last_seen);
          const fiveMinutesAgo = new Date();
          fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

          if (lastSeenDate > fiveMinutesAgo) {
            newActiveContacts[contact.id] = true;
            return;
          }
        }

        newActiveContacts[contact.id] = false;
      });

      setActiveContacts(newActiveContacts);
    };

    // Actualizar inmediatamente
    updateActiveStatus();

    // Y también periódicamente
    const intervalId = setInterval(updateActiveStatus, 30000);
    return () => clearInterval(intervalId);
  }, [contacts, onlineUsers]);

  // Formatear tiempo para mostrar
  const formatTime = (dateStr?: string): string => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Si es hoy, mostrar solo la hora
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    }
    // Si es ayer, mostrar "Ayer"
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    // Si es de este año pero no es hoy ni ayer, mostrar día y mes
    else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'd MMM', { locale: es });
    }
    // Si es de otro año, mostrar fecha completa
    else {
      return format(date, 'dd/MM/yy');
    }
  };

  const filteredAndSortedContacts = useMemo(() => {
    // Primero filtramos por término de búsqueda
    let result = extendedContacts;

    if (searchTerm.trim()) {
      result = extendedContacts.filter(contact =>
        contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Luego ordenamos por:
    // 1. Primero los usuarios activos
    // 2. Luego por la fecha del último mensaje (descendente)
    // 3. Si no hay mensajes, por last_seen
    return result.sort((a, b) => {
      // Primero verificamos si alguno está activo
      const aActive = activeContacts[a.id] || false;
      const bActive = activeContacts[b.id] || false;

      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Si ambos tienen el mismo estado de actividad, ordenar por último mensaje
      const aTime = a.last_message_time || a.last_seen;
      const bTime = b.last_message_time || b.last_seen;

      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }

      // Si solo uno tiene timestamp, ese va primero
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;

      // Si ninguno tiene timestamp, ordenar por nombre
      return a.full_name.localeCompare(b.full_name);
    });
  }, [extendedContacts, searchTerm, activeContacts]);

  const handleSelectContact = (contact: Contact) => {
    const currentUser = useChatStore.getState().currentUser;

    if (!currentUser) {
      console.error("No hay usuario actual disponible. Por favor, inicia sesión nuevamente.");
      return;
    }

    setActiveContact(contact);
    onSelectContact?.();
  };

  // Función para truncar el último mensaje
  const truncateMessage = (message?: string): string => {
    if (!message) return '';
    if (message.length <= 30) return message;
    return message.substring(0, 27) + '...';
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
        <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'
          }`}>Contactos</h2>
        <SearchInput onSearch={setSearchTerm} placeholder="Buscar contactos..." />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? 'border-violet-500' : 'border-indigo-500'
            }`}></div>
        </div>
      ) : filteredAndSortedContacts.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center p-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
          {searchTerm ? 'No se encontraron contactos' : 'No hay contactos disponibles'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 flex items-center cursor-pointer transition-colors ${activeContact?.id === contact.id
                  ? darkMode
                    ? 'bg-gray-700'
                    : `bg-${themeColors.secondary.split('-')[1]}-50`
                  : darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              onClick={() => handleSelectContact(contact)}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={contact.full_name}
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    <div className={`flex items-center justify-center h-full w-full ${themeColors.gradient}`}>
                      {contact.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Indicador de estado (activo/inactivo) */}
                {activeContacts[contact.id] && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{contact.full_name}</p>

                  {/* Fecha del último mensaje o actividad */}
                  <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {formatTime((contact as ExtendedContact).last_message_time || contact.last_seen)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  {/* Último mensaje o estado */}
                  <p className={`text-sm truncate ${activeContacts[contact.id]
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {activeContacts[contact.id] ? (
                      'Activo ahora'
                    ) : (contact as ExtendedContact).last_message ? (
                      truncateMessage((contact as ExtendedContact).last_message)
                    ) : (
                      contact.email
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;