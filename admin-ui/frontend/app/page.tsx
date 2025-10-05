'use client'

import { useState, useEffect, useRef } from 'react'
import AlertCard from './components/AlertCard'
import ConnectionStatus from './components/ConnectionStatus'
import RepositorySubscription from './components/RepositorySubscription'
import MetricsCard from './components/MetricsCard'
import DashboardHeader from './components/DashboardHeader'
import AlertTimeline from './components/AlertTimeline'
import { SecurityAlert } from './types/alert'

export default function Home() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [subscribedRepos, setSubscribedRepos] = useState<any[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket('ws://localhost:8000/ws')
        
        ws.current.onopen = () => {
          console.log('WebSocket connected')
          setConnectionStatus('connected')
        }
        
        ws.current.onmessage = (event) => {
          try {
            const alert: SecurityAlert = JSON.parse(event.data)
            setAlerts(prev => [alert, ...prev])
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        ws.current.onclose = () => {
          console.log('WebSocket disconnected')
          setConnectionStatus('disconnected')
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }
        
        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error)
        setConnectionStatus('disconnected')
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const clearAlerts = () => {
    setAlerts([])
  }

  const handleRepositoriesChange = (repositories: any[]) => {
    setSubscribedRepos(repositories)
  }

  // Calculate metrics
  const criticalAlerts = alerts.filter(alert => alert.severity?.toLowerCase() === 'critical' || alert.severity?.toLowerCase() === 'high').length
  const totalAlerts = alerts.length
  const recentAlerts = alerts.filter(alert => {
    const alertTime = new Date(alert.timestamp).getTime()
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    return alertTime > oneHourAgo
  }).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <DashboardHeader 
        connectionStatus={connectionStatus}
        totalAlerts={totalAlerts}
        subscribedRepos={subscribedRepos.length}
      />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <MetricsCard
            title="Total Alerts"
            value={totalAlerts}
            change={totalAlerts > 0 ? `+${totalAlerts} this session` : 'No alerts yet'}
            changeType={totalAlerts > 0 ? 'negative' : 'neutral'}
            icon="🚨"
            color="red"
          />
          <MetricsCard
            title="Critical Alerts"
            value={criticalAlerts}
            change={criticalAlerts > 0 ? `${criticalAlerts} require attention` : 'All clear'}
            changeType={criticalAlerts > 0 ? 'negative' : 'positive'}
            icon="⚠️"
            color="red"
          />
          <MetricsCard
            title="Recent Activity"
            value={recentAlerts}
            change="Last hour"
            changeType="neutral"
            icon="📊"
            color="blue"
          />
          <MetricsCard
            title="Monitored Repos"
            value={subscribedRepos.length}
            change={subscribedRepos.length > 0 ? `${subscribedRepos.length} active` : 'No repos subscribed'}
            changeType={subscribedRepos.length > 0 ? 'positive' : 'neutral'}
            icon="📁"
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Repository Management */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RepositorySubscription onRepositoriesChange={handleRepositoriesChange} />
          </div>

          {/* Alert Timeline */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <AlertTimeline alerts={alerts} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 sm:mb-8">
          <button
            onClick={clearAlerts}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
          >
            Clear All Alerts
          </button>
          <button
            onClick={() => {
              fetch('http://localhost:8000/webhook/github/test', { method: 'POST' })
                .then(response => response.json())
                .then(data => console.log('Test alert sent:', data))
                .catch(error => console.error('Error sending test alert:', error))
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
          >
            Send Test Alert
          </button>
        </div>

        {/* Detailed Alert Cards */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Alert Details
            </h2>
            <div className="grid gap-4">
              {alerts.map((alert, index) => (
                <AlertCard key={`${alert.alert_id}-${index}`} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

