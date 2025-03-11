// src/components/chat/SearchInput.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SearchInputProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

const SearchInput = ({ onSearch, placeholder = 'Buscar...' }: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useTheme();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-10 pr-4 py-2 w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-transparent' 
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-transparent'
        }`}
      />
    </div>
  );
};

export default SearchInput;