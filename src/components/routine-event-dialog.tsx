
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, setHours, setMinutes, getHours, getMinutes, getDay, startOfDay } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  roomNumber: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine(data => {
    if (!data.startTime || !data.endTime) return true;
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        return false;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

type RoutineEventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  event?: CalendarEvent;
  selectedDate?: Date;
  routine: CalendarEvent[];
};

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

export function RoutineEventDialog({ isOpen, onClose, onSave, onDelete, event, selectedDate, routine }: RoutineEventDialogProps) {
  
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      roomNumber: '',
      startTime: '',
      endTime: '',
    },
  });

  const dayForConflictCheck = useMemo(() => {
    return event ? event.dayOfWeek : (selectedDate ? getDay(selectedDate) : undefined);
  }, [event, selectedDate]);

  const availableStartSlots = useMemo(() => {
    if (dayForConflictCheck === undefined) return timeSlots;
    
    const routineForDay = routine.filter(r => r.dayOfWeek === dayForConflictCheck && r.id !== event?.id);
    
    return timeSlots.filter(slot => {
        const [hour, minute] = slot.split(':').map(Number);
        const slotTime = hour * 60 + minute;
        return !routineForDay.some(r => {
            const start = getHours(r.startTime) * 60 + getMinutes(r.startTime);
            const end = getHours(r.endTime) * 60 + getMinutes(r.endTime);
            return slotTime >= start && slotTime < end;
        });
    });
  }, [routine, dayForConflictCheck, event?.id]);
  
  const availableEndSlots = useMemo(() => {
      const startTime = form.watch('startTime');
      if (!startTime || dayForConflictCheck === undefined) return timeSlots;

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      
      const routineForDay = routine.filter(r => r.dayOfWeek === dayForConflictCheck && r.id !== event?.id);
      
      const nextEvent = routineForDay
          .map(r => getHours(r.startTime) * 60 + getMinutes(r.startTime))
          .filter(time => time > startTimeInMinutes)
          .sort((a,b) => a - b)[0];

      return timeSlots.filter(slot => {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTime = hour * 60 + minute;
          
          if (slotTime <= startTimeInMinutes) return false;
          if (nextEvent && slotTime > nextEvent) return false;

          return true;
      });

  }, [form, routine, dayForConflictCheck, event?.id]);


  useEffect(() => {
    if (isOpen) {
        if (event) {
          form.reset({
            title: event.title,
            roomNumber: event.roomNumber || '',
            startTime: format(event.startTime, 'HH:mm'),
            endTime: format(event.endTime, 'HH:mm'),
          });
        } else {
          form.reset({
            title: '',
            roomNumber: '',
            startTime: '',
            endTime: '',
          });
        }
    }
  }, [event, isOpen, form]);
  
  const handleSave = (data: z.infer<typeof eventSchema>) => {
    const dateToUse = selectedDate || startOfDay(new Date());
    
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const startDateTime = setMinutes(setHours(dateToUse, startHour), startMinute);
    
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const endDateTime = setMinutes(setHours(dateToUse, endHour), endMinute);

    const finalEventData = {
        ...event,
        ...data,
        dayOfWeek: getDay(dateToUse),
        startTime: startDateTime,
        endTime: endDateTime,
    };
    
    onSave(finalEventData as CalendarEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Routine Event' : 'Add Routine Event'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
         <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
           <FormField
             control={form.control}
             name="title"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Title</FormLabel>
                 <FormControl>
                   <Input placeholder="e.g., CS101 Lecture" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="roomNumber"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Room Number (Optional)</FormLabel>
                 <FormControl>
                   <Input placeholder="e.g., A-101" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('endTime', '');
                        }} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableStartSlots.length > 0 ? availableStartSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                    {format(new Date(`1970-01-01T${slot}:00`), 'p')}
                                </SelectItem>
                            )) : <SelectItem value="-" disabled>No available slots</SelectItem>}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('startTime')}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableEndSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                    {format(new Date(`1970-01-01T${slot}:00`), 'p')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
           <DialogFooter>
            {event && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" className="mr-auto">
                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this event from your routine.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(event.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
             <DialogClose asChild>
               <Button type="button" variant="ghost">Cancel</Button>
             </DialogClose>
             <Button type="submit">Save</Button>
           </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
}

    