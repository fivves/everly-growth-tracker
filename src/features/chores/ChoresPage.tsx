import { useState } from 'react'
import { useChoresStore } from './store'

export function ChoresPage() {
  const { choresToday, toggleChore, addChore, deleteChore } = useChoresStore()
  const list = choresToday()
  const [title, setTitle] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    addChore(title)
    setTitle('')
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Today's Chores</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">These reset every midnight. Check them off as you go.</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <form onSubmit={submit} className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a chore" className="flex-1 rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
          <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2">Add</button>
        </form>
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={c.done} onChange={() => toggleChore(c.id)} className="size-4" />
                <span className={`text-sm ${c.done ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>{c.title}</span>
              </label>
              <button onClick={() => deleteChore(c.id)} className="text-xs rounded-full border px-2 py-1 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30">Delete</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}


