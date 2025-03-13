"use client"

import React, { useState } from 'react';

const ZenithRegistration = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl shadow-lg rounded-lg overflow-hidden my-8">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Zenith</h1>
            <p className="text-gray-500">Online Student Result Management System</p>
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-6">Create your Account</h2>
          
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Name of the Institution
              </label>
              <input 
                type="text" 
                placeholder="ACME Inc" 
                className="w-full p-3 border rounded-md"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-lg font-medium mb-2">
                  Official Email
                </label>
                <input 
                  type="email" 
                  placeholder="admin@online.mtu.ac.in" 
                  className="w-full p-3 border rounded-md"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-gray-700 text-lg font-medium mb-2">
                  Contact Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-200 border rounded-l-md">
                    +91
                  </span>
                  <input 
                    type="text" 
                    placeholder="93664-6XXXX" 
                    className="flex-1 p-3 border border-l-0 rounded-r-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-lg font-medium mb-2">
                  Login Password
                </label>
                <div className="relative">
                  <input 
                    type={passwordVisible ? "text" : "password"} 
                    placeholder="At least 16 characters"
                    className="w-full p-3 border rounded-md"
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-gray-700 text-lg font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={confirmPasswordVisible ? "text" : "password"} 
                    placeholder="At least 16 characters"
                    className="w-full p-3 border rounded-md"
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Password Guidelines</h3>
              <ol className="list-decimal pl-6 text-xs text-gray-500 space-y-1">
                <li>Minimum 16 characters with a mix of uppercase letters, lowercase letters, numbers, and at least one special character (<span className="text-red-500">@#$%^&*!-=+</span>)</li>
                <li>No repetitive patterns (e.g., aaa) or common sequences (e.g., 123456, qwerty)</li>
                <li>Example format: <span className="text-blue-500">Tr5$pQB$zLm@7xN2</span></li>
                <li>Do not reuse passwords from other websites or services</li>
              </ol>
            </div>
            
            <button className="w-full bg-indigo-900 text-white py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors">
              Create Account
            </button>
            
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Already have an account 
                <a href="#" className="text-indigo-600 font-medium ml-1">Sign In</a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Section - Image */}
        <div className="hidden md:block md:w-1/2">
          <img 
            src="/api/placeholder/800/600" 
            alt="Winter scene with person walking with umbrella" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      
      <footer className="w-full text-center p-4 text-gray-500 text-sm">
        Developed by Synergy Systems for Manipur Technical University<br/>
        Copyright - 2025
      </footer>
    </div>
  );
};

export default ZenithRegistration;