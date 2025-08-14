

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
  assigneeId?: string | null;
  category?: string;
  isRecurring?: boolean;
  createdAt: Date;
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
    role: 'HoD' | 'dHoD' | 'MSc Coordinator' | 'Lecturer' | 'Non-Teaching Staff';
    isAdmin: boolean;
}

export type Announcement = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    targetRoles: string[];
}
    

    