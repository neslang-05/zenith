'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { auth, getUserProfile, signOutUser } from '@/lib/firebase'; // Adjust path

// Reuse Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);


const FacultyDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  //     if (currentUser) {
  //       setUser(currentUser);
  //       try {
  //         const profile = await getUserProfile(currentUser.uid);
  //         if (profile && profile.role === 'faculty') {
  //           setUserProfile(profile);
  //           setError(null);
  //         } else if (profile) {
  //           console.warn("User is not faculty. Redirecting.");
  //           router.push('/login'); // Or an unauthorized page
  //         } else {
  //           console.warn("Faculty profile not found. Redirecting.");
  //           setError("Profile not found. Please contact support.");
  //           await signOutUser(); // Sign out if profile is missing
  //           router.push('/login');
  //         }
  //       } catch (err) {
  //         console.error("Error fetching profile:", err);
  //         setError("Failed to load faculty profile data.");
  //       }
  //     } else {
  //       setUser(null);
  //       setUserProfile(null);
  //       console.log("No user logged in, redirecting.");
  //       router.push('/login');
  //     }
  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Start loading
      if (currentUser) {
        setUser(currentUser);
        try {
          const profile = await getUserProfile(currentUser.uid);

          // --- TEMPORARY CHANGE FOR TESTING ---
          // Original Check:
          // if (profile && profile.role === 'faculty') {
          //    setUserProfile(profile);
          //    setError(null);
          // } else if (profile) { ... redirect ... } else { ... redirect ... }

          // Temporary Check (Allows viewing regardless of role):
          if (profile) {
            setUserProfile(profile); // Set profile regardless of role for viewing
            setError(null);
            console.warn("TEMP: Bypassing strict faculty role check for testing.");
          }
          // --- END TEMPORARY CHANGE ---

          else { // Profile still not found
            console.warn("Faculty profile not found. Redirecting.");
            setError("Profile not found. Please contact support.");
            await signOutUser();
            router.push('/login');
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Failed to load faculty profile data.");
          // Decide if you want to sign out here too
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

  // Faculty Dashboard View (Placeholder)
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Faculty Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome, {userProfile.name || user.email}
            </span>
            <button onClick={handleLogout} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Logout
            </button>
          </div>
        </div>
        <div className="sm:hidden text-center pb-2 text-sm text-gray-600">
          Welcome, {userProfile.name || user.email}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Faculty Area</h2>
          <p className="text-gray-600">
            This dashboard is intended for faculty members.
          </p>
          <p className="text-gray-500 mt-4 italic">
            Features such as viewing assigned courses and student results are planned for future development.
          </p>
          {/* Add placeholder content or links as needed */}
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

export default FacultyDashboardPage;