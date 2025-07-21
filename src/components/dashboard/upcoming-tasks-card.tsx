
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, updateTask, addTask, deleteTask } from "@/lib/data-service";
import type { Task } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { ListTodo, CheckCircle2, Circle, ChevronUp, ChevronDown, Equal, PlusCircle } from "lucide-react";
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { TaskDialog } from '../task-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const priorityIcons = {
    High: <ChevronUp className="w-4 h-4 text-red-500" />,
    Medium: <Equal className="w-4 h-4 text-yellow-500" />,
    Low: <ChevronDown className="w-4 h-4 text-green-500" />,
};

export default function UpcomingTasksCard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const { toast } = useToast();

    const loadTasks = async () => {
        setIsLoading(true);
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleTaskDialogClose = () => {
        setIsTaskDialogOpen(false);
        setSelectedTask(undefined);
    }
    
    const handleTaskSave = async (task: Omit<Task, 'id'> | Task) => {
        try {
          if ('id' in task) {
            await updateTask(task);
            toast({ title: "Task Updated", description: "Your task has been successfully updated." });
          } else {
            await addTask(task);
            toast({ title: "Task Added", description: "Your new task has been successfully added." });
          }
          loadTasks();
          handleTaskDialogClose();
        } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "Failed to save the task." });
        }
      };
    
      const handleTaskDelete = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            toast({ title: "Task Deleted", description: "The task has been removed." });
            loadTasks();
            handleTaskDialogClose();
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete the task." });
        }
      };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDialogOpen(true);
    }

    const handleAddTaskClick = () => {
        setSelectedTask(undefined);
        setIsTaskDialogOpen(true);
    }

    const filteredTasks = useMemo(() => {
        if (filter === 'all') return tasks;
        if (filter === 'completed') return tasks.filter(task => task.completed);
        return tasks.filter(task => !task.completed);
    }, [filter, tasks]);

    return (
        <>
            <TaskDialog 
                isOpen={isTaskDialogOpen}
                onClose={handleTaskDialogClose}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
                task={selectedTask}
            />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                <ListTodo className="w-6 h-6 text-primary" />
                                Tasks
                            </CardTitle>
                            <CardDescription>Your tasks and deadlines.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" onClick={handleAddTaskClick}>
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {filteredTasks.map(task => (
                                <div key={task.id} onClick={() => handleTaskClick(task)} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                                    <div className="flex-1">
                                        <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {task.completed ? 'Completed' : `Due ${formatDistanceToNow(task.dueDate, { addSuffix: true })}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {priorityIcons[task.priority]}
                                        <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'}>{task.priority}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No {filter} tasks.</p>
                            <p className="text-sm text-muted-foreground">
                                {filter === 'upcoming' ? "You're all caught up!" : "Create a new task to get started."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
