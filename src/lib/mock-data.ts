import type { CalendarEvent, Task } from './types';

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'CS101 Lecture',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
    isOfficial: true,
    roomNumber: 'A-101',
  },
  {
    id: '2',
    title: 'Project Phoenix Meeting',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)), // Conflict with CS101
    endTime: new Date(new Date().setHours(11, 0, 0, 0)),
    isOfficial: false,
    roomNumber: 'Library Room 3',
  },
  {
    id: '3',
    title: 'Office Hours',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    isOfficial: true,
    roomNumber: 'Faculty Office 21B',
  },
  {
    id: '4',
    title: 'Dentist Appointment',
    startTime: new Date(new Date(tomorrow).setHours(11, 0, 0, 0)),
    endTime: new Date(new Date(tomorrow).setHours(12, 0, 0, 0)),
    isOfficial: false,
  },
    {
    id: '5',
    title: 'Faculty Board Meeting',
    startTime: new Date(new Date(tomorrow).setHours(15, 0, 0, 0)),
    endTime: new Date(new Date(tomorrow).setHours(16, 30, 0, 0)),
    isOfficial: true,
    roomNumber: 'Conference Hall A',
  },
];


export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Grade Midterm Exams',
    priority: 'High',
    dueDate: tomorrow,
    completed: false,
  },
  {
    id: 't2',
    title: 'Prepare slides for CS202',
    priority: 'Medium',
    dueDate: nextWeek,
    completed: false,
  },
  {
    id: 't3',
    title: 'Submit research paper draft',
    priority: 'High',
    dueDate: new Date(new Date().setDate(today.getDate() + 3)),
    completed: false,
  },
  {
    id: 't4',
    title: 'Update course website',
    priority: 'Low',
    dueDate: nextWeek,
    completed: true,
  },
  {
    id: 't5',
    title: 'Review student applications',
    priority: 'Medium',
    dueDate: new Date(new Date().setDate(today.getDate() + 5)),
    completed: false,
  }
];
