import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRecord = {
  username: string
  password: string
}

type AuthState = {
  users: UserRecord[]
  currentUser: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (username: string, password: string) => Promise<void>
  removeUser: (username: string) => void
  changePassword: (username: string, newPassword: string) => Promise<void>
  canEdit: () => boolean
  isAdmin: () => boolean
}

const DEFAULT_ADMIN = 'eddie'
const DEFAULT_ADMIN_PASSWORD = 'eddie'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [{ username: DEFAULT_ADMIN, password: DEFAULT_ADMIN_PASSWORD }],
      currentUser: null,
      login: async (username, password) => {
        const { users } = get()
        const user = users.find((u) => u.username === username)
        if (!user) return false
        if (user.password === password) {
          set({ currentUser: username })
          return true
        }
        return false
      },
      logout: () => set({ currentUser: null }),
      addUser: async (username, password) => {
        const { users } = get()
        if (users.some((u) => u.username === username)) return
        set({ users: [...users, { username, password }] })
      },
      removeUser: (username) => {
        if (username === DEFAULT_ADMIN) return
        set((state) => ({ users: state.users.filter((u) => u.username !== username) }))
      },
      changePassword: async (username, newPassword) => {
        const actor = get().currentUser
        if (username === DEFAULT_ADMIN && actor !== DEFAULT_ADMIN) {
          return
        }
        set((state) => ({
          users: state.users.map((u) => (u.username === username ? { ...u, password: newPassword } : u)),
        }))
      },
      canEdit: () => get().currentUser != null,
      isAdmin: () => get().currentUser != null, // all users are admins per requirements
    }),
    {
      name: 'everly-auth-v2',
      version: 2,
    }
  )
)


