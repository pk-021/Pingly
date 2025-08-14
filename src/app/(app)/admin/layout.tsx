
'use client';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/data-service';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, authLoading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    async function fetchProfile() {
      setProfileLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      setProfileLoading(false);
      if (!profile?.isAdmin) {
        router.replace('/dashboard');
      }
    }
    
    fetchProfile();
  }, [user, authLoading, router]);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
        <div className="space-y-4 p-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!userProfile?.isAdmin) {
     return (
        <div className="container mx-auto py-8">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view this page. You will be redirected to the dashboard.
                </AlertDescription>
            </Alert>
        </div>
     )
  }

  return <>{children}</>;
}
