
'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createAnnouncement, getAllUsers } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '../ui/scroll-area';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  targetRoles: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one role.",
  }),
});

const roles = ['HoD', 'dHoD', 'MSc Coordinator', 'Lecturer', 'Non-Teaching Staff'];

export function CreateAnnouncementForm() {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [confirmationData, setConfirmationData] = React.useState<{title: string, content: string, recipients: UserProfile[]}>({ title: '', content: '', recipients: [] });

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      targetRoles: [],
    },
  });

  const handleSubmit = async (data: z.infer<typeof announcementSchema>) => {
    try {
      const allUsers = await getAllUsers();
      const recipients = allUsers.filter(user => data.targetRoles.includes(user.role));
      
      setConfirmationData({
          title: "Announcement Sent!",
          content: "The following users will now see the new announcement on their dashboard.",
          recipients: recipients,
      });
      
      await createAnnouncement(data);

      setShowConfirmation(true);
      
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem sending the announcement.',
      });
    }
  };

  return (
    <>
    <Card>
        <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>Compose and send a new message. This will appear on the dashboard for selected roles.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Department Meeting" {...field} />
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
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Write your announcement details here..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="targetRoles"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Target Roles</FormLabel>
                            <p className="text-sm text-muted-foreground">
                                Select which roles will receive this announcement.
                            </p>
                        </div>
                        {roles.map((role) => (
                            <FormField
                            key={role}
                            control={form.control}
                            name="targetRoles"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={role}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(role)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, role])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== role
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {role}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Announcement'}
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationData.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationData.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="max-h-60 w-full rounded-md border p-4">
             <div className="space-y-2">
                {confirmationData.recipients.map(user => (
                  <div key={user.id} className="text-sm">
                    <span className="font-medium">{user.displayName}</span>
                    <span className="text-muted-foreground ml-2">({user.email})</span>
                  </div>
                ))}
              </div>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConfirmation(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
