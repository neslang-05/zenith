"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import both Auth registration and Firestore profile creation functions
import { registerWithEmailAndPassword, createUserProfile } from '../lib/firebase'; // Adjust path if needed

const AdminSignUpPage = () => { // Renamed component for clarity
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState(''); // Keeping contact number field
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => { // Ensure it's FormEvent
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Consider adding more robust password validation here later
    if (password.length < 8) { // Example: Minimum 8 characters for MVP
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!institutionName.trim()) {
        setError('Institution name is required.');
        setIsLoading(false);
        return;
    }

    try {
      // Step 1: Register the user with Firebase Auth
      const userCredential = await registerWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user) {
        // This should not happen if registerWithEmailAndPassword resolves, but good to check
        throw new Error("User registration failed, user data not available.");
      }

      // Step 2: Create the user profile document in Firestore with 'admin' role
      // Include institutionName and contactNumber in the additionalData
      await createUserProfile(user.uid, user.email || email, 'admin', {
         institutionName: institutionName.trim(),
         contactNumber: contactNumber, // Store contact number if needed
         // Add any other admin-specific fields here if necessary
      });

      // Step 3: Success feedback and redirection
      // Note: Firebase Auth usually sends a verification email automatically.
      setSuccess('Admin account registered successfully! Please check your email to verify your account.');

      // Optional: Redirect after some time
      setTimeout(() => {
        router.push('/admin/console/settings'); // Redirect to System Settings after successful registration
      }, 4000); // Increased delay to allow reading the success message

    } catch (err) {
      // Handle errors from both Auth and Firestore
      let errorMessage = 'An unknown error occurred during registration.';
      if (err instanceof Error) {
         // Check for specific Firebase Auth error codes
        if ((err as any).code === 'auth/email-already-in-use') {
          errorMessage = 'This email address is already registered. Please try logging in or use a different email.';
        } else if ((err as any).code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if ((err as any).code === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 8 characters).';
        } else {
          // General error or potential Firestore error
          errorMessage = `Registration failed: ${err.message}`;
        }
      }
      setError(errorMessage);
      console.error("Registration Error:", err);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl shadow-lg rounded-lg overflow-hidden my-8 bg-white">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="text-center mb-6">
            {/* ... (Logo) ... */}
            <div className="flex justify-center mb-2">
              <img
                src="/zenith-logo.svg"
                alt="Zenith Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-500">Online Student Result Management System</p>
          </div>

          <h2 className="text-2xl font-bold text-green-800 mb-6">Create Admin Account</h2> {/* Updated Title */}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
               <strong className="font-bold">Success!</strong>
               <span className="block sm:inline ml-2">{success}</span>
            </div>
          )}

          {/* Wrap form elements in <form> tag */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* --- Institution Name Input --- */}
            <div className="mb-4">
              <label htmlFor="institutionName" className="block text-gray-700 text-lg font-medium mb-2">
                Name of the Institution <span className="text-red-500">*</span>
              </label>
              <input
                id="institutionName"
                type="text"
                placeholder="e.g., Some University or College Name"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
            </div>

            {/* --- Email and Contact --- */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="flex-1">
                <label htmlFor="contactNumber" className="block text-gray-700 text-lg font-medium mb-2">
                  Contact Number {/* Optional, remove * if not required */}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                    +91
                  </span>
                  <input
                    id="contactNumber"
                    type="tel"
                    placeholder="987654XXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-3 border border-gray-300 rounded-r-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    // required // Make required if necessary
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit Indian mobile number"
                    maxLength={10}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* --- Password Fields --- */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="password" className="block text-gray-700 text-lg font-medium mb-2">
                  Login Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                   {/* Password visibility toggle */}
                  <button
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    disabled={isLoading}
                  >
                     {/* SVG Icons */}
                     {passwordVisible ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg> )}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-lg font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full p-3 border rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  {/* Password visibility toggle */}
                  <button
                    type="button"
                    aria-label={confirmPasswordVisible ? "Hide confirmation password" : "Show confirmation password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                     disabled={isLoading}
                  >
                     {/* SVG Icons */}
                     {confirmPasswordVisible ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg> )}
                  </button>
                </div>
                 {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
                  )}
              </div>
            </div>

            {/* Optional: Simplify password guidelines for MVP if desired */}
            <div className="pt-2 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Password Guidelines</h3>
              <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
                <li>Minimum 8 characters.</li>
                <li>Consider using a mix of letters, numbers, and symbols.</li>
                <li>Do not reuse passwords from other sites.</li>
              </ul>
            </div>

            {/* --- Submit Button --- */}
            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-3 rounded-md font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={isLoading || !!success} // Disable button while loading or on success
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>

            {/* --- Link to Login --- */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an admin account?
                <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1">
                   Sign In
                </a>
              </p>
            </div>
          </form> {/* End of form */}
        </div>

        {/* Right Section - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/sign-up-image.jpeg"
            alt="Decorative visual for registration page"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center p-4 text-gray-500 text-sm mt-auto">
        Developed by Synergy Systems<br />
        Copyright © 2025
      </footer>
    </div>
  );
};

export default AdminSignUpPage;