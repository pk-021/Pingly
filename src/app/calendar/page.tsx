import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">Full Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <CalendarDays className="mx-auto h-12 w-12" />
                <p className="mt-4">Full calendar view will be implemented here.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
