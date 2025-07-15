'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  text,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        animate-spin rounded-full border-4 
        ${sizeClasses[size]} 
        ${colorClasses[color]}
      `}></div>
      {text && (
        <p className="mt-3 text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  )
} 