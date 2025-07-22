
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getClassRoutine } from '@/lib/data-service';
import type { CalendarEvent } from '@/lib/types';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClassRoutinePage() {
  const [routine, setRoutine] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const fetchedRoutine = await getClassRoutine();
      setRoutine(fetchedRoutine);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek),
    end: endOfWeek(currentWeek),
  });

  const routineByDay = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = routine
        .filter(event => isSameDay(event.startTime, day))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
    return grouped;
  }, [routine, weekDays]);

  return (
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
          <CardTitle>This Week's Schedule</CardTitle>
          <CardDescription>
            {format(startOfWeek(currentWeek), 'MMMM d')} - {format(endOfWeek(currentWeek), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {weekDays.slice(1, 6).map(day => ( // Slice to show Mon-Fri
                <div key={day.toString()} className="space-y-4">
                  <h3 className="text-lg font-semibold text-center pb-2 border-b">
                    {format(day, 'eeee')}
                    <span className="block text-sm font-normal text-muted-foreground">{format(day, 'MMM d')}</span>
                  </h3>
                  <div className="space-y-3">
                    {routineByDay[format(day, 'yyyy-MM-dd')].length > 0 ? (
                      routineByDay[format(day, 'yyyy-MM-dd')].map(event => (
                        <Card key={event.id} className="bg-accent/10 border-accent/30">
                          <CardContent className="p-4">
                            <p className="font-bold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(event.startTime, 'p')} - {format(event.endTime, 'p')}
                            </p>
                            {event.roomNumber && (
                              <p className="flex items-center gap-2 mt-2 text-sm">
                                <Pin className="w-4 h-4" /> {event.roomNumber}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center pt-4">No scheduled classes.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
