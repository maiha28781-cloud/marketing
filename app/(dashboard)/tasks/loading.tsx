import { Skeleton } from '@/components/ui/skeleton'

export default function TasksLoading() {
    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-5 w-32" />
                <div className="ml-auto flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            {Array.from({ length: 3 }).map((_, j) => (
                                <Skeleton key={j} className="h-28 w-full rounded-lg" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
