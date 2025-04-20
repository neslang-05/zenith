'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { auth, getUserProfile, getStudentResults, signOutUser } from '@/lib/firebase'; // Adjust path

// Simple Loading Spinner Component (Reuse or define here)
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

interface Result extends DocumentData {
    id: string;
    subjectName: string;
    marks: string | number;
    examName: string;
    // Add other relevant fields from your results data model
    timestamp?: { seconds: number; toDate: () => Date }; // Example timestamp handling
}


const StudentDashboardPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    //         if (currentUser) {
    //             setUser(currentUser);
    //             try {
    //                 const profile = await getUserProfile(currentUser.uid);
    //                 if (profile && profile.role === 'student') {
    //                     setUserProfile(profile);
    //                     setError(null);
    //                 } else if (profile) {
    //                     console.warn("User is not a student. Redirecting.");
    //                     router.push('/login'); // Or an unauthorized page
    //                 } else {
    //                     console.warn("User profile not found. Redirecting.");
    //                     // May indicate an issue during signup profile creation
    //                     setError("Profile not found. Please contact support.");
    //                     await signOutUser(); // Sign out if profile is missing
    //                     router.push('/login');
    //                 }
    //             } catch (err) {
    //                 console.error("Error fetching profile:", err);
    //                 setError("Failed to load profile data.");
    //                 // Optionally sign out or redirect on profile fetch error
    //             }
    //         } else {
    //             setUser(null);
    //             setUserProfile(null);
    //             console.log("No user logged in, redirecting.");
    //             router.push('/login');
    //         }
    //         setLoading(false);
    //     });

    //     return () => unsubscribe();
    // }, [router]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setLoading(true); // Start loading on auth change
          if (currentUser) {
            setUser(currentUser);
            try {
              const profile = await getUserProfile(currentUser.uid);
    
              // --- TEMPORARY CHANGE FOR TESTING ---
              // Original Check:
              // if (profile && profile.role === 'student') {
              //   setUserProfile(profile);
              //   setError(null);
              // } else if (profile) { ... redirect ... } else { ... redirect ... }
    
              // Temporary Check (Allows viewing regardless of role):
              if (profile) {
                 setUserProfile(profile); // Set profile regardless of role for viewing
                 setError(null);
                 console.warn("TEMP: Bypassing strict student role check for testing.");
              }
              // --- END TEMPORARY CHANGE ---
    
              else { // Profile still not found - handle this case
                console.warn("User profile not found. Redirecting.");
                setError("Profile not found. Please contact support.");
                await signOutUser(); // Sign out if profile is missing
                router.push('/login');
              }
            } catch (err) {
              console.error("Error fetching profile:", err);
              setError("Failed to load profile data.");
              // Decide if you want to sign out here too
              // await signOutUser();
              // router.push('/login');
            }
          } else {
            // ... (rest of the else block remains the same - redirect to login) ...
            setUser(null);
            setUserProfile(null);
            console.log("No user logged in, redirecting.");
            router.push('/login');
          }
          setLoading(false); // Finish loading
        });
    
        return () => unsubscribe();
    }, [router]);

    // Fetch results after user profile is loaded
    useEffect(() => {
        if (userProfile && user) {
            const fetchResults = async () => {
                setResultsLoading(true);
                setError(null); // Clear previous errors
                try {
                    const studentResults = await getStudentResults(user.uid);
                    setResults(studentResults as Result[]); // Cast to Result[] type
                } catch (err) {
                    console.error("Error fetching results:", err);
                    setError("Failed to load results.");
                    setResults([]); // Clear results on error
                } finally {
                    setResultsLoading(false);
                }
            };
            fetchResults();
        }
    }, [userProfile, user]); // Depend on userProfile and user

    const handleLogout = async () => {
        setError(null);
        try {
            await signOutUser();
            // onAuthStateChanged will handle redirection
        } catch (err) {
            setError(err instanceof Error ? `Logout failed: ${err.message}` : "Logout failed.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user || !userProfile) {
        // Should have been redirected, but as a fallback
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-red-600 mb-4">{error || "Access Denied or User Not Found."}</p>
                <button onClick={() => router.push('/login')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Go to Login</button>
            </div>
        );
    }

    // Student Dashboard View
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-10 w-auto" />
                        <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {/* Welcome & Profile Info */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Welcome, {userProfile.name || user.email}!</h2>
                    <p className="text-gray-600">Registration No: <span className="font-medium text-gray-800">{userProfile.registrationNumber}</span></p>
                    <p className="text-gray-600">Email: <span className="font-medium text-gray-800">{userProfile.email}</span></p>
                    {/* Add more profile details if available */}
                </div>

                {/* Results Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">My Results</h3>
                    {resultsLoading ? (
                        <LoadingSpinner />
                    ) : results.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam/Semester</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks/Grade</th>
                                        {/* Optional: Add date column */}
                                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.map((result) => (
                                        <tr key={result.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.examName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.subjectName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.marks}</td>
                                            {/* Optional: Display formatted date */}
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.timestamp ? result.timestamp.toDate().toLocaleDateString() : 'N/A'}
                       </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No results found.</p>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center p-4 text-gray-500 text-sm mt-8 border-t border-gray-200 bg-white">
                Developed by Synergy Systems for Manipur Technical University<br />
                Copyright © 2025
            </footer>
        </div>
    );
};

export default StudentDashboardPage;