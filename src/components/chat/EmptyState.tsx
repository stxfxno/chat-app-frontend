// src/components/chat/EmptyState.tsx
import { MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

const EmptyState = ({ message, icon }: EmptyStateProps) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`flex-1 flex items-center justify-center flex-col p-6 ${
      darkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <div className={`flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
        darkMode 
          ? 'bg-gray-800' 
          : 'bg-gray-100'
      }`}>
        {icon || <MessageSquare size={32} className={
          darkMode ? 'text-violet-400' : 'text-indigo-500'
        } />}
      </div>
      <p className={`text-lg text-center max-w-md ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>{message}</p>
    </div>
  );
};

export default EmptyState;