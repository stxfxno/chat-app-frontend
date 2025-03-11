// src/context/MessageSubscriptionProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

// Create context
const MessageSubscriptionContext = createContext<null>(null);

/**
 * Provider component that handles all chat subscriptions in one place
 */
export const MessageSubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  
  // Get store functions directly from the store
  const loadMessages = useChatStore.getState().loadMessages;
  const updateUserOnlineStatus = useChatStore.getState().updateUserOnlineStatus;
  
  // Subscribe to messages for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;
    
    console.log("Setting up message subscription for conversation:", activeConversationId);
    
    const channel = supabase.channel(`messages:${activeConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`,
      }, (payload) => {
        console.log("New message detected:", payload);
        // Get the current conversation ID to ensure we're still on the same conversation
        const currentConversationId = useChatStore.getState().activeConversationId;
        if (currentConversationId === activeConversationId) {
          loadMessages(activeConversationId);
        }
      })
      .subscribe();
    
    return () => {
      console.log("Cleaning up message subscription");
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);
  
  // Setup presence subscription once, regardless of active contact
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up presence subscription");
    
    const presenceChannel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Get the current state of all online users
        const state = presenceChannel.presenceState();
        console.log("Presence state updated:", state);
        
        // Update the online status of users in our store
        for (const userId in state) {
          updateUserOnlineStatus(userId, true);
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
        updateUserOnlineStatus(key, true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
        updateUserOnlineStatus(key, false);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        if (user?.id) {
          // Track the current user as online
          const trackStatus = await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          console.log("Tracking current user's online status:", trackStatus);
        }
      });
    
    return () => {
      console.log("Cleaning up presence subscription");
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id]);
  
  return (
    <MessageSubscriptionContext.Provider value={null}>
      {children}
    </MessageSubscriptionContext.Provider>
  );
};

// Custom hook for using the context
export const useMessageSubscription = () => {
  useContext(MessageSubscriptionContext);
  // We don't actually need to return anything from the context
  // The provider handles all the subscriptions
  return null;
};