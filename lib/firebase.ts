import { initializeApp, FirebaseApp } from 'firebase/app'; // Import FirebaseApp type
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  Auth, // Import Auth type
  UserCredential // Import UserCredential type
} from 'firebase/auth';

// Your Firebase configuration object - KEEP THIS SECURE
// Consider using environment variables for sensitive keys like apiKey
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY", // Example using env var
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zenith-25.firebaseapp.com",
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zenith-25",
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zenith-25.appspot.com", // Corrected typical domain
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "958240095678",
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:958240095678:web:b3a6f2d6a08cd7e7948def",
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Q0MGCZGHR6" // Optional
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

// Initialize Firebase
let app: FirebaseApp;
try {
   app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase initialization error:", error);
    // Handle the error appropriately - maybe show a message to the user
    // or prevent the app from rendering further Firebase-dependent components.
    // For now, we'll rethrow but you might want a more graceful handling.
    throw new Error("Could not initialize Firebase. Please check configuration.");
}


// Get Auth instance
export const auth: Auth = getAuth(app);

/**
 * Registers a new user with email and password.
 * @param email - The user's email address.
 * @param password - The user's chosen password.
 * @returns A Promise resolving with the UserCredential on success.
 * @throws Throws an error on failure (e.g., email already in use, weak password).
 */
export const registerWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // --- Removed side effects ---
    // const token = await userCredential.user.getIdToken(); // Use getIdToken() for fresh token
    // localStorage.setItem('token', token); // Handle this in the component if needed
    // window.location.href = '/dashboard'; // Handle navigation in the component
    // ---
    return userCredential; // Return the full credential object
  } catch (error) {
    console.error("Firebase registration error:", error);
    // You might want to parse the error code here for more specific messages
    // e.g., if (error.code === 'auth/email-already-in-use') ...
    throw error; // Re-throw the error for the component to handle
  }
};

/**
 * Signs in a user with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A Promise resolving with the UserCredential on success.
 * @throws Throws an error on failure (e.g., wrong password, user not found).
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // --- Removed side effects ---
    // const token = await userCredential.user.getIdToken(); // Use getIdToken()
    // localStorage.setItem('token', token); // Handle this in the component if needed
    // ---
    return userCredential; // Return the full credential object
  } catch (error) {
    console.error("Firebase sign-in error:", error);
    throw error; // Re-throw the error for the component to handle
  }
};

/**
 * Sends a password reset email to the specified email address.
 * @param email - The email address to send the reset link to.
 * @returns A Promise resolving with void on success.
 * @throws Throws an error on failure (e.g., user not found).
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    // return true; // Not necessary, promise resolves on success
  } catch (error) {
    console.error("Firebase password reset error:", error);
    throw error; // Re-throw the error for the component to handle
  }
};

/**
 * Signs out the current user.
 * @returns A Promise resolving with void on success.
 * @throws Throws an error on failure.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    // localStorage.removeItem('token'); // Handle this in the component if needed
    // return true; // Not necessary, promise resolves on success
  } catch (error) {
    console.error("Firebase sign out error:", error);
    throw error; // Re-throw the error for the component to handle
  }
};

// Export the initialized app instance if you need it for other Firebase services (Firestore, Storage, etc.)
export { app };

// The default export is usually not needed when using named exports like this.
// export default { auth, app };