'use client'

import { useState } from 'react'
import { verifyExecutivePassword } from '../actions'

export default function ExecutiveLoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await verifyExecutivePassword(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            // Navigate client-side after cookie is set
            window.location.href = '/executive-view'
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 space-y-1 text-center border-b border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-50 rounded-full">
                            {/* Simple Lock Icon using SVG */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ color: '#2563eb' }}
                            >
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Executive Access</h2>
                    <p className="text-sm text-gray-500">
                        Nhập mật khẩu bảo mật để truy cập bảng điều khiển
                    </p>
                </div>
                <div className="p-6">
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <input
                                name="password"
                                type="password"
                                placeholder="Nhập mật khẩu..."
                                required
                                disabled={loading}
                                className="w-full h-10 px-3 py-2 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                style={{ fontSize: '16px' }} // Prevent iOS zoom on focus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full h-10 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Đang kiểm tra...' : 'Truy cập'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
