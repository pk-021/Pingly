
'use client';
import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  eachDayOfInterval,
  startOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
} from 'date-fns';
import { Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, NepaliHoliday } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CalendarGridProps = {
  currentDate: Date;
  selectedDate: Date;
  tasks: Task[];
  holidays: NepaliHoliday[];
  onDateClick: (date: Date) => void;
};

const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

export function CalendarGrid({ currentDate, selectedDate, tasks, holidays, onDateClick }: CalendarGridProps) {
  const today = useMemo(() => new Date(), []);
  
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = addDays(start, 41); // Always 6 rows * 7 days = 42 days
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const grouped = tasks.reduce((acc, item) => {
        const date = item.dueDate;
        if (date) {
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
        }
        return acc;
    }, {} as Record<string, Task[]>);

    for (const dateKey in grouped) {
        grouped[dateKey].sort((a, b) => {
            const aTime = a.startTime;
            const bTime = b.startTime;
            if (aTime && bTime) return aTime.getTime() - bTime.getTime();
            if (aTime) return -1;
            if (bTime) return 1;
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    return grouped;
  }, [tasks]);

  const holidaysByDate = useMemo(() => {
    return holidays.reduce((acc, holiday) => {
      const dateKey = format(holiday.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(holiday);
      return acc;
    }, {} as Record<string, NepaliHoliday[]>);
  }, [holidays]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 text-center font-medium text-muted-foreground border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayHolidays = holidaysByDate[dateKey] || [];
          const dayTasks = tasksByDate[dateKey] || [];
          const isSaturday = getDay(day) === 6;
          const isHoliday = dayHolidays.length > 0 || isSaturday;
          
          return (
            <div
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={cn(
                'border-r border-b p-2 flex flex-col cursor-pointer transition-colors min-h-[120px]',
                isSameMonth(day, currentDate) ? 'bg-card' : 'bg-muted/50',
                !isSameMonth(day, currentDate) && 'text-muted-foreground',
                'hover:bg-secondary',
                isHoliday && 'bg-red-50 text-red-700',
                isSameDay(day, selectedDate) && 'bg-primary/10 ring-2 ring-primary'
              )}
            >
              <div className='flex justify-between items-start'>
                <div className="flex">
                  {dayHolidays.map(holiday => (
                    <Tooltip key={holiday.name}>
                      <TooltipTrigger asChild>
                        <Dot className={cn("text-red-500 -ml-2 -mt-1", !isHoliday && "text-red-500")} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{holiday.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                    isSameDay(day, today) && 'bg-primary text-primary-foreground',
                    isSameDay(day, today) && isHoliday && 'bg-red-600 text-white'
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto -mx-2 text-xs">
                <div className="space-y-1 px-2">
                  {dayTasks.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className={cn(
                          "p-1 rounded-md truncate",
                          item.startTime ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800",
                          item.completed && "line-through bg-gray-200 text-gray-500"
                      )}
                    >
                      {item.startTime ? `${format(item.startTime, 'HH:mm')} ` : ''}{item.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-muted-foreground truncate pl-1">
                      +{dayTasks.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  );
}
