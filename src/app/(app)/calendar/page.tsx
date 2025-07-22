

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  eachDayOfInterval,
  startOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  getDay,
  addDays,
  formatDistanceToNow,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Pin, BookOpen, ListTodo, PlusCircle, CalendarDays, Dot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTasks, addTask, updateTask, deleteTask, getClassRoutine } from '@/lib/data-service';
import { getNepaliHolidays } from '@/lib/nepali-data-service';
import { cn } from '@/lib/utils';
import type { CalendarEvent, Task, NepaliHoliday } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDialog } from '@/components/task-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nepaliHolidays, setNepaliHolidays] = useState<NepaliHoliday[]>([]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const { toast } = useToast();

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [showNepaliCalendar, setShowNepaliCalendar] = useState(false);

  useEffect(() => {
    const setting = localStorage.getItem('nepali-calendar-enabled') === 'true';
    setShowNepaliCalendar(setting);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const promises = [getTasks(), getClassRoutine()];
    if (showNepaliCalendar) {
        promises.push(getNepaliHolidays());
    }
    const [fetchedTasks, fetchedClassRoutine, fetchedHolidays] = await Promise.all(promises);
    
    setTasks(fetchedTasks as Task[]);
    setClassRoutine(fetchedClassRoutine as CalendarEvent[]);
    if (fetchedHolidays) {
        setNepaliHolidays(fetchedHolidays as NepaliHoliday[]);
    } else {
        setNepaliHolidays([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [showNepaliCalendar]);

  const handleTaskDialogClose = () => {
    setIsTaskDialogOpen(false);
    setSelectedTask(undefined);
  }

  const handleTaskSave = async (task: Omit<Task, 'id'> | Task) => {
    try {
      if ('id' in task && task.id) {
        await updateTask(task as Task);
        toast({ title: "Task Updated", description: "Your task has been successfully updated." });
      } else {
        await addTask(task as Omit<Task, 'id'>);
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

  const handleAddTaskClick = () => {
    setSelectedTask(undefined);
    setIsTaskDialogOpen(true);
  }

  const monthStart = startOfMonth(currentDate);
  const firstDay = startOfWeek(monthStart);
  
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = addDays(start, 41); // Always 6 rows * 7 days = 42 days
    return eachDayOfInterval({ start, end });
  }, [currentDate]);
  
  const tasksByDate = useMemo(() => {
    const grouped = tasks.reduce((acc, item) => {
        const date = item.dueDate;
        if (date) {
            const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
        }
        return acc;
    }, {} as Record<string, Task[]>);

    // Sort items within each day
    for (const dateKey in grouped) {
        grouped[dateKey].sort((a, b) => {
            const aTime = a.startTime;
            const bTime = b.startTime;
        
            if (aTime && bTime) return aTime.getTime() - bTime.getTime();
            if (aTime) return -1;
            if (bTime) return 1;
        
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    return grouped;
  }, [tasks]);

   const holidaysByDate = useMemo(() => {
    if (!showNepaliCalendar) return {};
    return nepaliHolidays.reduce((acc, holiday) => {
      const dateKey = format(startOfDay(holiday.date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(holiday);
      return acc;
    }, {} as Record<string, NepaliHoliday[]>);
  }, [nepaliHolidays, showNepaliCalendar]);


  const selectedDayTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return (tasksByDate[dateKey] || []).filter(task => !task.startTime);
  }, [tasksByDate, selectedDate]);
  
  const selectedDayScheduledTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return (tasksByDate[dateKey] || []).filter(task => !!task.startTime);
  }, [tasksByDate, selectedDate]);
  
  const selectedDayRoutine = useMemo(() => {
    const dayOfWeek = getDay(selectedDate);
    return classRoutine
      .filter(event => getDay(event.startTime) === dayOfWeek)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [classRoutine, selectedDate]);

  return (
    <TooltipProvider>
      <TaskDialog 
        isOpen={isTaskDialogOpen}
        onClose={handleTaskDialogClose}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        task={selectedTask}
        routine={classRoutine}
        tasks={tasks}
      />
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <div className="flex-1 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <Button onClick={handleAddTaskClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Task
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => { setCurrentDate(new Date()); setSelectedDate(startOfDay(new Date())); }}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="grid grid-cols-7 text-center font-medium text-muted-foreground border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-6 flex-1">
                {days.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayHolidays = holidaysByDate[dateKey] || [];
                  const dayTasks = tasksByDate[dateKey] || [];
                  
                  return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'border-r border-b p-2 flex flex-col cursor-pointer transition-colors',
                      isSameMonth(day, monthStart) ? 'bg-card' : 'bg-muted/50',
                      !isSameMonth(day, monthStart) && 'text-muted-foreground',
                      'hover:bg-secondary',
                      isSameDay(day, selectedDate) && 'bg-primary/10 ring-2 ring-primary'
                    )}
                  >
                    <div className='flex justify-between items-start'>
                      <div className="flex">
                        {dayHolidays.map(holiday => (
                          <Tooltip key={holiday.name}>
                            <TooltipTrigger asChild>
                              <Dot className="text-red-500 -ml-2 -mt-1"/>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{holiday.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      <div
                        className={cn(
                          'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                          isSameDay(day, today) && 'bg-primary text-primary-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto -mx-2 text-xs">
                      <div className="space-y-1 px-2">
                        {dayTasks.slice(0, 3).map(item => (
                          <div
                            key={item.id}
                            className={cn(
                                "p-1 rounded-md truncate",
                                item.startTime ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800",
                                item.completed && "line-through bg-gray-200 text-gray-500"
                            )}
                          >
                            {item.startTime ? `${format(item.startTime, 'HH:mm')} ` : ''}{item.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <p className="text-muted-foreground truncate pl-1">
                            +{dayTasks.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-[350px] flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Schedule for {format(selectedDate, 'MMMM d')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-4 pr-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : (
                      <>
                        {selectedDayRoutine.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5"/>
                                Class Routine
                            </h3>
                            {selectedDayRoutine.map(event => (
                              <div key={event.id} className="flex gap-4 p-4 mb-3 rounded-lg border bg-accent/10">
                                <div className="font-semibold text-sm text-center w-16">
                                    <p>{format(event.startTime, 'HH:mm')}</p>
                                    <p className="text-muted-foreground">-</p>
                                    <p>{format(event.endTime, 'HH:mm')}</p>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{event.title}</h3>
                                    {event.roomNumber && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                            <Pin className="w-4 h-4" /> {event.roomNumber}
                                        </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(selectedDayRoutine.length > 0 && (selectedDayScheduledTasks.length > 0 || selectedDayTasks.length > 0)) && <Separator className="my-6" />}

                        <div>
                          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                              <CalendarDays className="w-5 h-5"/>
                              Tasks
                          </h3>
                           {selectedDayScheduledTasks.length > 0 ? (
                            selectedDayScheduledTasks.map(task => (
                                <div key={task.id} className="flex gap-4 p-4 mb-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <div className="font-semibold text-sm text-center w-16">
                                      <p>{format(task.startTime!, 'HH:mm')}</p>
                                      <p className="text-muted-foreground">-</p>
                                      <p>{format(task.endTime!, 'HH:mm')}</p>
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                      <div>
                                          <h3 className={cn("font-semibold", task.completed && "line-through text-muted-foreground")}>{task.title}</h3>
                                          {task.roomNumber && (
                                              <span className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"><Pin className="w-4 h-4" /> {task.roomNumber}</span>
                                          )}
                                      </div>
                                      </div>
                                  </div>
                                </div>
                            ))
                          ) : (selectedDayTasks.length === 0 &&
                            <div className="text-center py-6">
                              <p className="text-sm text-muted-foreground">No scheduled tasks for this day.</p>
                            </div>
                          )}
                        </div>

                        {(selectedDayScheduledTasks.length > 0 && selectedDayTasks.length > 0) && <Separator className="my-6" />}

                        {selectedDayTasks.length > 0 && (
                           <div>
                            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                <ListTodo className="w-5 h-5"/>
                                All-day Tasks
                            </h3>
                            {selectedDayTasks.map(task => {
                                const isTaskDueToday = isSameDay(task.dueDate, today);
                                return (
                                    <div key={task.id} onClick={() => handleTaskClick(task)} className="flex gap-4 p-4 mb-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                                        <div className="pt-1">
                                            <ListTodo className={cn("w-5 h-5 text-primary", task.completed && "text-gray-400")} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={cn("font-semibold", task.completed && "line-through text-muted-foreground")}>{task.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                              {task.completed ? "Completed" : isTaskDueToday
                                                ? `Due ${formatDistanceToNow(task.dueDate, { addSuffix: true })}`
                                                : `Due on ${format(task.dueDate, 'MMM d')}`
                                              }
                                            </p>
                                        </div>
                                        <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'}>{task.priority}</Badge>
                                    </div>
                                );
                            })}
                          </div>
                        )}

                        {selectedDayRoutine.length === 0 && selectedDayScheduledTasks.length === 0 && selectedDayTasks.length === 0 && (
                             <div className="text-center py-10">
                                <p className="text-muted-foreground">No routine or tasks for this day.</p>
                            </div>
                        )}
                      </>
                    )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

    