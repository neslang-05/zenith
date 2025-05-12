"use client"
import React from 'react';
import Link from 'next/link';

const ZenithNotFound = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8"> {/* Added py-8 for vertical padding */}
      <div className="flex w-full max-w-6xl shadow-lg rounded-lg overflow-hidden my-8">
        {/* Left Section - Error Content */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/zenith-logo.svg"
                alt="Zenith Logo"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-500 mb-4">Online Student Result Management System</p>

            <div className="mb-6">
              <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
              <h2 className="text-2xl font-bold text-green-800 mb-4">Page Not Found</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Oops! The page you are looking for seems to have wandered off the mountain path.
                It might have taken an unexpected detour or simply doesn't exist.
              </p>

              {/* --- Button Section - Updated --- */}
              <div className="space-y-4">
                <Link
                  href="/"
                  className="inline-block w-full bg-indigo-600 text-white py-3 rounded-md font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-center" // Lighter bg, bolder font, shadow, focus ring
                >
                  Return to Home
                </Link>

                {/* <Link
                  href="/"
                  className="inline-block w-full bg-green-700 text-white py-3 rounded-md font-semibold shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all text-center" // Lighter bg, bolder font, shadow, focus ring
                >
                  Go to Dashboard
                </Link> */}
              </div>
              {/* --- End Button Section --- */}


              <div className="mt-6 text-sm text-gray-500">
                <p>Need help? Contact our support team at</p>
                <p className="font-medium text-blue-600">support@zenith.app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/404-img.jpeg" // Ensure this image exists in your public folder
            alt="Mountain landscape illustration" // Improved alt text
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <footer className="w-full text-center p-4 text-gray-500 text-sm mt-auto"> {/* Added mt-auto to push footer down */}
        Developed by Synergy Systems <br />
        Copyright - 2025
      </footer>
    </div>
  );
};

export default ZenithNotFound;