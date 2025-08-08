import { useState } from 'react'
import { useMilestoneStore } from './store'
import { useToast } from '../../components/toast/ToastProvider'
import { MilestoneCard } from './components/MilestoneCard'
import { Calendar, Clock, X } from 'lucide-react'

export function CompletedPage() {
  const { completed, setLevel, undoLevel, milestones, setLevelHistory } = useMilestoneStore()
  const { toast } = useToast()
  const list = completed()
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Completed Milestones</h2>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {list.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No completed milestones yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((m) => (
              <MilestoneCard
                key={m.id}
                item={m}
                showAdvance={false}
                statusAside={(() => {
                  const last = m.levelHistory.filter(h => h.level === 'mastered').slice(-1)[0]
                  if (!last) return null
                  try {
                    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(last.timestampIso))
                  } catch {
                    return new Date(last.timestampIso).toLocaleString()
                  }
                })()}
                onAdvance={() => {
                  setLevel(m.id, 'mastered')
                  toast('Already mastered!', { type: 'info' })
                }}
                onUndo={() => {
                  undoLevel(m.id)
                  toast('Undone!', { type: 'info' })
                }}
                onEditLogs={() => setEditingId(m.id)}
                onDelete={undefined}
              />
            ))}
          </div>
        )}
      </main>
      {editingId && (
        <EditLogsModal
          milestoneId={editingId}
          milestones={milestones}
          onClose={() => setEditingId(null)}
          onSave={(history) => { setLevelHistory(editingId, history); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function EditLogsModal({ milestoneId, milestones, onClose, onSave }: { milestoneId: string; milestones: ReturnType<typeof useMilestoneStore>['milestones']; onClose: () => void; onSave: (history: { level: 'didIt'|'learning'|'mastered'; timestampIso: string }[]) => void }) {
  const m = milestones.find((x) => x.id === milestoneId)!
  const [rows, setRows] = useState<{ level: 'didIt'|'learning'|'mastered'; date: string; time: string }[]>(() =>
    (m.levelHistory.length ? m.levelHistory : [{ level: 'didIt', timestampIso: new Date().toISOString() }]).map((h) => {
      const dt = new Date(h.timestampIso)
      const yyyy = dt.getFullYear()
      const mm = String(dt.getMonth() + 1).padStart(2, '0')
      const dd = String(dt.getDate()).padStart(2, '0')
      const hh = String(dt.getHours()).padStart(2, '0')
      const mi = String(dt.getMinutes()).padStart(2, '0')
      return { level: h.level, date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` }
    })
  )

  const addRow = () => setRows((r) => [...r, { level: 'didIt', date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,5) }])
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx))
  const changeRow = (idx: number, patch: Partial<{ level: 'didIt'|'learning'|'mastered'; date: string; time: string }>) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)))

  const save = () => {
    const history = rows.map((r) => ({ level: r.level, timestampIso: new Date(`${r.date}T${r.time}:00`).toISOString() }))
    onSave(history)
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit logs</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="size-4"/></button>
          </div>
          <div className="mt-3 space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select value={row.level} onChange={(e) => changeRow(i, { level: e.target.value as any })} className="col-span-4 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900">
                  <option value="didIt">I Did It!</option>
                  <option value="learning">I'm learning!</option>
                  <option value="mastered">Mastered</option>
                </select>
                <div className="col-span-4 flex items-center gap-2">
                  <Calendar className="size-4 text-gray-500"/>
                  <input type="date" value={row.date} onChange={(e) => changeRow(i, { date: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900" />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <Clock className="size-4 text-gray-500"/>
                  <input type="time" value={row.time} onChange={(e) => changeRow(i, { time: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900" />
                </div>
                <div className="col-span-1 text-right">
                  <button onClick={() => removeRow(i)} className="rounded-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Del</button>
                </div>
              </div>
            ))}
            <div>
              <button onClick={addRow} className="mt-2 rounded-full border px-3 py-1.5 text-sm border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Add entry</button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 border-gray-300 dark:border-gray-700">Cancel</button>
            <button onClick={save} className="rounded-lg bg-brand-600 text-white px-4 py-2">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}


