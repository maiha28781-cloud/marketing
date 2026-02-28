'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    LayoutDashboard,
    CheckSquare,
    Target,
    Calendar,
    Share2,
    DollarSign,
    BarChart3,
    BadgeDollarSign,
    Zap,
    User,
} from 'lucide-react'

const routes = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, keywords: ['home', 'trang chủ'] },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare, keywords: ['task', 'công việc', 'kanban'] },
    { label: 'Sprints', href: '/sprints', icon: Zap, keywords: ['sprint', 'planning'] },
    { label: 'KPIs', href: '/kpis', icon: Target, keywords: ['kpi', 'mục tiêu'] },
    { label: 'Calendar', href: '/calendar', icon: Calendar, keywords: ['lịch', 'content'] },
    { label: 'Social', href: '/social', icon: Share2, keywords: ['social', 'mạng xã hội'] },
    { label: 'Budget', href: '/budget', icon: DollarSign, keywords: ['ngân sách', 'chi phí', 'campaign'] },
    { label: 'Reports', href: '/reports', icon: BarChart3, keywords: ['báo cáo', 'report', 'analytics'] },
    { label: 'Payroll', href: '/payroll', icon: BadgeDollarSign, keywords: ['lương', 'payroll'] },
    { label: 'Team', href: '/team', icon: User, keywords: ['team', 'nhân viên'] },
]

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filtered = query
        ? routes.filter(r =>
            r.label.toLowerCase().includes(query.toLowerCase()) ||
            r.keywords.some(k => k.includes(query.toLowerCase()))
        )
        : routes

    function handleSelect(href: string) {
        setOpen(false)
        setQuery('')
        router.push(href)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery('') }}>
            <DialogContent className="max-w-md p-0 gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Command Palette</DialogTitle>
                </DialogHeader>
                <div className="border-b px-4 py-3">
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm trang... (Ctrl+K)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm"
                    />
                </div>
                <div className="py-2 max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">Không tìm thấy kết quả.</p>
                    ) : (
                        filtered.map((route) => (
                            <button
                                key={route.href}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                                onClick={() => handleSelect(route.href)}
                            >
                                <route.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{route.label}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="border-t px-4 py-2 text-xs text-muted-foreground flex gap-3">
                    <span><kbd className="font-mono bg-muted px-1 rounded">↵</kbd> chọn</span>
                    <span><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> đóng</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
