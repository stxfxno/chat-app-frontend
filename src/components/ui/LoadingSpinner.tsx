// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
  }
  
  const LoadingSpinner = ({ size = 'md', fullScreen = false }: LoadingSpinnerProps) => {
    const sizeClass = 
      size === 'sm' ? 'h-6 w-6' :
      size === 'lg' ? 'h-12 w-12' :
      'h-8 w-8';
    
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className={`${sizeClass} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
        </div>
      );
    }
    
    return (
      <div className={`${sizeClass} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
    );
  };
  
  export default LoadingSpinner;