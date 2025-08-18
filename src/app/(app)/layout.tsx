
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app-sidebar-content';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserProfile } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    getUserProfile(user.uid).then(userProfile => {
        if (userProfile) {
            setProfile(userProfile);
            if (!userProfile.hasCompletedOnboarding) {
                router.replace('/onboarding');
            }
        }
        setProfileLoading(false);
    });
  }, [user, loading, router]);

  const isLoading = loading || profileLoading;

  if (isLoading) {
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

  // This check is important to prevent a flash of the app layout before redirecting.
  // We only render the layout if there is a user who has completed onboarding.
  if (!user || !profile?.hasCompletedOnboarding) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <AppSidebarContent />
        </Sidebar>
        <SidebarInset className='flex-1'>
          <div className="p-4 sm:p-6 lg:p-8 h-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
