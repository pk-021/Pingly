
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Task } from '@/lib/types';
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
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Paperclip, Pencil } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  dueDate: z.date({ required_error: 'Due date is required' }),
  completionNotes: z.string().optional(),
});


type TaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  onDelete: (taskId: string) => void;
  task?: Task;
};

export function TaskDialog({ isOpen, onClose, onSave, onDelete, task }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(!task);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>(task?.completionPhotos || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      priority: task?.priority || 'Medium',
      dueDate: task?.dueDate || new Date(),
      completionNotes: task?.completionNotes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (task) {
          form.reset({
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
            completionNotes: task.completionNotes || ''
          });
          setAttachedPhotos(task.completionPhotos || []);
          setIsEditing(false);
        } else {
          form.reset({
            title: '',
            priority: 'Medium',
            dueDate: new Date(),
            completionNotes: ''
          });
          setAttachedPhotos([]);
          setIsEditing(true);
        }
    }
  }, [task, isOpen, form]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        const dataUrls = files.map(file => URL.createObjectURL(file));
        setAttachedPhotos(prev => [...prev, ...dataUrls]);
    }
  };

  const handleSave = (data: z.infer<typeof taskSchema>) => {
    onSave({ ...task, ...data });
  };
  
  const handleMarkComplete = () => {
    if (task) {
        const formData = form.getValues();
        onSave({ 
            ...task,
            ...formData,
            completed: true, 
            completionPhotos: attachedPhotos,
        });
    }
  };

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
               <div className="flex gap-4">
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
                             onSelect={field.onChange}
                             initialFocus
                           />
                         </PopoverContent>
                       </Popover>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>
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
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                        <p className={cn(task.completed && "line-through")}>{task.title}</p>
                    </div>
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

                    {task.completed ? (
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Completion Details</h3>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                                <p>{task.completionNotes || "No notes provided."}</p>
                            </div>
                            <div>
                                 <h4 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h4>
                                 {attachedPhotos.length > 0 ? (
                                    <div className="flex gap-2 flex-wrap">
                                        {attachedPhotos.map((photo, index) => (
                                            <Image key={index} src={photo} alt={`attachment ${index+1}`} width={80} height={80} className="rounded-md object-cover" />
                                        ))}
                                    </div>
                                 ) : <p>No photos attached.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4 border-t">
                             <h3 className="text-lg font-semibold">Mark as Complete</h3>
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
                            <div>
                                 <FormLabel>Attach Photos (Optional)</FormLabel>
                                 <div className="flex items-center gap-4 mt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <Paperclip className="mr-2 h-4 w-4"/>
                                        Add Photo
                                    </Button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                                    <span className="text-sm text-muted-foreground">{attachedPhotos.length} photo(s) attached</span>
                                 </div>
                                  {attachedPhotos.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {attachedPhotos.map((photo, index) => (
                                            <Image key={index} src={photo} alt={`attachment ${index+1}`} width={60} height={60} className="rounded-md object-cover" />
                                        ))}
                                    </div>
                                 )}
                            </div>
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
                        {!task.completed && <Button onClick={handleMarkComplete}>Mark as Complete</Button>}
                    </DialogFooter>
                </div>
            </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
