
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, getClassRoutine, updateTask, addTask, deleteTask } from "@/lib/data-service";
import { getNepaliHolidays } from "@/lib/nepali-data-service";
import type { CalendarEvent, Task, NepaliHoliday } from "@/lib/types";
import { isToday, format, getDay, set, isSameDay } from 'date-fns';
import { CalendarClock, Pin, BookOpen, CalendarCheck, PartyPopper } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { TaskDialog } from '../task-dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function DailyScheduleCard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
    const [holidays, setHolidays] = useState<NepaliHoliday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [showNepaliCalendar, setShowNepaliCalendar] = useState(false);
    const today = useMemo(() => new Date(), []);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (isClient) {
            const setting = localStorage.getItem('nepali-calendar-enabled') === 'true';
            setShowNepaliCalendar(setting);
        }
    }, [isClient]);

    const loadData = async () => {
        setIsLoading(true);
        const [fetchedTasks, fetchedClassRoutine] = await Promise.all([
            getTasks(), 
            getClassRoutine(),
        ]);
        setTasks(fetchedTasks);
        setClassRoutine(fetchedClassRoutine);

        if (showNepaliCalendar) {
            const fetchedHolidays = await getNepaliHolidays();
            setHolidays(fetchedHolidays);
        } else {
            setHolidays([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isClient) {
            loadData();
        }
    }, [isClient, showNepaliCalendar]);
    
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
            toast({ title: "Task Deleted", description: "The task has been removed." });
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

    const holidayInfo = useMemo(() => {
        if (getDay(today) === 6) return { isHoliday: true, name: 'Saturday' };
        if (!showNepaliCalendar) return { isHoliday: false, name: null };
        const foundHoliday = holidays.find(h => isSameDay(h.date, today));
        return foundHoliday ? { isHoliday: true, name: foundHoliday.name } : { isHoliday: false, name: null };
    }, [holidays, today, showNepaliCalendar]);

    const todayTasks = useMemo(() => {
        return tasks
            .filter(task => isToday(task.dueDate) && task.startTime)
            .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());
    }, [tasks]);

    const todayRoutine = useMemo(() => {
        const todayDay = getDay(new Date());
        return classRoutine
            .filter(event => event.dayOfWeek === todayDay)
            .map(event => ({
                ...event,
                startTime: set(new Date(), { hours: event.startTime.getHours(), minutes: event.startTime.getMinutes(), seconds: 0, milliseconds: 0 }),
                endTime: set(new Date(), { hours: event.endTime.getHours(), minutes: event.endTime.getMinutes(), seconds: 0, milliseconds: 0 })
            }))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }, [classRoutine]);


    const hasItems = todayTasks.length > 0 || todayRoutine.length > 0;

    return (
        <>
            <TaskDialog 
                isOpen={isTaskDialogOpen}
                onClose={handleTaskDialogClose}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
                task={selectedTask}
                tasks={tasks}
                routine={classRoutine}
            />
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
                    ) : (
                        <div className="space-y-6">
                            {holidayInfo.isHoliday && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 [&>svg]:text-red-800">
                                    <PartyPopper className="h-4 w-4" />
                                    <AlertTitle>Today is a Holiday!</AlertTitle>
                                    <AlertDescription>{holidayInfo.name}</AlertDescription>
                                </Alert>
                            )}

                            {hasItems ? (
                                <>
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
                                                <div key={task.id} onClick={() => handleTaskClick(task)} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
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
                                </>
                            ) : !holidayInfo.isHoliday ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">No events scheduled for today.</p>

                                    <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
                                </div>
                            ) : null }
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
