
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getClassRoutine, getTasks } from '@/lib/data-service';
import type { CalendarEvent, Task } from '@/lib/types';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, getDay, set, isSameDay, getHours, getMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CalendarX2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
const slotDuration = 30; // in minutes

type TimeSlot = {
  start: Date;
  end: Date;
};

export default function EmptySlotsPage() {
  const [routine, setRoutine] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentWeekDays = useMemo(() => eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  }), []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [fetchedRoutine, fetchedTasks] = await Promise.all([getClassRoutine(), getTasks()]);
      setRoutine(fetchedRoutine);
      setTasks(fetchedTasks);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const emptySlotsByDay = useMemo(() => {
    const slotsByDay: { [key: number]: TimeSlot[] } = {};

    currentWeekDays.forEach(day => {
      const dayOfWeek = getDay(day);
      if (dayOfWeek === 6) { // Saturday is a holiday
        slotsByDay[dayOfWeek] = [];
        return;
      }

      const startOfWorkDay = setMinutes(setHours(startOfDay(day), workingHours.start), 0);
      const endOfWorkDay = setMinutes(setHours(startOfDay(day), workingHours.end), 0);
      
      const allItemsForDay = [
        ...routine.filter(event => event.dayOfWeek === dayOfWeek).map(event => ({
            startTime: setMinutes(setHours(startOfDay(day), getHours(event.startTime)), getMinutes(event.startTime)),
            endTime: setMinutes(setHours(startOfDay(day), getHours(event.endTime)), getMinutes(event.endTime)),
        })),
        ...tasks.filter(task => isSameDay(task.dueDate, day) && task.startTime && task.endTime).map(task => ({
            startTime: task.startTime!,
            endTime: task.endTime!,
        }))
      ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      const emptySlots: TimeSlot[] = [];
      let lastEventEndTime = startOfWorkDay;

      allItemsForDay.forEach(item => {
        if (item.startTime > lastEventEndTime) {
          emptySlots.push({ start: lastEventEndTime, end: item.startTime });
        }
        lastEventEndTime = item.endTime > lastEventEndTime ? item.endTime : lastEventEndTime;
      });

      if (endOfWorkDay > lastEventEndTime) {
        emptySlots.push({ start: lastEventEndTime, end: endOfWorkDay });
      }

      slotsByDay[dayOfWeek] = emptySlots;
    });

    return slotsByDay;
  }, [routine, tasks, currentWeekDays]);


  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-primary"/>
            <div>
                <h1 className="text-3xl font-headline text-primary">Empty Slots</h1>
                <p className="text-muted-foreground">Find your free time slots for the current week.</p>
            </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <CardDescription>
            Showing all periods this week where you have no scheduled classes or tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentWeekDays.filter(d => getDay(d) !== 6).map(day => {
                  const dayOfWeek = getDay(day);
                  const slots = emptySlotsByDay[dayOfWeek] || [];
                  return (
                      <Card key={day.toString()} className="flex flex-col">
                          <CardHeader>
                            <CardTitle className="text-xl font-headline">{weekDays[dayOfWeek]}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <ScrollArea className="h-48">
                                <div className="space-y-3 pr-4">
                                {slots.length > 0 ? (
                                    slots.map((slot, index) => (
                                    <div key={index} className="p-3 rounded-md bg-green-50 text-green-800 border border-green-200">
                                        <p className="font-semibold">{format(slot.start, 'p')} - {format(slot.end, 'p')}</p>
                                    </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 rounded-md bg-muted/50">
                                        <CalendarX2 className="w-8 h-8 mb-2" />
                                        <p>No empty slots available.</p>
                                    </div>
                                )}
                                </div>
                            </ScrollArea>
                          </CardContent>
                      </Card>
                  )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
