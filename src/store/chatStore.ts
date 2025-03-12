// src/store/chatStore.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import api from '../services/api'; // Importar el servicio API en lugar de axios

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
  isInitialLoad: boolean; // Flag para diferenciar carga inicial de actualizaciones
  currentUser: User | null;
  activeConversationId: string | null;
  onlineUsers: Record<string, boolean>;
  loadContacts: () => Promise<void>;
  searchContacts: (term: string) => Promise<void>;
  loadMessages: (conversationId: string, isInitial?: boolean) => Promise<void>;
  sendMessage: (receiverId: string, content: string, imageUrl?: string) => Promise<void>;
  setActiveContact: (contact: Contact) => void;
  setCurrentUser: (user: User) => void;
  markMessagesAsRead: () => Promise<void>;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  addMessageOptimistically: (message: Message) => void;
}

//const API_URL = import.meta.env.VITE_API_URL;

export const useChatStore = create<ChatState>((set, get) => ({
  contacts: [],
  activeContact: null,
  messages: [],
  isLoading: false,
  isInitialLoad: true, // Inicialmente true
  currentUser: null,
  activeConversationId: null,
  onlineUsers: {},

  // Actualización para la función setActiveContact en chatStore.ts

  // Función setActiveContact mejorada para src/store/chatStore.ts

  setActiveContact: async (contact: Contact) => {
    // Primero, limpiar inmediatamente los mensajes y establecer el nuevo contacto activo
    set({ 
      activeContact: contact, 
      messages: [], // Limpiar mensajes inmediatamente
      isLoading: true,
      isInitialLoad: true, // Marcar como carga inicial al cambiar de contacto
      activeConversationId: null // Importante: anular la conversación activa para evitar cargas incorrectas
    });
    
    try {
      // 1. Obtener el usuario actual
      const currentUser = get().currentUser;
      if (!currentUser) {
        console.error("No current user available");
        
        // Intentar obtener el usuario actual de Supabase
        const { data } = await supabase.auth.getSession();
        const supabaseUser = data.session?.user;
        
        if (!supabaseUser) {
          console.error("No se pudo obtener el usuario de Supabase");
          set({ isLoading: false, isInitialLoad: false });
          return;
        }
        
        // Establecer el usuario actual si lo encontramos
        get().setCurrentUser(supabaseUser);
      }
      
      // Verificar que tenemos un usuario válido
      const user = get().currentUser || (await supabase.auth.getSession()).data.session?.user;
      
      if (!user) {
        console.error("No se pudo obtener un usuario válido");
        set({ isLoading: false, isInitialLoad: false });
        return;
      }
      
      // 2. Intentar obtener o crear la conversación con una pequeña pausa
      setTimeout(async () => {
        if (get().activeContact?.id !== contact.id) {
          console.log("Contact changed before fetch, aborting");
          set({ isLoading: false, isInitialLoad: false });
          return;
        }
        
        console.log(`Intentando obtener conversación entre ${user.id} y ${contact.id}`);
        
        try {
          // Verificar que tenemos el token en localStorage
          const token = localStorage.getItem('authToken');
          if (!token) {
            const sessionData = await supabase.auth.getSession();
            const newToken = sessionData.data.session?.access_token;
            
            if (newToken) {
              localStorage.setItem('authToken', newToken);
              console.log("Token obtenido y almacenado de Supabase");
            } else {
              console.error("No se pudo obtener token de Supabase");
            }
          }
          
          // Intentar obtener conversación existente
          const response = await api.get(`/conversations/between/${user.id}/${contact.id}`);
          
          // Verificar que el contacto activo no cambió durante la petición
          if (get().activeContact?.id !== contact.id) {
            console.log("Contact changed during conversation fetch, aborting");
            set({ isLoading: false, isInitialLoad: false });
            return;
          }
          
          // Extraer ID de conversación de la respuesta
          const conversationData = response.data.data || response.data;
          const conversationId = conversationData.id;
          
          console.log("Conversation obtained:", conversationId);
          
          // 3. Establecer conversación activa
          set({ activeConversationId: conversationId });
          
          // 4. Cargar mensajes para esta conversación
          if (conversationId) {
            await get().loadMessages(conversationId, true);
          }
        } catch (error: any) {
          console.error("Error getting conversation:", error);
          
          // Si es 404 o 500, intentamos crear una nueva conversación
          if (error.response && (error.response.status === 404 || error.response.status === 500)) {
            try {
              console.log("Intentando crear una nueva conversación...");
              
              // Crear una nueva conversación
              const createResponse = await api.post('/conversations', {
                participant_ids: [user.id, contact.id]
              });
              
              // Verificar si el contacto activo cambió
              if (get().activeContact?.id !== contact.id) {
                console.log("Contact changed during conversation creation, aborting");
                set({ isLoading: false, isInitialLoad: false });
                return;
              }
              
              const newConversationId = createResponse.data?.id || createResponse.data?.data?.id;
              console.log("Nueva conversación creada:", newConversationId);
              
              if (newConversationId) {
                set({ activeConversationId: newConversationId });
                await get().loadMessages(newConversationId, true);
              } else {
                console.error("No se pudo obtener ID de la nueva conversación");
                set({ isLoading: false, isInitialLoad: false });
              }
            } catch (createError) {
              console.error("Error creating new conversation:", createError);
              set({ isLoading: false, isInitialLoad: false });
            }
          } else {
            set({ isLoading: false, isInitialLoad: false });
          }
        }
      }, 50);
    } catch (error) {
      console.error("General error setting up conversation:", error);
      set({ isLoading: false, isInitialLoad: false });
    }
  },

  loadContactsWithLastMessages: async () => {
    set({ isLoading: true });
    try {
      // 1. Cargar la lista básica de contactos
      const response = await api.get(`/users`);
      
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
      
      // 2. Para cada contacto, obtener su última conversación con el usuario actual
      const contactsWithLastMessages = await Promise.all(
        filteredContacts.map(async (contact: Contact) => {
          try {
            // Buscar conversación entre usuarios
            const conversationResponse = await api.get(
              `/conversations/between/${currentUserId}/${contact.id}`
            );
            
            const conversationData = conversationResponse.data.data || conversationResponse.data;
            const conversationId = conversationData.id;
            
            if (conversationId) {
              // Obtener último mensaje de la conversación
              const messagesResponse = await api.get(
                `/messages/conversation/${conversationId}?page=1&limit=1`
              );
              
              const messagesData = messagesResponse.data?.data?.messages || [];
              
              if (messagesData.length > 0) {
                const lastMessage = messagesData[0];
                return {
                  ...contact,
                  last_message: lastMessage.content,
                  last_message_time: lastMessage.created_at
                };
              }
            }
            
            // Si no hay conversación o mensajes, devolver contacto sin cambios
            return contact;
          } catch (error) {
            console.error(`Error getting last message for contact ${contact.id}:`, error);
            return contact;
          }
        })
      );
      
      // Actualizar el estado con los contactos enriquecidos
      set({ 
        contacts: contactsWithLastMessages, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading contacts with last messages:', error);
      set({ contacts: [], isLoading: false });
    }
  },
  
  loadContacts: async () => {
    set({ isLoading: true });
    console.log("Iniciando carga de contactos...");
    try {
      console.log("Haciendo solicitud a /users");
      const response = await api.get(`/users`);
      console.log("Respuesta obtenida:", response.data);
      
      const contactsArray = response.data.data || [];
      console.log("Contactos sin filtrar:", contactsArray);
      
      // Get current user ID
      const currentUser = get().currentUser;
      let currentUserId: string | undefined = currentUser?.id;
      console.log("ID de usuario actual desde store:", currentUserId);
      
      // If no current user in store, try to get from session
      if (!currentUserId) {
        console.log("Obteniendo sesión de Supabase...");
        const { data } = await supabase.auth.getSession();
        currentUserId = data.session?.user?.id;
        console.log("ID de usuario obtenido de sesión:", currentUserId);
      }
      
      // Filter out current user from contacts list
      const filteredContacts = contactsArray.filter((contact: Contact) => contact.id !== currentUserId);
      
      console.log("Contactos filtrados (sin el usuario actual):", filteredContacts);
      set({ contacts: filteredContacts, isLoading: false });
    } catch (error) {
      console.error('Error loading contacts:', error);
      console.log("Tipo de error:", typeof error);
      if (error instanceof Error) {
        console.log("Mensaje de error:", error.message);
      }
      
      // Intentar obtener más información sobre el error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.log("Status del error:", axiosError.response?.status);
        console.log("Datos del error:", axiosError.response?.data);
      }
      
      set({ contacts: [], isLoading: false });
    }
  },
  
  searchContacts: async (term: string) => {
    if (!term.trim()) {
      return get().loadContacts();
    }
  
    set({ isLoading: true });
    try {
      const response = await api.get(`/users/search?term=${encodeURIComponent(term)}`);
      const contactsArray = response.data.data || [];
      
      // Get current user ID
      const currentUser = get().currentUser;
      let currentUserId: string | undefined = currentUser?.id;
      
      // If no current user in store, try to get from session
      if (!currentUserId) {
        const { data } = await supabase.auth.getSession();
        currentUserId = data.session?.user?.id;
      }
      
      // Filter out current user from contacts list
      const filteredContacts = contactsArray.filter((contact: Contact) => contact.id !== currentUserId);
      
      set({ contacts: filteredContacts, isLoading: false });
    } catch (error) {
      console.error('Error searching contacts:', error);
      set({ contacts: [], isLoading: false });
    }
  },
  
  loadMessages: async (conversationId: string, isInitial = false) => {
    // Get the current active contact to ensure we're loading messages for the right conversation
    const activeContactId = get().activeContact?.id;
    const currentConversationId = get().activeConversationId;
    
    // Si no es carga inicial, no mostrar el spinner
    if (isInitial) {
      set({ isLoading: true });
    }
    
    // If the active conversation has changed since this function was called, don't proceed
    if (conversationId !== currentConversationId) {
      console.log("Conversation changed, aborting stale message load");
      return;
    }
    
    try {
      const response = await api.get(`/messages/conversation/${conversationId}?page=1&limit=50`);
      
      // Double-check that the active contact hasn't changed during the request
      if (activeContactId !== get().activeContact?.id) {
        console.log("Contact changed during message fetch, discarding results");
        return;
      }
      
      // Access nested structure correctly
      const messagesData = response.data?.data?.messages || [];
      
      // Sort messages by created_at to ensure proper chronological order
      const sortedMessages = [...messagesData].sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      // Update messages state
      set({ 
        messages: sortedMessages, 
        isLoading: false,
        isInitialLoad: false 
      });
      
      // Mark messages as read
      get().markMessagesAsRead();
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ isLoading: false, isInitialLoad: false });
    }
  },
  
  // Método para agregar mensajes optimistamente
  addMessageOptimistically: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
  
  sendMessage: async (receiverId: string, content: string, imageUrl?: string) => {
    const { activeConversationId, currentUser, activeContact } = get();
    
    if (!activeContact) {
      console.error('No active contact');
      return;
    }
    
    // If no active conversation, create a new one
    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        console.log("No active conversation, creating a new one...");
        const response = await api.post(`/conversations`, {
          participant_ids: [currentUser!.id, activeContact.id]
        });
        
        conversationId = response.data.id || response.data.data?.id;
        set({ activeConversationId: conversationId });
        
        console.log("Conversation created with ID:", conversationId);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }
    
    if (!conversationId || !currentUser) {
      console.error('Could not obtain a valid conversation or no current user');
      return;
    }
    
    // Crear un ID temporal para el mensaje optimista
    const tempId = `temp-${Date.now()}`;
    
    // Añadir mensaje optimistamente antes de enviar
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: content,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    
    // Agregar el mensaje optimista al estado
    get().addMessageOptimistically(optimisticMessage);
    
    try {
      console.log("Sending message to conversation:", conversationId);
      await api.post(`/messages`, {
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: content,
        image_url: imageUrl
      });

      if (currentUser) {
        supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', currentUser.id);
      }
      
      // No necesitamos recargar mensajes, ya mostramos el optimista
      // Solo recargamos silenciosamente para actualizar el mensaje con su ID real
      setTimeout(() => {
        get().loadMessages(conversationId, false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      // Si hay error, podríamos quitar el mensaje optimista o mostrar un error
      // En este caso, simplemente recargamos los mensajes para asegurar consistencia
      get().loadMessages(conversationId, false);
    }
  },

  markMessagesAsRead: async () => {
    const { activeConversationId, currentUser } = get();
    
    if (!activeConversationId || !currentUser) {
      return;
    }
    
    try {
      await api.patch(`/messages/${currentUser.id}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  updateUserOnlineStatus: (userId, isOnline) => {
    set(state => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline
      },
      // Also update the last_seen property in the contacts list
      contacts: state.contacts.map(contact => 
        contact.id === userId 
          ? { 
              ...contact, 
              last_seen: isOnline ? new Date().toISOString() : contact.last_seen 
            } 
          : contact
      )
    }));
  }
}));