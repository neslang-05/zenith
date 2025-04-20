'use client'
import React from 'react';
import Link from 'next/link';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';

const LandingPage = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* Navigation Bar - Moodle-inspired with blue primary color */}
            <header className="bg-white py-4 border-b border-gray-200">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <img
                            src="/zenith-logo.svg"
                            alt="Zenith Logo"
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Navigation Buttons - Moodle style */}
                    <nav className="space-x-4">
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signup" className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-6 rounded-full border border-blue-600 transition-colors">
                            Sign Up
                        </Link>
                    </nav>
                </div>
            </header>

            {/* 1. Hero Section - Moodle style with blue and curved shapes */}
            <section className="bg-blue-50 py-20 relative overflow-hidden">
                {/* Background curved shape element - Moodle-like */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100 rounded-bl-full opacity-70"></div>

                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left Side - Text Content */}
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6 leading-tight">
                            Empower your learning journey
                        </h1>
                        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                            Your all-in-one platform for courses, grades, and progress tracking. Learn smarter, achieve more.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-colors">
                                Sign Up
                            </button>
                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                <PlayCircleIcon className="h-6 w-6" />
                                <span>Watch a Demo</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Hero Image */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
                            <img src="hero-mockup-placeholder.png" alt="Dashboard Preview" className="relative rounded-xl shadow-lg w-full max-w-md" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section - Moodle style */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-500 mb-8">TRUSTED BY EDUCATORS WORLDWIDE</p>
                    <div className="flex flex-wrap justify-center gap-8 items-center">
                        <img src="harvardx-logo-placeholder.png" alt="HarvardX" className="h-8 grayscale hover:grayscale-0 transition-all" />
                        <img src="coursera-logo-placeholder.png" alt="Coursera" className="h-8 grayscale hover:grayscale-0 transition-all" />
                        <img src="edx-logo-placeholder.png" alt="edX" className="h-8 grayscale hover:grayscale-0 transition-all" />
                        <img src="partner-logo-placeholder.png" alt="Partner" className="h-8 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </section>

            {/* 2. Key Features Grid - Moodle-inspired clean cards */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-blue-800 mb-4">
                        All-in-one learning platform
                    </h2>
                    <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                        Everything you need to manage courses, track progress, and achieve better educational outcomes
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">📊</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Real-Time Grade Tracking</h3>
                            <p className="text-gray-600">Instantly view progress with automatic grade calculations and personalized insights</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">🎓</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Unified Course Hub</h3>
                            <p className="text-gray-600">Access all course materials, assignments, and resources in one centralized location</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">🤖</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">AI Learning Assistant</h3>
                            <p className="text-gray-600">Get 24/7 homework help and personalized concept explanations with our AI tutor</p>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">📈</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Performance Analytics</h3>
                            <p className="text-gray-600">Track trends, predict outcomes, and identify opportunities with advanced data insights</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">🔒</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Enhanced Security</h3>
                            <p className="text-gray-600">Protect student data with enterprise-grade encryption and privacy controls</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600 text-2xl">📱</div>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Anywhere Access</h3>
                            <p className="text-gray-600">Learn on any device with our fully responsive platform, online or offline</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Platform Showcase - Moodle-style with angles and accent colors */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-white relative">
                {/* Background accent element */}
                <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-blue-100 rounded-br-full opacity-50"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-bold text-blue-800 mb-4">
                        See Zenith in action
                    </h2>
                    <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                        Discover how our platform transforms the learning experience
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Showcase Video/Image */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img src="platform-showcase-placeholder.png" alt="Platform Showcase" className="w-full" />
                        </div>

                        {/* Right Side - Feature Highlight */}
                        <div className="text-left">
                            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Intelligent Grade Prediction</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                Our predictive analytics help students stay on track and reach their academic goals by providing:
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700">Personalized progress reports based on current performance</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700">Early warning system for potential grade issues</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700">Custom study recommendations based on data insights</span>
                                </li>
                            </ul>

                            <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-colors">
                               See a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Social Proof - Moodle-style testimonials */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-blue-800 mb-4">
                        Loved by students and educators
                    </h2>
                    <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                        See why thousands of institutions trust Zenith to power their educational experiences
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-blue-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="mb-6">
                                <div className="flex justify-center">
                                    <img src="testimonial-avatar-1.png" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                                </div>
                                <div className="flex justify-center mt-4 mb-4">
                                    {/* 5 stars */}
                                    <div className="flex text-yellow-400">
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">"Zenith completely transformed how I manage my courses. The grade tracking is intuitive, and the AI tutor has been a game-changer for my students."</p>
                            <h4 className="font-semibold text-blue-800">Dr. Willian Heikrujam</h4>
                            <p className="text-gray-500 text-sm">Professor</p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-blue-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="mb-6">
                                <div className="flex justify-center">
                                    <img src="testimonial-avatar-2.png" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                                </div>
                                <div className="flex justify-center mt-4 mb-4">
                                    {/* 5 stars */}
                                    <div className="flex text-yellow-400">
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">"The predictive analytics have helped us identify at-risk students early and provide targeted support. Our student success rates have improved by 32%."</p>
                            <h4 className="font-semibold text-blue-800">Savio Rodriguez</h4>
                            <p className="text-gray-500 text-sm">Registrar</p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-blue-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="mb-6">
                                <div className="flex justify-center">
                                    <img src="testimonial-avatar-3.png" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                                </div>
                                <div className="flex justify-center mt-4 mb-4">
                                    {/* 5 stars */}
                                    <div className="flex text-yellow-400">
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                        <StarIcon className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">"As a student, Zenith has been incredibly helpful. The unified course hub keeps me organized, and the mobile access means I can study anywhere."</p>
                            <h4 className="font-semibold text-blue-800">Willson Loukham</h4>
                            <p className="text-gray-500 text-sm">Student</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Call to Action - Moodle-style prominent button */}
            <section className="py-24 bg-blue-100 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-8">
                        Ready to transform your learning experience?
                    </h2>
                    <p className="text-xl text-gray-700 mb-12 max-w-xl mx-auto">
                        Start your free trial today and discover the power of Zenith for your educational needs.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-full text-xl shadow-lg transition-colors">
                        Start Free Trial
                    </button>
                </div>
            </section>

            {/* Footer - Moodle style simple footer */}
            <footer className="bg-white py-6 border-t border-gray-200 text-center text-gray-500">
                <div className="container mx-auto px-6">
                    <p>© 2025 Zenith. All rights reserved.</p>
                    <p className="mt-2">
                        <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
                        <span className="mx-2">·</span>
                        <Link href="/terms" className="hover:text-blue-600">Terms of Service</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;