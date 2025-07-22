
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  addHours,
  isSameDay as isSameDate,
  formatDistanceToNow,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Pin, Clock, CheckCircle, ListTodo, PlusCircle, CalendarCheck, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTasks, addTask, updateTask, deleteTask, getClassRoutine } from '@/lib/data-service';
import { cn } from '@/lib/utils';
import type { CalendarEvent, Task, DisplayItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDialog } from '@/components/task-dialog';
import { useToast } from '@/hooks/use-toast';

const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

function getEmptySlots(events: (CalendarEvent | Task)[], date: Date) {
  const startOfWorkDay = addHours(startOfDay(date), workingHours.start);
  const endOfWorkDay = addHours(startOfDay(date), workingHours.end);

  const todaysEvents = events
    .filter(event => {
        if (!event.startTime || !event.endTime) return false;
        // Check day of week for routine, full date for tasks
        if ('priority' in event) { // It's a Task
            return isSameDate(event.startTime, date);
        } else { // It's a CalendarEvent (routine)
            return getDay(event.startTime) === getDay(date);
        }
    })
    .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());

  const emptySlots = [];
  let lastEventEnd = startOfWorkDay;

  for (const event of todaysEvents) {
    if (event.startTime! > lastEventEnd) {
      emptySlots.push({ start: lastEventEnd, end: event.startTime! });
    }
    lastEventEnd = event.endTime! > lastEventEnd ? event.endTime! : lastEventEnd;
  }
  
  if (lastEventEnd < endOfWorkDay) {
    emptySlots.push({ start: lastEventEnd, end: endOfWorkDay });
  }

  return emptySlots.filter(slot => slot.start < slot.end);
}

const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emptySlots, setEmptySlots] = useState<{start: Date, end: Date}[]>([]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const { toast } = useToast();

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);


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

  useEffect(() => {
    if (!isLoading) {
      const allItems = [...classRoutine, ...tasks];
      setEmptySlots(getEmptySlots(allItems, selectedDate));
    }
  }, [selectedDate, classRoutine, tasks, isLoading]);

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

  const firstDay = startOfWeek(startOfMonth(currentDate));
  const lastDay = endOfWeek(endOfMonth(currentDate));

  let days = eachDayOfInterval({ start: firstDay, end: lastDay });
  if (days.length < 42) {
    const extraDays = eachDayOfInterval({
        start: new Date(days[days.length - 1].getTime() + 86400000), // one day after last day
        end: new Date(days[days.length - 1].getTime() + (42 - days.length) * 86400000)
    })
    days = [...days, ...extraDays];
  }
  if (days.length > 42) {
    days.length = 42;
  }
  
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
            if (aTime) return -1; // a has time, b doesn't, a comes first
            if (bTime) return 1;  // b has time, a doesn't, b comes first
        
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    return grouped;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    return tasksByDate[format(selectedDate, 'yyyy-MM-dd')] || [];
  }, [tasksByDate, selectedDate]);
  
  const selectedDayRoutine = useMemo(() => {
    const dayOfWeek = getDay(selectedDate);
    return classRoutine.filter(event => getDay(event.startTime) === dayOfWeek)
                       .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [classRoutine, selectedDate]);


  return (
    <>
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
        <Card className="flex-1">
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
          <CardContent>
            <div className="grid grid-cols-7 text-center font-medium text-muted-foreground border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6">
              {days.map(day => (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'border-r border-b p-2 flex flex-col cursor-pointer transition-colors h-28',
                    isSameMonth(day, monthStart) ? 'bg-card' : 'bg-muted/50',
                    !isSameMonth(day, monthStart) && 'text-muted-foreground',
                    'hover:bg-secondary',
                    isSameDay(day, selectedDate) && 'bg-primary/10 ring-2 ring-primary'
                  )}
                >
                  <div className='flex justify-end'>
                    <div
                      className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                        isSameDay(day, today) && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto -mx-2">
                    <div className="space-y-1 px-2">
                      {(tasksByDate[format(day, 'yyyy-MM-dd')] || []).slice(0, 2).map(item => (
                        <div
                          key={item.id}
                           className={cn(
                              "text-xs p-1 rounded-md truncate",
                              item.startTime ? "bg-secondary text-secondary-foreground" : "bg-blue-100 text-blue-800",
                              item.completed && "line-through bg-gray-200 text-gray-500"
                          )}
                        >
                          {item.startTime ? `${format(item.startTime, 'HH:mm')} ` : ''}{item.title}
                        </div>
                      ))}
                      {(tasksByDate[format(day, 'yyyy-MM-dd')] || []).length > 2 && (
                         <p className="text-xs text-muted-foreground truncate pl-1">
                           {(tasksByDate[format(day, 'yyyy-MM-dd')] || []).length - 2} more...
                         </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                            <div className="space-y-3">
                              {selectedDayRoutine.map(event => (
                                <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-accent/10">
                                  <div className="font-semibold text-sm text-center">
                                      <p>{format(event.startTime, 'HH:mm')}</p>
                                      <p className="text-muted-foreground">-</p>
                                      <p>{format(event.endTime, 'HH:mm')}</p>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{event.title}</h3>
                                    {event.roomNumber && (
                                      <p className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <Pin className="w-4 h-4" /> {event.roomNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Separator className="my-6" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                              <CalendarCheck className="w-5 h-5"/>
                              Scheduled Tasks
                          </h3>
                           {selectedDayTasks.length > 0 ? (
                            selectedDayTasks.map(task => {
                                if (task.startTime && task.endTime) { // It's a scheduled task
                                    return (
                                        <div key={task.id} className="flex gap-4 p-4 mb-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                                          onClick={() => handleTaskClick(task)}
                                        >
                                          <div className="font-semibold text-sm text-center">
                                              <p>{format(task.startTime, 'HH:mm')}</p>
                                              <p className="text-muted-foreground">-</p>
                                              <p>{format(task.endTime, 'HH:mm')}</p>
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-start">
                                              <div>
                                                  <h3 className="font-semibold">{task.title}</h3>
                                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                  {task.roomNumber && (
                                                      <span className="flex items-center gap-2"><Pin className="w-4 h-4" /> {task.roomNumber}</span>
                                                  )}
                                                  </div>
                                              </div>
                                              </div>
                                          </div>
                                        </div>
                                    );
                                } else { // It's a task without a specific time
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
                                }
                            })
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-sm text-muted-foreground">No tasks for this day.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Separator className="my-6" />

                    <div>
                      <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5"/>
                          Available Slots
                      </h3>
                       {isLoading ? (
                         <div className="space-y-3">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                         </div>
                       ) : emptySlots.length > 0 ? (
                          <div className="space-y-3">
                          {emptySlots.map((slot, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                                  <CheckCircle className="w-5 h-5" />
                                  <p className="font-medium text-sm">
                                      <span className="font-bold">{format(slot.start, 'HH:mm')}</span> - <span className="font-bold">{format(slot.end, 'HH:mm')}</span>
                                  </p>
                              </div>
                          ))}
                          </div>
                      ) : (
                          <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No empty slots available.</p>
                          </div>
                      )}
                    </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
