'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeListener() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        console.log('🔌 Realtime Listener Connected')

        const channel = supabase.channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'content_items'
                },
                () => {
                    console.log('🔄 Content changed -> Refreshing...')
                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                },
                () => {
                    console.log('🔄 Tasks changed -> Refreshing...')
                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'kpis'
                },
                () => {
                    console.log('🔄 KPIs changed -> Refreshing...')
                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles' // Listen for salary/rate changes
                },
                () => {
                    console.log('🔄 Profiles changed -> Refreshing...')
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, supabase])

    return null // Invisible component
}
