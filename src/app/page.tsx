import DailyScheduleCard from "@/components/dashboard/daily-schedule-card";
import UpcomingTasksCard from "@/components/dashboard/upcoming-tasks-card";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-primary">Welcome to Pingly Web</h1>
        <p className="text-muted-foreground">Here's your overview for today.</p>
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
