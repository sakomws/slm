'use client'

import { SecurityAlert } from '../types/alert'

interface AlertTimelineProps {
  alerts: SecurityAlert[]
}

export default function AlertTimeline({ alerts }: AlertTimelineProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Alert Timeline
      </h2>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600">No alerts yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Security alerts will appear here when they are received
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.slice(0, 10).map((alert, index) => (
            <div key={`${alert.alert_id}-${index}`} className="flex items-start space-x-3">
              {/* Timeline dot */}
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
              </div>
              
              {/* Alert content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {alert.package_name} - {alert.package_version}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {alert.summary}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{alert.repository}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    alert.severity?.toLowerCase() === 'low' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.severity?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <span>{alert.state}</span>
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length > 10 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing 10 of {alerts.length} alerts
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}