'use client'

import { useState } from 'react'
import { verifyExecutivePassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

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
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">Executive Access</h2>
                    <p className="text-sm text-gray-500">
                        Nhập mật khẩu bảo mật để truy cập bảng điều khiển
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Nhập mật khẩu..."
                                required
                                disabled={loading}
                                className="w-full"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Đang kiểm tra...' : 'Truy cập'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
