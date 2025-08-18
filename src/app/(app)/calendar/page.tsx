
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTasks, addTask, updateTask, deleteTask, getClassRoutine } from '@/lib/data-service';
import { getNepaliHolidays } from '@/lib/nepali-data-service';
import type { CalendarEvent, Task, NepaliHoliday } from '@/lib/types';
import { TaskDialog } from '@/components/task-dialog';
import { useToast } from '@/hooks/use-toast';
import { DailySchedulePanel } from '@/components/calendar/daily-schedule-panel';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [classRoutine, setClassRoutine] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nepaliHolidays, setNepaliHolidays] = useState<NepaliHoliday[]>([]);
  const { toast } = useToast();

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [showNepaliCalendar, setShowNepaliCalendar] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const setting = localStorage.getItem('nepali-calendar-enabled') === 'true';
    setShowNepaliCalendar(setting);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      const promises: [Promise<Task[]>, Promise<CalendarEvent[]>, Promise<NepaliHoliday[]>?] = [getTasks(), getClassRoutine()];
      if (showNepaliCalendar) {
          promises.push(getNepaliHolidays());
      }
      const [fetchedTasks, fetchedClassRoutine, fetchedHolidays] = await Promise.all(promises);
      
      setTasks(fetchedTasks as Task[]);
      setClassRoutine(fetchedClassRoutine as CalendarEvent[]);
      if (fetchedHolidays) {
          setNepaliHolidays(fetchedHolidays as NepaliHoliday[]);
      } else {
          setNepaliHolidays([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [showNepaliCalendar, isClient]);

  const handleTaskDialogClose = () => {
    setIsTaskDialogOpen(false);
    setSelectedTask(undefined);
  }

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'creatorId'> | Task) => {
    try {
      if ('id' in taskData && taskData.id) {
        await updateTask(taskData as Task);
        toast({ title: "Task Updated", description: "Your task has been successfully updated." });
      } else {
        await addTask(taskData as Omit<Task, 'id' | 'creatorId' | 'completed'>);
        toast({ title: "Task Added", description: "Your new task has been successfully added." });
      }
      if (isClient) {
        // Re-trigger the data loading effect
        const setting = localStorage.getItem('nepali-calendar-enabled') === 'true';
        setShowNepaliCalendar(setting);
      }
      handleTaskDialogClose();
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to save the task." });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
        await deleteTask(taskId);
        toast({ title: "Task Deleted", description: "The task has been removed." });
        if (isClient) {
           // Re-trigger the data loading effect
          const setting = localStorage.getItem('nepali-calendar-enabled') === 'true';
          setShowNepaliCalendar(setting);
        }
        handleTaskDialogClose();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete the task." });
    }
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  }

  const handleAddTaskClick = () => {
    setSelectedTask(undefined);
    setIsTaskDialogOpen(true);
  }
  
  if (!isClient) {
    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full w-full">
            <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[70vh] w-full" />
            </div>
            <div className="w-full lg:w-[400px]">
                 <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
  }

  return (
    <>
      <TaskDialog 
        isOpen={isTaskDialogOpen}
        onClose={handleTaskDialogClose}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        task={selectedTask}
        routine={classRoutine}
        tasks={tasks}
      />
      <div className="flex flex-col lg:flex-row gap-8 h-full w-full">
        <div className="flex-1 flex flex-col h-full w-full bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-headline">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddTaskClick}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => { setCurrentDate(new Date()); setSelectedDate(startOfDay(new Date())); }}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            tasks={tasks}
            holidays={nepaliHolidays}
            onDateClick={setSelectedDate}
          />
        </div>

        <div className="w-full lg:w-[400px] lg:max-w-[40%] flex-shrink-0">
          <DailySchedulePanel
            selectedDate={selectedDate}
            tasks={tasks}
            routine={classRoutine}
            holidays={nepaliHolidays}
            isLoading={isLoading}
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>
    </>
  );
}
