'use client'; // Required for using hooks like useState, useEffect, useRouter

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signOutUser } from '@/lib/firebase'; // Adjust path as needed

// Simple Loading Spinner Component (Optional)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listener for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in.
        setUser(currentUser);
        setError(null); // Clear any previous errors
      } else {
        // User is signed out.
        setUser(null);
        console.log("No user logged in, redirecting to login.");
        router.push('/login'); // Redirect to login page if not authenticated
      }
      setLoading(false); // Finished checking auth state
    }, (authError) => {
        // Handle errors during the listener setup/execution
        console.error("Auth State Error:", authError);
        setError(`Authentication error: ${authError.message}`);
        setUser(null);
        setLoading(false);
        router.push('/login'); // Redirect on error too
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]); // Dependency array includes router

  const handleLogout = async () => {
    setError(null); // Clear previous errors
    try {
      await signOutUser();
      // The onAuthStateChanged listener will automatically redirect to login
      console.log("User signed out successfully.");
    } catch (err) {
      console.error("Logout Error:", err);
       if (err instanceof Error) {
           setError(`Logout failed: ${err.message}`);
       } else {
           setError("An unknown error occurred during logout.");
       }
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // Display error state (though redirection usually happens first)
  if (error && !user) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
         <p className="text-red-600 bg-red-100 p-4 rounded border border-red-400 mb-4">Error: {error}</p>
         <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
         >
           Go to Login
         </button>
       </div>
     );
   }


  // Display dashboard content if user is logged in
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <img
                    src="/zenith-logo.svg" // Ensure path is correct
                    alt="Zenith Logo"
                    className="h-10 w-auto"
                />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
           {/* Mobile Welcome Message */}
           <div className="sm:hidden text-center pb-2 text-sm text-gray-600">
             Welcome, {user.displayName || user.email}
           </div>
        </header>

        {/* Main Content Area */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
             {/* Display general errors (like logout error) */}
             {error && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                   <strong className="font-bold">Error!</strong>
                   <span className="block sm:inline ml-2">{error}</span>
                 </div>
               )}

            {/* Replace with your actual dashboard content */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Example Card 1: View Results */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">View Results</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Check your latest semester or exam results here.
                  </p>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Go to Results →
                  </button>
                </div>

                {/* Example Card 2: Profile */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">My Profile</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your contact information and password.
                  </p>
                   <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Manage Profile →
                   </button>
                </div>

                {/* Example Card 3: Notifications */}
                 <div className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                   <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                   <p className="text-sm text-gray-500 mb-4">
                     View important announcements and updates. (You have 2 unread)
                   </p>
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                     View Notifications →
                    </button>
                 </div>

                 {/* Add more cards/widgets as needed */}
                  <div className="bg-white overflow-hidden shadow rounded-lg p-6 md:col-span-2 lg:col-span-1 hover:shadow-lg transition-shadow duration-200">
                   <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Links</h3>
                   <ul className="space-y-2 text-sm">
                     <li><a href="#" className="text-indigo-600 hover:underline">Academic Calendar</a></li>
                     <li><a href="#" className="text-indigo-600 hover:underline">Fee Payment</a></li>
                     <li><a href="#" className="text-indigo-600 hover:underline">Contact Support</a></li>
                   </ul>
                 </div>

              </div>
            </div>
            {/* /End replace */}
          </div>
        </main>

         <footer className="w-full text-center p-4 text-gray-500 text-sm mt-auto border-t border-gray-200 bg-white">
            Developed by Synergy Systems for Manipur Technical University<br/>
            Copyright © 2025
        </footer>
      </div>
    );
  }

  // Fallback if no user and not loading (should usually be redirected already)
  return null;
};

export default DashboardPage;