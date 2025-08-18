
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, getAllUsers } from "@/lib/data-service";
import type { Task, UserProfile } from "@/lib/types";
import { format, isPast, endOfDay } from 'date-fns';
import { History, AlertCircle, CheckCircle2, CircleDot } from "lucide-react";
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const getStatus = (task: Task) => {
    if (task.completed) {
        return { text: 'Completed', color: 'text-green-600', icon: <CheckCircle2 className="w-4 h-4" /> };
    }
    if (isPast(endOfDay(task.dueDate))) {
        return { text: 'Overdue', color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> };
    }
    // Should not happen if filtered correctly, but as a fallback
    return { text: 'Pending', color: 'text-muted-foreground', icon: <CircleDot className="w-4 h-4" /> };
}

export default function PastTasksCard() {
    const [user] = useAuthState(auth);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);
        const [fetchedTasks, fetchedUsers] = await Promise.all([
            getTasks(), 
            getAllUsers()
        ]);
        setTasks(fetchedTasks);
        setAllUsers(fetchedUsers);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const pastTasks = useMemo(() => {
        if (!user) return [];
        return tasks
            .filter(task => task.completed || isPast(endOfDay(task.dueDate)))
            .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime()); // Show most recent first
    }, [tasks, user]);

    return (
        <TooltipProvider>
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2 flex-1">
                        <History className="w-6 h-6 text-primary" />
                        Task History
                    </CardTitle>
                    <CardDescription>A log of your completed and overdue tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : pastTasks.length > 0 ? (
                        <ScrollArea className="flex-1 -mr-4">
                            <div className="space-y-3 pr-4">
                                {pastTasks.map(task => {
                                    const status = getStatus(task);
                                    const assignee = task.assigneeId ? allUsers.find(u => u.id === task.assigneeId) : null;
                                    const creator = allUsers.find(u => u.id === task.creatorId);

                                    return (
                                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                            <div className="flex-1">
                                                <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                                                <div className="text-xs text-muted-foreground">
                                                    {task.assigneeId ? (
                                                        <span>Assigned to {assignee?.displayName || '...'}</span>
                                                    ) : (
                                                        <span>Personal Task</span>
                                                    )}
                                                    <span className="mx-1">&bull;</span>
                                                    <span>Due {format(task.dueDate, 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn("flex items-center gap-1 text-sm", status.color)}>
                                                        {status.icon}
                                                        <span>{status.text}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{status.text}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                                <p className="text-muted-foreground">No past tasks found.</p>
                                <p className="text-sm text-muted-foreground">
                                    Completed tasks will appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
