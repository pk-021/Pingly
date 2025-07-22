export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  roomNumber?: string;
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
};

export type DisplayItem = CalendarEvent | Task;

export type NepaliHoliday = {
  date: Date;
  name: string;
};

    