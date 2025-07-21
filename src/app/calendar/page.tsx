
'use client';

import { useState, useEffect } from 'react';
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
} from 'date-fns';
import { ChevronLeft, ChevronRight, Pin, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents } from '@/lib/data-service';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

function getEmptySlots(events: CalendarEvent[], date: Date) {
  const startOfWorkDay = addHours(startOfDay(date), workingHours.start);
  const endOfWorkDay = addHours(startOfDay(date), workingHours.end);

  const todaysEvents = events
    .filter(event => isSameDate(event.startTime, date))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const emptySlots = [];
  let lastEventEnd = startOfWorkDay;

  for (const event of todaysEvents) {
    if (event.startTime > lastEventEnd) {
      emptySlots.push({ start: lastEventEnd, end: event.startTime });
    }
    lastEventEnd = event.endTime > lastEventEnd ? event.endTime : lastEventEnd;
  }
  
  if (lastEventEnd < endOfWorkDay) {
    emptySlots.push({ start: lastEventEnd, end: endOfWorkDay });
  }

  return emptySlots.filter(slot => slot.start < slot.end);
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [emptySlots, setEmptySlots] = useState<{start: Date, end: Date}[]>([]);

  useEffect(() => {
    async function loadData() {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setEmptySlots(getEmptySlots(events, selectedDate));
    }
  }, [selectedDate, events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

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
  
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(event.startTime, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDayEvents = eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
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
                      isSameDay(day, new Date()) && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto -mx-2">
                  <div className="space-y-1 px-2">
                    {(eventsByDate[format(day, 'yyyy-MM-dd')] || []).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                            "text-xs p-1 rounded-md truncate",
                            event.isOfficial ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
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
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.sort((a,b) => a.startTime.getTime() - b.startTime.getTime()).map(event => (
                      <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                        <div className="font-semibold text-sm text-center">
                            <p>{format(event.startTime, 'HH:mm')}</p>
                            <p className="text-muted-foreground">-</p>
                            <p>{format(event.endTime, 'HH:mm')}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                {event.roomNumber && (
                                    <span className="flex items-center gap-2"><Pin className="w-4 h-4" /> {event.roomNumber}</span>
                                )}
                              </div>
                            </div>
                            {event.isOfficial && <Badge variant="outline">Official</Badge>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 h-full flex flex-col justify-center items-center">
                      <p className="text-muted-foreground">No events scheduled for this day.</p>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5"/>
                        Available Slots
                    </h3>
                     {emptySlots.length > 0 ? (
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
  );
}
