'use client'

import { SecurityAlert } from '../types/alert'

interface AlertCardProps {
  alert: SecurityAlert
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-500 bg-gray-50'
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

  return (
    <div className={`alert-card ${alert.severity?.toLowerCase() || 'unknown'} border-l-4 p-4 mb-4 bg-white rounded-lg shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {alert.package_name} - {alert.package_version}
            </h3>
            <p className="text-sm text-gray-600">{alert.repository}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
            {alert.severity?.toUpperCase() || 'UNKNOWN'}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 mb-1">Summary</h4>
        <p className="text-sm text-gray-700">{alert.summary}</p>
      </div>
      
      {alert.description && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-1">Description</h4>
          <p className="text-sm text-gray-700">{alert.description}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>State: <strong>{alert.state}</strong></span>
          <span>Action: <strong>{alert.action}</strong></span>
          {alert.alert_type && (
            <span>Type: <strong>{alert.alert_type}</strong></span>
          )}
        </div>
        {alert.html_url && (
          <a
            href={alert.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View on GitHub →
          </a>
        )}
      </div>
      
      {alert.sender && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Triggered by: <strong>{alert.sender.login}</strong>
            {alert.organization && ` (${alert.organization.login})`}
          </p>
        </div>
      )}
    </div>
  )
}