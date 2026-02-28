'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
    const router = useRouter()
    const pressedRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Skip if focused on an input/textarea/select
            const tag = (e.target as HTMLElement).tagName.toLowerCase()
            if (['input', 'textarea', 'select'].includes(tag)) return
            if ((e.target as HTMLElement).isContentEditable) return

            pressedRef.current.add(e.key.toLowerCase())

            // G + T → Tasks
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 't') {
                e.preventDefault()
                router.push('/tasks')
                pressedRef.current.clear()
                return
            }
            // G + K → KPIs
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                router.push('/kpis')
                pressedRef.current.clear()
                return
            }
            // G + D → Dashboard
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 'd') {
                e.preventDefault()
                router.push('/dashboard')
                pressedRef.current.clear()
                return
            }
            // G + R → Reports
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 'r') {
                e.preventDefault()
                router.push('/reports')
                pressedRef.current.clear()
                return
            }
            // G + B → Budget
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 'b') {
                e.preventDefault()
                router.push('/budget')
                pressedRef.current.clear()
                return
            }
            // G + S → Sprints
            if (pressedRef.current.has('g') && e.key.toLowerCase() === 's') {
                e.preventDefault()
                router.push('/sprints')
                pressedRef.current.clear()
                return
            }
        }

        function handleKeyUp(e: KeyboardEvent) {
            pressedRef.current.delete(e.key.toLowerCase())
            // Clear all if G released without combo
            if (e.key.toLowerCase() === 'g') {
                setTimeout(() => pressedRef.current.clear(), 500)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, [router])
}
