
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addAnnouncement, getUserProfile } from '@/lib/data-service';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import type { UserProfile, Announcement as AnnouncementType } from '@/lib/types';

const announcementSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long.'),
    content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

export default function AnnouncementsPage() {
    const [user, loading] = useAuthState(auth);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    useEffect(() => {
        async function checkAdminStatus() {
            if (loading) return;
            if (!user) {
                router.replace('/login');
                return;
            }
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
            if (!profile?.isAdmin) {
                toast({ variant: 'destructive', title: 'Access Denied', description: 'You are not authorized to view this page.' });
                router.replace('/dashboard');
            }
        }
        checkAdminStatus();
    }, [user, loading, router, toast]);

    const handleSendAnnouncement = async (data: z.infer<typeof announcementSchema>) => {
        try {
            await addAnnouncement(data);
            toast({ title: 'Announcement Sent', description: 'Your announcement has been published.' });
            form.reset();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send announcement.' });
        }
    };
    
    if (loading || !userProfile?.isAdmin) {
        return <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div>;
    }

    return (
        <div className="space-y-8">
             <div className="flex items-center gap-4">
              <Megaphone className="w-10 h-10 text-primary"/>
              <div>
                  <h1 className="text-3xl font-headline text-primary">Post an Announcement</h1>
                  <p className="text-muted-foreground">This message will be visible to everyone in the organization on their dashboard.</p>
              </div>
          </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Announcement</CardTitle>
                    <CardDescription>Compose a message to be broadcast to all users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSendAnnouncement)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Upcoming Holiday" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Write your announcement details here..." className="min-h-[150px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Sending...' : 'Send Announcement'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

