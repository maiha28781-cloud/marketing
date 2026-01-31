'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, changePassword } from '@/lib/modules/profile/actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: any
}

export function ProfileDialog({ open, onOpenChange, profile }: ProfileDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setIsUploading(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            setAvatarUrl(data.publicUrl)

            // Auto save avatar url
            await updateProfile({ avatar_url: data.publicUrl })
            router.refresh()
            toast({ title: "Ảnh đại diện đã được cập nhật" })

        } catch (error: any) {
            toast({
                title: "Lỗi upload ảnh",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await updateProfile({ full_name: fullName })

        if (result.error) {
            toast({
                title: "Lỗi cập nhật",
                description: result.error,
                variant: 'destructive'
            })
        } else {
            toast({ title: "Đã cập nhật thông tin" })
            router.refresh()
        }
        setIsLoading(false)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast({
                title: "Mật khẩu không khớp",
                variant: 'destructive'
            })
            return
        }
        if (password.length < 6) {
            toast({
                title: "Mật khẩu quá ngắn",
                description: "Mật khẩu phải từ 6 ký tự trở lên",
                variant: 'destructive'
            })
            return
        }

        setIsLoading(true)
        const result = await changePassword(password)

        if (result.error) {
            toast({
                title: "Lỗi đổi mật khẩu",
                description: result.error,
                variant: 'destructive'
            })
        } else {
            toast({ title: "Đã đổi mật khẩu thành công" })
            setPassword('')
            setConfirmPassword('')
        }
        setIsLoading(false)
    }

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'MO'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Tài khoản của tôi</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                        <TabsTrigger value="security">Bảo mật</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-muted ring-offset-2">
                                    <AvatarImage src={avatarUrl} className="object-cover" />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-col gap-1"
                                >
                                    <Camera className="h-6 w-6" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Đổi ảnh</span>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading}
                                />
                            </div>
                            {isUploading && <span className="text-xs text-muted-foreground animate-pulse">Đang tải ảnh lên...</span>}
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Tên hiển thị</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={profile?.email} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Vai trò</Label>
                                <Input id="role" value={profile?.role} disabled className="bg-muted capitalize" />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Lưu thay đổi
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4 py-4">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Mật khẩu mới</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ít nhất 6 ký tự"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={isLoading || !password} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Đổi mật khẩu
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
