import { Skeleton } from '@/components/ui/skeleton'

export default function BudgetLoading() {
    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-5 w-28" />
                <div className="ml-auto">
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}
