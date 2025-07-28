
export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  roomNumber?: string;
  // Routines are now based on day of week, not a full date
  dayOfWeek?: number; // 0 for Sunday, 1 for Monday, etc.
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  completionNotes?: string;
  roomNumber?: string;
  creatorId: string;
  assigneeId?: string;
  category?: string;
  isRecurring?: boolean;
};

export type DisplayItem = CalendarEvent | Task;

export type NepaliHoliday = {
  date: Date;
  name: string;
};

export type UserProfile = {
    id: string;
    email: string;
    displayName: string;
    department?: string;
    createdAt: Date;
}
    
