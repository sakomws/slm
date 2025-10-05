'use client'

import { useState } from 'react'
import { EC2Instance, EC2ListResponse, AWSConfig } from './types/ec2'
import AWSCredentialsForm from './components/AWSCredentialsForm'
import EC2InstancesList from './components/EC2InstancesList'

export default function Home() {
  const [instances, setInstances] = useState<EC2Instance[]>([])
  const [region, setRegion] = useState<string>('')
  const [totalCount, setTotalCount] = useState<number>(0)
  const [accessKeyUsed, setAccessKeyUsed] = useState<string>('')
  const [timestamp, setTimestamp] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasLoaded, setHasLoaded] = useState(false)

  const handleCredentialsSubmit = async (config: AWSConfig) => {
    setIsLoading(true)
    setError('')
    setHasLoaded(false)

    try {
      const response = await fetch('http://localhost:8001/ec2/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch EC2 instances')
      }

      const data: EC2ListResponse = await response.json()
      setInstances(data.instances)
      setRegion(data.region)
      setTotalCount(data.total_count)
      setAccessKeyUsed(data.access_key_used)
      setTimestamp(data.timestamp)
      setHasLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setInstances([])
      setRegion('')
      setTotalCount(0)
      setAccessKeyUsed('')
      setTimestamp('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-aws-blue text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AWS EC2 Dashboard</h1>
              <p className="text-aws-orange mt-1">Monitor and manage your EC2 instances</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credentials Form */}
          <div className="lg:col-span-1">
            <AWSCredentialsForm onSubmit={handleCredentialsSubmit} isLoading={isLoading} />
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasLoaded && (
              <EC2InstancesList 
                instances={instances} 
                region={region} 
                totalCount={totalCount}
                accessKeyUsed={accessKeyUsed}
                timestamp={timestamp}
              />
            )}

            {!hasLoaded && !error && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Connect</h3>
                <p className="text-gray-600">
                  Enter your AWS credentials to start monitoring your EC2 instances.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
