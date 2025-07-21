
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks } from "@/lib/data-service";
import type { Task } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { ListTodo, CheckCircle2, Circle, ChevronUp, ChevronDown, Equal } from "lucide-react";
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

const priorityIcons = {
    High: <ChevronUp className="w-4 h-4 text-red-500" />,
    Medium: <Equal className="w-4 h-4 text-yellow-500" />,
    Low: <ChevronDown className="w-4 h-4 text-green-500" />,
};

export default function UpcomingTasksCard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

    useEffect(() => {
        async function loadData() {
            const fetchedTasks = await getTasks();
            setTasks(fetchedTasks);
        }
        loadData();
    }, []);

    const filteredTasks = useMemo(() => {
        const upcoming = tasks.filter(task => !task.completed);
        if (filter === 'all') {
            return upcoming;
        }
        return upcoming.filter(task => task.priority === filter);
    }, [filter, tasks]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <ListTodo className="w-6 h-6 text-primary" />
                            Upcoming Tasks
                        </CardTitle>
                        <CardDescription>Your pending tasks and deadlines.</CardDescription>
                    </div>
                    <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {filteredTasks.length > 0 ? (
                    <div className="space-y-3">
                        {filteredTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                                {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                                <div className="flex-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
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
                        <p className="text-muted-foreground">No upcoming tasks.</p>
                        <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
