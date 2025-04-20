"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmailAndPassword } from '../lib/firebase'; // Ensure this path is correct

const ZenithRegistration = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // <-- FIX: Explicitly typed state
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 16) {
      setError('Password must be at least 16 characters long');
      return;
    }

    // Add more robust password validation here based on guidelines if needed
    // Example: Check for uppercase, lowercase, number, special character

    try {
      // Consider adding institutionName and contactNumber to the registration data if needed
      // This depends on how registerWithEmailAndPassword and your backend/Firebase setup works.
      // You might need to store these details in Firestore or Realtime Database associated with the user UID.
      await registerWithEmailAndPassword(email, password);

      // If you need to store extra user info (like institution name) after registration:
      // const userCredential = await registerWithEmailAndPassword(email, password);
      // const user = userCredential.user;
      // if (user) {
      //   // Store additional info in Firestore/Database using user.uid
      //   await storeInstitutionDetails(user.uid, { institutionName, contactNumber, email });
      // }

      setSuccess('Registration successful! Please check your email to verify your account.');

      // Optional: Redirect after some time
      setTimeout(() => {
        // Consider redirecting to a specific "check your email" page or login
        router.push('/login');
      }, 3000);
    } catch (err) {
       // Improve error handling for specific Firebase Auth errors
      if (err instanceof Error) {
         if ((err as any).code === 'auth/email-already-in-use') {
           setError('This email address is already registered. Please try logging in.');
         } else if ((err as any).code === 'auth/invalid-email') {
           setError('Please enter a valid email address.');
         } else if ((err as any).code === 'auth/weak-password') {
            // This check might be redundant if you have frontend validation, but good for safety
           setError('Password is too weak. Please follow the guidelines.');
         } else {
           setError(`Registration failed: ${err.message}`);
         }
      } else {
        setError('An unknown error occurred during registration.');
      }
      console.error("Registration Error:", err); // Log the full error for debugging
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl shadow-lg rounded-lg overflow-hidden my-8 bg-white"> {/* Moved bg-white here */}
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <img
                src="/zenith-logo.svg" // Ensure this path is correct in your public folder
                alt="Zenith Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-500">Online Student Result Management System</p>
          </div>

          <h2 className="text-2xl font-bold text-green-800 mb-6">Create your Account</h2>

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

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="institutionName" className="block text-gray-700 text-lg font-medium mb-2">
                Name of the Institution
              </label>
              <input
                id="institutionName"
                type="text"
                placeholder="ACME Inc"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">
                  Official Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@online.mtu.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="flex-1">
                <label htmlFor="contactNumber" className="block text-gray-700 text-lg font-medium mb-2">
                  Contact Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                    +91
                  </span>
                  <input
                    id="contactNumber"
                    type="tel" // Use type="tel" for phone numbers
                    placeholder="936646XXXX" // Adjusted placeholder
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))} // Allow only digits
                    className="flex-1 p-3 border border-gray-300 rounded-r-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    pattern="[0-9]{10}" // Basic pattern for 10 digits
                    title="Please enter a 10-digit Indian mobile number"
                    maxLength={10} // Limit input length
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="password" className="block text-gray-700 text-lg font-medium mb-2">
                  Login Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="At least 16 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={16}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-lg font-medium mb-2">
                  Confirm Password
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
                    minLength={16}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                     aria-label={confirmPasswordVisible ? "Hide confirmation password" : "Show confirmation password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                     {confirmPasswordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                 {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
                  )}
              </div>
            </div>

            <div className="pt-2 pb-4"> {/* Added padding top */}
              <h3 className="text-sm font-medium text-gray-600 mb-2">Password Guidelines</h3>
              <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1"> {/* Changed to ul and list-disc */}
                <li>Minimum 16 characters.</li>
                <li>Include a mix of uppercase letters, lowercase letters, numbers, and special characters (<code className="text-red-500 bg-gray-100 px-1 rounded">@#$%^&*!-=+</code>).</li>
                <li>Avoid common patterns (e.g., `123456`, `qwerty`) or personal information.</li>
                <li>Example: <code className="text-blue-500 bg-gray-100 px-1 rounded">Tr5$pQB&zLm@7xN2</code></li>
                <li>Do not reuse passwords from other sites.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-3 rounded-md font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition-colors"
              disabled={!!success} // Optionally disable button after success
            >
              Create Account
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600"> {/* Adjusted text size */}
                Already have an account?
                <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1">
                   Sign In
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Right Section - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/sign-up-image.jpeg" // Ensure this path is correct in your public folder
            alt="Decorative visual for registration page"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <footer className="w-full text-center p-4 text-gray-500 text-sm mt-auto"> {/* Added mt-auto */}
        Developed by Synergy Systems for Manipur Technical University<br />
        Copyright © 2025 {/* Use © symbol */}
      </footer>
    </div>
  );
};

export default ZenithRegistration;