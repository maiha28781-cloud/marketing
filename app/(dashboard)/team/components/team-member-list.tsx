'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { EditMemberDialog } from './edit-member-dialog'

interface TeamMemberListProps {
    teamMembers: any[]
    currentUserId: string
}

const positionLabels: Record<string, string> = {
    manager: 'Manager',
    content: 'Content Creator',
    social_media: 'Social Media',
    performance: 'Performance Marketing',
    designer: 'Designer',
    editor: 'Video Editor',
    member: 'Member',
}

export function TeamMemberList({ teamMembers, currentUserId }: TeamMemberListProps) {
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    if (teamMembers.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">Chưa có thành viên nào</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thành viên</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thành viên</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Vị trí</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Ngày tham gia</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(member.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{member.full_name}</span>
                                                {member.id === currentUserId && (
                                                    <span className="text-xs text-muted-foreground">(Bạn)</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">{member.email}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {positionLabels[member.position] || member.position}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                            {member.role === 'admin' ? 'Admin' : 'Member'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(member.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedMember(member)
                                                    setIsEditing(true)
                                                }}>
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {selectedMember && (
                <EditMemberDialog
                    member={selectedMember}
                    open={isEditing}
                    onOpenChange={setIsEditing}
                />
            )}
        </>
    )
}
