// src/components/ui/ProfileButton.tsx
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ProfileButtonProps {
  user: { avatar_url?: string }; // Tipo de usuario
}

const ProfileButton = ({ user }: ProfileButtonProps) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate('/profile')}
      className={`p-2 rounded-full transition-colors ${
        darkMode 
          ? 'hover:bg-gray-700/70' 
          : 'hover:bg-white/20'
      }`}
      aria-label="Perfil"
    >
      {user?.avatar_url ? (
        <div className="h-6 w-6 rounded-full overflow-hidden">
          <img 
            src={user.avatar_url} 
            alt="Perfil" 
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <UserCircle size={24} className={darkMode ? 'text-white' : 'text-white'} />
      )}
    </button>
  );
};

export default ProfileButton;