
'use client';

import AnnouncementsCard from "@/components/dashboard/announcements-card";
import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function Dashboard() {
    const [user] = useAuthState(auth);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline text-primary">
                    Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">Here's a look at your day.</p>
            </div>
            <AnnouncementsCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyScheduleCard />
                <UpcomingTasksCard />
            </div>
        </div>
    );
}
