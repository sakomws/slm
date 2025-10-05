'use client'

import { useState, useEffect } from 'react'

interface RepositorySubscriptionProps {
  onRepositoriesChange: (repositories: any[]) => void
}

export default function RepositorySubscription({ onRepositoriesChange }: RepositorySubscriptionProps) {
  const [username, setUsername] = useState('')
  const [repoInput, setRepoInput] = useState('')
  const [repositories, setRepositories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [githubRepos, setGithubRepos] = useState<any[]>([])
  const [isFetchingRepos, setIsFetchingRepos] = useState(false)
  const [showGithubRepos, setShowGithubRepos] = useState(false)

  // Load initial subscriptions
  useEffect(() => {
    fetchSubscribedRepos()
  }, [])

  const fetchSubscribedRepos = async () => {
    try {
      const response = await fetch('http://localhost:8000/repositories')
      if (response.ok) {
        const data = await response.json()
        setRepositories(data.repositories || [])
        onRepositoriesChange(data.repositories || [])
      }
    } catch (error) {
      console.error('Error fetching subscribed repositories:', error)
    }
  }

  const fetchGithubRepositories = async () => {
    if (!username.trim()) {
      setMessage('Please enter a GitHub username')
      return
    }

    setIsFetchingRepos(true)
    setMessage('')

    try {
      const response = await fetch(`http://localhost:8000/github/repositories/${username}`)
      if (response.ok) {
        const data = await response.json()
        setGithubRepos(data.repositories || [])
        setShowGithubRepos(true)
        setMessage(`Found ${data.repositories?.length || 0} public repositories`)
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to fetch repositories')
      }
    } catch (error) {
      setMessage('Error fetching repositories')
    } finally {
      setIsFetchingRepos(false)
    }
  }

  const selectAllRepositories = () => {
    const allRepos = githubRepos.map(repo => ({
      username: username,
      repository: repo.name,
      full_name: repo.full_name
    }))
    setRepositories([...repositories, ...allRepos])
    onRepositoriesChange([...repositories, ...allRepos])
    setMessage(`Selected all ${allRepos.length} repositories`)
  }

  const selectRepository = (repo: any) => {
    const newRepo = {
      username: username,
      repository: repo.name,
      full_name: repo.full_name
    }
    
    if (!repositories.some(r => r.full_name === newRepo.full_name)) {
      const updatedRepos = [...repositories, newRepo]
      setRepositories(updatedRepos)
      onRepositoriesChange(updatedRepos)
      setMessage(`Added ${repo.name} to subscriptions`)
    } else {
      setMessage(`${repo.name} is already subscribed`)
    }
  }

  const subscribeToRepositories = async () => {
    if (repositories.length === 0) {
      setMessage('Please select repositories to subscribe')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/repositories/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          repositories: repositories.map(r => r.repository)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.message || 'Successfully subscribed to repositories')
        fetchSubscribedRepos() // Refresh the list
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to subscribe to repositories')
      }
    } catch (error) {
      setMessage('Error subscribing to repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const removeRepository = async (repoToRemove: any) => {
    try {
      const response = await fetch(`http://localhost:8000/repositories/${repoToRemove.username}/${repoToRemove.repository}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedRepos = repositories.filter(r => r.full_name !== repoToRemove.full_name)
        setRepositories(updatedRepos)
        onRepositoriesChange(updatedRepos)
        setMessage(`Removed ${repoToRemove.repository} from subscriptions`)
        fetchSubscribedRepos() // Refresh the list
      } else {
        setMessage('Failed to remove repository')
      }
    } catch (error) {
      setMessage('Error removing repository')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Repository Subscriptions
      </h2>
      
      <div className="space-y-4">
        {/* GitHub Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Username
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchGithubRepositories}
              disabled={isFetchingRepos}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isFetchingRepos ? 'Fetching...' : 'Fetch Repos'}
            </button>
          </div>
        </div>

        {/* GitHub Repositories List */}
        {showGithubRepos && githubRepos.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">
                Available Repositories ({githubRepos.length})
              </h3>
              <button
                onClick={selectAllRepositories}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {githubRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{repo.name}</div>
                    <div className="text-sm text-gray-600">{repo.description || 'No description'}</div>
                  </div>
                  <button
                    onClick={() => selectRepository(repo)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Repository Input */}
        <div>
          <label htmlFor="repoInput" className="block text-sm font-medium text-gray-700 mb-2">
            Or add repository manually
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="repoInput"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="repository-name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                if (repoInput.trim() && username.trim()) {
                  selectRepository({ name: repoInput.trim(), full_name: `${username}/${repoInput.trim()}` })
                  setRepoInput('')
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Repositories */}
        {repositories.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Selected Repositories ({repositories.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {repositories.map((repo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <span className="font-medium text-gray-900">{repo.full_name}</span>
                  <button
                    onClick={() => removeRepository(repo)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribe Button */}
        <button
          onClick={subscribeToRepositories}
          disabled={isLoading || repositories.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe to Repositories'}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('Error') || message.includes('Failed') 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}