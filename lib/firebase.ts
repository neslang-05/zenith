// lib/firebase.ts

import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    Auth,
    UserCredential,
    onAuthStateChanged,
    User // Import User type
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
    updateDoc,
    DocumentReference,
    QuerySnapshot,
    limit,
    orderBy,
    deleteDoc, // For potential future use
    writeBatch // For batch operations
} from 'firebase/firestore';
import { sendWelcomeEmailToStudent, sendWelcomeEmailToFaculty, sendMarksPublishedEmail, sendCourseRegistrationEmail } from './emailService';

//--- Environment Variables for Firebase Config (Recommended) ---
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};
// Replace "YOUR_..." with your actual Firebase config values or ensure .env.local is set up
// Fallbacks are provided for demonstration if .env variables are not found.

let app: FirebaseApp;
if (getApps().length === 0) {
    try {
        if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
            throw new Error("Missing Firebase configuration. Check environment variables or hardcoded values.");
        }
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized.");
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw new Error("Could not initialize Firebase. Please check configuration.");
    }
} else {
    app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage = getStorage(app); // Initialize Firebase Storage

// --- Authentication Functions (largely unchanged, but ensure createUserWithEmailAndPassword is exported) ---
export { createUserWithEmailAndPassword, onAuthStateChanged, Timestamp, serverTimestamp }; // Export necessary items

export const registerWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Firebase Auth registration error:", error);
        throw error;
    }
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Firebase Auth sign-in error:", error);
        throw error;
    }
};

export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Firebase password reset error:", error);
        throw error;
    }
};

export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error)
{
        console.error("Firebase sign out error:", error);
        throw error;
    }
};


// --- User Profile Functions ---
export const createUserProfile = async (
    uid: string,
    email: string,
    role: 'admin' | 'student' | 'faculty',
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

        // Send welcome email if requested
        if (additionalData.sendWelcomeEmail) {
            try {
                if (role === 'student') {
                    await sendWelcomeEmailToStudent(
                        additionalData.name,
                        email,
                        additionalData.initialPassword
                    );
                } else if (role === 'faculty') {
                    await sendWelcomeEmailToFaculty(
                        additionalData.name,
                        email,
                        additionalData.initialPassword
                    );
                }
                console.log(`Welcome email sent to ${email}`);
            } catch (emailError) {
                console.error("Error sending welcome email:", emailError);
                // Don't throw here - we want the user creation to succeed even if email fails
            }
        }
    } catch (error) {
        console.error("Error creating/updating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (uid: string): Promise<DocumentData | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (
    uid: string,
    dataToUpdate: Partial<DocumentData>
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { ...dataToUpdate, updatedAt: serverTimestamp() });
        console.log(`User profile updated for UID: ${uid}`);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
    const filePath = `profileImages/${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateUserProfile(uid, { photoURL });
    return photoURL;
};


// --- Student Specific ---
export const findStudentByRegNum = async (registrationNumber: string): Promise<(DocumentData & { id: string }) | null> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("role", "==", "student"),
            where("registrationNumber", "==", registrationNumber.toUpperCase()), // Ensure case-insensitivity if needed
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            return { id: studentDoc.id, ...studentDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error finding student by registration number:", error);
        throw error;
    }
};

export const getAllStudents = async (): Promise<(DocumentData & { id: string })[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'student'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all students:", error);
        throw error;
    }
};


// --- Faculty Specific ---
export const createFacultyProfile = async ( // Already existed, ensure it's used correctly
    uid: string,
    email: string,
    additionalData: Record<string, any> = {}
): Promise<void> => {
    await createUserProfile(uid, email, 'faculty', additionalData);
};

export const getAllFaculty = async (): Promise<(DocumentData & { id: string })[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'faculty'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all faculty:", error);
        throw error;
    }
};

// --- Course Management ---
export interface CourseData {
    courseName: string;
    courseCode: string;
    facultyUid: string;
    facultyName: string; // Denormalized
    academicYear?: string; // Make academicYear optional or ensure it's provided upon course creation
    description?: string;
    credits?: number;
    departmentId?: string; // New: Add departmentId
    semesterId?: string; // New: Add semesterId
    // any other course details
}
export const addCourse = async (courseData: CourseData): Promise<DocumentReference> => {
    try {
        const coursesCollectionRef = collection(db, 'courses');
        const dataWithTimestamp = { ...courseData, createdAt: serverTimestamp() };
        const docRef = await addDoc(coursesCollectionRef, dataWithTimestamp);
        console.log("Course added with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error adding course:", error);
        throw error;
    }
};

export const getAllCourses = async (): Promise<(CourseData & { id: string })[]> => {
    try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseData & { id: string }));
    } catch (error) {
        console.error("Error fetching all courses:", error);
        throw error;
    }
};

export const getCoursesByFaculty = async (facultyUid: string): Promise<(CourseData & { id: string })[]> => {
    try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('facultyUid', '==', facultyUid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseData & { id: string }));
    } catch (error) {
        console.error(`Error fetching courses for faculty ${facultyUid}:`, error);
        throw error;
    }
};

export const getCourseById = async (courseId: string): Promise<(CourseData & { id: string }) | null> => {
    try {
        const courseDocRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(courseDocRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as CourseData & { id: string } : null;
    } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error);
        throw error;
    }
};

export const getCoursesByDepartmentAndSemester = async (
    departmentId: string,
    semesterId: string
): Promise<(CourseData & { id: string })[]> => {
    try {
        const coursesRef = collection(db, 'courses');
        const q = query(
            coursesRef,
            where('departmentId', '==', departmentId),
            where('semesterId', '==', semesterId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseData & { id: string }));
    } catch (error) {
        console.error(`Error fetching courses for department ${departmentId} and semester ${semesterId}:`, error);
        throw error;
    }
};

// --- Student Course Registration ---
export const registerStudentForCourse = async (courseId: string, studentUid: string, studentName: string, registrationNumber: string): Promise<void> => {
    try {
        // Get course details first
        const courseDoc = await getCourseById(courseId);
        if (!courseDoc) throw new Error('Course not found');

        // Get student email
        const studentDoc = await getUserProfile(studentUid);
        if (!studentDoc) throw new Error('Student not found');

        // Store registration under course
        const registrationDocRef = doc(db, 'courses', courseId, 'registrations', studentUid);
        await setDoc(registrationDocRef, {
            studentName, // Denormalize for easier display
            registrationNumber, // Denormalize
            registeredAt: serverTimestamp()
        });

        // Store registration under student (optional, for student's view)
        const studentCourseRef = doc(db, 'users', studentUid, 'registeredCourses', courseId);
        await setDoc(studentCourseRef, { registeredAt: serverTimestamp() });

        // Send registration confirmation email
        try {
            await sendCourseRegistrationEmail(
                studentDoc.email,
                studentName,
                courseDoc.courseName,
                courseDoc.facultyName
            );
            console.log(`Course registration email sent to ${studentDoc.email}`);
        } catch (emailError) {
            console.error("Error sending course registration email:", emailError);
            // Don't throw here - we want the registration to succeed even if email fails
        }

        console.log(`Student ${studentUid} registered for course ${courseId}`);
    } catch (error) {
        console.error("Error registering student for course:", error);
        throw error;
    }
};

export const getRegisteredStudentsForCourse = async (courseId: string): Promise<(DocumentData & { id: string })[]> => {
    try {
        const registrationsRef = collection(db, 'courses', courseId, 'registrations');
        const q = query(registrationsRef, orderBy('registeredAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // id here is studentUid
    } catch (error) {
        console.error(`Error fetching registered students for course ${courseId}:`, error);
        throw error;
    }
};

export const getStudentRegisteredCourses = async (studentUid: string): Promise<(DocumentData & { id: string })[]> => {
    try {
        const registeredCoursesRef = collection(db, 'users', studentUid, 'registeredCourses');
        const q = query(registeredCoursesRef, orderBy('registeredAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const courseIds = querySnapshot.docs.map(doc => doc.id);
        const courseDetailsPromises = courseIds.map(id => getCourseById(id));
        const coursesWithDetails = (await Promise.all(courseDetailsPromises)).filter(c => c !== null);

        return coursesWithDetails as (CourseData & { id: string })[];
    } catch (error) {
        console.error(`Error fetching registered courses for student ${studentUid}:`, error);
        throw error;
    }
};

export const isStudentRegistered = async (courseId: string, studentUid: string): Promise<boolean> => {
    try {
        const registrationDocRef = doc(db, 'courses', courseId, 'registrations', studentUid);
        const docSnap = await getDoc(registrationDocRef);
        return docSnap.exists();
    } catch (error) {
        console.error(`Error checking registration status for student ${studentUid} in course ${courseId}:`, error);
        // Depending on rules, this might throw if document doesn't exist and read is denied.
        // Safely assume not registered on error, or re-throw.
        return false;
    }
};


// --- Marks Management ---
export interface MarksData {
    internalMarks?: number | string | null;
    midTermMarks?: number | string | null;
    endTermMarks?: number | string | null;
    internalPublished?: boolean;
    midTermPublished?: boolean;
    endTermPublished?: boolean;
    lastUpdatedByFaculty?: string; // UID of faculty
    facultyPublishedAt?: Timestamp;
    lastUpdatedByAdmin?: string; // UID of admin for end-term
    adminPublishedAt?: Timestamp;
    grade?: string | null; // Overall grade if calculated
}

// Faculty adds/updates internal or mid-term marks
export const upsertFacultyMarks = async (
    courseId: string,
    studentUid: string,
    marks: { internalMarks?: number | string; midTermMarks?: number | string },
    facultyUid: string
): Promise<void> => {
    try {
        const marksDocRef = doc(db, 'courses', courseId, 'marks', studentUid);
        const dataToUpdate: Partial<MarksData & { updatedAt: Timestamp }> = {
            ...marks,
            lastUpdatedByFaculty: facultyUid,
            updatedAt: serverTimestamp() as Timestamp
        };
        await setDoc(marksDocRef, dataToUpdate, { merge: true });
        console.log(`Faculty marks updated for student ${studentUid} in course ${courseId}`);
    } catch (error) {
        console.error("Error updating faculty marks:", error);
        throw error;
    }
};

// Faculty publishes internal or mid-term marks
export const publishFacultyMarks = async (
    courseId: string,
    studentUid: string,
    type: 'internal' | 'midTerm',
    facultyUid: string
): Promise<void> => {
    try {
        const marksDocRef = doc(db, 'courses', courseId, 'marks', studentUid);
        const updateData: Partial<MarksData> = {
            lastUpdatedByFaculty: facultyUid,
            facultyPublishedAt: serverTimestamp() as Timestamp
        };
        if (type === 'internal') updateData.internalPublished = true;
        if (type === 'midTerm') updateData.midTermPublished = true;

        await updateDoc(marksDocRef, updateData);

        // Get course and student details for email
        const [courseDoc, studentDoc] = await Promise.all([
            getCourseById(courseId),
            getUserProfile(studentUid)
        ]);

        if (courseDoc && studentDoc) {
            try {
                await sendMarksPublishedEmail(
                    studentDoc.email,
                    studentDoc.name,
                    courseDoc.courseName,
                    type === 'internal' ? 'Internal' : 'Mid-Term'
                );
                console.log(`Marks published email sent to ${studentDoc.email}`);
            } catch (emailError) {
                console.error("Error sending marks published email:", emailError);
                // Don't throw here - we want the marks publication to succeed even if email fails
            }
        }

        console.log(`${type} marks published by faculty for student ${studentUid} in course ${courseId}`);
    } catch (error) {
        console.error("Error publishing faculty marks:", error);
        throw error;
    }
};

// Admin adds/updates end-term marks
export const upsertAdminEndTermMarks = async (
    studentUid: string,
    courseId: string,
    marks: string,
    adminUid: string,
    courseName?: string
): Promise<void> => {
    try {
        const marksDocRef = doc(db, "studentMarks", studentUid, "courses", courseId);
        await setDoc(marksDocRef, {
            endTermMarks: marks,
            lastUpdatedByAdmin: adminUid,
            adminPublishedAt: serverTimestamp(),
            courseName: courseName,
            courseId: courseId,
            studentUid: studentUid
        }, { merge: true });
        console.log(`Admin end-term marks for student ${studentUid} in course ${courseId} upserted.`);
    } catch (error) {
        console.error("Error upserting admin end-term marks:", error);
        throw error;
    }
};

// Admin publishes end-term marks
export const publishAdminEndTermMarks = async (
    studentUid: string,
    courseId: string,
    marks: string,
    adminUid: string,
    courseName?: string
): Promise<void> => {
    try {
        const marksDocRef = doc(db, "studentMarks", studentUid, "courses", courseId);
        await updateDoc(marksDocRef, {
            endTermPublished: true,
            lastUpdatedByAdmin: adminUid,
            adminPublishedAt: serverTimestamp(),
            endTermMarks: marks,
            courseName: courseName,
            courseId: courseId,
            studentUid: studentUid
        });
        console.log(`Admin end-term marks for student ${studentUid} in course ${courseId} published.`);
    } catch (error) {
        console.error("Error publishing admin end-term marks:", error);
        throw error;
    }
};

// Get all marks for a student in a specific course
export const getStudentMarksForCourse = async (courseId: string, studentUid: string): Promise<(MarksData & { id: string }) | null> => {
    try {
        // Attempt to get marks from the main /courses/{courseId}/marks/{studentUid} path (for internal/mid-term)
        const facultyMarksRef = doc(db, 'courses', courseId, 'marks', studentUid);
        const facultyMarksSnap = await getDoc(facultyMarksRef);
        const facultyMarksData = facultyMarksSnap.exists() ? facultyMarksSnap.data() : {};

        // Attempt to get marks from the /studentMarks/{studentUid}/courses/{courseId} path (for admin end-term)
        const adminMarksRef = doc(db, 'studentMarks', studentUid, 'courses', courseId);
        const adminMarksSnap = await getDoc(adminMarksRef);
        const adminMarksData = adminMarksSnap.exists() ? adminMarksSnap.data() : {};

        // Merge marks data, with admin marks taking precedence for end-term related fields
        const mergedMarksData = {
            ...facultyMarksData,
            ...adminMarksData,
        } as MarksData;

        if (facultyMarksSnap.exists() || adminMarksSnap.exists()) {
            return { id: studentUid, ...mergedMarksData }; // Use studentUid as the ID for consistency
        }
        return null;
    } catch (error) {
        console.error(`Error fetching marks for student ${studentUid} in course ${courseId}:`, error);
        throw error;
    }
};

// Get all marks for all students in a specific course (for faculty/admin view)
export const getAllMarksForCourse = async (courseId: string): Promise<(MarksData & { studentUid: string; id: string })[]> => {
    try {
        const marksCollectionRef = collection(db, 'courses', courseId, 'marks');
        console.log(`[Firebase] Querying marks from path: courses/${courseId}/marks`);
        const q = query(marksCollectionRef, orderBy('studentUid', 'asc')); // Order by studentUid for consistency
        const querySnapshot = await getDocs(q);
        console.log(`[Firebase] Marks querySnapshot size: ${querySnapshot.size}`);
        if (querySnapshot.empty) {
            console.warn(`[Firebase] No marks found for courseId: ${courseId}. Query result is empty.`);
        }
        return querySnapshot.docs.map(doc => ({
            id: doc.id, // Explicitly add id
            studentUid: doc.id, // studentUid is also the doc.id in this subcollection
            ...doc.data()
        }) as MarksData & { studentUid: string; id: string });
    } catch (error: any) {
        console.error("[Firebase] Error fetching all marks for course:", error);
        throw error; // Re-throw to propagate error to the caller
    }
};

// --- Generic Result Management (Old system, can be deprecated or adapted) ---
// This was the `addResult` from the original problem. It's less structured than the new course-based marks.
// You might want to migrate data from this system or adapt its UI if it's still needed.
export interface GenericResultData {
    studentUid: string;
    registrationNumber: string;
    subjectName: string;
    marks: number | string;
    examName: string;
    enteredBy: string; // Admin's UID
    academicYear?: string;
    subjectCode?: string;
    timestamp?: Timestamp;
}

export const addGenericResult = async (resultData: Omit<GenericResultData, 'timestamp'>): Promise<DocumentReference> => {
    try {
        const resultsCollectionRef = collection(db, 'genericResults'); // Use a different collection name
        const dataWithTimestamp = { ...resultData, timestamp: serverTimestamp() };
        const docRef = await addDoc(resultsCollectionRef, dataWithTimestamp);
        console.log("Generic Result added with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error adding generic result:", error);
        throw error;
    }
};

export const getStudentGenericResults = async (studentUid: string): Promise<(GenericResultData & { id: string })[]> => {
    try {
        const resultsCollectionRef = collection(db, 'genericResults');
        const q = query(resultsCollectionRef, where('studentUid', '==', studentUid), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GenericResultData & { id: string }));
    } catch (error) {
        console.error("Error fetching student generic results:", error);
        throw error;
    }
};

// --- Student Results ---
export interface StudentResult extends DocumentData {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    internalMarks?: number | null;
    midTermMarks?: number | null;
    endTermMarks?: number | null;
    internalPublished?: boolean;
    midTermPublished?: boolean;
    endTermPublished?: boolean;
    grade?: string | null;
    semesterId?: string; // Add semesterId to the interface
    academicYear?: string; // Add academicYear to the interface
    semesterName?: string; // Add semesterName to the interface
}

export const getStudentResults = async (studentUid: string): Promise<StudentResult[]> => {
    try {
        // First get all courses the student is registered for
        const registeredCoursesRef = collection(db, 'users', studentUid, 'registeredCourses');
        const registeredCoursesSnap = await getDocs(registeredCoursesRef);
        
        // For each course, get the student's marks
        const resultsPromises = registeredCoursesSnap.docs.map(async (courseDoc) => {
            const courseId = courseDoc.id;
            
            // Attempt to get faculty-entered marks (internal, mid-term) from /courses/{courseId}/marks/{studentUid}
            const facultyMarksRef = doc(db, 'courses', courseId, 'marks', studentUid);
            const facultyMarksSnap = await getDoc(facultyMarksRef);
            const facultyMarksData = facultyMarksSnap.exists() ? facultyMarksSnap.data() : {};

            // Attempt to get admin-entered end-term marks from /studentMarks/{studentUid}/courses/{courseId}
            const adminMarksRef = doc(db, 'studentMarks', studentUid, 'courses', courseId);
            const adminMarksSnap = await getDoc(adminMarksRef);
            const adminMarksData = adminMarksSnap.exists() ? adminMarksSnap.data() : {};

            // Merge marks data, with admin marks taking precedence for end-term related fields
            const mergedMarksData = {
                ...facultyMarksData,
                ...adminMarksData, // This will override endTermMarks, endTermPublished etc. if present in adminMarksData
            };

            // Get course details (still needed from the main 'courses' collection)
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            const courseData = courseSnap.data() as CourseData | undefined;

            let semesterName: string | undefined;
            if (courseData?.departmentId && courseData?.semesterId) {
                const semesterDocRef = doc(db, 'departments', courseData.departmentId, 'semesters', courseData.semesterId);
                const semesterSnap = await getDoc(semesterDocRef);
                semesterName = semesterSnap.exists() ? semesterSnap.data()?.name : undefined;
            }

            if ((facultyMarksSnap.exists() || adminMarksSnap.exists()) && courseData) {
                return {
                    id: courseId, // Use courseId as the id for the result object
                    courseId,
                    courseName: courseData.courseName,
                    courseCode: courseData.courseCode,
                    semesterId: courseData.semesterId, // Include semesterId from courseData
                    academicYear: courseData.academicYear, // Include academicYear from courseData
                    semesterName, // Include semesterName
                    ...mergedMarksData,
                } as StudentResult;
            }
            return null;
        });
        
        const results = await Promise.all(resultsPromises);
        return results.filter((result): result is StudentResult => result !== null);
    } catch (error) {
        console.error("Error fetching student results:", error);
        throw error;
    }
};

// --- Admin User Creation Functions ---
export const createNewUserWithoutSigningOut = async (
    email: string,
    password: string,
    role: 'student' | 'faculty',
    additionalData: Record<string, any> = {}
): Promise<void> => {
    try {
        // Create a new auth instance for user creation
        const tempAuth = getAuth(initializeApp(firebaseConfig, 'tempAuth'));
        
        // Create the user with the temporary auth instance
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        const newUser = userCredential.user;

        // Create the user profile
        if (role === 'student') {
            await createUserProfile(newUser.uid, email, 'student', additionalData);
        } else {
            await createFacultyProfile(newUser.uid, email, additionalData);
        }

        // Delete the temporary app instance
        await tempAuth.signOut();

        console.log(`New ${role} created successfully with UID: ${newUser.uid}`);
    } catch (error) {
        console.error(`Error creating new ${role}:`, error);
        throw error;
    }
};

// Get all users (students, faculty, admins)
export const getAllUsers = async (): Promise<{ id: string; name?: string; email: string; role: string }[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
};

// Get all admins
export const getAllAdmins = async (): Promise<{ id: string; name?: string; email: string; role: string }[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'admin'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email as string,
            role: doc.data().role as string,
            name: doc.data().name as string || undefined, // name might be optional
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching all admins:", error);
        throw error;
    }
};

// --- Institution Structure Management ---
// Departments
export const getDepartments = async (): Promise<(DocumentData & { id: string, name: string })[]> => {
  const ref = collection(db, 'departments');
  const snap = await getDocs(ref);
  return snap.docs.map(doc => ({ id: doc.id, name: doc.data().name as string, ...doc.data() }));
};

export const addDepartment = async (name: string) => {
  const ref = collection(db, 'departments');
  const docRef = await addDoc(ref, { name });
  return docRef.id;
};

export const updateDepartment = async (id: string, name: string) => {
  const ref = doc(db, 'departments', id);
  await updateDoc(ref, { name });
};

export const deleteDepartment = async (id: string) => {
  const ref = doc(db, 'departments', id);
  await deleteDoc(ref);
};

// Semesters (subcollection)
export const getSemesters = async (departmentId: string): Promise<(DocumentData & { id: string, name: string })[]> => {
    try {
        const semestersCol = collection(db, 'departments', departmentId, 'semesters');
        const q = query(semestersCol, orderBy('name'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    } catch (error) {
        console.error("Error getting semesters:", error);
        throw error;
    }
};

export const addSemester = async (departmentId: string, name: string) => {
  const ref = collection(db, 'departments', departmentId, 'semesters');
  const docRef = await addDoc(ref, { name });
  return docRef.id;
};

export const updateSemester = async (departmentId: string, semesterId: string, name: string) => {
  const ref = doc(db, 'departments', departmentId, 'semesters', semesterId);
  await updateDoc(ref, { name });
};

export const deleteSemester = async (departmentId: string, semesterId: string) => {
  const ref = doc(db, 'departments', departmentId, 'semesters', semesterId);
  await deleteDoc(ref);
};

// Courses (subcollection)
export const getCourses = async (departmentId: string, semesterId: string): Promise<(CourseData & { id: string; createdAt?: Timestamp; })[]> => {
  const ref = collection(db, 'departments', departmentId, 'semesters', semesterId, 'courses');
  const snap = await getDocs(ref);
  return snap.docs.map(doc => ({
    id: doc.id,
    courseName: doc.data().name, // Map 'name' from subcollection to 'courseName'
    courseCode: doc.data().code, // Map 'code' from subcollection to 'courseCode'
    // Add other CourseData properties from the document if they exist in subcollection
    facultyUid: doc.data().facultyUid || null,
    facultyName: doc.data().facultyName || null,
    academicYear: doc.data().academicYear || null,
    description: doc.data().description || null,
    credits: doc.data().credits || null,
    createdAt: doc.data().createdAt || null,
    // Ensure other CourseData properties are mapped or set to null/default if not present
  }) as CourseData & { id: string; createdAt?: Timestamp; });
};

export const addCourseToSemester = async (departmentId: string, semesterId: string, course: { name: string; code: string }, facultyUid: string, facultyName: string, academicYear?: string) => {
    try {
        // Create a new course document in the 'courses' collection
        const coursesCollectionRef = collection(db, 'courses');
        const newCourseRef = await addDoc(coursesCollectionRef, {
            courseName: course.name,
            courseCode: course.code,
            facultyUid: facultyUid,
            facultyName: facultyName,
            departmentId: departmentId, // Store department ID
            semesterId: semesterId,     // Store semester ID
            academicYear: academicYear || null, // Store academic year if provided
            createdAt: serverTimestamp(),
        });
        const courseId = newCourseRef.id;

        // Also add a reference or denormalized data under the specific semester
        const semesterCoursesRef = doc(db, 'departments', departmentId, 'semesters', semesterId, 'courses', courseId);
        await setDoc(semesterCoursesRef, {
            name: course.name,
            code: course.code,
            facultyUid: facultyUid,
            facultyName: facultyName,
            academicYear: academicYear || null,
            createdAt: serverTimestamp(),
        });

        return courseId;
    } catch (error) {
        console.error("Error adding course to semester:", error);
        throw error;
    }
};

export const updateCourseInSemester = async (
    departmentId: string,
    semesterId: string,
    courseId: string,
    courseUpdateData: Partial<{ name: string; code: string; } & CourseData>
) => {
    const subcollectionRef = doc(db, 'departments', departmentId, 'semesters', semesterId, 'courses', courseId);

    // Prepare data for subcollection update (only name and code)
    const subcollectionUpdate: Partial<{ name: string; code: string; facultyUid?: string; facultyName?: string; academicYear?: string; description?: string; credits?: number; updatedAt?: any; }> = {
        updatedAt: serverTimestamp()
    };
    if (courseUpdateData.name !== undefined) subcollectionUpdate.name = courseUpdateData.name;
    if (courseUpdateData.code !== undefined) subcollectionUpdate.code = courseUpdateData.code;
    if (courseUpdateData.facultyUid !== undefined) subcollectionUpdate.facultyUid = courseUpdateData.facultyUid;
    if (courseUpdateData.facultyName !== undefined) subcollectionUpdate.facultyName = courseUpdateData.facultyName;
    if (courseUpdateData.academicYear !== undefined) subcollectionUpdate.academicYear = courseUpdateData.academicYear;
    if (courseUpdateData.description !== undefined) subcollectionUpdate.description = courseUpdateData.description;
    if (courseUpdateData.credits !== undefined) subcollectionUpdate.credits = courseUpdateData.credits;

    if (Object.keys(subcollectionUpdate).length > 1) {
        await updateDoc(subcollectionRef, subcollectionUpdate);
    }

    // Prepare data for top-level 'courses' collection update (all relevant CourseData fields)
    const topLevelCourseRef = doc(db, 'courses', courseId);
    const topLevelCourseUpdate: Partial<CourseData & { updatedAt: any }> = {
        updatedAt: serverTimestamp()
    };

    if (courseUpdateData.courseName !== undefined) topLevelCourseUpdate.courseName = courseUpdateData.courseName;
    if (courseUpdateData.courseCode !== undefined) topLevelCourseUpdate.courseCode = courseUpdateData.courseCode;
    if (courseUpdateData.facultyUid !== undefined) topLevelCourseUpdate.facultyUid = courseUpdateData.facultyUid;
    if (courseUpdateData.facultyName !== undefined) topLevelCourseUpdate.facultyName = courseUpdateData.facultyName;
    if (courseUpdateData.academicYear !== undefined) topLevelCourseUpdate.academicYear = courseUpdateData.academicYear;
    if (courseUpdateData.description !== undefined) topLevelCourseUpdate.description = courseUpdateData.description;
    if (courseUpdateData.credits !== undefined) topLevelCourseUpdate.credits = courseUpdateData.credits;

    if (Object.keys(topLevelCourseUpdate).length > 1) { // >1 because updatedAt is always there
        await updateDoc(topLevelCourseRef, topLevelCourseUpdate);
    }
};

export const deleteCourseInSemester = async (departmentId: string, semesterId: string, courseId: string) => {
  const ref = doc(db, 'departments', departmentId, 'semesters', semesterId, 'courses', courseId);
  await deleteDoc(ref);

  // Also delete from the top-level 'courses' collection
  await deleteDoc(doc(db, 'courses', courseId));
};

// Ensure `app` is also exported if needed directly, though usually not.
export { app };
