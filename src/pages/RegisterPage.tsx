import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { Phone } from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Usa el contexto de tema en lugar de estado local
  const { darkMode, toggleDarkMode } = useTheme();

  const navigate = useNavigate();
  const signUp = useAuthStore(state => state.signUp);


  const validatePhone = (value: string) => {
    if (!/^\d{9}$/.test(value)) {
      setPhoneError('El número debe tener exactamente 9 dígitos');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!validatePhone(phoneNumber)) {
      return;
    }

    try {
      await signUp(email, password, fullName, phoneNumber);
      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrarse');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900'
      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50'
      }`}>
      {/* Header con navegación y botón de tema */}
      <header className="w-full flex justify-between items-center p-4 md:p-6">
        {/* Botón de cambio de tema */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-opacity-20 backdrop-blur-sm transition-colors hover:bg-opacity-30"
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Link de ayuda */}
        <div className={`text-xs sm:text-sm font-light flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="hidden sm:inline mr-2">¿Necesitas ayuda?</span>
          <span className="hidden sm:block h-4 w-px bg-gray-400 mx-2 opacity-50"></span>
          <Link to="https://www.instagram.com/stef.dev_/?next=%2F" className={`${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-800'} transition-colors duration-300`}>
            Contáctanos
          </Link>
        </div>
      </header>

      {/* Contenedor principal - Centrado vertical y horizontal */}
      <main className="flex-grow flex items-center justify-center w-full px-4 py-2 md:py-2">
        <div className={`w-full max-w-md p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl ${darkMode ? 'border border-gray-700' : ''}`}>
          <div className="text-center">
            {/* Logo/Icono */}
            <div className={`mx-auto h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-full ${darkMode ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} mb-4 sm:mb-6`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            {/* Títulos */}
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Crea tu cuenta
            </h2>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 sm:mb-8`}>
              Únete a nuestra comunidad en segundos
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className={`mb-4 sm:mb-6 ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-500'} border-l-4 p-3 sm:p-4 rounded-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              {/* Campo de Nombre Completo */}
              <div>
                <label htmlFor="full-name" className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="full-name"
                    name="fullName"
                    type="text"
                    required
                    className={`pl-10 sm:pl-12 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 transition-all duration-200 text-sm ${darkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-transparent'
                      : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-indigo-500 focus:border-transparent'
                      }`}
                    placeholder="Tu nombre y apellido"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              

              {/* Campo de Email */}
              <div>
                <label htmlFor="email-address" className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`pl-10 sm:pl-12 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 transition-all duration-200 text-sm ${darkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-transparent'
                      : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-indigo-500 focus:border-transparent'
                      }`}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label htmlFor="password" className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`pl-10 sm:pl-12 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 transition-all duration-200 text-sm ${darkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-transparent'
                      : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-indigo-500 focus:border-transparent'
                      }`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>



            {/* Campo de Telefono */}
            <div>
              <label htmlFor="phone_number" className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Número de teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Phone size={16} className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="phone_number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className={`pl-10 sm:pl-12 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 transition-all duration-200 text-sm ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-transparent'
                    : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-indigo-500 focus:border-transparent'
                    }`}
                  placeholder="Ingresa tu número de 9 dígitos"
                  required
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className={`focus:ring-2 h-4 w-4 rounded ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-violet-500 focus:ring-violet-500'
                    : 'bg-gray-50 border-gray-300 text-indigo-600 focus:ring-indigo-500'
                    }`}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="terms" className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Acepto los <Link to="/terms" className={`${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-800'}`}>Términos de servicio</Link> y la <Link to="/privacy" className={`${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-800'}`}>Política de privacidad</Link>
                </label>
              </div>
            </div>

            {/* Botón de Registro */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white transition-all duration-300 transform hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed ${darkMode
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-800'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </span>
                ) : 'Crear cuenta'}
              </button>
            </div>

            {/* Separador */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>O regístrate con</span>
              </div>
            </div>

            {/* Botones de redes sociales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className={`w-full flex justify-center items-center px-3 sm:px-4 py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-colors duration-300 ${darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Google
              </button>
              <button
                type="button"
                className={`w-full flex justify-center items-center px-3 sm:px-4 py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-colors duration-300 ${darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Footer con link de login */}
            <div className={`text-center text-xs sm:text-sm mt-4 sm:mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className={`font-medium ${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-800'} transition-colors duration-300`}>
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer con copyright */}
      <footer className="w-full p-4">
        <p className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          © 2025 stef.dev_ . De vez en cuando hace otras cosas.
        </p>
      </footer>
    </div>
  );
};

export default RegisterPage;