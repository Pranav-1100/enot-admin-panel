import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

// Button Loading Spinner
export function ButtonSpinner({ size = 'sm' }) {
  return <LoadingSpinner size={size} className="mr-2" />;
}

// Page Loading Spinner
export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}