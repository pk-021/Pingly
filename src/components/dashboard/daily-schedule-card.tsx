
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, getClassRoutine, updateTask, addTask, deleteTask } from "@/lib/data-service";
import type { CalendarEvent, Task } from "@/lib/types";
import { isToday, format, getDay, set } from 'date-fns';
import { CalendarClock, Pin, BookOpen, CalendarCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { TaskDialog } from '../task-dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "../ui/scroll-area";

const ScheduleItem = ({ title, startTime, endTime, roomNumber, onClick, isTask }: { title: string, startTime: Date, endTime: Date, roomNumber?: string, onClick?: () => void, isTask?: boolean }) => (
    <div 
      onClick={onClick} 
      className={`flex gap-4 p-4 rounded-lg border ${isTask ? 'bg-card hover:bg-secondary/50 cursor-pointer' : 'bg-accent/10'} transition-colors`}
    >
        <div className="flex flex-col items-center w-16 text-center">
            <p className="font-semibold text-base">{format(startTime, 'HH:mm')}</p>
            <div className="h-4 w-px bg-border my-1"></div>
            <p className="text-muted-foreground text-sm">{format(endTime, 'HH:mm')}</p>
        </div>
        <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            {roomNumber && (
                <span className="flex items-center gap-2 mt-1 text-sm text-muted-foreground"><Pin className="w-4 h-4" /> {roomNumber}</span>
            )}
        </div>
    </div>
);

export default function DailyScheduleCard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const { toast } = useToast();

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

    const handleTaskDialogClose = () => {
        setIsTaskDialogOpen(false);
        setSelectedTask(undefined);
    }
    
    const handleTaskSave = async (task: Omit<Task, 'id' | 'creatorId' | 'completed'> | Task) => {
        try {
          if ('id' in task && task.id) {
            await updateTask(task as Task);
            toast({ title: "Task Updated" });
          } else {
            await addTask(task as Omit<Task, 'id' | 'creatorId' | 'completed'>);
            toast({ title: "Task Added" });
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
            toast({ title: "Task Deleted" });
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

    const todayTasks = useMemo(() => tasks
        .filter(task => isToday(task.dueDate) && task.startTime)
        .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime()), [tasks]);

    const todayRoutine = useMemo(() => {
        const todayDay = getDay(new Date());
        return classRoutine
            .filter(event => event.dayOfWeek === todayDay)
            .map(event => ({
                ...event,
                startTime: set(new Date(), { hours: event.startTime.getHours(), minutes: event.startTime.getMinutes() }),
                endTime: set(new Date(), { hours: event.endTime.getHours(), minutes: event.endTime.getMinutes() })
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
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <CalendarClock className="w-6 h-6 text-primary" />
                        Today's Schedule
                    </CardTitle>
                    <CardDescription>Your class routine and scheduled tasks for today.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="space-y-6">
                             <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-24 w-full" />
                        </div>
                    ) : hasItems ? (
                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            <div className="space-y-6">
                                {todayRoutine.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                            <BookOpen className="w-5 h-5 text-accent"/>
                                            Class Routine
                                        </h3>
                                        <div className="space-y-4">
                                            {todayRoutine.map(event => <ScheduleItem key={event.id} {...event} />)}
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
                                                <ScheduleItem 
                                                  key={task.id} 
                                                  {...task} 
                                                  startTime={task.startTime!} 
                                                  endTime={task.endTime!}
                                                  onClick={() => handleTaskClick(task)} 
                                                  isTask 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                                <p className="text-muted-foreground">No events scheduled for today.</p>
                                <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
