'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, subMonths, addMonths } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function MonthPicker() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current value from URL or default to current month
    const currentDateParam = searchParams.get('month')
    const date = currentDateParam ? new Date(currentDateParam + '-01') : new Date()

    const [open, setOpen] = React.useState(false)
    const [year, setYear] = React.useState(date.getFullYear())
    const [month, setMonth] = React.useState(date.getMonth())

    // Update URL when selection changes
    const applyFilter = (newMonth: number, newYear: number) => {
        const newDate = new Date(newYear, newMonth, 1)
        const dateString = format(newDate, 'yyyy-MM')

        // Create new URLSearchParams
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', dateString)

        router.push(`?${params.toString()}`, { scroll: false })
        setOpen(false)
    }

    const nextMonth = () => {
        const next = addMonths(date, 1)
        applyFilter(next.getMonth(), next.getFullYear())
    }

    const prevMonth = () => {
        const prev = subMonths(date, 1)
        applyFilter(prev.getMonth(), prev.getFullYear())
    }

    // Generate years (last 5 years + next 1 year)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i)

    const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[180px] justify-start text-left font-normal h-8",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'MMMM yyyy', { locale: vi })}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Chọn tháng</h4>
                            <p className="text-sm text-muted-foreground">
                                Xem dữ liệu lịch sử theo tháng
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={month.toString()}
                                onValueChange={(v) => setMonth(parseInt(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tháng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={year.toString()}
                                onValueChange={(v) => setYear(parseInt(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Năm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => applyFilter(month, year)}
                        >
                            Xem báo cáo
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
