
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getClassRoutine, addRoutineEvent, updateRoutineEvent, deleteRoutineEvent } from '@/lib/data-service';
import type { CalendarEvent } from '@/lib/types';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, set, getDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, BookOpen, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RoutineEventDialog } from '@/components/routine-event-dialog';

export default function ClassRoutinePage() {
  const [routine, setRoutine] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const fetchedRoutine = await getClassRoutine();
    setRoutine(fetchedRoutine);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 0 }), // Sunday as start of week
    end: endOfWeek(currentWeek, { weekStartsOn: 0 }),
  });

  const routineByDay = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = routine
        .filter(event => getDay(event.startTime) === getDay(day)) // Match by day of week for weekly routine
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
    return grouped;
  }, [routine, weekDays]);
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  }

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'isOfficial'> | CalendarEvent) => {
    try {
        if ('id' in eventData && eventData.id) {
            await updateRoutineEvent(eventData as CalendarEvent);
            toast({ title: "Event Updated", description: "The event has been successfully updated." });
        } else {
            await addRoutineEvent(eventData as Omit<CalendarEvent, 'id' | 'isOfficial'>);
            toast({ title: "Event Added", description: "The new event has been added to your routine." });
        }
        loadData();
        handleDialogClose();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to save the event." });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
        await deleteRoutineEvent(eventId);
        toast({ title: "Event Deleted", description: "The event has been removed." });
        loadData();
        handleDialogClose();
    } catch(error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete the event." });
    }
  }

  const handleAddClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }

  const handleEventClick = (event: CalendarEvent, day: Date) => {
    // We need to set the date of the event to the selected day for editing purposes
    const eventOnSelectedDay = {
        ...event,
        startTime: set(event.startTime, { year: day.getFullYear(), month: day.getMonth(), date: day.getDate() }),
        endTime: set(event.endTime, { year: day.getFullYear(), month: day.getMonth(), date: day.getDate() })
    };
    setSelectedEvent(eventOnSelectedDay);
    setIsDialogOpen(true);
  }

  return (
    <>
      <RoutineEventDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
        routine={routine}
      />
      <div className="space-y-8">
          <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10 text-primary"/>
              <div>
                  <h1 className="text-3xl font-headline text-primary">Class Routine</h1>
                  <p className="text-muted-foreground">Your official weekly teaching and faculty schedule.</p>
              </div>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              A consistent schedule for every week. Saturday is a holiday.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-x-2">
                {weekDays.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const isSaturday = getDay(day) === 6;
                    return (
                        <div key={day.toString()} 
                            className={cn(
                                "rounded-lg p-2 space-y-3",
                                isSaturday ? 'bg-red-50' : 'bg-muted/30'
                            )}
                        >
                        <h3 className={cn(
                                "text-lg font-semibold text-center pb-2 border-b-2",
                                isSaturday ? 'text-red-600 border-red-200' : 'border-border'
                            )}>
                            {format(day, 'eeee')}
                        </h3>
                        <div className="space-y-3 min-h-[200px]">
                            {routineByDay[dayKey] && routineByDay[dayKey].map(event => (
                            <Card key={event.id} onClick={() => handleEventClick(event, day)} className="bg-accent/20 border-accent/40 hover:bg-accent/40 cursor-pointer transition-colors">
                                <CardContent className="p-3">
                                <p className="font-bold text-sm">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(event.startTime, 'p')} - {format(event.endTime, 'p')}
                                </p>
                                {event.roomNumber && (
                                    <p className="flex items-center gap-1.5 mt-2 text-xs">
                                    <Pin className="w-3 h-3" /> {event.roomNumber}
                                    </p>
                                )}
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                        {!isSaturday && (
                            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => handleAddClick(day)}>
                                <PlusCircle className="w-4 h-4 mr-2"/>
                                Add Event
                            </Button>
                        )}
                        </div>
                    )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

