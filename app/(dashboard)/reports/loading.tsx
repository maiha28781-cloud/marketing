import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsLoading() {
    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-5 w-28" />
                <div className="ml-auto">
                    <Skeleton className="h-9 w-36" />
                </div>
            </div>
            <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
    )
}
