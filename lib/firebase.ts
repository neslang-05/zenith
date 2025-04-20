// lib/firebase.ts

import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app'; // Import getApps and getApp
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    Auth,
    UserCredential,
    onAuthStateChanged
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
    serverTimestamp,
    Timestamp,
    Firestore,
    DocumentData,
    DocumentReference,
    QuerySnapshot,
    limit,
    orderBy
} from 'firebase/firestore';

// --- Environment Variables for Firebase Config (Recommended) ---
// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// };

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
// This is important for Next.js with Hot Module Replacement (HMR)
let app: FirebaseApp;
if (getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized.");
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // If initialization fails, subsequent calls will likely fail too.
        // You might want more robust error handling depending on your app's needs.
        throw new Error("Could not initialize Firebase. Please check configuration.");
    }
} else {
    // If already initialized, use the existing app
    app = getApp();
    console.log("Firebase app already exists.");
}


// --- Initialize Firebase Services ---
// Now 'app' is guaranteed to be assigned if no error was thrown during initialization
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);


// --- Authentication Functions ---

/**
 * Registers a new user AUTHENTICATION account. Profile creation is separate.
 */
export const registerWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Firebase Auth registration error:", error);
        throw error;
    }
};

/**
 * Signs in a user AUTHENTICATION account. Profile fetching is separate.
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
 * Sends a password reset email.
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
 * Signs out the current user.
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
 */
export const createUserProfile = async (
    uid: string,
    email: string,
    role: 'admin' | 'student',
    additionalData: Record<string, any> = {}
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const profileData = {
            uid,
            email,
            role,
            createdAt: serverTimestamp(),
            ...additionalData,
        };
        await setDoc(userDocRef, profileData, { merge: true });
        console.log(`User profile created/updated for UID: ${uid} with role: ${role}`);
    } catch (error) {
        console.error("Error creating/updating user profile:", error);
        throw error;
    }
};

/**
 * Fetches a user's profile data (including role) from Firestore.
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
 */
export const addResult = async (resultData: {
    studentUid: string;
    registrationNumber: string;
    subjectName: string;
    marks: number | string;
    examName: string;
    enteredBy: string;
    academicYear?: string;
    subjectCode?: string;
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
 */
export const getStudentResults = async (studentUid: string): Promise<(DocumentData & { id: string })[]> => {
    try {
        const resultsCollectionRef = collection(db, 'results');
        const q = query(
            resultsCollectionRef,
            where('studentUid', '==', studentUid),
            orderBy('timestamp', 'desc')
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
 * Finds a student user profile by their registration number.
 */
export const findStudentByRegNum = async (registrationNumber: string): Promise<(DocumentData & { id: string }) | null> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("role", "==", "student"),
            where("registrationNumber", "==", registrationNumber),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            return { id: studentDoc.id, ...studentDoc.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error finding student by registration number:", error);
        throw error;
    }
};

/**
 * Fetches all student user profiles.
 */
export const getAllStudents = async (): Promise<(DocumentData & { id: string })[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('role', '==', 'student'),
            orderBy('name', 'asc')
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


// --- Export initialized services and types/functions as needed ---
export { app, onAuthStateChanged, serverTimestamp, Timestamp };