import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from './store'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const ok = await login(username.trim(), password)
    if (!ok) setError('Invalid credentials')
    else navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <label className="block mb-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
        </label>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <button className="w-full rounded-lg bg-brand-600 text-white py-2">Sign in</button>
        <p className="text-xs text-gray-500 mt-3">Default admin: eddie / eddie</p>
      </form>
    </div>
  )
}


