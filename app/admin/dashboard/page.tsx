'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for navigation
import { onAuthStateChanged, User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { auth, getUserProfile, signOutUser, getAllStudents } from '@/lib/firebase'; // Adjust path

// Reuse Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

interface Student extends DocumentData {
    id: string; // UID is the ID
    name: string;
    email: string;
    registrationNumber: string;
}

const AdminDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [students, setStudents] = useState<Student[]>([]); // State for student list
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile && profile.role === 'admin') {
            setUserProfile(profile);
            setError(null);
          } else if (profile) {
             console.warn("User is not an admin. Redirecting.");
             router.push('/login'); // Or an unauthorized page
          } else {
            console.warn("Admin profile not found. Redirecting.");
            setError("Profile not found. Please contact support.");
            await signOutUser(); // Sign out if profile is missing
            router.push('/login');
          }
        } catch (err) {
           console.error("Error fetching profile:", err);
           setError("Failed to load admin profile data.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
        console.log("No user logged in, redirecting.");
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


   // Fetch student list after admin profile is loaded
   useEffect(() => {
    if (userProfile && user && userProfile.role === 'admin') {
      const fetchStudents = async () => {
        setStudentsLoading(true);
        setError(null);
        try {
          const studentList = await getAllStudents();
          setStudents(studentList as Student[]);
        } catch (err) {
          console.error("Error fetching students:", err);
          setError("Failed to load student list.");
          setStudents([]);
        } finally {
          setStudentsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [userProfile, user]);


  const handleLogout = async () => {
    setError(null);
    try {
      await signOutUser();
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
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
         <p className="text-red-600 mb-4">{error || "Access Denied or User Not Found."}</p>
         <button onClick={() => router.push('/login')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Go to Login</button>
       </div>
     );
  }

  // Admin Dashboard View
  return (
     <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <div className="flex items-center space-x-3">
             <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-10 w-auto" />
             <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
           <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                   Institution: {userProfile.institutionName || 'N/A'} ({user.email})
                </span>
                <button onClick={handleLogout} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                   Logout
                </button>
            </div>
        </div>
          <div className="sm:hidden text-center pb-2 text-sm text-gray-600">
             {userProfile.institutionName || 'N/A'} ({user.email})
           </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
         {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Management Tools</h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Manage Students Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
               <h3 className="text-lg font-medium text-gray-900 mb-3">Manage Students</h3>
               <p className="text-sm text-gray-500 mb-4">
                 Create new student accounts and view existing student details.
               </p>
               {/* Link to a dedicated student management page/section */}
               <Link href="/admin/manage-students" legacyBehavior>
                 <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                   Go to Student Management →
                 </a>
               </Link>
            </div>

             {/* Add Results Card */}
             <div className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
               <h3 className="text-lg font-medium text-gray-900 mb-3">Add Results</h3>
               <p className="text-sm text-gray-500 mb-4">
                 Enter marks or grades for students for specific exams or semesters.
               </p>
                {/* Link to a dedicated result entry page/section */}
                <Link href="/admin/add-results" legacyBehavior>
                 <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                   Go to Result Entry →
                 </a>
               </Link>
             </div>
         </div>

          {/* Optional: Display a quick list of students on dashboard */}
          <div className="bg-white shadow rounded-lg p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-4">Student List Overview ({students.length})</h3>
              {studentsLoading ? (
                <LoadingSpinner />
              ) : students.length > 0 ? (
                 <div className="overflow-x-auto max-h-96"> {/* Max height and scroll */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0"> {/* Sticky header */}
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                 </div>
              ) : (
                <p className="text-gray-500">No students found or failed to load.</p>
              )}
          </div>

      </main>

      {/* Footer */}
       <footer className="w-full text-center p-4 text-gray-500 text-sm mt-8 border-t border-gray-200 bg-white">
          Developed by Synergy Systems<br/>
          Copyright © 2025
      </footer>
    </div>
  );
};

export default AdminDashboardPage;