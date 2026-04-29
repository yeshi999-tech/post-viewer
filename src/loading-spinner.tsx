type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
  color?: string;
  className?: string;
};

const LoadingSpinner = ({
  size = 'md',
  color = 'text-blue-600',
  className = ""
}: LoadingSpinnerProps) => {
  // Mapping sizes to Tailwind classes
  const sizeClasses: Record<LoadingSpinnerSize, string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-8',
  };

  return (
    
<div className="flex min-h-[200px] w-full items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${color} 
          ${className} 
          animate-spin 
          rounded-full 
          border-current 
          border-t-transparent
        `}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
