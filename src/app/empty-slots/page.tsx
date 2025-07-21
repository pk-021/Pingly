import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { mockEvents } from "@/lib/mock-data";
import { format, startOfDay, endOfDay, addHours } from "date-fns";

const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

function getEmptySlots() {
  const today = new Date();
  const sortedEvents = mockEvents
    .filter(event => format(event.startTime, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const emptySlots = [];
  let lastEventEnd = addHours(startOfDay(today), workingHours.start);

  for (const event of sortedEvents) {
    if (event.startTime > lastEventEnd) {
      emptySlots.push({ start: lastEventEnd, end: event.startTime });
    }
    lastEventEnd = event.endTime > lastEventEnd ? event.endTime : lastEventEnd;
  }
  
  const endOfWorkDay = addHours(startOfDay(today), workingHours.end);
  if (lastEventEnd < endOfWorkDay) {
    emptySlots.push({ start: lastEventEnd, end: endOfWorkDay });
  }

  return emptySlots;
}

export default function EmptySlotsPage() {
  const slots = getEmptySlots();

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
