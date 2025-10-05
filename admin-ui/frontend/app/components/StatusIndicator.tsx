'use client'

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500 animate-pulse'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`${getSizeClasses(size)} ${getStatusColor(status)} rounded-full`}></div>
  )
}