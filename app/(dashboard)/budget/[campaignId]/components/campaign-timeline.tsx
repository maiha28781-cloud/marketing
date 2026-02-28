import { ContentItem } from '@/lib/modules/calendar/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, differenceInDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CampaignTimelineProps {
    items: ContentItem[]
    startDate: string
    endDate: string
}

const PLATFORM_COLORS: Record<string, string> = {
    facebook: 'bg-blue-500',
    tiktok: 'bg-gray-900',
    youtube: 'bg-red-500',
    instagram: 'bg-pink-500',
    website: 'bg-emerald-500',
    email: 'bg-amber-500',
    linkedin: 'bg-sky-700',
    other: 'bg-gray-400',
}

const STATUS_OPACITY: Record<string, string> = {
    published: 'opacity-100',
    scheduled: 'opacity-70',
    draft: 'opacity-40',
    idea: 'opacity-30',
}

export function CampaignTimeline({ items, startDate, endDate }: CampaignTimelineProps) {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const totalDays = differenceInDays(end, start) + 1

    const scheduled = items.filter(i => i.scheduled_date)

    if (!scheduled.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có content item nào có ngày đăng.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                <div className="flex gap-1 text-xs text-muted-foreground">
                    <span>{format(start, 'dd/MM/yyyy', { locale: vi })}</span>
                    <span>→</span>
                    <span>{format(end, 'dd/MM/yyyy', { locale: vi })}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div style={{ minWidth: Math.max(totalDays * 12, 400) }} className="relative">
                        {/* Week markers */}
                        <div className="flex border-b mb-2 text-xs text-muted-foreground">
                            {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, w) => (
                                <div key={w} style={{ width: `${7 / totalDays * 100}%` }} className="border-r px-1 py-0.5 truncate">
                                    W{w + 1}
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        {scheduled.map((item) => {
                            const itemDate = parseISO(item.scheduled_date!)
                            const offsetDays = differenceInDays(itemDate, start)
                            const leftPercent = Math.max(0, Math.min((offsetDays / totalDays) * 100, 98))
                            const colorClass = PLATFORM_COLORS[item.platform] ?? 'bg-gray-400'
                            const opacityClass = STATUS_OPACITY[item.status] ?? 'opacity-60'

                            return (
                                <div
                                    key={item.id}
                                    className="relative mb-2 h-7 flex items-center"
                                    title={`${item.title} — ${item.platform} — ${item.status}`}
                                >
                                    <div
                                        className={`absolute flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-medium ${colorClass} ${opacityClass} max-w-xs truncate`}
                                        style={{ left: `${leftPercent}%` }}
                                    >
                                        <span className="truncate max-w-[120px]">{item.title}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
