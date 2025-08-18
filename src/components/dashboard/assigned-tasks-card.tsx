
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getCreatedTasks, deleteTask, getAllUsers, updateTask, addTask, getClassRoutine } from "@/lib/data-service";
import type { Task, UserProfile, CalendarEvent } from "@/lib/types";
import { formatDistanceToNow, isPast, endOfDay } from 'date-fns';
import { ListChecks, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { TaskDialog } from '../task-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const getTaskStatus = (task: Task) => {
    if (task.completed) {
        return { text: 'Completed', color: 'text-green-500', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> };
    }
    if (isPast(endOfDay(task.dueDate))) {
        return { text: 'Overdue', color: 'text-red-500', icon: <AlertCircle className="w-4 h-4 text-red-500" /> };
    }
    return { text: `Due ${formatDistanceToNow(task.dueDate, { addSuffix: true })}`, color: 'text-muted-foreground', icon: null };
};

export default function AssignedTasksCard() {
    const [user] = useAuthState(auth);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [routine, setRoutine] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const { toast } = useToast();

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);
        const [fetchedTasks, fetchedUsers, fetchedClassRoutine] = await Promise.all([
            getCreatedTasks(), 
            getAllUsers(),
            getClassRoutine()
        ]);
        setTasks(fetchedTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
        setAllUsers(fetchedUsers);
        setRoutine(fetchedClassRoutine);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleTaskDialogClose = () => {
        setIsTaskDialogOpen(false);
        setSelectedTask(undefined);
    }
    
    const handleTaskSave = async (task: Omit<Task, 'id' | 'creatorId' | 'completed'> | Task) => {
        try {
          if ('id' in task && task.id) {
            await updateTask(task as Task);
            toast({ title: "Task Updated", description: "Your task has been successfully updated." });
          } else {
            await addTask(task as Omit<Task, 'id' | 'creatorId' | 'completed'>);
            toast({ title: "Task Added", description: "Your new task has been successfully added." });
          }
          loadData();
          handleTaskDialogClose();
        } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "Failed to save the task." });
        }
      };
    
      const handleTaskDelete = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            toast({ title: "Task Deleted", description: "The task has been successfully removed." });
            loadData();
            handleTaskDialogClose();
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete the task." });
        }
      };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDialogOpen(true);
    }

    const assignedTasks = useMemo(() => {
        if (!user) return [];
        return tasks.filter(task => task.assigneeId && task.assigneeId !== user.uid);
    }, [tasks, user]);

    return (
        <>
            <TaskDialog 
                isOpen={isTaskDialogOpen}
                onClose={handleTaskDialogClose}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
                task={selectedTask}
                tasks={tasks}
                routine={routine}
            />
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2 flex-1">
                        <ListChecks className="w-6 h-6 text-primary" />
                        Tasks You've Assigned
                    </CardTitle>
                    <CardDescription>A list of tasks you have delegated to others.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : assignedTasks.length > 0 ? (
                        <ScrollArea className="flex-1 -mr-4">
                            <div className="space-y-3 pr-4">
                                {assignedTasks.map(task => {
                                    const assignee = allUsers.find(u => u.id === task.assigneeId);
                                    const status = getTaskStatus(task);
                                    return (
                                    <div key={task.id} onClick={() => handleTaskClick(task)} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                                        <div className="flex-1">
                                            <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                                            <div className={cn("text-sm", status.color, "flex items-center gap-2")}>
                                               {status.icon}
                                                <span>
                                                    {status.text}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-right">
                                            <div className='flex flex-col items-end'>
                                                <span className='text-sm font-medium'>{assignee?.displayName || 'Unknown'}</span>
                                                <span className='text-xs text-muted-foreground'>Assignee</span>
                                            </div>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={assignee?.photoURL || ''} alt={assignee?.displayName || 'User'} data-ai-hint="profile picture" />
                                                <AvatarFallback>{assignee?.displayName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                                <p className="text-muted-foreground">You haven't assigned any tasks.</p>
                                <p className="text-sm text-muted-foreground">
                                    Assign a task from the calendar or task list.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
