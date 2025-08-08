import { useMemo, useState, useEffect } from 'react'
import { intervalToDuration, parseISO } from 'date-fns'
import { useMilestoneStore } from '../milestones/store'
import { useChoresStore } from '../chores/store'
import { NavLink, useNavigate } from 'react-router-dom'

export function HomePage() {
  const { baby, upcoming, completed } = useMilestoneStore()
  const navigate = useNavigate()
  const [now, setNow] = useState<Date>(() => new Date())
  const upcomingList = upcoming(4)
  const completedList = completed().slice(0, 4)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

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

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              <img src={baby.photoUrl || 'https://placehold.co/600x600/FFE4E6/8B5CF6?text=Everly'} alt={baby.name} className="w-full h-full object-cover"/>
            </div>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Welcome to everApp</h1>
            <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">Hi, I'm {baby.name}.</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoPill label="Birth date" value={new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parseISO(baby.birthDateIso))} />
              <InfoPill label="Alive for" value={liveCounter} />
              {typeof baby.weightLbs === 'number' && <InfoPill label="Weight" value={`${baby.weightLbs.toFixed(1)} lbs`} />}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Milestones at a glance</h2>
            <NavLink to="/milestones" className={({isActive}) => `inline-flex items-center rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-brand-600 text-white' : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>View more</NavLink>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingList.map((m) => (
              <div key={m.id} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{m.title}</h3>
                    {m.description && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{m.description}</p>}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{m.ageStartMonths}-{m.ageEndMonths} mo</span>
                </div>
              </div>
            ))}
          </div>
          {completedList.length > 0 && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Recently completed: {completedList.map((m) => m.title).join(', ')}</p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Today's chores</h2>
            <button onClick={() => navigate('/chores')} className="inline-flex items-center rounded-full px-3 py-1.5 text-sm bg-brand-600 text-white hover:bg-brand-700">Open chores</button>
          </div>
          <ChoresCompactWidget />
        </section>
      </main>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  )
}

function ChoresCompactWidget() {
  const { choresToday } = useChoresStore()
  const items = choresToday()
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((c) => (
        <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 flex items-center justify-between">
          <div className="text-sm text-gray-800 dark:text-gray-100">{c.title}</div>
          <span className={`text-xs rounded-full px-2 py-0.5 ${c.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{c.done ? 'Done' : 'Pending'}</span>
        </div>
      ))}
    </div>
  )
}


