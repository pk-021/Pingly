

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
import { getFirebaseApp } from './firebase';

const { auth, db } = getFirebaseApp();


// Helper to convert Firestore Timestamps to JS Dates in a task
function taskFromDoc(doc: any): Task {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        dueDate: (data.dueDate as Timestamp)?.toDate(),
        startTime: (data.startTime as Timestamp)?.toDate(),
        endTime: (data.endTime as Timestamp)?.toDate(),
        createdAt: (data.createdAt as Timestamp)?.toDate(),
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
    if (!user.uid) {
        throw new Error("No UID provided, cannot create user profile.");
    }
    const userRef = doc(db, "users", user.uid);
    
    try {
        const userDocSnap = await getDoc(userRef);

        // Only create a profile if one doesn't already exist.
        if (userDocSnap.exists()) {
            console.log(`Profile for user ${user.uid} already exists. Skipping creation.`);
            return;
        }
        
        const newUserProfile: Omit<UserProfile, 'id' | 'createdAt' | 'isAdmin' | 'role'> = {
            email: user.email || "",
            displayName: user.displayName || "New User",
            department: "",
        };
        
        console.log(`Creating new profile for user ${user.uid}:`, newUserProfile);

        await setDoc(userRef, {
            ...newUserProfile,
            createdAt: Timestamp.fromDate(new Date()),
            isAdmin: false,
            role: 'Lecturer', // Default role
            hasCompletedOnboarding: false, // New flag
        });
        console.log(`Successfully created profile for user ${user.uid}.`);

    } catch (error) {
        console.error("Error in createUserProfile: ", error);
        throw new Error("Failed to create or check for user profile in database.");
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
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

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCollection = collection(db, "users");
    try {
        const querySnapshot = await getDocs(usersCollection);
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
        console.error("Error getting all users: ", error);
        return [];
    }
}


export async function updateUserRole(userId: string, newRole: UserProfile['role']): Promise<void> {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            role: newRole
        });
        console.log(`Successfully updated role for user ${userId} to ${newRole}.`);
    } catch (error) {
        console.error("Error updating user role: ", error);
        throw new Error("Failed to update user role in database.");
    }
}

export async function updateUserIsAdmin(userId: string, isAdmin: boolean): Promise<void> {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            isAdmin: isAdmin
        });
        console.log(`Successfully updated admin status for user ${userId} to ${isAdmin}.`);
    } catch (error: any) {
        console.error("Error updating user admin status: ", error);
        throw new Error("Failed to update user admin status in database.");
    }
}

export async function completeOnboarding(userId: string, department: string, routineEvents: Omit<CalendarEvent, 'id'>[]) {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) throw new Error("User not authenticated or mismatched ID.");

    const batch = writeBatch(db);

    // 1. Update the user's profile
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
        department: department,
        hasCompletedOnboarding: true,
    });

    // 2. Add all the routine events
    const routineCollection = collection(db, "routines");
    routineEvents.forEach(event => {
        const newEventRef = doc(routineCollection); // Auto-generates an ID
        const newEventData = {
            ...event,
            creatorId: userId,
            startTime: Timestamp.fromDate(event.startTime),
            endTime: Timestamp.fromDate(event.endTime),
        };
        batch.set(newEventRef, newEventData);
    });

    await batch.commit();
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

export async function createAnnouncement(announcement: { title: string; content: string; targetRoles: string[] }): Promise<Announcement> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newAnnouncementData = {
        title: announcement.title,
        content: announcement.content,
        targetRoles: announcement.targetRoles, // Include target roles
        authorId: user.uid,
        authorName: user.displayName || 'Admin',
        createdAt: Timestamp.fromDate(new Date()),
    };

    const docRef = await addDoc(collection(db, "announcements"), newAnnouncementData);

    // Return the created announcement with its generated ID
    return { id: docRef.id, ...newAnnouncementData, createdAt: newAnnouncementData.createdAt.toDate() } as Announcement;
}

export async function addTask(task: Omit<Task, 'id' | 'completed' | 'creatorId'>): Promise<Task> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const { dueDate, startTime, endTime, ...rest } = task;

    const newTaskData: any = {
        ...rest,
        creatorId: user.uid,
        completed: false,
        createdAt: Timestamp.fromDate(new Date()),
    };
    
    if (dueDate) newTaskData.dueDate = Timestamp.fromDate(dueDate);
    if (startTime) newTaskData.startTime = Timestamp.fromDate(startTime);
    if (endTime) newTaskData.endTime = Timestamp.fromDate(endTime);
    if (!task.assigneeId) {
        newTaskData.assigneeId = null;
    }


    const docRef = await addDoc(collection(db, "tasks"), newTaskData);
    
    return {
        id: docRef.id,
        ...task,
        creatorId: user.uid,
        completed: false,
        createdAt: newTaskData.createdAt.toDate(),
    };
}

export async function updateTask(updatedTask: Task): Promise<Task> {
    const taskRef = doc(db, "tasks", updatedTask.id);
    const { id, dueDate, startTime, endTime, createdAt, ...taskData } = updatedTask;

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
        const user = auth.currentUser;
        if (!user) return [];

        const userProfile = await getUserProfile(user.uid);
        // If the user has no profile or no role, they can't receive announcements.
        if (!userProfile || !userProfile.role) {
            return [];
        }

        const announcementsRef = collection(db, "announcements");
        // Query for announcements where the user's role is in the targetRoles array
        const q = query(announcementsRef, where('targetRoles', 'array-contains', userProfile.role));
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

export async function addAnnouncement(announcement: Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'targetRoles'>): Promise<Announcement> {
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
        ...newAnnouncementData,
        createdAt: newAnnouncementData.createdAt.toDate(),
    } as Announcement;
}

    
