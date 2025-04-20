'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DocumentData } from 'firebase/firestore';
// Ensure auth and necessary functions are imported
import { auth, createUserWithEmailAndPassword, createUserProfile, getAllStudents } from '@/lib/firebase';

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'h-5 w-5' }: { size?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-indigo-500`}></div>
);

// Interface for type safety
interface Student { // Simpler interface for clarity
    id: string; // UID
    name?: string;
    email?: string;
    registrationNumber?: string;
    // Add other fields you expect based on createUserProfile
}

const ManageStudentsPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    // Form state...
    const [studentName, setStudentName] = useState('');
    const [studentRegNum, setStudentRegNum] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);

    // Refined fetchStudents
    const fetchStudents = useCallback(async () => {
        console.log("Attempting to fetch students..."); // Debug log
        setLoadingStudents(true);
        setListError(null);
        try {
            // Ensure getAllStudents returns the array of { id: doc.id, ...doc.data() }
            const studentListRaw = await getAllStudents();
            console.log("Raw student list fetched:", studentListRaw); // Debug log

            if (!Array.isArray(studentListRaw)) {
                throw new Error("getAllStudents did not return an array.");
            }

            // Explicitly map and validate structure if needed, or trust getAllStudents format
            const typedStudents: Student[] = studentListRaw.map((data: DocumentData & { id: string }) => {
                // Basic check for expected fields
                if (!data.id || !data.email) {
                    console.warn("Fetched student data missing id or email:", data);
                }
                return {
                    id: data.id,
                    name: data.name || 'N/A', // Provide fallbacks for missing optional data
                    email: data.email || 'N/A',
                    registrationNumber: data.registrationNumber || 'N/A',
                };
            });

            console.log("Processed students:", typedStudents); // Debug log
            setStudents(typedStudents);

        } catch (err) {
            console.error("Error in fetchStudents:", err);
            let errorMsg = "Failed to load student list.";
            if (err instanceof Error) {
                // Check for permission errors (indicative of Firestore rules)
                if (err.message.toLowerCase().includes('permission denied') || err.message.toLowerCase().includes('missing or insufficient permissions')) {
                    errorMsg = "Permission denied fetching students. Check Firestore security rules.";
                } else {
                     errorMsg = `Failed to load student list: ${err.message}`;
                }
            }
            setListError(errorMsg);
            setStudents([]);
        } finally {
            setLoadingStudents(false);
            console.log("Finished fetching students."); // Debug log
        }
    }, []);

    // Fetch students on mount
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // Consider checking admin role here if needed
                fetchStudents();
            } else {
                setListError("Authentication required.");
                setLoadingStudents(false);
            }
        });
        return () => unsubscribe();
    }, [fetchStudents]);

    // handleCreateStudent (ensure it calls fetchStudents on success)
    const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // ... (validation) ...
        setIsCreatingStudent(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, studentEmail.trim(), studentPassword);
            const studentUser = userCredential.user;
            if (!studentUser) throw new Error("Auth creation failed.");

            await createUserProfile(
                studentUser.uid,
                studentUser.email || studentEmail.trim(),
                'student',
                {
                    name: studentName.trim(),
                    registrationNumber: studentRegNum.trim().toUpperCase(),
                }
            );

            setFormSuccess(`Student '${studentName.trim()}' created...`); // Shortened success msg
            setStudentName(''); setStudentRegNum(''); setStudentEmail(''); setStudentPassword('');

            await fetchStudents(); // <<< REFRESH THE LIST HERE

        } catch (err) {
            // ... (error handling) ...
             let specificError = "Failed to create student account.";
             if (err instanceof Error) { /* ... detailed error checks ... */
                if ((err as any).code === 'auth/email-already-in-use') specificError = "Email already registered.";
                else if ((err as any).code === 'auth/invalid-email') specificError = "Invalid email format.";
                else if ((err as any).code === 'auth/weak-password') specificError = "Password too weak (min 8 chars).";
                else specificError = `Error: ${err.message}`;
            }
            setFormError(specificError);
            setFormSuccess(null);
            console.error("Student creation error:", err);

        } finally {
            setIsCreatingStudent(false);
        }
    };

    // --- JSX Section ---
    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">
            {/* Header */}
            <header className="mb-8 pb-4 border-b border-gray-300">
                {/* ... Header content ... */}
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Students</h1>
                 <p className="text-gray-600 mt-1">Create new student accounts and view existing students.</p>
                 <Link href="/admin/dashboard" legacyBehavior><a className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline mt-2 inline-block">← Back to Admin Dashboard</a></Link>
            </header>

            {/* Create Student Form Section */}
            <section className="mb-10 bg-white shadow-md rounded-lg p-6">
                {/* ... Form JSX remains largely the same ... */}
                 <h2 className="text-xl font-semibold text-gray-700 mb-5 border-b pb-2">Create New Student Account</h2>
                 <form onSubmit={handleCreateStudent} className="space-y-4">
                     {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm" role="alert">{formError}</div>}
                     {formSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm" role="alert">{formSuccess}</div>}
                     {/* Inputs Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Name Input */}
                         <div> <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1"> Full Name <span className="text-red-500">*</span> </label> <input type="text" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} required disabled={isCreatingStudent} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                         {/* Reg Num Input */}
                         <div> <label htmlFor="studentRegNum" className="block text-sm font-medium text-gray-700 mb-1"> Registration No. <span className="text-red-500">*</span> </label> <input type="text" id="studentRegNum" value={studentRegNum} onChange={(e) => setStudentRegNum(e.target.value)} required disabled={isCreatingStudent} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                     </div>
                      {/* Email Input */}
                      <div> <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1"> Official Email <span className="text-red-500">*</span> </label> <input type="email" id="studentEmail" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required disabled={isCreatingStudent} placeholder="student@institution.edu" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                      {/* Password Input */}
                       <div> <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700 mb-1"> Initial Password <span className="text-red-500">*</span> </label> <input type="password" id="studentPassword" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required minLength={8} disabled={isCreatingStudent} placeholder="Min. 8 characters" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> <p className="text-xs text-gray-500 mt-1"> Important: You are responsible for securely communicating this password to the student. </p> </div>
                      {/* Submit Button */}
                       <div className="text-right pt-2"> <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isCreatingStudent}> {isCreatingStudent ? <LoadingSpinner size="h-4 w-4 mr-2"/> : null} {isCreatingStudent ? 'Creating Account...' : 'Create Student'} </button> </div>
                 </form>
                 {/* Security Warning */}
                  <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-sm rounded-md"> <p className="font-bold">Security Recommendation:</p> <p>Creating user accounts directly from the client-side is suitable for MVPs but has security limitations. For production, use Firebase Cloud Functions with the Admin SDK.</p> </div>
            </section>

            {/* Existing Students List Section */}
            <section className="bg-white shadow-md rounded-lg p-6">
                 {/* List Header */}
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
                        Existing Students ({loadingStudents ? '...' : students.length}) {/* Show count dynamically */}
                     </h2>
                     <button onClick={fetchStudents} disabled={loadingStudents} className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center px-3 py-1 rounded border border-indigo-300 hover:bg-indigo-50 transition-colors">
                         {loadingStudents ? <LoadingSpinner size="h-4 w-4 mr-2"/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" /></svg>}
                         {loadingStudents ? 'Refreshing...' : 'Refresh List'}
                     </button>
                 </div>
                {/* List Error Display */}
                 {listError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm" role="alert">{listError}</div>}

                {/* List Content: Loading / Table / No Students Message */}
                 {loadingStudents ? (
                     <div className="flex justify-center items-center py-6"><LoadingSpinner size="h-8 w-8" /><span className="ml-3 text-gray-500">Loading students...</span></div>
                 ) : students.length > 0 ? (
                     <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             {/* ... Table Head ... */}
                             <thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID (UID)</th></tr></thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {students.map((student) => (
                                     <tr key={student.id} className="hover:bg-gray-50">
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationNumber}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-xs">{student.id}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 ) : (
                     <p className="text-gray-500 text-center py-4">No students found.</p>
                 )}
             </section>
         </div>
     );
 };

 export default ManageStudentsPage;