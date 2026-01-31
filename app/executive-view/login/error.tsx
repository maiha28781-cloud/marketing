'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra lỗi!</h2>
            <p className="text-sm text-gray-600 mb-4">{error.message || 'Lỗi không xác định'}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Thử lại
            </button>
        </div>
    )
}
