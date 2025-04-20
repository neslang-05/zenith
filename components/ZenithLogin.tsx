'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import getUserProfile
import { signInWithEmail, resetPassword, getUserProfile, signOutUser } from '../lib/firebase';

const ZenithLogin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Loading state for login process
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoggingIn(true); // Start loading

    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmail(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("Login successful, but user data not found.");
      }

      // Step 2: Get user profile from Firestore to determine role
      const profile = await getUserProfile(user.uid);

      if (!profile) {
         console.error(`Profile not found for UID: ${user.uid}. Signing out.`);
         await signOutUser(); // Sign out if profile doesn't exist
         throw new Error("Login failed: User profile not found. Please contact administrator.");
      }

      // Step 3: Redirect based on role
      const userRole = profile.role;
      console.log(`User role: ${userRole}`); // For debugging

      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'student') {
        router.push('/student/dashboard');
      } else if (userRole === 'faculty') {
        router.push('/faculty/dashboard');
      } else {
        // Fallback if role is missing or unrecognized
        console.warn(`Unrecognized or missing role: ${userRole}. Redirecting to default dashboard.`);
        await signOutUser(); // Sign out user with invalid role
        throw new Error("Login failed: Invalid user role.");
        // OR redirect to a generic page: router.push('/dashboard');
      }

      // No need to set loading false here, redirection handles it.

    } catch (err) { // Catch errors from Auth or Firestore profile fetch
       setSuccess(null);
       setIsLoggingIn(false); // Stop loading on error
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof Error) {
        // Check specific Auth errors first
        if ((err as any).code === 'auth/user-not-found' || (err as any).code === 'auth/wrong-password' || (err as any).code === 'auth/invalid-credential') {
           errorMessage = 'Invalid email or password. Please try again.';
        } else if ((err as any).code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email format.';
        } else {
            // Use the error message from profile fetch or other issues
            errorMessage = `Login failed: ${err.message}`;
        }
      }
      setError(errorMessage);
      console.error("Login Process Error:", err);
    }
    // No finally block needed if redirection happens on success
  };

  // --- Password Reset Logic (Keep as is) ---
   const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsResetting(true);

    if (!resetEmail) {
        setError("Please enter your email address.");
        setIsResetting(false);
        return;
    }

    try {
      await resetPassword(resetEmail);
      setSuccess('Password reset email sent! Check your inbox (and spam folder).');
    } catch (err) {
      setSuccess(null);
       if (err instanceof Error) {
         if ((err as any).code === 'auth/user-not-found') {
            setError('No user found with this email address.');
         } else if ((err as any).code === 'auth/invalid-email') {
             setError('Please enter a valid email format.');
         } else {
           setError(`Password reset failed: ${err.message}`);
         }
       } else {
         setError('An unexpected error occurred during password reset.');
       }
       console.error("Password Reset Error:", err);
    } finally {
        setIsResetting(false);
    }
  };

  const openResetModal = () => {
    setError(null);
    setSuccess(null);
    setResetEmail('');
    setShowResetModal(true);
  }

  const closeResetModal = () => {
    setShowResetModal(false);
    setError(null);
    setSuccess(null);
  }
  // --- End Password Reset Logic ---

  // --- MTU ID Login Placeholder (Keep as is) ---
  const handleMtuIdLogin = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setError('MTU ID Sign in is not yet implemented.');
     setSuccess(null);
     console.log("MTU ID Sign in attempt");
  }
  // --- End MTU ID Login ---


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl shadow-lg rounded-lg overflow-hidden my-8 bg-white">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-2/5 p-8 flex flex-col">
          {/* ... Logo, Title ... */}
           <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-16 w-auto" />
            </div>
            <h2 className="text-2xl font-medium text-green-800">Login to Zenith</h2>
          </div>

          {/* Error/Success Display */}
          {error && !showResetModal && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          {/* Success messages mainly for password reset modal */}


          {/* Email/Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
             <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">Username / Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required autoComplete="username" disabled={isLoggingIn} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
            </div>
            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-lg font-medium mb-2">Password</label>
              <div className="relative">
                <input id="password" type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" disabled={isLoggingIn} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"/>
                {/* Password visibility toggle */}
                 <button type="button" aria-label={passwordVisible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setPasswordVisible(!passwordVisible)} disabled={isLoggingIn}>
                   {/* SVGs */}
                   {passwordVisible ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg> )}
                 </button>
              </div>
              {/* Forgot password link */}
              <div className="flex justify-end mt-1">
                <button type="button" onClick={openResetModal} className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none" disabled={isLoggingIn}>Forgot password?</button>
              </div>
            </div>
            {/* Login Button */}
            <button type="submit" className="w-full bg-indigo-900 text-white py-3 rounded-md font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center" disabled={isLoggingIn}>
               {isLoggingIn ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                    Signing In...
                 </>
               ) : (
                 'Sign In'
               )}
            </button>
          </form>

           {/* ... (Divider, MTU ID Login Form, Registration Link) ... */}
            <div className="flex items-center my-6"> <div className="flex-grow border-t border-gray-300"></div> <span className="mx-4 text-gray-500 text-sm">OR</span> <div className="flex-grow border-t border-gray-300"></div> </div>
            <form onSubmit={handleMtuIdLogin} className="space-y-4"> {/* ... MTU ID Input ... */} <div className="mb-4"> <label htmlFor="mtuId" className="block text-gray-700 text-lg font-medium mb-2"> Sign In with MTU ID </label> <div className="relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /> </svg> </div> <input id="mtuId" type="text" placeholder="Enter your University Registration No." className="w-full pl-10 p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" /> </div> </div> <button type="submit" className="w-full bg-red-900 text-white py-3 rounded-md font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition-colors"> Sign In with MTU ID </button> </form>
            <div className="text-center mt-6"> <p className="text-sm text-gray-600"> Don't have an account? <a href="/sign-up" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"> Register Admin Account </a> </p> </div>


        </div>
        {/* Right Section - Image */}
        <div className="hidden md:block md:w-3/5">
          <img src="/sign-up-image.jpeg" alt="Decorative landscape for login page" className="h-full w-full object-cover"/>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full text-center p-4 text-gray-500 text-sm mt-auto"> Developed by Synergy Systems for Manipur Technical University<br/> Copyright © 2025 </footer>

      {/* Password Reset Modal (Keep as is) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           {/* ... Modal Content ... */}
           <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
             <div className="flex justify-between items-center mb-4"> <h3 className="text-xl font-semibold text-gray-800">Reset Password</h3> <button onClick={closeResetModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"> <span className="sr-only">Close</span> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> </button> </div>
             {error && ( <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded relative mb-4 text-sm" role="alert"> {error} </div> )} {success && ( <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded relative mb-4 text-sm" role="alert"> {success} </div> )}
             <form onSubmit={handlePasswordReset}> <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1"> Enter your account email address </label> <input id="resetEmail" type="email" placeholder="your.email@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" required aria-describedby="reset-email-description" disabled={isResetting} /> <p id="reset-email-description" className="text-xs text-gray-500 mb-4"> We'll send a password reset link to this email if it's associated with an account. </p>
               <div className="flex justify-end space-x-3"> <button type="button" onClick={closeResetModal} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50" disabled={isResetting}> Cancel </button> <button type="submit" className="px-4 py-2 rounded-md border border-transparent bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center" disabled={isResetting}> {isResetting ? ( <> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Sending... </> ) : ( 'Send Reset Link' )} </button> </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ZenithLogin;