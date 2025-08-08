import { useState } from 'react'
import { useAuthStore } from './store'

export function AdminPage() {
  const { users, addUser, removeUser, changePassword, currentUser } = useAuthStore()
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [pwUser, setPwUser] = useState('')
  const [pwPass, setPwPass] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newUser.trim() || !newPass) return
    await addUser(newUser.trim(), newPass)
    setNewUser('')
    setNewPass('')
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault()
    if (!pwUser.trim() || !pwPass) return
    await changePassword(pwUser.trim(), pwPass)
    setPwUser('')
    setPwPass('')
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Users</h2>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.username} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span>{u.username}</span>
              <div className="space-x-2">
                <button
                  className="px-2 py-1 text-sm rounded border"
                  disabled={u.username === 'eddie' && currentUser !== 'eddie'}
                  title={u.username === 'eddie' && currentUser !== 'eddie' ? 'Only eddie can change this password' : ''}
                  onClick={() => setPwUser(u.username)}
                >Select for password change</button>
                <button
                  className="px-2 py-1 text-sm rounded border"
                  disabled={u.username === 'eddie' || u.username === currentUser}
                  title={u.username === 'eddie' ? 'Cannot remove default admin' : u.username === currentUser ? 'Cannot remove current session' : ''}
                  onClick={() => removeUser(u.username)}
                >Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Add user</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="username" value={newUser} onChange={(e) => setNewUser(e.target.value)} className="rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
          <input placeholder="password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
          <button className="rounded-lg bg-brand-600 text-white px-4">Add</button>
        </form>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Change password</h2>
        <form onSubmit={handleChangePw} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="username" value={pwUser} onChange={(e) => setPwUser(e.target.value)} className="rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
          <input placeholder="new password" type="password" value={pwPass} onChange={(e) => setPwPass(e.target.value)} className="rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500" />
          <button className="rounded-lg bg-brand-600 text-white px-4">Change</button>
        </form>
      </section>
    </div>
  )
}


