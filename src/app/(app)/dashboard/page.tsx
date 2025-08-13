
'use client';

import AnnouncementsCard from "@/components/dashboard/announcements-card";
import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from "@/components/ui/skeleton";


export default function Dashboard() {
    const [user, loading] = useAuthState(auth);
    
    if (loading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-96" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">
                    Welcome back, {user?.displayName || 'User'}!
                </h1>
                <p className="text-muted-foreground">Here's what's happening today.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <AnnouncementsCard />
                    <DailyScheduleCard />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingTasksCard />
                </div>
            </div>
        </div>
    );
}
