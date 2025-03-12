// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ArrowLeft, Save, Palette } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

interface UpdateProfileDto {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { darkMode, toggleDarkMode, colorScheme, setColorScheme, themeColors } = useTheme();
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    phone_number: user?.phone_number || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);

  // Opciones de temas disponibles
  const colorOptions = [
    { id: 'purple', name: 'Púrpura', color: darkMode ? 'bg-violet-600' : 'bg-indigo-600' },
    { id: 'blue', name: 'Azul', color: darkMode ? 'bg-blue-600' : 'bg-blue-500' },
    { id: 'green', name: 'Verde', color: darkMode ? 'bg-emerald-600' : 'bg-emerald-500' },
    { id: 'amber', name: 'Ámbar', color: darkMode ? 'bg-amber-600' : 'bg-amber-500' },
  ];

  // Cerrar el selector de temas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeSelectorRef.current && !themeSelectorRef.current.contains(event.target as Node)) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setColorScheme(themeId as 'purple' | 'blue' | 'green' | 'amber');
    setShowThemeSelector(false);
  };

  // Redirigir si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear objeto con solo los campos modificados
      const updatedData: UpdateProfileDto = {};
      
      if (formData.full_name !== user?.full_name) {
        updatedData.full_name = formData.full_name;
      }
      
      if (formData.email !== user?.email) {
        updatedData.email = formData.email;
      }
      
      if (formData.avatar_url !== user?.avatar_url) {
        updatedData.avatar_url = formData.avatar_url;
      }
      
      // Solo enviar si hay cambios
      if (Object.keys(updatedData).length > 0) {
        await updateProfile(user!.id, updatedData);
        setSuccess('Perfil actualizado correctamente');
      } else {
        setSuccess('No se detectaron cambios');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error al actualizar el perfil');
      } else {
        setError('Error al actualizar el perfil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Encabezado */}
      <header className={`px-4 py-3 flex items-center justify-between shadow-md z-10 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white' 
          : themeColors.gradient + ' text-white'
      }`}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Mi Perfil</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón de tema claro/oscuro */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Selector de color - NUEVO */}
          <div className="relative" ref={themeSelectorRef}>
            <button 
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Cambiar tema de color"
              title="Cambiar tema de color"
            >
              <Palette size={20} className="text-white" />
            </button>
            
            {showThemeSelector && (
              <div 
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}
                style={{ zIndex: 50 }}
              >
                <div className="py-1">
                  <div className={`px-4 py-2 text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tema de color
                  </div>
                  
                  <div className="mt-1 px-2 space-y-1">
                    {colorOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectTheme(option.id)}
                        className={`flex items-center w-full px-2 py-2 text-sm rounded-md ${
                          colorScheme === option.id
                            ? darkMode 
                              ? 'bg-gray-700 text-white' 
                              : 'bg-gray-100 text-gray-900'
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-4 h-4 mr-2 rounded-full ${option.color}`}></span>
                        {option.name}
                        {colorScheme === option.id && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-6">
              <div className={`h-32 w-32 rounded-full overflow-hidden border-4 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={`h-full w-full flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-200'
                  }`}>
                    <UserCircle 
                      size={80} 
                      className={darkMode ? 'text-gray-500' : 'text-gray-400'} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mensajes de error/éxito */}
          {error && (
            <div className={`p-3 rounded text-sm mb-4 ${
              darkMode 
                ? 'bg-red-900/50 text-red-300 border border-red-800/50' 
                : 'bg-red-100 text-red-600'
            }`}>
              {error}
            </div>
          )}
          
          {success && (
            <div className={`p-3 rounded text-sm mb-4 ${
              darkMode 
                ? 'bg-green-900/50 text-green-300 border border-green-800/50' 
                : 'bg-green-100 text-green-600'
            }`}>
              {success}
            </div>
          )}
          
          {/* Campos del formulario */}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label 
                htmlFor="full_name" 
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Nombre completo
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  darkMode 
                    ? `bg-gray-800 border-gray-700 text-white focus:ring-2 focus:${themeColors.ring} focus:border-transparent` 
                    : `bg-white border-gray-300 text-gray-900 focus:ring-2 focus:${themeColors.ring} focus:border-transparent`
                }`}
              />
            </div>
            {/* Número de teléfono 

            <div>
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  darkMode 
                    ? `bg-gray-800 border-gray-700 text-white focus:ring-2 focus:${themeColors.ring} focus:border-transparent` 
                    : `bg-white border-gray-300 text-gray-900 focus:ring-2 focus:${themeColors.ring} focus:border-transparent`
                }`}
              />
            </div>
            */}
            
            {/* URL del avatar */}
            <div>
              <label 
                htmlFor="avatar_url" 
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                URL de la foto de perfil
              </label>
              <input
                type="text"
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  darkMode 
                    ? `bg-gray-800 border-gray-700 text-white focus:ring-2 focus:${themeColors.ring} focus:border-transparent` 
                    : `bg-white border-gray-300 text-gray-900 focus:ring-2 focus:${themeColors.ring} focus:border-transparent`
                }`}
              />
            </div>
            
          </div>
          
          {/* Botón de guardar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                `bg-gradient-to-r ${themeColors.primary} ${themeColors.hover} focus:ring-2 focus:ring-offset-2 focus:${themeColors.ring} ${darkMode ? 'focus:ring-offset-gray-800' : ''}`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;