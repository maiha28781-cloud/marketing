'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteSavedView } from '@/lib/modules/saved-views/actions'
import { useToast } from '@/hooks/use-toast'

interface TaskTabsProps {
    savedViews: any[]
}

export function TaskTabs({ savedViews }: TaskTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // Determine active tab based on params
    // If no specific filters (except view=kanban/list), it's "all-tasks"
    // If filters match a saved view, technically it could be that view, but usually we track "activeViewId" in params
    // For simplicity: We add `activeView` param.
    const activeView = searchParams.get('activeView') || 'all-tasks'

    const handleTabChange = (value: string) => {
        if (value === 'all-tasks') {
            router.push('/tasks') // Clear filters
        } else {
            const view = savedViews.find(v => v.id === value)
            if (view) {
                const params = new URLSearchParams()
                const filters = view.filters as any
                if (filters.assignee) params.set('assignee', filters.assignee)
                if (filters.status) params.set('status', filters.status)
                if (filters.priority) params.set('priority', filters.priority)
                params.set('activeView', value)

                // Keep the current view mode (kanban/list) if exists
                const currentMode = searchParams.get('view')
                if (currentMode) params.set('view', currentMode)

                router.push(`/tasks?${params.toString()}`)
            }
        }
    }

    const handleDeleteView = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm('Bạn có chắc muốn xóa View này?')) {
            await deleteSavedView(id)
            if (activeView === id) {
                router.push('/tasks')
            }
            toast({ title: 'Đã xóa View' })
        }
    }

    return (
        <Tabs value={activeView} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all-tasks">Tất cả Tasks</TabsTrigger>
                {savedViews.map((view) => (
                    <TabsTrigger key={view.id} value={view.id} className="group flex items-center gap-2">
                        {view.name}
                        <Trash2
                            className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                            onClick={(e) => handleDeleteView(e, view.id)}
                        />
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
