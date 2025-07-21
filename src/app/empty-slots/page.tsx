
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { getEvents } from "@/lib/data-service";
import type { CalendarEvent } from "@/lib/types";
import { format, startOfDay, endOfDay, addHours, isSameDay } from "date-fns";
import { useEffect, useState } from "react";

const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

function getEmptySlots(events: CalendarEvent[]) {
  const today = new Date();
  const startOfWorkDay = addHours(startOfDay(today), workingHours.start);
  const endOfWorkDay = addHours(startOfDay(today), workingHours.end);

  const todaysEvents = events
    .filter(event => isSameDay(event.startTime, today))
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

export default function EmptySlotsPage() {
  const [slots, setSlots] = useState<{start: Date, end: Date}[]>([]);

  useEffect(() => {
    async function loadData() {
      const events = await getEvents();
      setSlots(getEmptySlots(events));
    }
    loadData();
  }, [])
  

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">Available Empty Slots</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-6 h-6" /> Today's Availability</CardTitle>
          <CardDescription>
            Here are the free time slots in your schedule for today, {format(new Date(), 'MMMM d, yyyy')}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length > 0 ? (
            <div className="space-y-4">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                  <CheckCircle className="w-6 h-6" />
                  <p className="font-medium">
                    Available from <span className="font-bold">{format(slot.start, 'HH:mm')}</span> to <span className="font-bold">{format(slot.end, 'HH:mm')}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No empty slots available today.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
