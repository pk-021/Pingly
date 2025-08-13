

'use client';

import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { auth } from "@/lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import AnnouncementsCard from '@/components/dashboard/announcements-card';

export default function DashboardPage() {
  const [user] = useAuthState(auth);

  return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
              <h1 className="text-3xl font-headline text-primary">Welcome, {user?.displayName || 'User'}!</h1>
              <p className="text-muted-foreground">Here's your overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/calendar">
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
