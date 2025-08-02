
'use client';

import type { CalendarEvent, Task, UserProfile } from './types';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    where, 
    query,
    Timestamp,
    writeBatch,
    setDoc
} from 'firebase/firestore';
import { auth, app } from './firebase';

const db = getFirestore(app);

// Helper to convert Firestore Timestamps to JS Dates in a task
function taskFromDoc(doc: any): Task {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        dueDate: (data.dueDate as Timestamp)?.toDate(),
        startTime: (data.startTime as Timestamp)?.toDate(),
        endTime: (data.endTime as Timestamp)?.toDate(),
    };
}

// Helper to convert Firestore Timestamps to JS Dates in a routine event
function routineFromDoc(doc: any): CalendarEvent {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        startTime: (data.startTime as Timestamp)?.toDate(),
        endTime: (data.endTime as Timestamp)?.toDate(),
    };
}


// --- User Management ---
export async function createUserProfile(user: { uid: string, email: string | null, displayName: string | null }): Promise<void> {
    const userRef = doc(db, "users", user.uid);
    const newUserProfile: Omit<UserProfile, 'id' | 'createdAt'> = {
        email: user.email || "",
        displayName: user.displayName || "New User",
        department: "",
    };
    // Use setDoc to create a document with a specific ID (the user's UID)
    await setDoc(userRef, {
        ...newUserProfile,
        createdAt: new Date(),
    });
}


// --- Task Management ---
export async function getTasks(): Promise<Task[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        const tasksRef = collection(db, "tasks");
        // Query for tasks created by the user OR assigned to the user
        const q = query(tasksRef, where('creatorId', '==', user.uid));
        // In a real scenario, you'd also query for tasks where assigneeId == user.uid
        // const qAssigned = query(tasksRef, where('assigneeId', '==', user.uid));
        // const [creatorTasksSnapshot, assignedTasksSnapshot] = await Promise.all([getDocs(q), getDocs(qAssigned)]);
        
        const querySnapshot = await getDocs(q);

        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            tasks.push(taskFromDoc(doc));
        });
        
        return tasks;
    } catch (error) {
        console.error("Error getting tasks: ", error);
        return [];
    }
}

export async function addTask(task: Omit<Task, 'id' | 'completed' | 'creatorId'>): Promise<Task> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newTaskData = {
        ...task,
        creatorId: user.uid,
        completed: false,
    };

    const docRef = await addDoc(collection(db, "tasks"), newTaskData);
    
    return {
        id: docRef.id,
        ...newTaskData,
    };
}

export async function updateTask(updatedTask: Task): Promise<Task> {
    const taskRef = doc(db, "tasks", updatedTask.id);
    // The 'id' is not stored in the Firestore document itself
    const { id, ...taskData } = updatedTask;
    await updateDoc(taskRef, taskData as any);
    return updatedTask;
}

export async function deleteTask(taskId: string): Promise<{ success: true }> {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    return { success: true };
}


// --- Class Routine Management ---
export async function getClassRoutine(): Promise<CalendarEvent[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        const routineRef = collection(db, "routines");
        const q = query(routineRef, where('creatorId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const routine: CalendarEvent[] = [];
        querySnapshot.forEach((doc) => {
            routine.push(routineFromDoc(doc));
        });

        return routine;
    } catch (error) {
        console.error("Error getting class routine: ", error);
        return [];
    }
}

export async function addRoutineEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newEventData = {
        ...event,
        creatorId: user.uid,
    };

    const docRef = await addDoc(collection(db, "routines"), newEventData);

    return {
        id: docRef.id,
        ...newEventData,
    };
}

export async function updateRoutineEvent(updatedEvent: CalendarEvent): Promise<CalendarEvent> {
    const eventRef = doc(db, "routines", updatedEvent.id);
    const { id, ...eventData } = updatedEvent;
    await updateDoc(eventRef, eventData as any);
    return updatedEvent;
}

export async function deleteRoutineEvent(eventId: string): Promise<{ success: true }> {
    const eventRef = doc(db, "routines", eventId);
    await deleteDoc(eventRef);
    return { success: true };
}
