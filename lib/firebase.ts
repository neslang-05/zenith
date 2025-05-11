// lib/firebase.ts

import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    // Ensure this is imported for direct use/re-export
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    Auth,
    UserCredential,
    onAuthStateChanged // Keep this for use in components
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp, // Use server timestamp for consistency
    Timestamp, // Import Timestamp type if needed elsewhere
    Firestore,
    DocumentData,
    DocumentReference,
    QuerySnapshot,
    limit,
    orderBy // Optional for sorting
} from 'firebase/firestore';

<<<<<<< HEAD
// --- Environment Variables for Firebase Config (Recommended) ---
// Ensure these are set in your .env.local file
//const firebaseConfig = {
    // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Access prefixed variable
    // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// };
=======
//--- Environment Variables for Firebase Config (Recommended) ---
// 
>>>>>>> refs/remotes/origin/master
const firebaseConfig = {
    apiKey: "AIzaSyAsFtTuzBJ4mHfWWIO825x8tKBnOLzTY0U",
    authDomain: "zenith-25.firebaseapp.com",
    projectId: "zenith-25",
    storageBucket: "zenith-25.firebasestorage.app",
    messagingSenderId: "958240095678",
    appId: "1:958240095678:web:b3a6f2d6a08cd7e7948def",
    measurementId: "G-Q0MGCZGHR6"
  };



// --- Initialize Firebase App (Singleton Pattern) ---
// Check if Firebase App has already been initialized
// Important for Next.js with Hot Module Replacement (HMR)
let app: FirebaseApp;
if (getApps().length === 0) {
    try {
        if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
            throw new Error("Missing Firebase configuration. Check environment variables.");
        }
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized.");
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw new Error("Could not initialize Firebase. Please check configuration and environment variables.");
    }
} else {
    // If already initialized, use the existing app
    app = getApp();
    // console.log("Firebase app already exists."); // Less noisy console
}


// --- Initialize Firebase Services ---
// Ensure 'app' is valid before initializing services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);


// --- Authentication Functions ---

/**
 * [CUSTOM FUNCTION, e.g., for Admins] Registers a new user AUTHENTICATION account.
 * Profile creation is separate. Consider renaming if specific (e.g., registerAdminAuth).
 */
export const registerWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    try {
        // Directly uses the imported SDK function
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Firebase Auth registration error:", error);
        throw error; // Re-throw for component handling
    }
};

/**
 * [CUSTOM FUNCTION] Signs in a user AUTHENTICATION account. Profile fetching is separate.
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Firebase Auth sign-in error:", error);
        throw error;
    }
};

/**
 * [CUSTOM FUNCTION] Sends a password reset email.
 */
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Firebase password reset error:", error);
        throw error;
    }
};

/**
 * [CUSTOM FUNCTION] Signs out the current user.
 */
export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Firebase sign out error:", error);
        throw error;
    }
};


// --- Firestore Functions ---

/**
 * Creates or updates a user's profile document in Firestore.
 * Should be called after successful Auth registration/creation.
 * @param uid - The Firebase Auth User ID.
 * @param email - User's email.
 * @param role - 'admin' or 'student' or 'faculty'.
 * @param additionalData - Object containing role-specific data (e.g., { institutionName: 'MTU' } for admin, { name: 'John Doe', registrationNumber: '123' } for student).
 */
export const createUserProfile = async (
    uid: string,
    email: string,
    role: 'admin' | 'student' | 'faculty', // Added 'faculty'
    additionalData: Record<string, any> = {}
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const profileData = {
            uid, // Store uid in the document as well if needed for queries
            email,
            role,
            createdAt: serverTimestamp(), // Track creation time
            ...additionalData,
        };
        await setDoc(userDocRef, profileData, { merge: true }); // Use merge: true to avoid overwriting accidentally
        console.log(`User profile created/updated for UID: ${uid} with role: ${role}`);
    } catch (error) {
        console.error("Error creating/updating user profile:", error);
        throw error;
    }
};

/**
 * Fetches a user's profile data (including role) from Firestore.
 * @param uid - The Firebase Auth User ID.
 * @returns The user's profile data object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<DocumentData | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.warn(`No profile found for UID: ${uid}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

/**
 * Adds a result document to Firestore.
 * @param resultData - Object containing result details. Must include `studentUid`.
 */
export const addResult = async (resultData: {
    studentUid: string;
    registrationNumber: string; // Denormalized for easier admin views
    subjectName: string;
    marks: number | string; // Allow grade strings like 'A+'
    examName: string;
    enteredBy: string; // Admin's UID
    academicYear?: string; // Optional
    subjectCode?: string; // Optional
}): Promise<DocumentReference> => {
    try {
        const resultsCollectionRef = collection(db, 'results');
        const dataWithTimestamp = {
            ...resultData,
            timestamp: serverTimestamp(),
        };
        const docRef = await addDoc(resultsCollectionRef, dataWithTimestamp);
        console.log("Result added with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error adding result:", error);
        throw error;
    }
};

/**
 * Fetches all results for a specific student.
 * @param studentUid - The Firebase Auth UID of the student.
 * @returns An array of result data objects, including their Firestore document IDs.
 */
export const getStudentResults = async (studentUid: string): Promise<(DocumentData & { id: string })[]> => {
    try {
        const resultsCollectionRef = collection(db, 'results');
        // Query results where the studentUid field matches the logged-in student's UID
        const q = query(
            resultsCollectionRef,
            where('studentUid', '==', studentUid),
            orderBy('timestamp', 'desc') // Optional: Show newest results first
        );
        const querySnapshot = await getDocs(q);
        const results: (DocumentData & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });
        return results;
    } catch (error) {
        console.error("Error fetching student results:", error);
        throw error;
    }
};


/**
 * Finds a student user profile by their registration number. (Helper for Admin)
 * @param registrationNumber - The student's unique registration number.
 * @returns The student's profile data object (including UID via id field) or null if not found.
 */
export const findStudentByRegNum = async (registrationNumber: string): Promise<(DocumentData & { id: string }) | null> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("role", "==", "student"),
            where("registrationNumber", "==", registrationNumber),
            limit(1) // Ensure only one result is returned
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            return { id: studentDoc.id, ...studentDoc.data() }; // id is the UID here
        } else {
            return null; // No student found with that registration number
        }
    } catch (error) {
        console.error("Error finding student by registration number:", error);
        throw error;
    }
};

/**
 * Fetches all student user profiles. (Helper for Admin)
 * @returns An array of student profile data objects, including their Firestore document IDs (which are their UIDs).
 */
export const getAllStudents = async (): Promise<(DocumentData & { id: string })[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('role', '==', 'student'),
            orderBy('name', 'asc') // Optional: sort by name
        );
        const querySnapshot = await getDocs(q);
        const students: (DocumentData & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            students.push({ id: doc.id, ...doc.data() });
        });
        return students;
    } catch (error) {
        console.error("Error fetching all students:", error);
        throw error;
    }
};


// --- Export initialized services and specific SDK functions/types as needed ---
export {
    app,
    onAuthStateChanged,
    serverTimestamp,
    Timestamp,
    // --- Re-export the original SDK function for direct use ---
    // This allows components like ManageStudentsPage to import and use it
    // directly via `import { createUser... } from '../lib/firebase'`
    createUserWithEmailAndPassword
};
// Note: Exporting `auth` and `db` directly above is usually preferred over default exports.