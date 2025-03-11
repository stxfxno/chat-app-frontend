// src/hooks/useMessageSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';

export const useMessageSubscription = (conversationId: string | null) => {
  const loadMessages = useChatStore(state => state.loadMessages);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    if (!conversationId) return;
    
    console.log("Configurando suscripción para conversación:", conversationId);
    
    // Usar postgres_changes para escuchar cambios en la tabla messages
    const channel = supabase.channel('message-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        console.log("Nuevo mensaje detectado:", payload);
        loadMessages(conversationId);
      })
      .subscribe((status) => {
        console.log("Estado de suscripción:", status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });
    
    return () => {
      console.log("Limpiando suscripción");
      supabase.removeChannel(channel);
    };
  }, [conversationId, loadMessages]);
  
  return { isSubscribed };
};