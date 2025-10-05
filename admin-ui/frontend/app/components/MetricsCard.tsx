'use client'

interface MetricsCardProps {
  title: string
  value: number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
  color: 'red' | 'green' | 'blue' | 'yellow' | 'purple'
}

export default function MetricsCard({ title, value, change, changeType, icon, color }: MetricsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-2">
        <p className={`text-sm ${getChangeColor(changeType)}`}>
          {change}
        </p>
      </div>
    </div>
  )
}