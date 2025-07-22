
import type { CalendarEvent, Task } from './types';
import { getDay } from 'date-fns';

// In a real application, this data would be fetched from a database or API.
// For now, we'll use mock data.

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

let classRoutine: CalendarEvent[] = [
  {
    id: 'cr1',
    title: 'CS101 Lecture',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
    roomNumber: 'A-101',
  },
  {
    id: 'cr2',
    title: 'Office Hours',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    roomNumber: 'Faculty Office 21B',
  },
  {
    id: 'cr3',
    title: 'Faculty Board Meeting',
    startTime: new Date(new Date(tomorrow).setHours(15, 0, 0, 0)),
    endTime: new Date(new Date(tomorrow).setHours(16, 30, 0, 0)),
    roomNumber: 'Conference Hall A',
  },
];


let mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Grade Midterm Exams',
    description: 'Go through all the papers from the CS101 midterm exam and upload the grades to the portal.',
    priority: 'High',
    dueDate: today,
    startTime: new Date(new Date().setHours(16, 0, 0, 0)),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)),
    completed: false,
  },
  {
    id: 't2',
    title: 'Prepare slides for CS202',
    description: 'Create a new presentation for the upcoming lecture on Advanced Algorithms.',
    priority: 'Medium',
    dueDate: nextWeek,
    completed: false,
  },
  {
    id: 't3',
    title: 'Submit research paper draft',
    description: 'Finalize the draft for the paper on "Quantum Computing Applications" and submit it to the journal.',
    priority: 'High',
    dueDate: new Date(new Date().setDate(today.getDate() + 3)),
    completed: false,
  },
  {
    id: 't4',
    title: 'Update course website',
    description: 'Upload the latest syllabus and add the new lecture notes for week 5.',
    priority: 'Low',
    dueDate: nextWeek,
    completed: true,
    completionNotes: 'Updated syllabus and added new lecture notes.',
    completionPhotos: ['https://placehold.co/400x300.png']
  },
  {
    id: 't5',
    title: 'Review student applications',
    description: 'Go through the new applications for the research assistant position.',
    priority: 'Medium',
    dueDate: new Date(new Date().setDate(today.getDate() + 5)),
    completed: false,
  },
  {
    id: 'ue1',
    title: 'Project Phoenix Meeting',
    description: 'Strategy meeting for the upcoming Project Phoenix launch.',
    priority: 'Medium',
    dueDate: today,
    startTime: new Date(new Date().setHours(11, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    roomNumber: 'Library Room 3',
    completed: false,
  },
  {
    id: 'ue2',
    title: 'Dentist Appointment',
    description: 'Annual check-up.',
    priority: 'Medium',
    dueDate: tomorrow,
    startTime: new Date(new Date(tomorrow).setHours(11, 0, 0, 0)),
    endTime: new Date(new Date(tomorrow).setHours(12, 0, 0, 0)),
    completed: false,
  },
];


// Simulate API calls
export async function getClassRoutine(): Promise<CalendarEvent[]> {
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve(classRoutine);
}

export async function getTasks(): Promise<Task[]> {
  await new Promise(res => setTimeout(res, 500));
  return Promise.resolve(mockTasks);
}

export async function addTask(task: Omit<Task, 'id' | 'completed'>): Promise<Task> {
    await new Promise(res => setTimeout(res, 300));
    const newTask: Task = {
        ...task,
        id: `t${Date.now()}`,
        completed: false,
    };
    mockTasks.push(newTask);
    return Promise.resolve(newTask);
}

export async function updateTask(updatedTask: Task): Promise<Task> {
    await new Promise(res => setTimeout(res, 300));
    const index = mockTasks.findIndex(t => t.id === updatedTask.id);
    if (index === -1) {
        throw new Error("Task not found");
    }
    mockTasks[index] = updatedTask;
    return Promise.resolve(updatedTask);
}

export async function deleteTask(taskId: string): Promise<{ success: true }> {
    await new Promise(res => setTimeout(res, 300));
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index === -1) {
        throw new Error("Task not found");
    }
    mockTasks.splice(index, 1);
    return Promise.resolve({ success: true });
}

export async function addRoutineEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await new Promise(res => setTimeout(res, 300));
    const newEvent: CalendarEvent = {
        ...event,
        id: `cr${Date.now()}`,
    };
    classRoutine.push(newEvent);
    return Promise.resolve(newEvent);
}

export async function updateRoutineEvent(updatedEvent: CalendarEvent): Promise<CalendarEvent> {
    await new Promise(res => setTimeout(res, 300));
    const index = classRoutine.findIndex(e => e.id === updatedEvent.id);
    if (index === -1) {
        throw new Error("Event not found");
    }
    classRoutine[index] = updatedEvent;
    return Promise.resolve(updatedEvent);
}

export async function deleteRoutineEvent(eventId: string): Promise<{ success: true }> {
    await new Promise(res => setTimeout(res, 300));
    const index = classRoutine.findIndex(e => e.id === eventId);
    if (index === -1) {
        throw new Error("Event not found");
    }
    classRoutine.splice(index, 1);
    return Promise.resolve({ success: true });
}
