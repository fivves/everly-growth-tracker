import { useState } from 'react'
import { useAuthStore } from './store'
import { useMilestoneStore } from '../milestones/store'

export function AdminPage() {
  const { users, addUser, removeUser, changePassword, currentUser } = useAuthStore()
  const { baby, setBabyWeight } = useMilestoneStore()
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [pwUser, setPwUser] = useState('')
  const [pwPass, setPwPass] = useState('')
  const [weight, setWeight] = useState<string>(typeof baby.weightLbs === 'number' ? String(baby.weightLbs) : '')

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

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Baby profile</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const num = Number(weight)
            if (Number.isFinite(num) && num > 0) setBabyWeight(Number(num.toFixed(1)))
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
        >
          <label className="block md:col-span-1">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Weight (lbs)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2 text-right">
            <button className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-4 py-2 shadow-lg shadow-brand-600/30 hover:bg-brand-700">Save weight</button>
          </div>
        </form>
      </section>
    </div>
  )
}


