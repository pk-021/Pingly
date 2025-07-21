export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isOfficial: boolean;
  roomNumber?: string;
};

export type Task = {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  completed: boolean;
  completionNotes?: string;
  completionPhotos?: string[];
};

export type DisplayItem = CalendarEvent | Task;
