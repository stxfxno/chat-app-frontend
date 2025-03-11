// src/components/chat/ContactList.tsx
import { useState, useEffect, useMemo } from 'react';
import { useChatStore } from '../../store/chatStore';
import SearchInput from './SearchInput';
import { Contact } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ContactListProps {
  onSelectContact?: () => void;
}

const ContactList = ({ onSelectContact }: ContactListProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { contacts, loadContacts, searchContacts, setActiveContact, activeContact } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useTheme();

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

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    
    return contacts.filter(contact => 
      contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const handleSelectContact = (contact: Contact) => {
    const currentUser = useChatStore.getState().currentUser;
    
    if (!currentUser) {
      console.error("No hay usuario actual disponible. Por favor, inicia sesión nuevamente.");
      return;
    }
    
    setActiveContact(contact);
    onSelectContact?.();
  };

  return (
    <div className={`h-full flex flex-col ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`p-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-3 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Contactos</h2>
        <SearchInput onSearch={setSearchTerm} placeholder="Buscar contactos..." />
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            darkMode ? 'border-violet-500' : 'border-indigo-500'
          }`}></div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center p-4 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {searchTerm ? 'No se encontraron contactos' : 'No hay contactos disponibles'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 flex items-center cursor-pointer transition-colors duration-150 ${
                activeContact?.id === contact.id 
                  ? darkMode 
                    ? 'bg-gray-700' 
                    : 'bg-indigo-50'
                  : darkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectContact(contact)}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                {contact.avatar_url ? (
                  <img 
                    src={contact.avatar_url} 
                    alt={contact.full_name} 
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <div className={`flex items-center justify-center h-full w-full ${
                    darkMode 
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}>
                    {contact.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>{contact.full_name}</p>
                <p className={`text-sm truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{contact.email}</p>
              </div>
              {contact.last_seen && (
                <div className={`text-xs whitespace-nowrap ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {new Date(contact.last_seen).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;