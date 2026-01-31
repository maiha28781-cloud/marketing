'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Bell, CheckCircle, Info, DollarSign, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Notification } from '@/lib/modules/notifications/types'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'task_assigned':
            case 'task_completed':
                return <CheckCircle className="h-4 w-4 text-blue-500" />
            case 'budget_alert':
                return <DollarSign className="h-4 w-4 text-red-500" />
            case 'kpi_update':
                return <Target className="h-4 w-4 text-green-500" />
            default:
                return <Info className="h-4 w-4 text-gray-500" />
        }
    }

    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id)
        }
    }

    return (
        <DropdownMenuItem
            className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                !notification.is_read && "bg-muted/50"
            )}
            onClick={handleClick}
        >
            <div className="mt-1">{getIcon()}</div>
            <div className="flex-1 space-y-1">
                <p className={cn("text-sm font-medium leading-none", !notification.is_read && "font-bold")}>
                    {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground pt-1" suppressHydrationWarning>
                    {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
            </div>
            {!notification.is_read && (
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
            )}
        </DropdownMenuItem>
    )
}
