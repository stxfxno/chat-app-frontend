// src/hooks/useMessageSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';

export const useMessageSubscription = (contactId: string | null) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Get store functions directly from the store
  const loadMessagesFromStore = useChatStore.getState().loadMessages;
  const updateUserStatusFromStore = useChatStore.getState().updateUserOnlineStatus;
  
  // Subscription for messages
  useEffect(() => {
    if (!contactId) return;
    
    // Get the conversation ID directly from the store
    const activeConversationId = useChatStore.getState().activeConversationId;
    if (!activeConversationId) return;
    
    console.log("Setting up message subscription for conversation:", activeConversationId);
    
    // Listen for new messages in the current conversation
    const channel = supabase.channel(`messages:${activeConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`,
      }, (payload) => {
        console.log("New message detected:", payload);
        // Get the current conversation ID when a message arrives
        // This ensures we're loading messages for the current conversation
        const currentConversationId = useChatStore.getState().activeConversationId;
        if (currentConversationId === activeConversationId) {
          loadMessagesFromStore(activeConversationId);
        }
      })
      .subscribe((status) => {
        console.log("Message subscription status:", status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });
    
    return () => {
      console.log("Cleaning up message subscription");
      supabase.removeChannel(channel);
    };
  }, [contactId]); // Only depend on contactId
  
  // Subscription for presence (user online status)
  useEffect(() => {
    if (!contactId) return;
    
    console.log("Setting up presence subscription");
    
    // Create a channel for presence
    const presenceChannel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Get the current state of all online users
        const state = presenceChannel.presenceState();
        console.log("Presence state updated:", state);
        
        // Update the online status of users in our store
        for (const userId in state) {
          updateUserStatusFromStore(userId, true);
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        // A user has come online
        console.log('User joined:', key);
        updateUserStatusFromStore(key, true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // A user has gone offline
        console.log('User left:', key);
        updateUserStatusFromStore(key, false);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        // Track the current user as online
        const { data } = await supabase.auth.getSession();
        const currentUserId = data.session?.user?.id;
        
        if (currentUserId) {
          // Current user is now tracked as online
          const trackStatus = await presenceChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
          console.log("Tracking current user's online status:", trackStatus);
        }
      });
    
    return () => {
      console.log("Cleaning up presence subscription");
      supabase.removeChannel(presenceChannel);
    };
  }, [contactId]); // Only depend on contactId
  
  return { isSubscribed };
};