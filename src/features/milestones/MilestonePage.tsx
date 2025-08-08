import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { PlusCircle, Calendar, Clock, X, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMilestoneStore } from './store'
import { useToast } from '../../components/toast/ToastProvider'
import type { MilestoneItem, MilestoneLevel } from './types'
import { intervalToDuration, parseISO } from 'date-fns'
import { MilestoneCard } from './components/MilestoneCard'
import { useAuthStore } from '../auth/store'

export function MilestonePage() {
  const { baby, upcoming, completed, setLevel, undoLevel, deleteMilestone, milestones, setLevelHistory } = useMilestoneStore()
  const { toast } = useToast()
  const canEdit = useAuthStore((s) => s.canEdit())
  const [showCreate, setShowCreate] = useState(false)
  const [now, setNow] = useState<Date>(() => new Date())
  const [editingId, setEditingId] = useState<string | null>(null)
  const upcomingList = upcoming(100)
  const completedList = completed()
  const sections = useMemo(() => {
    const buckets: Record<string, MilestoneItem[]> = {
      '0–12 months': [],
      '12–24 months': [],
      '24–36 months': [],
    }
    for (const m of upcomingList) {
      const start = m.ageStartMonths
      if (start < 12) buckets['0–12 months'].push(m)
      else if (start < 24) buckets['12–24 months'].push(m)
      else buckets['24–36 months'].push(m)
    }
    for (const key of Object.keys(buckets)) {
      buckets[key].sort((a, b) => a.ageStartMonths - b.ageStartMonths)
    }
    return buckets
  }, [upcomingList])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])


  const birthText = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      parseISO(baby.birthDateIso)
    )
  }, [baby.birthDateIso])

  const liveCounter = useMemo(() => {
    const d = intervalToDuration({ start: parseISO(baby.birthDateIso), end: now })
    const parts: string[] = []
    const add = (n: number | undefined, unit: string) => {
      if (!n || n <= 0) return
      parts.push(`${n} ${unit}${n === 1 ? '' : 's'}`)
    }
    add(d.years, 'year')
    add(d.months, 'month')
    add(d.days, 'day')
    add(d.hours, 'hour')
    add(d.minutes, 'minute')
    add(d.seconds, 'second')
    if (parts.length <= 1) return parts[0] ?? '0 seconds'
    return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1]
  }, [baby.birthDateIso, now])

  function handleAdvanceLevel(m: MilestoneItem) {
    const next: Record<MilestoneLevel, MilestoneLevel> = {
      none: 'didIt',
      didIt: 'learning',
      learning: 'mastered',
      mastered: 'mastered',
    }
    const nextLevel = next[m.level]
    if (nextLevel !== m.level) {
      setLevel(m.id, nextLevel as Exclude<MilestoneLevel, 'none'>)
      if (nextLevel === 'didIt' || nextLevel === 'mastered') {
        fireConfetti()
      }
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Everly's Milestone Tracker</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{baby.name} was born on {birthText}.</p>
            <p className="text-sm text-gray-700 dark:text-gray-200">{baby.name} has been alive for {liveCounter}.</p>
          </div>
          <button
            onClick={() => canEdit && setShowCreate(true)}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${canEdit ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:shadow-brand-600/30' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
          >
            <PlusCircle className="size-5" /> Add custom milestone
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upcoming and active</h2>
          {(['0–12 months','12–24 months','24–36 months'] as const).map((label) => {
            const list = sections[label]
            if (!list || list.length === 0) return null
            return (
              <div key={label} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((m) => (
                    <MilestoneCard
                      key={m.id}
                      item={m}
                      onAdvance={() => handleAdvanceLevel(m)}
                      onUndo={() => { undoLevel(m.id); toast('Undone!', { type: 'info' }) }}
                      onDelete={m.isCustom ? () => { deleteMilestone(m.id); toast('Custom milestone deleted', { type: 'info' }) } : undefined}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Completed</h2>
          {completedList.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No completed milestones yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedList.map((m) => (
                <MilestoneCard
                  key={m.id}
                  item={m}
                  showAdvance={false}
                  statusAside={(() => {
                    const last = m.levelHistory.filter(h => h.level === 'mastered').slice(-1)[0]
                    if (!last) return null
                    const dt = new Date(last.timestampIso)
                    const mm = dt.getMonth() + 1
                    const dd = dt.getDate()
                    const yy = String(dt.getFullYear()).slice(-2)
                    let hours = dt.getHours()
                    const minutes = String(dt.getMinutes()).padStart(2, '0')
                    const ampm = hours >= 12 ? 'PM' : 'AM'
                    hours = hours % 12
                    if (hours === 0) hours = 12
                    const dateStr = `${mm}/${dd}/${yy}, ${hours}:${minutes}${ampm}`
                    const birth = new Date(useMilestoneStore.getState().baby.birthDateIso)
                    const ageMonths = Math.max(0, Math.floor((dt.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
                    let timingClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    if (ageMonths < m.ageStartMonths) timingClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    if (ageMonths > m.ageEndMonths) timingClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    return (
                      <>
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${timingClass}`} title={`Completed at ~${ageMonths} months (window ${m.ageStartMonths}-${m.ageEndMonths} mo)`}>
                          {ageMonths} mo
                        </span>
                        <span className="text-xs italic text-gray-600 dark:text-gray-300 truncate">{dateStr}</span>
                      </>
                    )
                  })()}
                  onAdvance={() => { setLevel(m.id, 'mastered'); toast('Already mastered!', { type: 'info' }) }}
                  onUndo={() => { undoLevel(m.id); toast('Undone!', { type: 'info' }) }}
                  onEditLogs={() => setEditingId(m.id)}
                  editLogsIconOnly
                  onDelete={undefined}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      <AnimatePresence>{showCreate && <CreateMilestoneModal onClose={() => setShowCreate(false)} />}</AnimatePresence>
      {editingId && (
        <EditLogsModal
          milestoneId={editingId}
          milestones={milestones}
          onDelete={() => { const m = milestones.find(x => x.id === editingId); if (m && m.isCustom) { deleteMilestone(editingId); setEditingId(null) }}}
          onClose={() => setEditingId(null)}
          onSave={(history) => { setLevelHistory(editingId, history); setEditingId(null) }}
        />
      )}
    </div>
  )
}

// Card moved to shared component

// removed unused levelLabel

// Archive moved to its own page

function CreateMilestoneModal({ onClose }: { onClose: () => void }) {
  const { upsertMilestone } = useMilestoneStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState(9)
  const [end, setEnd] = useState(12)
  const [category, setCategory] = useState<'motor' | 'language' | 'social' | 'cognitive' | 'custom'>('custom')

  function submit() {
    if (!title.trim()) return
    upsertMilestone({ title, description, ageStartMonths: start, ageEndMonths: end, category })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="absolute inset-0 grid place-items-center p-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Add custom milestone</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">Start (mo)</span>
                <input type="number" value={start} onChange={(e) => setStart(parseInt(e.target.value || '0'))} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">End (mo)</span>
                <input type="number" value={end} onChange={(e) => setEnd(parseInt(e.target.value || '0'))} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="motor">Motor</option>
                <option value="language">Language</option>
                <option value="social">Social</option>
                <option value="cognitive">Cognitive</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded-lg bg-brand-500 text-white" onClick={submit}>Add</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditLogsModal({ milestoneId, milestones, onClose, onSave, onDelete }: { milestoneId: string; milestones: ReturnType<typeof useMilestoneStore>['milestones']; onClose: () => void; onSave: (history: { level: 'didIt'|'learning'|'mastered'; timestampIso: string }[]) => void; onDelete?: () => void }) {
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
            {onDelete && m.isCustom && (
              <div className="flex justify-end">
                <button
                  onClick={onDelete}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Delete custom milestone"
                >
                  <Trash2 className="size-4"/>
                </button>
              </div>
            )}
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

function fireConfetti() {
  const defaults = { spread: 60, ticks: 60, gravity: 0.9 }
  confetti({ ...defaults, particleCount: 60, origin: { y: 0.6 } })
  confetti({ ...defaults, particleCount: 120, origin: { y: 0.2 } })
}


