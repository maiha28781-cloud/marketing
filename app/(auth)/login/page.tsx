'use client'

import { useState } from 'react'
import { login, loginWithGoogle } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
                <CardDescription>
                    Nhập email và mật khẩu để truy cập Marketing OS
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid gap-2">
                    <form action={async () => {
                        setLoading(true)
                        await loginWithGoogle()
                    }}>
                        <Button variant="outline" className="w-full" type="submit" disabled={loading}>
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Đăng nhập bằng Google
                        </Button>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Hoặc
                            </span>
                        </div>
                    </div>
                </div>

                <form action={handleSubmit} className="space-y-4">
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
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
