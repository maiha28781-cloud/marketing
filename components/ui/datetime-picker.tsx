"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date)

    // Update internal state when prop changes
    React.useEffect(() => {
        setSelectedDateTime(date)
    }, [date])

    const handleSelect = (day: Date | undefined) => {
        if (!day) {
            setSelectedDateTime(undefined)
            setDate(undefined)
            return
        }
        const newDate = new Date(day)
        if (selectedDateTime) {
            newDate.setHours(selectedDateTime.getHours())
            newDate.setMinutes(selectedDateTime.getMinutes())
        }
        setSelectedDateTime(newDate)
        setDate(newDate)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value
        if (!selectedDateTime) return

        const [hours, minutes] = time.split(':').map(Number)
        const newDate = new Date(selectedDateTime)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        setSelectedDateTime(newDate)
        setDate(newDate)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy HH:mm") : <span>dd/MM/yyyy --:--</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDateTime}
                    onSelect={handleSelect}
                    initialFocus
                />
                <div className="p-3 border-t border-border">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="time"
                            value={selectedDateTime ? format(selectedDateTime, "HH:mm") : ""}
                            onChange={handleTimeChange}
                            className="w-full"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
