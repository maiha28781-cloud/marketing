import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    icon?: LucideIcon
    title: string
    description?: string
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({ icon: Icon, title, description, actions, className }: PageHeaderProps) {
    return (
        <header className={cn('sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6', className)}>
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    {Icon && <Icon className="h-5 w-5 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold leading-none">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground truncate">{description}</p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-2 shrink-0 ml-4">{actions}</div>
                )}
            </div>
        </header>
    )
}
