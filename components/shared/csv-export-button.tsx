'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'

interface CSVExportButtonProps {
    data: Record<string, unknown>[]
    filename: string
    label?: string
}

export function CSVExportButton({ data, filename, label = 'Export CSV' }: CSVExportButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(data, filename)}
            disabled={!data.length}
        >
            <Download className="h-4 w-4 mr-2" />
            {label}
        </Button>
    )
}
