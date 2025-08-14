

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Task, CalendarEvent, DisplayItem, UserProfile } from '@/lib/types';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, addHours, startOfDay, setHours, setMinutes, getHours, getMinutes, isSameDay, getDay } from 'date-fns';
import { CalendarIcon, Trash2, Pencil, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { getAllUsers } from '@/lib/data-service';
import { auth } from '@/lib/firebase';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']),
  category: z.string().optional(),
  dueDate: z.date({ required_error: 'Due date is required' }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  completionNotes: z.string().optional(),
  roomNumber: z.string().optional(),
  isRecurring: z.boolean().optional(),
  assigneeId: z.string().optional(),
}).refine(data => {
    if (data.startTime && !data.endTime) return false;
    if (!data.startTime && data.endTime) return false;
    if (data.startTime && data.endTime) {
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            return false;
        }
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});


type TaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'creatorId'> | Task) => void;
  onDelete: (taskId: string) => void;
  task?: Task;
  routine: CalendarEvent[];
  tasks: Task[];
};

const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
const slotDuration = 30; // in minutes

function getAvailableSlots(date: Date, allItems: (Task | CalendarEvent)[], currentTaskId?: string) {
    const startOfWorkDay = setMinutes(setHours(startOfDay(date), workingHours.start), 0);
    const endOfWorkDay = setMinutes(setHours(startOfDay(date), workingHours.end), 0);
    
    const itemsForDay = allItems
        .filter(item => ('id' in item && item.id !== currentTaskId)) // Exclude current task from conflict check
        .filter(item => {
            if ('dayOfWeek' in item) { // It's a CalendarEvent (routine)
                return item.dayOfWeek === getDay(date);
            }
            if ('dueDate' in item) { // It's a Task
                return isSameDay(item.dueDate, date) && item.startTime;
            }
            return false;
        });

    const slots = [];
    let currentTime = startOfWorkDay;

    while (currentTime < endOfWorkDay) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
        
        let conflict = itemsForDay.some(item => {
            const itemStartTime = 'dayOfWeek' in item ? setMinutes(setHours(startOfDay(date), getHours(item.startTime)), getMinutes(item.startTime)) : item.startTime!;
            const itemEndTime = 'dayOfWeek' in item ? setMinutes(setHours(startOfDay(date), getHours(item.endTime)), getMinutes(item.endTime)) : item.endTime!;
            return currentTime < itemEndTime && slotEnd > itemStartTime;
        });

        if (!conflict) {
            slots.push({
                start: new Date(currentTime),
                end: slotEnd,
            });
        }
        currentTime = slotEnd;
    }
    return slots;
}


export function TaskDialog({ isOpen, onClose, onSave, onDelete, task, routine, tasks }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(!task);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function fetchUsers() {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
    }
    if (isOpen) {
        fetchUsers();
    }
  }, [isOpen]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
      dueDate: new Date(),
      startTime: '',
      endTime: '',
      completionNotes: '',
      roomNumber: '',
      isRecurring: false,
      assigneeId: '',
    },
  });

  const watchedDueDate = useWatch({ control: form.control, name: 'dueDate' });

  const availableSlots = useMemo(() => {
    if (!watchedDueDate) return { startSlots: [], endSlots: [] };
    const allItems = [...routine, ...tasks];
    const slots = getAvailableSlots(watchedDueDate, allItems, task?.id);
    return {
        startSlots: slots.map(s => s.start),
        endSlots: slots.map(s => s.end),
    };
  }, [watchedDueDate, routine, tasks, task?.id]);

  useEffect(() => {
    if (isOpen) {
        if (task) {
          form.reset({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            category: task.category || '',
            dueDate: task.dueDate,
            startTime: task.startTime ? format(task.startTime, 'HH:mm') : '',
            endTime: task.endTime ? format(task.endTime, 'HH:mm') : '',
            completionNotes: task.completionNotes || '',
            roomNumber: task.roomNumber || '',
            isRecurring: task.isRecurring || false,
            assigneeId: task.assigneeId || '',
          });
          setIsEditing(false);
        } else {
          form.reset({
            title: '',
            description: '',
            priority: 'Medium',
            category: 'Personal',
            dueDate: new Date(),
            startTime: '',
            endTime: '',
            completionNotes: '',
            roomNumber: '',
            isRecurring: false,
            assigneeId: '',
          });
          setIsEditing(true);
        }
    }
  }, [task, isOpen, form]);
  
  const handleSave = (data: z.infer<typeof taskSchema>) => {
    const { startTime, endTime, ...restData } = data;
    let finalTaskData: Omit<Task, 'id' | 'completed' | 'creatorId'> | Task = { ...task, ...restData, completed: task?.completed || false };
    
    if (startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startDateTime = setMinutes(setHours(data.dueDate, startHour), startMinute);
        const endDateTime = setMinutes(setHours(data.dueDate, endHour), endMinute);
        
        finalTaskData = { ...finalTaskData, startTime: startDateTime, endTime: endDateTime };
    } else {
        finalTaskData = { ...finalTaskData, startTime: undefined, endTime: undefined };
    }

    onSave(finalTaskData as Task);
  };
  
  const handleMarkComplete = () => {
    if (task) {
        const formData = form.getValues();
        handleSave({
            ...formData,
            completed: true, 
        } as any);
    }
  };

  const assignee = users.find(u => u.id === task?.assigneeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
             <DialogTitle>{task ? (isEditing ? 'Edit Task' : 'Task Details') : 'Add New Task'}</DialogTitle>
             {task && !task.completed && !isEditing && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
             )}
          </div>
        </DialogHeader>
        
        {isEditing ? (
             <Form {...form}>
             <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
               <FormField
                 control={form.control}
                 name="title"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Title</FormLabel>
                     <FormControl>
                       <Input placeholder="e.g., Grade Midterm Exams" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add more details about the task..." {...field} />
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
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Library Room 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={form.control}
                   name="priority"
                   render={({ field }) => (
                     <FormItem className="flex-1">
                       <FormLabel>Priority</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select priority" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="High">High</SelectItem>
                           <SelectItem value="Medium">Medium</SelectItem>
                           <SelectItem value="Low">Low</SelectItem>
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="dueDate"
                   render={({ field }) => (
                     <FormItem className="flex-1 flex flex-col">
                       <FormLabel>Due Date</FormLabel>
                       <Popover>
                         <PopoverTrigger asChild>
                           <FormControl>
                             <Button
                               variant={'outline'}
                               className={cn(
                                 'w-full justify-start text-left font-normal',
                                 !field.value && 'text-muted-foreground'
                               )}
                             >
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {field.value ? (
                                 format(field.value, 'PPP')
                               ) : (
                                 <span>Pick a date</span>
                               )}
                             </Button>
                           </FormControl>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                             mode="single"
                             selected={field.value}
                             onSelect={(date) => {
                                if (date) {
                                    field.onChange(date);
                                }
                                form.setValue('startTime', '');
                                form.setValue('endTime', '');
                             }}
                             initialFocus
                           />
                         </PopoverContent>
                       </Popover>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                </div>
                 <FormField
                   control={form.control}
                   name="assigneeId"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Assign to (Optional)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select a person" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="">Nobody (Personal Task)</SelectItem>
                           {users.map(user => (
                             <SelectItem key={user.id} value={user.id}>{user.displayName}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                {watchedDueDate && (
                    <div className="space-y-4 rounded-md border p-4">
                        <h4 className="flex items-center font-medium text-sm">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule Time (Optional)
                        </h4>
                        {availableSlots.startSlots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a start time" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableSlots.startSlots.map(slot => (
                                            <SelectItem key={slot.toISOString()} value={format(slot, 'HH:mm')}>
                                                {format(slot, 'p')}
                                            </SelectItem>
                                        ))}
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
                                        <SelectValue placeholder="Select an end time" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableSlots.endSlots
                                            .filter(slot => {
                                                const startTime = form.getValues('startTime');
                                                if (!startTime) return true;
                                                const [startHour, startMinute] = startTime.split(':').map(Number);
                                                const slotHour = getHours(slot);
                                                const slotMinute = getMinutes(slot);
                                                return slotHour > startHour || (slotHour === startHour && slotMinute > startMinute);
                                            })
                                            .map(slot => (
                                            <SelectItem key={slot.toISOString()} value={format(slot, 'HH:mm')}>
                                                {format(slot, 'p')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No available time slots for this day.</p>
                        )}
                    </div>
                )}
               <DialogFooter>
                 <DialogClose asChild>
                   <Button type="button" variant="ghost">Cancel</Button>
                 </DialogClose>
                 <Button type="submit">Save Task</Button>
               </DialogFooter>
             </form>
           </Form>
        ) : task ? (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleMarkComplete)} className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                        <p className={cn(task.completed && "line-through")}>{task.title}</p>
                    </div>

                    {task.description && (
                         <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="text-sm">{task.description}</p>
                        </div>
                    )}
                    
                    {task.roomNumber && (
                         <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                            <p className="text-sm">{task.roomNumber}</p>
                        </div>
                    )}
                    
                    {assignee ? (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                            <p className="text-sm">{assignee.displayName} {task.creatorId === auth.currentUser?.uid && "(You assigned)"}</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                            <p className="text-sm">Personal Task (Only you)</p>
                        </div>
                    )}


                    <div className="flex gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                            <p>{format(task.dueDate, 'PPP')}</p>
                        </div>
                         <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                            <p>{task.priority}</p>
                        </div>
                    </div>

                    {task.startTime && task.endTime && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Scheduled Time</h3>
                            <p>{format(task.startTime, 'p')} - {format(task.endTime, 'p')}</p>
                        </div>
                    )}

                    {task.completed ? (
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Completion Details</h3>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                                <p>{task.completionNotes || "No notes provided."}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4 border-t">
                             <FormField
                                control={form.control}
                                name="completionNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Completion Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Add any notes about the task completion..." {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <Button type="submit" className="w-full">Mark as Complete</Button>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="mr-auto">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete Task
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the task.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <DialogClose asChild><Button type="button" variant="ghost">Close</Button></DialogClose>
                        {task.completed && <Button type="submit" disabled>Completed</Button>}
                    </DialogFooter>
                </form>
            </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
