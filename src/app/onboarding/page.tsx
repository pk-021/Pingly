
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { completeOnboarding, getUserProfile } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { setHours, setMinutes, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const routineEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dayOfWeek: z.string().min(1, 'Day is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  roomNumber: z.string().optional(),
}).refine(data => {
    if (!data.startTime || !data.endTime) return true;
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    return startHour < endHour || (startHour === endHour && startMinute < endMinute);
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

const onboardingSchema = z.object({
  department: z.string().min(2, 'Department is required'),
  routine: z.array(routineEventSchema).min(1, 'Please add at least one routine event.'),
});

const weekDays = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
];

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}).filter(time => {
    const hour = parseInt(time.split(':')[0], 10);
    return hour >= 6 && hour < 23;
});


export default function OnboardingPage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
    if (!authLoading && user) {
        getUserProfile(user.uid).then(profile => {
            if (profile?.hasCompletedOnboarding) {
                router.replace('/dashboard');
            }
        });
    }
  }, [user, authLoading, router]);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      department: '',
      routine: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'routine',
  });

  const onSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const routineEvents = values.routine.map(event => {
        const today = startOfDay(new Date());
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);
        
        return {
            title: event.title,
            dayOfWeek: parseInt(event.dayOfWeek, 10),
            startTime: setMinutes(setHours(today, startHour), startMinute),
            endTime: setMinutes(setHours(today, endHour), endMinute),
            roomNumber: event.roomNumber || '',
        };
      });

      await completeOnboarding(user.uid, values.department, routineEvents);
      router.replace('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
      // You could show a toast message here
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
             <div className="w-full max-w-4xl p-8 space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-10 w-32 ml-auto" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome to Pingly!</CardTitle>
          <CardDescription>Let's set up your profile. Please provide your department and weekly class routine.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Label className="text-lg">Weekly Class Routine</Label>
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <FormField
                        control={form.control}
                        name={`routine.${index}.title`}
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2">
                            <FormLabel>Class/Event Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Data Structures" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`routine.${index}.dayOfWeek`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {weekDays.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`routine.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`routine.${index}.endTime`}
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`routine.${index}.roomNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room (Opt.)</FormLabel>
                            <FormControl><Input placeholder="e.g., A-101" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                     <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ title: '', dayOfWeek: '', startTime: '', endTime: '', roomNumber: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Class
                </Button>
                <FormMessage>{form.formState.errors.routine?.message}</FormMessage>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
