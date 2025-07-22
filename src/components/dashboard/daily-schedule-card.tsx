
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, getClassRoutine } from "@/lib/data-service";
import type { CalendarEvent, Task } from "@/lib/types";
import { isToday, format, getDay } from 'date-fns';
import { CalendarClock, Pin, BookOpen, CalendarCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { useEffect, useState, useMemo } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export default function DailyScheduleCard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const [fetchedTasks, fetchedClassRoutine] = await Promise.all([getTasks(), getClassRoutine()]);
        setTasks(fetchedTasks);
        setClassRoutine(fetchedClassRoutine);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const todayTasks = useMemo(() => {
        return tasks
            .filter(task => isToday(task.dueDate) && task.startTime)
            .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());
    }, [tasks]);

    const todayRoutine = useMemo(() => {
        const todayDay = getDay(new Date());
        return classRoutine
            .filter(event => getDay(event.startTime) === todayDay)
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }, [classRoutine]);


    const hasItems = todayTasks.length > 0 || todayRoutine.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <CalendarClock className="w-6 h-6 text-primary" />
                    Today's Schedule
                </CardTitle>
                <CardDescription>Your class routine and scheduled tasks for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-6">
                         <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-24 w-full" />
                    </div>
                ) : hasItems ? (
                    <div className="space-y-6">
                        {todayRoutine.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                    <BookOpen className="w-5 h-5 text-accent"/>
                                    Class Routine
                                </h3>
                                <div className="space-y-4">
                                    {todayRoutine.map(event => (
                                        <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-accent/10">
                                            <div className="flex flex-col items-center w-16 text-center">
                                                <p className="font-semibold text-base">{format(event.startTime, 'HH:mm')}</p>
                                                <div className="h-4 w-px bg-border my-1"></div>
                                                <p className="text-muted-foreground text-sm">{format(event.endTime, 'HH:mm')}</p>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{event.title}</h3>
                                                {event.roomNumber && (
                                                    <span className="flex items-center gap-2 mt-1 text-sm text-muted-foreground"><Pin className="w-4 h-4" /> {event.roomNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {todayRoutine.length > 0 && todayTasks.length > 0 && <Separator />}

                        {todayTasks.length > 0 && (
                             <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                    <CalendarCheck className="w-5 h-5 text-primary"/>
                                    Scheduled Tasks
                                </h3>
                                <div className="space-y-4">
                                    {todayTasks.map(task => (
                                        <div key={task.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                                            <div className="flex flex-col items-center w-16 text-center">
                                                <p className="font-semibold text-base">{format(task.startTime!, 'HH:mm')}</p>
                                                <div className="h-4 w-px bg-border my-1"></div>
                                                <p className="text-muted-foreground text-sm">{format(task.endTime!, 'HH:mm')}</p>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{task.title}</h3>
                                                {task.roomNumber && (
                                                    <span className="flex items-center gap-2 mt-1 text-sm text-muted-foreground"><Pin className="w-4 h-4" /> {task.roomNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No events scheduled for today.</p>
                        <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
