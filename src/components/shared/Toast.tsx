import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { nanoid } from 'nanoid'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let addToastFn: ((t: Omit<ToastItem, 'id'>) => void) | null = null

export function toast(type: ToastItem['type'], message: string) {
  addToastFn?.({ type, message })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = nanoid(6)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id))
    }, 2500)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  const remove = (id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id))
  }

  const colors: Record<string, { bg: string; icon: string; border: string }> = {
    success: { bg: 'bg-emerald-50', icon: '✅', border: 'border-emerald-300' },
    error: { bg: 'bg-red-50', icon: '❌', border: 'border-red-300' },
    info: { bg: 'bg-blue-50', icon: 'ℹ️', border: 'border-blue-300' },
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div
            key={t.id}
            className={`${c.bg} border ${c.border} text-[var(--editor-text)] px-4 py-2.5 rounded-lg shadow-md text-sm flex items-center gap-2 animate-slide-in min-w-[260px]`}
          >
            <span>{c.icon}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-neutral-400 hover:text-neutral-600 ml-2">✕</button>
          </div>
        )
      })}
    </div>
  )
}
