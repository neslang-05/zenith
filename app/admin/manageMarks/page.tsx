'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
// Ensure necessary functions are imported
import { auth, findStudentByRegNum, addResult } from '@/lib/firebase';

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'h-5 w-5' }: { size?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-indigo-500`}></div>
);

// Interface for the found student data
interface FoundStudent extends DocumentData {
    id: string; // UID
    name?: string;
    email?: string;
    registrationNumber?: string;
}

const AddResultsPage = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null); // Get current user
    const [isAdmin, setIsAdmin] = useState(false); // Optional: Verify admin role

    // State for student search
    const [searchRegNum, setSearchRegNum] = useState('');
    const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // State for result form
    const [subjectName, setSubjectName] = useState('');
    const [marks, setMarks] = useState<string>('');
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isAddingResult, setIsAddingResult] = useState(false);

    // Get current user and optionally verify admin role
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            // --- Optional but recommended: Verify Admin Role ---
            // if (user) {
            //     try {
            //         const profile = await getUserProfile(user.uid); // Assumes getUserProfile exists
            //         if (profile && profile.role === 'admin') {
            //             setIsAdmin(true);
            //         } else {
            //             setIsAdmin(false);
            //             // Redirect or show error if not admin
            //             // router.push('/unauthorized');
            //         }
            //     } catch (error) {
            //         console.error("Error checking admin role:", error);
            //         setIsAdmin(false);
            //     }
            // } else {
            //     setIsAdmin(false);
            // }
             // --- End Optional ---
        });
        return () => unsubscribe();
    }, []);

    // Handler for searching student
    const handleSearchStudent = async (e?: React.FormEvent<HTMLFormElement>) => {
        if(e) e.preventDefault();
        const trimmedRegNum = searchRegNum.trim().toUpperCase(); // Standardize search input
        if (!trimmedRegNum) {
            setSearchError("Please enter a registration number.");
            return;
        }
        console.log(`Searching for registration number: ${trimmedRegNum}`); // Debug log
        setIsSearching(true);
        setSearchError(null);
        setFoundStudent(null);
        clearResultForm();
        setFormError(null);
        setFormSuccess(null);

        try {
            // Ensure findStudentByRegNum uses the correct field name and handles case if necessary
            const studentData = await findStudentByRegNum(trimmedRegNum);
            console.log("Search result:", studentData); // Debug log

            if (studentData) {
                // Cast or map to ensure correct structure
                 const typedStudent: FoundStudent = {
                    id: studentData.id,
                    name: studentData.name || 'N/A',
                    email: studentData.email || 'N/A',
                    registrationNumber: studentData.registrationNumber || 'N/A',
                };
                setFoundStudent(typedStudent);
            } else {
                setSearchError(`No student found with Registration Number: ${trimmedRegNum}`);
            }
        } catch (err) {
            console.error("Error searching student:", err);
            let errorMsg = "An error occurred while searching.";
             if (err instanceof Error && (err.message.toLowerCase().includes('permission denied') || err.message.toLowerCase().includes('missing index'))) {
                 errorMsg = "Search failed. Check Firestore rules or required indexes.";
                 // Check Firestore console for index creation prompts
            }
            setSearchError(errorMsg);
        } finally {
            setIsSearching(false);
        }
    };

     // Handler for adding result
     const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!foundStudent || !foundStudent.id || !foundStudent.registrationNumber) {
            setFormError("Internal Error: Student data is incomplete. Please search again.");
            return;
        }
        if (!currentUser) {
             setFormError("Authentication error. Please re-login.");
            return;
        }
        if (!subjectName.trim() || !marks.trim() || !examName.trim()) {
            setFormError("Please fill in Subject Name, Marks/Grade, and Exam Name.");
            return;
        }                                           

        setIsAddingResult(true);

        try {
            const resultData = {
                studentUid: foundStudent.id, // Use the student's UID (document ID)
                registrationNumber: foundStudent.registrationNumber, // Denormalize for display/queries
                subjectName: subjectName.trim(),
                marks: marks.trim(), // Keep as string for flexibility (e.g., 'A+', 'Absent')
                examName: examName.trim(),
                enteredBy: currentUser.uid,
                ...(academicYear.trim() && { academicYear: academicYear.trim() }),
            };
            console.log("Adding result data:", resultData); // Debug log

            await addResult(resultData);

            setFormSuccess(`Result added successfully for ${foundStudent.name} (${foundStudent.registrationNumber})!`);
            clearResultForm(); // Clear form for next entry for the *same* student

        } catch (err) {
            console.error("Error adding result:", err);
             let errorMsg = "Failed to add the result.";
              if (err instanceof Error && (err.message.toLowerCase().includes('permission denied'))) {
                 errorMsg = "Permission denied adding result. Check Firestore rules.";
             }
            setFormError(errorMsg);
            setFormSuccess(null);
        } finally {
            setIsAddingResult(false);
        }
    };

    // Helper to clear result form fields
    const clearResultForm = () => {
        setSubjectName('');
        setMarks('');
        setExamName('');
        setAcademicYear('');
    };

    // --- JSX Section ---
    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">
            {/* Header */}
            <header className="mb-8 pb-4 border-b border-gray-300">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add Student Results</h1>
                 <p className="text-gray-600 mt-1">Search for a student by Registration Number and enter their marks or grades.</p>
                 <Link href="/admin/dashboard" legacyBehavior><a className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline mt-2 inline-block">← Back to Admin Dashboard</a></Link>
            </header>

            {/* Student Search Section */}
            <section className="mb-10 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">1. Find Student by Registration Number</h2>
                 <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row items-start gap-3">
                     <div className="flex-grow w-full sm:w-auto">
                         <label htmlFor="searchRegNum" className="sr-only">Registration Number</label>
                         <input
                             type="text"
                             id="searchRegNum"
                             value={searchRegNum}
                             // Convert to uppercase as user types for consistency
                             onChange={(e) => setSearchRegNum(e.target.value.toUpperCase())}
                             placeholder="Enter Student Registration Number"
                             required
                             disabled={isSearching}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                         />
                     </div>
                     <button
                         type="submit"
                         className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                         disabled={isSearching || !searchRegNum.trim()} // Disable if input is empty
                     >
                          {isSearching ? <LoadingSpinner size="h-4 w-4 mr-2"/> : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                         )}
                          {isSearching ? 'Searching...' : 'Search Student'}
                     </button>
                 </form>
                  {/* Search Error Display */}
                 {searchError && <p className="text-red-600 text-sm mt-3">{searchError}</p>}
            </section>

             {/* Result Form Section (Show only if student is found) */}
            {foundStudent && (
                 <section className="bg-white shadow-md rounded-lg p-6 transition-opacity duration-300 ease-in-out">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">2. Enter Result for Found Student</h2>
                     {/* Display Found Student Info */}
                     <div className="bg-indigo-50 p-4 rounded border border-indigo-200 mb-6 text-sm">
                         <p><span className="font-medium text-indigo-900">Name:</span> {foundStudent.name}</p>
                         <p><span className="font-medium text-indigo-900">Reg No:</span> {foundStudent.registrationNumber}</p>
                         <p><span className="font-medium text-indigo-900">Email:</span> {foundStudent.email}</p>
                         <p className="text-xs"><span className="font-medium text-indigo-900">UID:</span> <span className="font-mono text-indigo-700">{foundStudent.id}</span></p>
                     </div>

                     {/* Form for adding a result */}
                    <form onSubmit={handleAddResult} className="space-y-4">
                          {/* Form Error/Success Messages */}
                         {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm" role="alert">{formError}</div>}
                         {formSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm" role="alert">{formSuccess}</div>}

                          {/* Result Input Fields */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {/* Subject Name */}
                            <div> <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label> <input type="text" id="subjectName" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required disabled={isAddingResult} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                             {/* Marks/Grade */}
                            <div> <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks / Grade <span className="text-red-500">*</span></label> <input type="text" id="marks" value={marks} onChange={(e) => setMarks(e.target.value)} required disabled={isAddingResult} placeholder="e.g., 85 or A+" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                             {/* Exam Name */}
                             <div> <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">Exam Name / Semester <span className="text-red-500">*</span></label> <input type="text" id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} required disabled={isAddingResult} placeholder="e.g., Semester 1 Final" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                         </div>
                          {/* Academic Year (Optional) */}
                         <div> <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year (Optional)</label> <input type="text" id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} disabled={isAddingResult} placeholder="e.g., 2024-2025" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>

                         {/* Submit Button */}
                        <div className="text-right pt-2">
                            <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isAddingResult}>
                                {isAddingResult ? <LoadingSpinner size="h-4 w-4 mr-2"/> : null}
                                {isAddingResult ? 'Adding Result...' : 'Add Result'}
                            </button>
                        </div>
                    </form>
                 </section>
            )}
         </div>
     );
 };

 export default AddResultsPage;