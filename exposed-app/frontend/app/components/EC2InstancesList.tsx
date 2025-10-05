'use client'

import { EC2Instance } from '../types/ec2'
import EC2InstanceCard from './EC2InstanceCard'

interface EC2InstancesListProps {
  instances: EC2Instance[]
  region: string
  totalCount: number
  accessKeyUsed: string
  timestamp: string
}

export default function EC2InstancesList({ instances, region, totalCount, accessKeyUsed, timestamp }: EC2InstancesListProps) {
  const getStateStats = () => {
    const stats = instances.reduce((acc, instance) => {
      acc[instance.state] = (acc[instance.state] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  const stateStats = getStateStats()

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          EC2 Instances Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Instances</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stateStats.running || 0}</div>
            <div className="text-sm text-gray-600">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stateStats.stopped || 0}</div>
            <div className="text-sm text-gray-600">Stopped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-aws-orange">{region}</div>
            <div className="text-sm text-gray-600">Region</div>
          </div>
        </div>
        
        {/* Access Key Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">AWS Access Key Used</h3>
              <p className="text-lg font-mono text-gray-900">{accessKeyUsed}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="text-sm text-gray-600">{new Date(timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instances List */}
      {instances.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No EC2 Instances Found</h3>
          <p className="text-gray-600">
            No EC2 instances were found in the {region} region. This could mean:
          </p>
          <ul className="mt-2 text-sm text-gray-600 text-left max-w-md mx-auto">
            <li>• No instances exist in this region</li>
            <li>• Your IAM user doesn't have EC2 permissions</li>
            <li>• The credentials are invalid</li>
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {instances.map((instance) => (
            <EC2InstanceCard key={instance.instance_id} instance={instance} />
          ))}
        </div>
      )}
    </div>
  )
}
