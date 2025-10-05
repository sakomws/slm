'use client'

import { EC2Instance } from '../types/ec2'

interface EC2InstanceCardProps {
  instance: EC2Instance
}

export default function EC2InstanceCard({ instance }: EC2InstanceCardProps) {
  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'stopping':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInstanceTypeColor = (type: string) => {
    if (type.startsWith('t')) return 'bg-blue-100 text-blue-800'
    if (type.startsWith('m')) return 'bg-purple-100 text-purple-800'
    if (type.startsWith('c')) return 'bg-green-100 text-green-800'
    if (type.startsWith('r')) return 'bg-pink-100 text-pink-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 font-mono break-all mb-1">
              {instance.instance_id}
            </h3>
            {instance.tags.Name && (
              <p className="text-base text-gray-700 font-medium break-words">{instance.tags.Name}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${getStateColor(instance.state)}`}>
              {instance.state.toUpperCase()}
            </span>
            <span className={`px-4 py-2 text-sm font-bold rounded-lg ${getInstanceTypeColor(instance.instance_type)}`}>
              {instance.instance_type}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6">

        {/* Network Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
            </svg>
            Network Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instance.public_ip && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">Public IP Address</div>
                <div className="font-mono text-lg font-bold text-green-900">{instance.public_ip}</div>
              </div>
            )}
            {instance.private_ip && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">Private IP Address</div>
                <div className="font-mono text-lg font-bold text-blue-900">{instance.private_ip}</div>
              </div>
            )}
            {instance.availability_zone && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-medium text-purple-800 mb-1">Availability Zone</div>
                <div className="text-lg font-bold text-purple-900">{instance.availability_zone}</div>
              </div>
            )}
            {instance.vpc_id && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-800 mb-1">VPC ID</div>
                <div className="font-mono text-sm font-bold text-gray-900 break-all">{instance.vpc_id}</div>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
            </svg>
            System Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-sm font-medium text-orange-800 mb-1">Instance Type</div>
              <div className="font-mono text-lg font-bold text-orange-900">{instance.instance_type}</div>
            </div>
            {instance.launch_time && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-sm font-medium text-indigo-800 mb-1">Launch Time</div>
                <div className="text-lg font-bold text-indigo-900">
                  {new Date(instance.launch_time).toLocaleDateString()}
                </div>
                <div className="text-sm text-indigo-700">
                  {new Date(instance.launch_time).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Groups */}
        {instance.security_groups.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Security Groups
            </h4>
            <div className="flex flex-wrap gap-3">
              {instance.security_groups.map((sg, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-lg px-4 py-3 border border-green-200"
                >
                  <div className="font-mono text-sm font-bold text-green-900 break-all">{sg}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags - Only show important ones */}
        {Object.keys(instance.tags).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              Important Tags
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(instance.tags)
                .filter(([key]) => !key.startsWith('aws:cloudformation:'))
                .slice(0, 4)
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                  >
                    <div className="text-sm font-medium text-purple-800 mb-1">{key}</div>
                    <div className="font-mono text-sm font-bold text-purple-900 break-all">{value}</div>
                  </div>
                ))}
            </div>
            {Object.keys(instance.tags).filter(key => key.startsWith('aws:cloudformation:')).length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                +{Object.keys(instance.tags).filter(key => key.startsWith('aws:cloudformation:')).length} CloudFormation tags hidden
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
