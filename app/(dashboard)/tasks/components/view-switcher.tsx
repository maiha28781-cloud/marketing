'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewSwitcherProps {
    currentView: string
}

export function ViewSwitcher({ currentView }: ViewSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()

    const setView = (view: string) => {
        router.push(`${pathname}?view=${view}`)
    }

    return (
        <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
                variant={currentView === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('kanban')}
                className="gap-2"
            >
                <LayoutGrid className="h-4 w-4" />
                Kanban
            </Button>
            <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="gap-2"
            >
                <List className="h-4 w-4" />
                List
            </Button>
        </div>
    )
}
