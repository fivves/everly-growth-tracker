import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRecord = {
  username: string
  passwordHash: string
  salt: string
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

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(input)
  const hashBuf = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuf))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSalt(bytes: number = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256(`${salt}:${password}`)
}

const DEFAULT_ADMIN = 'eddie'
const DEFAULT_ADMIN_PASSWORD = 'eddie'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      login: async (username, password) => {
        const { users, addUser } = get() as AuthState & { addUser: (u: string, p: string) => Promise<void> }
        const user = users.find((u) => u.username === username)
        if (!user) {
          // Bootstrap default admin on first login
          if (username === DEFAULT_ADMIN && password === DEFAULT_ADMIN_PASSWORD) {
            await addUser(DEFAULT_ADMIN, DEFAULT_ADMIN_PASSWORD)
            set({ currentUser: DEFAULT_ADMIN })
            return true
          }
          return false
        }
        const computed = await hashPassword(password, user.salt)
        if (computed === user.passwordHash) {
          set({ currentUser: username })
          return true
        }
        return false
      },
      logout: () => set({ currentUser: null }),
      addUser: async (username, password) => {
        const { users } = get()
        if (users.some((u) => u.username === username)) return
        const salt = generateSalt()
        const passwordHash = await hashPassword(password, salt)
        set({ users: [...users, { username, passwordHash, salt }] })
      },
      removeUser: (username) => {
        if (username === DEFAULT_ADMIN) return
        set((state) => ({ users: state.users.filter((u) => u.username !== username) }))
      },
      changePassword: async (username, newPassword) => {
        const salt = generateSalt()
        const passwordHash = await hashPassword(newPassword, salt)
        set((state) => ({
          users: state.users.map((u) => (u.username === username ? { ...u, salt, passwordHash } : u)),
        }))
      },
      canEdit: () => get().currentUser != null,
      isAdmin: () => get().currentUser != null, // all users are admins per requirements
    }),
    {
      name: 'everly-auth-v1',
      version: 1,
      migrate: async (persisted: any) => {
        // Preserve users; bootstrap handled on first login
        const data = (persisted ?? {}) as Partial<AuthState>
        return { ...data }
      },
    }
  )
)


