'use client'

import {
    LayoutDashboard,
    CheckSquare,
    BarChart3,
    Calendar,
    DollarSign,
    Settings,
    LogOut,
    User,
    Target,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { ProfileDialog } from '@/components/profile/profile-dialog'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface AppSidebarProps {
    user: any
    profile: any
}

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        title: 'Tasks',
        icon: CheckSquare,
        href: '/tasks',
        badge: 'new',
    },
    {
        title: 'KPIs',
        icon: Target,
        href: '/kpis',
    },
    {
        title: 'Team',
        icon: User,
        href: '/team',
    },
    {
        title: 'Calendar',
        icon: Calendar,
        href: '/calendar',
    },
    {
        title: 'Budget',
        icon: DollarSign,
        href: '/budget',
    },
    {
        title: 'Reports',
        icon: BarChart3,
        href: '/reports',
    },
]

export function AppSidebar({ user, profile }: AppSidebarProps) {
    const pathname = usePathname()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <>
            <Sidebar>
                <SidebarHeader className="border-b px-4 py-3">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <span className="text-sm font-bold">MO</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">Marketing OS</h2>
                                <p className="text-xs text-muted-foreground">Team Management</p>
                            </div>
                        </div>
                        <NotificationBell />
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                                {item.badge && (
                                                    <Badge variant="secondary" className="ml-auto">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton className="h-auto py-3">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={profile?.avatar_url} className="object-cover" />
                                            <AvatarFallback className="rounded-lg text-xs">
                                                {getInitials(profile?.full_name || 'User')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold truncate">{profile?.full_name}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {profile?.email}
                                            </span>
                                        </div>
                                        <div className="ml-auto flex items-center shrink-0 group-data-[collapsible=icon]:hidden">
                                            <Badge
                                                variant={profile?.role === 'admin' ? 'default' : 'secondary'}
                                                className="whitespace-nowrap px-2 py-0.5 text-[10px] font-medium capitalize"
                                                title={profile?.position || 'Member'}
                                            >
                                                {profile?.role === 'admin'
                                                    ? 'Admin'
                                                    : (profile?.position || 'Member')}
                                            </Badge>
                                        </div>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" className="w-56">
                                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={async () => {
                                            await logout()
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar >

            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} profile={profile} />
        </>
    )
}
