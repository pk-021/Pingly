
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, User, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, updateUserDepartment } from "@/lib/data-service";
import type { UserProfile } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from "firebase/auth";

const departments = [
    'Computer and electronics engineering',
    'mechanical and aerospace engineering',
    'applied sciences and chemical engineering',
    'civil engineering',
    'electrical engineering',
];

export default function SettingsPage() {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();

  // State for Notification Settings
  const [isNepaliCalendarEnabled, setIsNepaliCalendarEnabled] = useState(false);
  
  // State for Profile Settings
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // State to track client-side mounting
  const [isClient, setIsClient] = useState(false);

  const hasUnsavedChanges = profile ? selectedDepartment !== profile.department : false;

  useEffect(() => {
    // Component has mounted on the client
    setIsClient(true);

    // Fetch user profile data
    if (user) {
        setProfileLoading(true);
        getUserProfile(user.uid).then(userProfile => {
            setProfile(userProfile);
            setSelectedDepartment(userProfile?.department || '');
            setProfileLoading(false);
        });
    } else if (!authLoading) {
        setProfileLoading(false);
    }
    
    // Get stored notification settings
    const storedValue = localStorage.getItem('nepali-calendar-enabled');
    setIsNepaliCalendarEnabled(storedValue === 'true');

  }, [user, authLoading]);
  
  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = ''; // Required for legacy browsers
        }
    };

    if (isClient) {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }
  }, [hasUnsavedChanges, isClient]);

  const handleSwitchChange = (checked: boolean) => {
    setIsNepaliCalendarEnabled(checked);
    localStorage.setItem('nepali-calendar-enabled', String(checked));
    window.location.reload();
  };

  const handleSaveChanges = async () => {
    if (!user || !profile || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
        await updateUserDepartment(user.uid, selectedDepartment);
        setProfile({ ...profile, department: selectedDepartment });
        toast({ title: "Success", description: "Your department has been updated." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to update your department." });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!user?.email) {
        toast({ variant: 'destructive', title: "Error", description: "No email address found for your account." });
        return;
    };
    
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({ title: "Password Reset Email Sent", description: "Please check your inbox for instructions to reset your password." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to send password reset email. Please try again later." });
    }
  }

  const isLoading = authLoading || profileLoading;

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-headline text-primary">Settings</h1>

        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Profile Settings</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : profile ? (
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger id="department">
                                <SelectValue placeholder="Select your department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Could not load profile information.</p>
                )}
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={!hasUnsavedChanges || isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell /> Notification Settings</CardTitle>
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
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound/> Security Settings</CardTitle>
                <CardDescription>Manage your account security, like changing your password.</CardDescription>
            </CardHeader>
            <CardContent className="border-b">
                 <div className="p-4 text-center">
                    <Label className="text-base">Reset Password</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        Click the button to receive a password reset link in your email.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-4">
                <Button variant="secondary" onClick={handlePasswordReset} disabled={authLoading}>
                    Send Reset Link
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
