'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEvents } from "@/lib/mock-data";
import type { CalendarEvent } from "@/lib/types";
import { isToday, format } from 'date-fns';
import { User, Mail, ArrowRight, CalendarClock, Pin, Book } from "lucide-react";
import { Badge } from "../ui/badge";

export default function DailyScheduleCard() {
    const todayEvents = mockEvents.filter(event => isToday(event.startTime)).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <CalendarClock className="w-6 h-6 text-primary" />
                    Today's Schedule
                </CardTitle>
                <CardDescription>Your appointments and tasks for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {todayEvents.length > 0 ? (
                    <div className="space-y-4">
                        {todayEvents.map(event => (
                            <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                                <div className="flex flex-col items-center">
                                    <p className="font-semibold text-lg">{format(event.startTime, 'HH:mm')}</p>
                                    <div className="h-full w-px bg-border my-1"></div>
                                    <p className="text-muted-foreground text-sm">{format(event.endTime, 'HH:mm')}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                          {event.subject && (
                                              <span className="flex items-center gap-2"><Book className="w-4 h-4" /> {event.subject}</span>
                                          )}
                                          {event.roomNumber && (
                                              <span className="flex items-center gap-2"><Pin className="w-4 h-4" /> {event.roomNumber}</span>
                                          )}
                                        </div>
                                      </div>
                                      {event.isOfficial && <Badge variant="outline">Official</Badge>}
                                    </div>
                                    {event.contact && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {event.contact}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No events scheduled for today.</p>
                        <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
