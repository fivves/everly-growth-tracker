import { Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}


