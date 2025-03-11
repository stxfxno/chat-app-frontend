// src/components/ui/ThemeSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSelector = () => {
  const { darkMode, colorScheme, setColorScheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Opciones de temas disponibles
  const colorOptions = [
    { id: 'purple', name: 'Púrpura', color: darkMode ? 'bg-violet-600' : 'bg-indigo-600' },
    { id: 'blue', name: 'Azul', color: darkMode ? 'bg-blue-600' : 'bg-blue-500' },
    { id: 'green', name: 'Verde', color: darkMode ? 'bg-emerald-600' : 'bg-emerald-500' },
    { id: 'amber', name: 'Ámbar', color: darkMode ? 'bg-amber-600' : 'bg-amber-500' },
  ];

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setColorScheme(themeId as 'purple' | 'blue' | 'green' | 'amber');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors ${
          darkMode 
            ? 'hover:bg-gray-700/70' 
            : 'hover:bg-white/20'
        }`}
        aria-label="Cambiar tema de color"
        title="Cambiar tema de color"
      >
        <Palette size={20} className={darkMode ? 'text-white' : 'text-white'} />
      </button>

      {isOpen && (
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
  );
};

export default ThemeSelector;