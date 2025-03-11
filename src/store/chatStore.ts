import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  last_seen?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  image_url?: string;
}

interface ChatState {
  contacts: Contact[];
  activeContact: Contact | null;
  messages: Message[];
  isLoading: boolean;
  currentUser: User | null;
  activeConversationId: string | null; // Añadiste esta propiedad
  loadContacts: () => Promise<void>;
  searchContacts: (term: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, imageUrl?: string) => Promise<void>;
  setActiveContact: (contact: Contact) => void;
  setCurrentUser: (user: User) => void;
  markMessagesAsRead: () => Promise<void>;
  
}

const API_URL = import.meta.env.VITE_API_URL;

export const useChatStore = create<ChatState>((set, get) => ({
  contacts: [],
  activeContact: null,
  messages: [],
  isLoading: false,
  currentUser: null,
  activeConversationId: null,


  setActiveContact: async (contact: Contact) => {
    set({ activeContact: contact, isLoading: true });
    
    try {
      // 1. Obtener el usuario actual
      const currentUser = get().currentUser;
      if (!currentUser) {
        console.error("No hay usuario actual");
        set({ isLoading: false });
        return;
      }
      
      // 2. Usar el nuevo endpoint para obtener o crear una conversación entre usuarios
      try {
        // Llamada al nuevo endpoint
        const response = await axios.get(`${API_URL}/conversations/between/${currentUser.id}/${contact.id}`);
        
        // Extraer el ID de la conversación de la respuesta
        const conversationData = response.data.data || response.data;
        const conversationId = conversationData.id;
        
        console.log("Conversación obtenida/creada:", conversationId);
        
        // 3. Establecer la conversación activa
        set({ activeConversationId: conversationId });
        
        // 4. Cargar los mensajes iniciales de esta conversación
        if (conversationId) {
          await get().loadMessages(conversationId);
        }
      } catch (error) {
        console.error("Error al obtener/crear conversación:", error);
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error("Error general al configurar conversación:", error);
      set({ isLoading: false });
    }
  },
  
  loadContacts: async () => {
    //console.log("Ejecutando loadContacts en store");
    set({ isLoading: true });
    try {
      //console.log("Haciendo petición a:", `${API_URL}/users`);
      const response = await axios.get(`${API_URL}/users`);
      //console.log("Respuesta recibida:", response.data);
      
      const contactsArray = response.data.data || [];
      
      // Obtener el ID del usuario actual
      const currentUser = get().currentUser;
      let currentUserId: string | undefined = currentUser?.id;
      
      // Si no hay usuario actual en el store, intenta obtenerlo de la sesión
      if (!currentUserId) {
        const { data } = await supabase.auth.getSession();
        currentUserId = data.session?.user?.id;
      }
      
      // Filtrar el usuario actual de la lista de contactos
      const filteredContacts = contactsArray.filter((contact: Contact) => contact.id !== currentUserId);
      
      console.log("Datos procesados:", filteredContacts);
      set({ contacts: filteredContacts, isLoading: false });
    } catch (error) {
      console.error('Error loading contacts:', error);
      set({ contacts: [], isLoading: false });
    }
  },
  
  searchContacts: async (term: string) => {
    if (!term.trim()) {
      return get().loadContacts();
    }
  
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/users/search?term=${encodeURIComponent(term)}`);
      const contactsArray = response.data.data || [];
      
      // Obtener el ID del usuario actual
      const currentUser = get().currentUser;
      let currentUserId: string | undefined = currentUser?.id;
      
      // Si no hay usuario actual en el store, intenta obtenerlo de la sesión
      if (!currentUserId) {
        const { data } = await supabase.auth.getSession();
        currentUserId = data.session?.user?.id;
      }
      
      // Filtrar el usuario actual de la lista de contactos
      const filteredContacts = contactsArray.filter((contact: Contact) => contact.id !== currentUserId);
      
      set({ contacts: filteredContacts, isLoading: false });
    } catch (error) {
      console.error('Error searching contacts:', error);
      set({ contacts: [], isLoading: false });
    }
  },
  
  loadMessages: async (conversationId: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/messages/conversation/${conversationId}?page=1&limit=50`);
      
      console.log("Respuesta completa:", response.data);
      
      // Acceder correctamente a la estructura anidada
      const messagesData = response.data?.data?.messages || [];
      
      console.log("Mensajes extraídos:", messagesData);
      
      // Solo actualizar si hay mensajes para mostrar
      if (messagesData.length > 0) {
        set({ messages: messagesData, isLoading: false });
      } else {
        // Si no hay mensajes, solo actualizamos el estado de carga
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ isLoading: false });
      // No borrar mensajes existentes en caso de error
    }
  },
  
    // En chatStore.ts
    sendMessage: async (content: string, imageUrl?: string) => {
      const { activeConversationId, currentUser, activeContact } = get();
      
      if (!activeContact) {
        console.error('No hay contacto activo');
        return;
      }
      
      // Si no hay conversación activa, crear una nueva
      let conversationId = activeConversationId;
      if (!conversationId) {
        try {
          console.log("No hay conversación activa, creando una nueva...");
          const response = await axios.post(`${API_URL}/conversations`, {
            participant_ids: [currentUser!.id, activeContact.id]
          });
          
          conversationId = response.data.id || response.data.data?.id;
          set({ activeConversationId: conversationId });
          
          console.log("Conversación creada con ID:", conversationId);
        } catch (error) {
          console.error('Error al crear conversación:', error);
          return;
        }
      }
      
      if (!conversationId || !currentUser) {
        console.error('No se pudo obtener una conversación válida o no hay usuario actual');
        return;
      }
      
      try {
        console.log("Enviando mensaje a conversación:", conversationId);
        await axios.post(`${API_URL}/messages`, {
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: content,
          image_url: imageUrl
        });
        
        // Recargar mensajes después de enviar
        await get().loadMessages(conversationId);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },

  markMessagesAsRead: async () => {
    const { activeConversationId, currentUser } = get();
    
    if (!activeConversationId || !currentUser) {
      return;
    }
    
    try {
      await axios.patch(`${API_URL}/messages/${currentUser.id}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },


  setCurrentUser: (user) => {
    set({ currentUser: user });
  }
  
}));