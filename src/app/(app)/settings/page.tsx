
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const [isNepaliCalendarEnabled, setIsNepaliCalendarEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // It safely reads from localStorage and updates the state.
    const storedValue = localStorage.getItem('nepali-calendar-enabled');
    setIsNepaliCalendarEnabled(storedValue === 'true');
    setIsClient(true);
  }, []);

  const handleSwitchChange = (checked: boolean) => {
    // This function will only run on the client where localStorage is available.
    setIsNepaliCalendarEnabled(checked);
    localStorage.setItem('nepali-calendar-enabled', String(checked));
    // A full reload ensures all components re-check the localStorage value.
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isClient ? (
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-6 w-11" />
            </div>
          ) : (
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <Bell />
                <div className="flex-1 space-y-1">
                    <Label htmlFor="nepali-calendar" className="text-base">
                        Nepali Calendar Integration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Show public holidays from the Nepali calendar in your schedule.
                    </p>
                </div>
                <Switch
                id="nepali-calendar"
                checked={isNepaliCalendarEnabled}
                onCheckedChange={handleSwitchChange}
                />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
