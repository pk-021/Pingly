export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isOfficial: boolean;
  contact?: string;
  subject?: string;
};

export type Task = {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  completed: boolean;
};
