
'use client';

import { useMemo } from 'react';
import { format, getDay, set, isSameDay, formatDistanceToNow, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Pin, BookOpen, ListTodo, CalendarDays } from 'lucide-react';
import type { Task, CalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

type DailySchedulePanelProps = {
  selectedDate: Date;
  tasks: Task[];
  routine: CalendarEvent[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
};

export function DailySchedulePanel({
  selectedDate,
  tasks,
  routine,
  isLoading,
  onTaskClick,
}: DailySchedulePanelProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, item) => {
        const dateKey = format(item.dueDate, 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return (tasksByDate[dateKey] || []).filter(task => !task.startTime);
  }, [tasksByDate, selectedDate]);
  
  const selectedDayScheduledTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return (tasksByDate[dateKey] || []).filter(task => !!task.startTime)
      .sort((a,b) => a.startTime!.getTime() - b.startTime!.getTime());
  }, [tasksByDate, selectedDate]);
  
  const selectedDayRoutine = useMemo(() => {
    const dayOfWeek = getDay(selectedDate);
    return routine
      .filter(event => event.dayOfWeek === dayOfWeek)
      .map(event => ({
        ...event,
        startTime: set(selectedDate, { hours: event.startTime.getHours(), minutes: event.startTime.getMinutes() }),
        endTime: set(selectedDate, { hours: event.endTime.getHours(), minutes: event.endTime.getMinutes() }),
      }))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [routine, selectedDate]);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="font-headline">Schedule for {format(selectedDate, 'MMMM d')}</CardTitle>
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
                            onClick={() => onTaskClick(task)}
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
                              <div key={task.id} onClick={() => onTaskClick(task)} className="flex gap-4 p-4 mb-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
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
  );
}
