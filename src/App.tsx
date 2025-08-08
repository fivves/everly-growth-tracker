import './App.css'
import { MilestonePage } from './features/milestones/MilestonePage'
import { BrowserRouter, Route, Routes, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { AdminPage } from './features/auth/AdminPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { useAuthStore } from './features/auth/store'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('theme') as ThemeMode) || 'system')

  const effectiveTheme = useMemo<Exclude<ThemeMode, 'system'>>(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined' && 'matchMedia' in window) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
    localStorage.setItem('theme', theme)
  }, [theme, effectiveTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(mq.matches ? 'dark' : 'light')
    }
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else mq.addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else mq.removeListener(handler)
    }
  }, [theme])

  return (
    <BrowserRouter>
      <div className="min-h-dvh">
        <nav className="sticky top-0 z-30 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2 sm:gap-4">
            <NavLink to="/" end className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Milestones</NavLink>
            {/* Archive removed; logs now available from Completed cards */}
            <AdminLink />
            <div className="w-full sm:w-auto ml-0 sm:ml-auto mt-2 sm:mt-0 flex items-center gap-2 justify-between sm:justify-end">
              <AuthControls />
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Change theme"
              >
                {effectiveTheme === 'dark' ? <Sun className="size-4"/> : <Moon className="size-4"/>}
                <span className="hidden sm:inline">{theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<MilestonePage />} />
          <Route path="/completed" element={<Navigate to="/" replace />} />
          {/* Archive removed */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

function AuthControls() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  if (currentUser) {
    return <SignOutButton username={currentUser} onSignOut={logout} />
  }
  return (
    <NavLink to="/login" className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Sign in</NavLink>
  )
}

function AdminLink() {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (!currentUser) return null
  return (
    <NavLink to="/admin" className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Admin</NavLink>
  )
}

function SignOutButton({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { onSignOut(); navigate('/', { replace: true }) }}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
    >
      Sign out ({username})
    </button>
  )
}
