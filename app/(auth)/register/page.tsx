'use client'

import { useState } from 'react'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Đăng ký</CardTitle>
                <CardDescription>
                    Tạo tài khoản mới để sử dụng Marketing OS
                </CardDescription>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="full_name">Họ và tên</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your-email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
