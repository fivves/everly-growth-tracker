import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

type ToastType = 'success' | 'info' | 'error'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, options?: { type?: ToastType; durationMs?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, options?: { type?: ToastType; durationMs?: number }) => {
      const id = crypto.randomUUID()
      const type = options?.type ?? 'success'
      const durationMs = options?.durationMs ?? 2000
      setToasts((t) => [...t, { id, message, type }])
      window.setTimeout(() => remove(id), durationMs)
    },
    [remove]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center">
        <div className="flex max-w-xl flex-col gap-2 px-3">
          <AnimatePresence>
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />)
            )}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const palette: Record<ToastType, string> = {
    success: 'bg-emerald-600 ring-emerald-700',
    info: 'bg-blue-600 ring-blue-700',
    error: 'bg-rose-600 ring-rose-700',
  }
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'info' ? Info : XCircle
  return (
    <motion.div
      initial={{ y: -10, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -10, opacity: 0, scale: 0.98 }}
      className={`pointer-events-auto rounded-full px-4 py-2 text-sm text-white shadow-lg ring-1 ${palette[toast.type]}`}
      role="status"
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4" />
        <span>{toast.message}</span>
        <button onClick={onClose} className="ml-2 rounded-full/2 bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30">
          Close
        </button>
      </div>
    </motion.div>
  )
}


