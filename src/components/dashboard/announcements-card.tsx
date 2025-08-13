
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAnnouncements } from '@/lib/data-service';
import type { Announcement } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export default function AnnouncementsCard() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAnnouncements() {
            setIsLoading(true);
            const fetchedAnnouncements = await getAnnouncements();
            setAnnouncements(fetchedAnnouncements);
            setIsLoading(false);
        }
        loadAnnouncements();
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-primary" />
                        Announcements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (announcements.length === 0) {
        return null; // Don't show the card if there are no announcements
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-primary" />
                    Announcements
                </CardTitle>
                <CardDescription>Recent messages from the admin team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue={announcements[0]?.id}>
                    {announcements.slice(0, 3).map(announcement => (
                        <AccordionItem value={announcement.id} key={announcement.id}>
                            <AccordionTrigger>
                                <div className="flex flex-col items-start text-left">
                                    <p className="font-semibold">{announcement.title}</p>
                                     <p className="text-xs text-muted-foreground mt-1">
                                        by {announcement.authorName} &bull; {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="whitespace-pre-wrap">{announcement.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
