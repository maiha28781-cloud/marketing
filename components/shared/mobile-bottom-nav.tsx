'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CheckSquare,
    Target,
    BarChart3,
    DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { href: '/kpis', icon: Target, label: 'KPIs' },
    { href: '/budget', icon: DollarSign, label: 'Budget' },
    { href: '/reports', icon: BarChart3, label: 'Reports' },
]

export function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t bg-background md:hidden">
            {mobileNavItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center gap-0.5 h-full text-xs',
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
