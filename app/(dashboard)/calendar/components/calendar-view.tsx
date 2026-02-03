'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ContentItem } from '@/lib/modules/calendar/types'
import { ContentDialog } from './content-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css' // Custom styles

const locales = {
    'vi': vi,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface CalendarViewProps {
    items: ContentItem[]
    campaigns: { id: string; name: string }[]
    members: { id: string; full_name: string }[]
    userRole?: string
    showTabs?: boolean
    initialDate?: Date
}

const STATUS_COLORS: Record<string, string> = {
    idea: '#94a3b8',      // Slate 400
    draft: '#64748b',     // Slate 500
    in_review: '#f59e0b', // Amber 500
    scheduled: '#3b82f6', // Blue 500
    published: '#22c55e', // Green 500
    cancelled: '#ef4444', // Red 500
}

const TYPE_LABELS: Record<string, string> = {
    social_post: 'Social',
    blog_post: 'Blog',
    video: 'Video',
    ad_creative: 'Ads',
    email: 'Email',
    other: 'Other'
}

import Link from 'next/link'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { updateContentItem } from '@/lib/modules/calendar/actions'
import { useToast } from '@/hooks/use-toast'

const DnDCalendar = withDragAndDrop(Calendar)

export function CalendarView({ items, campaigns, members, userRole, showTabs = true, initialDate }: CalendarViewProps) {
    const { toast } = useToast()
    const [view, setView] = useState<View>(Views.MONTH)
    const [date, setDate] = useState(initialDate || new Date())
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedItem, setSelectedItem] = useState<ContentItem | undefined>(undefined)
    const [localItems, setLocalItems] = useState<ContentItem[]>(items)
    const supabase = createClient()
    const searchParams = useSearchParams()
    const router = useRouter()

    // ... (keep existing effects)

    // Handle Deep Linking (Open dialog from URL contentId)
    useEffect(() => {
        const contentId = searchParams.get('contentId')
        if (contentId && localItems.length > 0) {
            const item = localItems.find(i => i.id === contentId)
            if (item) {
                setSelectedItem(item)
                setDialogOpen(true)
            }
        }
    }, [searchParams, localItems])

    // Sync local items with initial props
    useEffect(() => {
        setLocalItems(items)
    }, [items])

    // Sync date with initialDate prop
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate)
        }
    }, [initialDate])

    // Subscribe to realtime changes
    useEffect(() => {
        const channel = supabase
            .channel('calendar-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'content_items' },
                (payload) => {
                    console.log('Realtime change:', payload)
                    if (payload.eventType === 'INSERT') {
                        setLocalItems((prev) => [...prev, payload.new as ContentItem])
                    } else if (payload.eventType === 'UPDATE') {
                        setLocalItems((prev) => prev.map((item) => (item.id === payload.new.id ? (payload.new as ContentItem) : item)))
                    } else if (payload.eventType === 'DELETE') {
                        setLocalItems((prev) => prev.filter((item) => item.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    // Map content items to calendar events
    const events = localItems.map(item => ({
        id: item.id,
        title: item.title,
        start: item.scheduled_date ? new Date(item.scheduled_date) : new Date(),
        end: item.scheduled_date ? addHours(new Date(item.scheduled_date), 1) : addHours(new Date(), 1),
        resource: item,
    }))

    const handleSelectSlot = ({ start }: { start: Date }) => {
        setSelectedDate(start)
        setSelectedItem(undefined)
        setDialogOpen(true)
    }

    const handleSelectEvent = (event: any) => {
        setSelectedItem(event.resource)
        setDialogOpen(true)
    }

    const handleEventDrop = async ({ event, start, end }: any) => {
        try {
            const res = await updateContentItem({
                id: event.id,
                scheduled_date: start,
            })
            if (res.error) throw new Error(res.error)
            toast({ title: 'Event rescheduled', description: `${event.title} moved to ${format(start, 'dd/MM/yyyy HH:mm')}` })
        } catch (error: any) {
            toast({ title: 'Error moving event', description: error.message, variant: 'destructive' })
        }
    }

    const eventStyleGetter = (event: any) => {
        const status = event.resource.status || 'idea'
        const color = STATUS_COLORS[status] || '#94a3b8'

        return {
            style: {
                backgroundColor: color,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                padding: '2px 4px'
            }
        }
    }

    const CustomEvent = ({ event }: any) => (
        <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                {TYPE_LABELS[event.resource.type] || event.resource.type}
            </span>
            <span className="text-xs font-medium truncate">
                {event.title}
            </span>
        </div>
    )

    // Filter items based on active tab logic
    const editorialItems = events.filter(e => e.resource.type !== 'ad_creative')
    const mediaItems = events.filter(e => e.resource.type === 'ad_creative')

    const CalendarComponent = ({ eventsList }: { eventsList: any[] }) => (
        <div className="bg-card rounded-md border p-4 shadow-sm h-[600px]">
            <DnDCalendar
                localizer={localizer}
                events={eventsList}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                selectable
                resizable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: CustomEvent
                }}
                culture="vi"
                messages={{
                    next: "Sau",
                    previous: "Trước",
                    today: "Hôm nay",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày"
                }}
            />
        </div>
    )

    if (!showTabs) {
        return (
            <div className="h-full flex flex-col space-y-4">
                <div className="flex justify-end items-center">
                    <Button onClick={() => { setSelectedDate(new Date()); setSelectedItem(undefined); setDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Content
                    </Button>
                </div>
                <CalendarComponent eventsList={events} />
                <ContentDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    initialDate={selectedDate}
                    existingItem={selectedItem}
                    campaigns={campaigns}
                    members={members}
                    userRole={userRole}
                    onDeleteSuccess={(id) => {
                        setLocalItems(prev => prev.filter(i => i.id !== id))
                        setDialogOpen(false)
                    }}
                />
            </div>
        )
    }

    return (
        <Tabs defaultValue="all" className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="all">All Content</TabsTrigger>
                    <TabsTrigger value="editorial">Editorial (Social/Blog)</TabsTrigger>
                    <TabsTrigger value="media">Media Plan (Ads)</TabsTrigger>
                </TabsList>

                <Button onClick={() => { setSelectedDate(new Date()); setSelectedItem(undefined); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                </Button>
            </div>

            <TabsContent value="all" className="flex-1 h-full mt-0">
                <CalendarComponent eventsList={events} />
            </TabsContent>

            <TabsContent value="editorial" className="flex-1 h-full mt-0">
                <CalendarComponent eventsList={editorialItems} />
            </TabsContent>

            <TabsContent value="media" className="flex-1 h-full mt-0">
                <CalendarComponent eventsList={mediaItems} />
            </TabsContent>

            <ContentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialDate={selectedDate}
                existingItem={selectedItem}
                campaigns={campaigns}
                members={members}
                userRole={userRole}
                onDeleteSuccess={(id) => {
                    setLocalItems(prev => prev.filter(i => i.id !== id))
                    setDialogOpen(false)
                }}
            />
        </Tabs>
    )
}
