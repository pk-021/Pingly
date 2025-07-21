import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline text-primary">Welcome to Pingly Web</h1>
            <p className="text-muted-foreground">Here's your overview for today.</p>
        </div>
        <Link href="/calendar">
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
          </Button>
        </Link>
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
  );
}
