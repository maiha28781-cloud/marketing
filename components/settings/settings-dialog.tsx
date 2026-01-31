'use client'

import { useTheme } from "next-themes"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Moon, Sun, Laptop } from "lucide-react"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cài đặt</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Giao diện</h4>
                        <RadioGroup
                            defaultValue={theme}
                            onValueChange={setTheme}
                            className="grid grid-cols-3 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                <Label
                                    htmlFor="light"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Sun className="mb-3 h-6 w-6" />
                                    <span>Sáng</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                <Label
                                    htmlFor="dark"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Moon className="mb-3 h-6 w-6" />
                                    <span>Tối</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                <Label
                                    htmlFor="system"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Laptop className="mb-3 h-6 w-6" />
                                    <span>Hệ thống</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
