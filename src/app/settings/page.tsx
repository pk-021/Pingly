import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Bell />
            <div className="flex-1 space-y-1">
                <Label htmlFor="nepali-calendar" className="text-base">
                    Nepali Calendar Integration
                </Label>
                <p className="text-sm text-muted-foreground">
                    Receive additional notifications based on the Nepali calendar.
                </p>
            </div>
            <Switch id="nepali-calendar" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
