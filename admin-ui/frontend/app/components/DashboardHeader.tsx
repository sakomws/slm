'use client'

import ConnectionStatus from './ConnectionStatus'

interface DashboardHeaderProps {
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  totalAlerts: number
  subscribedRepos: number
}

export default function DashboardHeader({ connectionStatus, totalAlerts, subscribedRepos }: DashboardHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full overflow-hidden">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Title and Status */}
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Security Alerts Dashboard
              </h1>
              <ConnectionStatus status={connectionStatus} />
            </div>
            
            {/* Metrics */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{totalAlerts}</div>
                <div className="text-xs text-gray-600">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{subscribedRepos}</div>
                <div className="text-xs text-gray-600">Monitored Repos</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-green-600">99.9%</div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}