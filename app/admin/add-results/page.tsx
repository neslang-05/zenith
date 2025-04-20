'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { auth, findStudentByRegNum, addResult } from '@/lib/firebase'; // Adjust path

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'h-5 w-5' }: { size?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-indigo-500`}></div>
);

interface FoundStudent extends DocumentData {
    id: string; // UID
    name: string;
    email: string;
    registrationNumber: string;
}

const AddResultsPage = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser); // Get current user

    // State for student search
    const [searchRegNum, setSearchRegNum] = useState('');
    const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // State for result form
    const [subjectName, setSubjectName] = useState('');
    const [marks, setMarks] = useState<string>(''); // Use string to allow grades like 'A+'
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState(''); // Optional
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isAddingResult, setIsAddingResult] = useState(false);

    // Update current user state if auth state changes (optional, good practice)
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        return () => unsubscribe(); // Cleanup listener
    }, []);


    // Handler for searching student
    const handleSearchStudent = async (e?: React.FormEvent<HTMLFormElement>) => {
        if(e) e.preventDefault(); // Allow calling without event too
        if (!searchRegNum.trim()) {
            setSearchError("Please enter a registration number to search.");
            return;
        }
        setIsSearching(true);
        setSearchError(null);
        setFoundStudent(null); // Clear previous result
        // Also clear result form if searching for a new student
        clearResultForm();
        setFormError(null);
        setFormSuccess(null);

        try {
            const studentData = await findStudentByRegNum(searchRegNum.trim());
            if (studentData) {
                setFoundStudent(studentData as FoundStudent);
            } else {
                setSearchError(`No student found with Registration Number: ${searchRegNum.trim()}`);
            }
        } catch (err) {
            console.error("Error searching student:", err);
            setSearchError("An error occurred while searching for the student.");
        } finally {
            setIsSearching(false);
        }
    };

     // Handler for adding result
     const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!foundStudent) {
            setFormError("No student selected. Please search for a student first.");
            return;
        }
        if (!currentUser) {
             setFormError("Admin user not identified. Please re-login.");
            return;
        }
        if (!subjectName || !marks || !examName) {
            setFormError("Please fill in Subject Name, Marks/Grade, and Exam Name.");
            return;
        }

        setIsAddingResult(true);

        try {
            const resultData = {
                studentUid: foundStudent.id, // The student's UID
                registrationNumber: foundStudent.registrationNumber, // Store for convenience
                subjectName: subjectName.trim(),
                marks: marks.trim(), // Store as string (flexible)
                examName: examName.trim(),
                enteredBy: currentUser.uid, // Admin's UID
                ...(academicYear.trim() && { academicYear: academicYear.trim() }), // Add if provided
            };

            await addResult(resultData);

            setFormSuccess(`Result added successfully for ${foundStudent.name} (${foundStudent.registrationNumber})!`);
            // Clear result form fields
            clearResultForm();

        } catch (err) {
            console.error("Error adding result:", err);
            setFormError("Failed to add the result. Please try again.");
            setFormSuccess(null);
        } finally {
            setIsAddingResult(false);
        }
    };

    // Helper to clear result form
    const clearResultForm = () => {
        setSubjectName('');
        setMarks('');
        setExamName('');
        setAcademicYear('');
    };


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header */}
            <header className="mb-8 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-bold text-gray-800">Add Student Results</h1>
                <p className="text-gray-600">Search for a student and enter their marks or grades.</p>
                <Link href="/admin/dashboard" legacyBehavior>
                    <a className="text-sm text-indigo-600 hover:underline mt-2 inline-block">← Back to Admin Dashboard</a>
                </Link>
            </header>

            {/* Student Search Section */}
            <section className="mb-10 bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Find Student</h2>
                 <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row items-start gap-3">
                    <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor="searchRegNum" className="sr-only">Registration Number</label>
                        <input
                            type="text"
                            id="searchRegNum"
                            value={searchRegNum}
                            onChange={(e) => setSearchRegNum(e.target.value)}
                            placeholder="Enter Student Registration Number"
                            required
                            disabled={isSearching}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isSearching}
                    >
                         {isSearching ? <LoadingSpinner size="h-4 w-4 mr-2"/> : null}
                         {isSearching ? 'Searching...' : 'Search'}
                    </button>
                 </form>
                 {searchError && <p className="text-red-600 text-sm mt-2">{searchError}</p>}
            </section>

             {/* Found Student Info & Result Form (Conditional) */}
            {foundStudent && (
                 <section className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Enter Result for:</h2>
                     <div className="bg-indigo-50 p-4 rounded border border-indigo-200 mb-6">
                         <p className="font-medium text-indigo-800">{foundStudent.name}</p>
                         <p className="text-sm text-indigo-700">Reg No: {foundStudent.registrationNumber}</p>
                         <p className="text-sm text-indigo-700">Email: {foundStudent.email}</p>
                         <p className="text-xs text-indigo-600 font-mono">UID: {foundStudent.id}</p>
                     </div>

                    <form onSubmit={handleAddResult} className="space-y-4">
                         {/* Form Messages */}
                         {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">{formError}</div>}
                         {formSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm">{formSuccess}</div>}

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
                                <input type="text" id="subjectName" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required disabled={isAddingResult} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks / Grade <span className="text-red-500">*</span></label>
                                <input type="text" id="marks" value={marks} onChange={(e) => setMarks(e.target.value)} required disabled={isAddingResult} placeholder="e.g., 85 or A+" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
                            </div>
                             <div>
                                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">Exam Name / Semester <span className="text-red-500">*</span></label>
                                <input type="text" id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} required disabled={isAddingResult} placeholder="e.g., Semester 1 Final" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
                            </div>
                         </div>
                         <div>
                             <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year (Optional)</label>
                            <input type="text" id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} disabled={isAddingResult} placeholder="e.g., 2024-2025" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
                         </div>

                        <div className="text-right">
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50" disabled={isAddingResult}>
                                {isAddingResult ? <LoadingSpinner size="h-4 w-4 mr-2"/> : null}
                                {isAddingResult ? 'Adding...' : 'Add Result'}
                            </button>
                        </div>
                    </form>
                 </section>
            )}

        </div>
    );
};

export default AddResultsPage;