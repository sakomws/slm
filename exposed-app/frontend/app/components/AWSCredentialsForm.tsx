'use client'

import { useState } from 'react'
import { AWSConfig } from '../types/ec2'

interface AWSCredentialsFormProps {
  onSubmit: (config: AWSConfig) => void
  isLoading: boolean
}

export default function AWSCredentialsForm({ onSubmit, isLoading }: AWSCredentialsFormProps) {
  const [formData, setFormData] = useState<AWSConfig>({
    region: 'us-east-1'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        AWS EC2 Instance Listing
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        List EC2 instances using AWS credentials stored in the backend's .env file. 
        Make sure your IAM user has EC2 read permissions.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            AWS Region
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
          >
            <option value="us-east-1">US East (N. Virginia)</option>
            <option value="us-east-2">US East (Ohio)</option>
            <option value="us-west-1">US West (N. California)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">Europe (Ireland)</option>
            <option value="eu-west-2">Europe (London)</option>
            <option value="eu-central-1">Europe (Frankfurt)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            <option value="ca-central-1">Canada (Central)</option>
            <option value="sa-east-1">South America (São Paulo)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-aws-orange text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Loading Instances...' : 'List EC2 Instances'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This application uses AWS credentials from the backend's .env file. 
          Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in the backend environment.
        </p>
      </div>
    </div>
  )
}
