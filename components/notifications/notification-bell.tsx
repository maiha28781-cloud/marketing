'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Notification as INotification } from '@/lib/modules/notifications/types'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/modules/notifications/actions'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { NotificationItem } from './notification-item'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<INotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    const fetchNotifications = async () => {
        const [notifsRes, countRes] = await Promise.all([
            getNotifications(),
            getUnreadCount()
        ])
        setNotifications(notifsRes.data as INotification[])
        setUnreadCount(countRes.count)
    }

    useEffect(() => {
        setIsMounted(true)
        fetchNotifications()

        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }

        let channel: any = null

        const setupRealtime = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            channel = supabase
                .channel(`notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        // Immediately refresh notifications list
                        fetchNotifications()

                        // Play sound
                        try {
                            const audio = new Audio('/notification.mp3')
                            audio.play().catch(e => {
                                console.error('Audio play failed:', e)
                                // Optional: Show toast debug only if needed
                                // toast({ title: "Lỗi phát âm thanh", description: e.message, variant: "destructive" })
                            })
                        } catch (err) {
                            console.error('Error playing sound:', err)
                        }

                        // Show toast
                        const newNotification = payload.new as INotification
                        toast({
                            title: newNotification.title,
                            description: newNotification.message,
                            duration: 5000,
                        })

                        // Show Browser Notification (Web Push)
                        if (Notification.permission === 'granted') {
                            new Notification(newNotification.title, {
                                body: newNotification.message,
                                icon: '/favicon.ico'
                            })
                        }
                    }
                )
                .subscribe()
        }

        setupRealtime()

        return () => {
            if (channel) {
                const supabase = createClient()
                supabase.removeChannel(channel)
            }
        }
    }, [])

    if (!isMounted) return null

    const handleRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        // Find notification to navigate if link exists
        const notif = notifications.find(n => n.id === id)
        if (notif?.link) {
            router.push(notif.link)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto text-xs text-blue-500 p-0 hover:bg-transparent"
                            onClick={handleMarkAllRead}
                        >
                            Đánh dấu đã đọc
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có thông báo mới
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={handleRead}
                            />
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer justify-center text-center">
                    <Link href="/notifications" className="text-xs text-muted-foreground">
                        Xem tất cả
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
