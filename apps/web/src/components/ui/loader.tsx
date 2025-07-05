import { cn } from '@/lib/utils'

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'orbit'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function Loader({ 
  variant = 'orbit', 
  size = 'md', 
  message = 'Loading...', 
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn('border-4 border-muted border-t-primary rounded-full animate-spin', sizeClasses[size])} />
        )

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn('bg-primary rounded-full animate-bounce', {
                  'w-2 h-2': size === 'sm',
                  'w-3 h-3': size === 'md',
                  'w-4 h-4': size === 'lg'
                })}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])} />
        )

      case 'wave':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn('bg-primary animate-wave', {
                  'w-1 h-4': size === 'sm',
                  'w-2 h-8': size === 'md',
                  'w-3 h-12': size === 'lg'
                })}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )

      case 'orbit':
      default:
        return (
          <div className={cn('relative', sizeClasses[size])}>
            {/* Central avatar icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn('bg-primary rounded-full', {
                'w-2 h-2': size === 'sm',
                'w-3 h-3': size === 'md',
                'w-4 h-4': size === 'lg'
              })} />
            </div>
            {/* Orbiting elements */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
                style={{ 
                  animationDuration: `${2 + i * 0.5}s`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                <div className={cn('bg-primary/60 rounded-full', {
                  'w-1 h-1': size === 'sm',
                  'w-1.5 h-1.5': size === 'md',
                  'w-2 h-2': size === 'lg'
                })} />
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      {renderLoader()}
      {message && (
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

// Add custom animations to globals.css
export const loaderStyles = `
@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

.animate-wave {
  animation: wave 1.2s infinite ease-in-out;
}
` 