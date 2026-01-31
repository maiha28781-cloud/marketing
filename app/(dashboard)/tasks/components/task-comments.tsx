'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/lib/modules/tasks/types'
import { createComment, getComments, toggleFollowTask, addFollower, getFollowers } from '@/lib/modules/tasks/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Send, Loader2, Bell, BellOff, AtSign } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface TaskCommentsProps {
    taskId: string
    currentUserId: string
    teamMembers: any[]
}

export function TaskComments({ taskId, currentUserId, teamMembers }: TaskCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [amIFollowing, setAmIFollowing] = useState(false)
    const [mentionedUserIds, setMentionedUserIds] = useState<Set<string>>(new Set())

    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const supabase = createClient()

    useEffect(() => {
        loadComments()
        checkFollowStatus()

        // Subscribe to NEW comments
        const commentChannel = supabase
            .channel(`comments-${taskId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'task_comments',
                    filter: `task_id=eq.${taskId}`
                },
                async () => {
                    await loadComments()
                }
            )
            .subscribe()

        // Subscribe to PROFILE updates (to refresh avatars in realtime)
        const profileChannel = supabase
            .channel(`profiles-changes-${taskId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                },
                async () => {
                    // When any profile updates, reload comments to get new avatar URLs
                    // This is simple but effective for small teams.
                    await loadComments()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(commentChannel)
            supabase.removeChannel(profileChannel)
        }
    }, [taskId, supabase])

    useEffect(() => {
        scrollToBottom()
    }, [comments])

    const loadComments = async () => {
        const { data, error } = await getComments(taskId)
        if (error) {
            console.error('Failed to load comments:', error)
            return
        }
        if (data) {
            setComments(data as Comment[])
        }
        setIsLoading(false)
    }

    const checkFollowStatus = async () => {
        const followers = await getFollowers(taskId)
        const leads = followers.some((f: any) => f.id === currentUserId)
        setAmIFollowing(leads)
    }

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleFollowToggle = async () => {
        // Optimistic update
        const newState = !amIFollowing
        setAmIFollowing(newState)

        const result = await toggleFollowTask(taskId, newState)
        if (result.error) {
            setAmIFollowing(!newState) // Revert
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật trạng thái theo dõi',
                variant: 'destructive',
            })
        } else {
            toast({
                title: newState ? 'Đã theo dõi' : 'Đã bỏ theo dõi',
                description: newState ? 'Bạn sẽ nhận được thông báo về task này.' : 'Bạn sẽ không nhận được thông báo nữa.',
            })
        }
    }

    const handleMentionSelect = (userId: string, userName: string) => {
        const mentionText = `@${userName} `

        if (textareaRef.current) {
            // Replace the last word starting with @
            const text = newComment
            const lastAtIndex = text.lastIndexOf('@')

            if (lastAtIndex >= 0) {
                const newText = text.substring(0, lastAtIndex) + mentionText
                setNewComment(newText)
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus()
                    }
                }, 0)
            } else {
                setNewComment(prev => prev + mentionText)
            }
        } else {
            setNewComment(prev => prev + mentionText)
        }

        setShowMentionList(false)
        setMentionedUserIds(prev => new Set(prev).add(userId))
    }

    const handleSend = async () => {
        if (!newComment.trim()) return

        setIsSending(true)
        const content = newComment

        // 1. First, ensure all mentioned users are following
        if (mentionedUserIds.size > 0) {
            // We do this silently in parallel
            Promise.all(Array.from(mentionedUserIds).map(uid => addFollower(taskId, uid)))
                .catch(err => console.error('Failed to auto-follow mentioned users', err))
        }

        setNewComment('')
        setMentionedUserIds(new Set()) // Clear mentions

        const { data, error } = await createComment(taskId, content)

        if (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể gửi bình luận',
                variant: 'destructive',
            })
            setNewComment(content) // Restore on error
        }

        setIsSending(false)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const [showMentionList, setShowMentionList] = useState(false)

    // Check for @ when typing
    useEffect(() => {
        if (newComment.endsWith('@')) {
            setShowMentionList(true)
        } else {
            // Keep it open if we are in "mention mode"? 
            // Simplest: close it if last char is not @ AND we are not "searching".
            // But usually you want to search. E.g. "@Nam".
            // Let's implement simple mode: Show if ends with "@". 
            // If user types more, we can filter or close.
            // For now, let's just Close if space is typed.
            // Or better: Use a regex to find the last word. If it starts with @, open.

            const match = newComment.match(/@(\w*)$/)
            if (match) {
                setShowMentionList(true)
            } else {
                setShowMentionList(false)
            }
        }
    }, [newComment])

    return (
        <div className="flex flex-col h-[400px]">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs text-muted-foreground">
                    {comments.length} bình luận
                </span>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={handleFollowToggle} className="h-8 gap-2">
                                {amIFollowing ? (
                                    <>
                                        <Bell className="h-4 w-4 text-primary fill-primary/10" />
                                        <span className="text-primary text-xs">Đang theo dõi</span>
                                    </>
                                ) : (
                                    <>
                                        <BellOff className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">Theo dõi</span>
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Nhận thông báo khi có hoạt động mới</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <ScrollArea className="flex-1 p-4 border rounded-md mb-4 bg-slate-50">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 text-sm">
                        Chưa có thảo luận nào. Hãy bắt đầu cuộc trò chuyện.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => {
                            const isMe = comment.user_id === currentUserId
                            return (
                                <div
                                    key={comment.id}
                                    className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.full_name} />
                                        <AvatarFallback className={`text-xs ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {getInitials(comment.user?.full_name || '?')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className={`text-xs text-muted-foreground ${isMe ? 'text-right' : ''}`}>
                                            {comment.user?.full_name} • {format(new Date(comment.created_at), 'HH:mm dd/MM', { locale: vi })}
                                        </div>
                                        <div
                                            className={`p-3 text-sm rounded-lg ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-white border shadow-sm rounded-tl-none'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {(() => {
                                                    // 1. Create a safe Regex pattern from team members
                                                    // Sort by length desc to match "Nguyen Van A" before "Nguyen Van"
                                                    const sortedMembers = [...teamMembers].sort((a, b) => b.full_name.length - a.full_name.length)
                                                    const names = sortedMembers.map(m => m.full_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')

                                                    if (!names) return comment.content

                                                    // Regex to match @Name
                                                    const pattern = new RegExp(`(@(?:${names}))`, 'g')

                                                    const parts = comment.content.split(pattern)

                                                    return parts.map((part, i) => {
                                                        if (part.startsWith('@')) {
                                                            const name = part.substring(1) // Remove @
                                                            const mentionedMember = teamMembers.find(m => m.full_name === name)

                                                            if (mentionedMember) {
                                                                const isAdmin = mentionedMember.role === 'admin'
                                                                // Specific Colors based on POSITION (prioritized)
                                                                // Note: Position is what the user provided in the list. Role 'admin' is separate check.

                                                                // Default fallback
                                                                let colorClass = 'text-slate-600 font-medium'

                                                                // Priority: Admin Role -> Position
                                                                // Or should Position override Admin color? 
                                                                // User said "them nua neu la admin mau khac".
                                                                // Let's assume Admin > Position, or check Position first then if Admin override?
                                                                // Usually Admin is a Role, Position is Job Title. 
                                                                // A "Manager" can be "Admin". Which color? 
                                                                // Let's use Position colors provided, but if role is Admin and no specific position color matches, use Red?
                                                                // Or Red overrides all?
                                                                // User said "if admin different color, member different positions have different colors".
                                                                // Implementation:

                                                                if (isAdmin) {
                                                                    colorClass = 'text-red-600 font-bold'
                                                                } else {
                                                                    const pos = mentionedMember.position || ''
                                                                    // Normalize string for comparison if needed, or exact match
                                                                    if (pos.includes('Manager')) colorClass = 'text-orange-600 font-bold'
                                                                    else if (pos.includes('Content Creator')) colorClass = 'text-green-600 font-semibold'
                                                                    else if (pos.includes('Social Media')) colorClass = 'text-blue-600 font-semibold'
                                                                    else if (pos.includes('Performance')) colorClass = 'text-purple-600 font-semibold'
                                                                    else if (pos.includes('Designer') || pos.includes('Editor')) colorClass = 'text-pink-600 font-semibold'
                                                                    else colorClass = 'text-blue-500 font-medium'
                                                                }

                                                                // Overlay for "Me" bubble (Primary Bg)
                                                                // If I am the sender, background is dark primary. 
                                                                // Colored text might be hard to read.
                                                                // Strategy: Keep color but add white stroke? Or just use white bold?
                                                                // User screenshot shows my bubble is dark.
                                                                // Previous logic: `if (isMe) colorClass = 'text-white ...'`
                                                                // Let's keep that to ensure readability.
                                                                if (isMe) {
                                                                    colorClass = 'text-white underline decoration-wavy font-bold'
                                                                }

                                                                return <span key={i} className={colorClass}>{part}</span>
                                                            }
                                                        }
                                                        return part
                                                    })
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            <div className="flex flex-col gap-2 relative">
                {/* Auto-mention List */}
                {showMentionList && (
                    <div className="absolute bottom-full mb-2 w-64 bg-white border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 border-b text-xs font-semibold text-muted-foreground bg-muted/50 rounded-t-lg">
                            Chọn người để tag (@)
                        </div>
                        <ScrollArea className="max-h-[200px]">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    onClick={() => handleMentionSelect(member.id, member.full_name)}
                                    className="flex gap-2 items-center p-2 hover:bg-slate-100 cursor-pointer transition-colors"
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                                        <AvatarFallback className="text-[10px]">
                                            {getInitials(member.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{member.full_name}</span>
                                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Nhập bình luận... (Sử dụng @ để tag tên)"
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                />
                <div className="flex justify-between items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
                                <AtSign className="h-4 w-4" />
                                <span className="text-xs">Tag tên</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <ScrollArea className="h-[200px]">
                                {teamMembers.map((member) => (
                                    <DropdownMenuItem
                                        key={member.id}
                                        onClick={() => handleMentionSelect(member.id, member.full_name)}
                                        className="flex gap-2 items-center cursor-pointer"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={member.avatar_url} alt={member.full_name} />
                                            <AvatarFallback className="text-[10px]">
                                                {getInitials(member.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate">{member.full_name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={handleSend}
                        disabled={isSending || !newComment.trim()}
                        size="sm"
                        className="px-4"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Gửi
                    </Button>
                </div>
            </div>
        </div>
    )
}
