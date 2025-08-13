
'use client';

import type { CalendarEvent, Task, UserProfile, Announcement } from './types';
import { 
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
    setDoc,
    getDoc,
    or
} from 'firebase/firestore';
import { auth, db } from './firebase';

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
    
    try {
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
            console.log("User profile already exists for:", user.uid);
            return;
        }

        console.log("Creating new user profile for:", user.uid);
        const newUserProfile: Omit<UserProfile, 'id' | 'createdAt' | 'isAdmin'> = {
            email: user.email || "",
            displayName: user.displayName || "New User",
            department: "",
        };
        
        await setDoc(userRef, {
            ...newUserProfile,
            createdAt: Timestamp.fromDate(new Date()),
            isAdmin: false,
        });
        console.log("Successfully created user profile for:", user.uid);

    } catch (error) {
        console.error("Error creating user profile:", error);
        // This will help diagnose permission issues
        alert("There was an error creating your user profile. Please check the console for details.");
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as UserProfile;
    }
    return null;
}

export async function getUsers(): Promise<UserProfile[]> {
    try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as UserProfile);
        });
        return users;
    } catch (error) {
        console.error("Error getting users: ", error);
        return [];
    }
}


// --- Task Management ---
export async function getTasks(): Promise<Task[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        const tasksRef = collection(db, "tasks");
        // Query for tasks created by the user OR assigned to the user
        const q = query(tasksRef, 
            or(
                where('creatorId', '==', user.uid),
                where('assigneeId', '==', user.uid)
            )
        );
        
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

    const { dueDate, startTime, endTime, ...rest } = task;

    const newTaskData: any = {
        ...rest,
        creatorId: user.uid,
        completed: false,
    };
    
    if (dueDate) newTaskData.dueDate = Timestamp.fromDate(dueDate);
    if (startTime) newTaskData.startTime = Timestamp.fromDate(startTime);
    if (endTime) newTaskData.endTime = Timestamp.fromDate(endTime);


    const docRef = await addDoc(collection(db, "tasks"), newTaskData);
    
    return {
        id: docRef.id,
        ...task,
        creatorId: user.uid,
        completed: false,
    };
}

export async function updateTask(updatedTask: Task): Promise<Task> {
    const taskRef = doc(db, "tasks", updatedTask.id);
    const { id, dueDate, startTime, endTime, ...taskData } = updatedTask;

    const dataToUpdate: any = { ...taskData };
    
    if (dueDate) dataToUpdate.dueDate = Timestamp.fromDate(dueDate);
    if (startTime) {
        dataToUpdate.startTime = Timestamp.fromDate(startTime);
    } else {
        dataToUpdate.startTime = null;
    }
    if (endTime) {
        dataToUpdate.endTime = Timestamp.fromDate(endTime);
    } else {
        dataToUpdate.endTime = null;
    }

    await updateDoc(taskRef, dataToUpdate);
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
    
    const { startTime, endTime, ...rest } = event;

    const newEventData = {
        ...rest,
        creatorId: user.uid,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
    };

    const docRef = await addDoc(collection(db, "routines"), newEventData);

    return {
        id: docRef.id,
        ...event,
        creatorId: user.uid,
    };
}

export async function updateRoutineEvent(updatedEvent: CalendarEvent): Promise<CalendarEvent> {
    const eventRef = doc(db, "routines", updatedEvent.id);
    const { id, startTime, endTime, ...eventData } = updatedEvent;
    await updateDoc(eventRef, {
        ...eventData,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
    });
    return updatedEvent;
}

export async function deleteRoutineEvent(eventId: string): Promise<{ success: true }> {
    const eventRef = doc(db, "routines", eventId);
    await deleteDoc(eventRef);
    return { success: true };
}


// --- Announcements ---
export async function getAnnouncements(): Promise<Announcement[]> {
    try {
        const announcementsRef = collection(db, "announcements");
        const q = query(announcementsRef);
        const querySnapshot = await getDocs(q);
        const announcements: Announcement[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            announcements.push({
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Announcement);
        });
        return announcements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error("Error getting announcements: ", error);
        return [];
    }
}

export async function addAnnouncement(announcement: Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'createdAt'>): Promise<Announcement> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newAnnouncementData = {
        ...announcement,
        authorId: user.uid,
        authorName: user.displayName || 'Admin',
        createdAt: Timestamp.fromDate(new Date()),
    };

    const docRef = await addDoc(collection(db, "announcements"), newAnnouncementData);
    
    return {
        id: docRef.id,
        ...newAnnouncementData
    } as Announcement;
}
