// src/components/chat/MessageInput.tsx
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { supabase } from '../../lib/supabase';
import { Send, Image, Smile } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { darkMode, themeColors } = useTheme();
  
  const { activeContact, sendMessage } = useChatStore();
  
  if (!activeContact) return null;
  
  // Cerrar el selector de emojis al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      await sendMessage(activeContact.id, message);
      setMessage('');
      setShowEmojiPicker(false); // Cerrar el selector después de enviar
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);
      
      await sendMessage(
        activeContact.id,
        'Imagen adjunta:',
        urlData.publicUrl
      );
    } catch (error) {
      console.error('Error al subir archivo:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Manejar la selección de emoji
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };
  
  return (
    <div className={`z-10 px-4 py-3 border-t shadow-sm ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex">
          {/* Botón de subir imagen */}
          <button
            type="button"
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Adjuntar imagen"
          >
            <Image size={20} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </button>
          
          {/* Botón de emojis */}
          <button
            type="button"
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isUploading}
            title="Insertar emoji"
          >
            <Smile size={20} />
          </button>
        </div>
        
        <div className="flex-1 mx-2 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className={`w-full py-2 px-3 rounded-full transition-colors focus:outline-none focus:ring-2 ${
              darkMode 
                ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:${themeColors.ring}` 
                : `bg-gray-100 border-gray-200 text-gray-900 focus:${themeColors.ring}`
            }`}
            disabled={isUploading}
          />
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              className="absolute bottom-full mb-2" 
              ref={emojiPickerRef}
              style={{ zIndex: 40 }}
            >
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                theme={darkMode ? 'dark' : 'light' as any}
                searchPlaceHolder="Buscar emoji..."
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className={`p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
            message.trim()
              ? `bg-gradient-to-r ${themeColors.primary} text-white ${themeColors.hover}` 
              : darkMode 
                ? 'bg-gray-700 text-gray-500' 
                : 'bg-gray-200 text-gray-400'
          }`}
          disabled={!message.trim() || isUploading}
        >
          <Send size={20} />
        </button>
      </form>
      
      {isUploading && (
        <div className={`mt-2 text-xs flex items-center justify-center ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className={`animate-spin mr-2 h-3 w-3 rounded-full border border-t-2 ${
            darkMode ? themeColors.secondary.replace('text', 'border') : themeColors.secondary.replace('text', 'border')
          }`}></div>
          Subiendo imagen...
        </div>
      )}
    </div>
  );
};

export default MessageInput;