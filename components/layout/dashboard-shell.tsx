'use client'

import { CommandPalette } from '@/components/shared/command-palette'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function DashboardShell({ children }: { children: React.ReactNode }) {
    useKeyboardShortcuts()

    return (
        <>
            {children}
            <CommandPalette />
            <MobileBottomNav />
        </>
    )
}
