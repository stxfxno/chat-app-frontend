export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  }
  
  export interface Contact {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    last_seen?: string;
  }
  
  export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    image_url?: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface Conversation {
    id: string;
    participants: string[];
    last_message?: string;
    last_message_time?: string;
  }