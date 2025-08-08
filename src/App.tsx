import './App.css'
import { MilestonePage } from './features/milestones/MilestonePage'
import { CompletedPage } from './features/milestones/CompletedPage'
import { ArchivePage } from './features/milestones/ArchivePage'
import { BrowserRouter, Route, Routes, NavLink, useNavigate } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { AdminPage } from './features/auth/AdminPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { useAuthStore } from './features/auth/store'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <div className="min-h-dvh">
        <nav className="sticky top-0 z-30 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4">
            <NavLink to="/" end className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Milestones</NavLink>
            <NavLink to="/completed" className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Completed</NavLink>
            <NavLink to="/archive" className={({isActive}) => `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Archive</NavLink>
            <AdminLink />
            <div className="ml-auto">
              <AuthControls />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="size-4"/> : <Moon className="size-4"/>}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<MilestonePage />} />
          <Route path="/completed" element={<CompletedPage />} />
          <Route path="/archive" element={<ArchivePage />} />
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
