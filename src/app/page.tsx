
'use client';

import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { auth } from "@/lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "./(app)/layout";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <div className="space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
              <h1 className="text-3xl font-headline text-primary">Welcome, {user.displayName || 'User'}!</h1>
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
          <div className="lg:col-span-2">
            <DailyScheduleCard />
          </div>
          <div>
            <UpcomingTasksCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
