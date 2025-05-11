'use client'

import React, { useState, useEffect, useCallback, RefCallback } from 'react';
import Link from 'next/link';

// Heroicons (keep existing icons - adjust colors via CSS)
import {
    ChevronRightIcon,
    StarIcon,
    CheckIcon,
    ArrowRightIcon,
    RocketLaunchIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    DevicePhoneMobileIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/solid';

import {
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

// Custom hook for intersection observer animations (remains the same)
const useInView = <T extends Element = HTMLElement>(
    options: IntersectionObserverInit = {}
): [RefCallback<T>, boolean] => {
    const [element, setElement] = useState<T | null>(null);
    const [isInView, setIsInView] = useState(false);

    const refCallback = useCallback((node: T | null) => {
        setElement(node);
    }, []);

    useEffect(() => {
        if (!element) {
            setIsInView(false);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, options);
        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [element, options]);

    return [refCallback, isInView];
};

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Use refs for sections you want to animate
    const [featuresRef, featuresInView] = useInView<HTMLElement>({ threshold: 0.1 });
    const [platformRef, platformInView] = useInView<HTMLElement>({ threshold: 0.1 }); // Renamed ref for consistency
    const [testimonialsRef, testimonialsInView] = useInView<HTMLElement>({ threshold: 0.1 });
    const [ctaRef, ctaInView] = useInView<HTMLElement>({ threshold: 0.1 });

    const navItems = [
        { title: 'Features', href: '#features' },
        { title: 'Platform', href: '#platform' }, // Renamed 'Showcase' to 'Platform'
        { title: 'Testimonials', href: '#testimonials' },
        { title: 'Pricing', href: '#pricing' },
    ];

    // Animation classes (reuse and update)
    const sectionAnimation = "transition-all duration-700 ease-out";
    const fadeInUp = "transform transition-all duration-700 ease-out";
    // Card hover effect - subtle light mode hover
    const cardHover = "transition-all duration-300 hover:shadow-lg hover:border-blue-300"; // Lighter blue border on hover
    const buttonAnimation = `transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2`; // Square buttons mean no rounded focus ring offset needed if focus ring is border

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    // Keep the content rewritten from the previous step (no AI)
    const features = [
        {
            icon: <RocketLaunchIcon />,
            title: "Optimized Study Paths",
            description: "Structured paths and resources designed to streamline your learning.",
        },
        {
            icon: <AcademicCapIcon />,
            title: "Unified Course Management",
            description: "Organize courses, materials, and assignments in one place.",
        },
        {
            icon: <LightBulbIcon />,
            title: "Concept Clarity Tools",
            description: "Resources and tools for understanding challenging topics.",
        },
        {
            icon: <PresentationChartLineIcon />,
            title: "Performance Analytics",
            description: "Track your progress, identify areas for improvement, and optimize study strategies.",
        },
        {
            icon: <ShieldCheckIcon />,
            title: "Data Security",
            description: "Robust encryption and privacy standards for your academic data.",
        },
        {
            icon: <DevicePhoneMobileIcon />,
            title: "Cross-Device Access",
            description: "Learn seamlessly on any device with our fully responsive platform.",
        },
    ];

    // Keep the content rewritten from the previous step (no AI)
    const testimonials = [
        {
            content: "Zenith has transformed our virtual classrooms. The intuitive interface and comprehensive analytics boosted student engagement significantly.",
            author: "ANGOM TERESA",
            role: "University Web Administrator",
            rating: 5,
            avatar: "/avatars/avatar-1.png" // Assuming these paths are valid
        },
        {
            content: "Using Zenith is a game-changer. My grades have improved, and I feel more confident in my studies than ever before.",
            author: "RAJESH KUMAR",
            role: "Student",
            rating: 5,
            avatar: "/avatars/avatar-2.png"
        },
        {
            content: "Managing multiple online courses was a hassle. Zenith streamlined everything, making teaching and learning more efficient and enjoyable.",
            author: "MEECOLEN KONSAM",
            role: "Teaching Assistant",
            rating: 4,
            avatar: "/avatars/avatar-3.png"
        },
    ];

    const legalLinks = [
        { title: "Terms of Service", href: "/terms" },
        { title: "Privacy Policy", href: "/privacy" },
        { title: "GitHub", href: "https://github.com/neslang-05/zenith" } // Keep external link behavior
    ];

    // Define the new contrasting color palette using Tailwind defaults
    const colors = {
        primary: 'bg-white', // Light background
        secondary: 'bg-slate-50', // Slightly darker light for contrast
        accent: 'bg-blue-900', // Primary Navy accent
        accentHover: 'hover:bg-blue-800', // Darker Navy on hover
        accentText: 'text-blue-700', // Text/icon color that stands out on light
        accentTextHover: 'hover:text-blue-900',
        textPrimary: 'text-slate-900', // Dark text for headings
        textSecondary: 'text-slate-700', // Slightly lighter text for body
        border: 'border-slate-200', // Border color
        focusRing: 'focus:ring-blue-900',
        focusRingOffsetPrimary: 'focus:ring-offset-white', // Offset for white background
        focusRingOffsetSecondary: 'focus:ring-offset-slate-50', // Offset for slate-50 background
    };

    // Button base styles (square - remove rounded classes)
    const buttonBase = `font-semibold py-3 px-8 text-lg shadow-md ${buttonAnimation}`;
    const buttonPrimary = `${colors.accent} ${colors.accentHover} text-white ${colors.focusRing} ${colors.focusRingOffsetPrimary}`;
    const buttonSecondary = `bg-white hover:bg-slate-100 ${colors.accentText} border border-blue-700 ${colors.focusRing} ${colors.focusRingOffsetPrimary}`; // Border using the accent text color

    // Mobile button base styles
    const mobileButtonBase = `w-full text-center font-medium py-3 px-5 ${buttonAnimation}`;
    const mobileButtonPrimary = `${colors.accent} ${colors.accentHover} text-white focus:ring-2 ${colors.focusRing} focus:ring-offset-white`; // Mobile menu offset white bg

    return (
        <div className={`${colors.primary} min-h-screen font-sans ${colors.textSecondary} antialiased overflow-x-hidden`}>
            {/* Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300
                    ${isScrolled
                        ? 'shadow-md bg-white/95 backdrop-blur-md'
                        : 'bg-white/80 backdrop-blur-sm'
                    }
                    border-b ${colors.border}`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center">
                            {/* Assuming logo works on light background or use original */}
                            <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-8 w-auto" />
                            {/* <span className={`ml-2 text-2xl font-bold ${colors.accentText}`}>Zenith</span> */}
                        </Link>

                        <nav className="hidden md:flex space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`text-sm font-medium ${colors.textSecondary} ${colors.accentTextHover} transition-colors`}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/login"
                                className={`${buttonAnimation} bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-5 ${colors.focusRing} ${colors.focusRingOffsetPrimary}`}
                            >
                                Login
                            </Link>
                        </div>

                        <button
                            className={`md:hidden p-2 text-slate-700 hover:${colors.accentText} focus:outline-none focus:ring-2 focus:ring-inset ${colors.focusRing}`}
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden absolute w-full left-0 top-16 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden border-t ${colors.border} ${mobileMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'}`}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`${colors.textSecondary} block px-3 py-2 hover:bg-slate-100 ${colors.accentTextHover} text-base font-medium`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            ))}
                            <hr className={`my-3 ${colors.border}`} />
                            <Link
                                href="/login"
                                className={`${colors.textSecondary} block px-3 py-2 hover:bg-slate-100 ${colors.accentTextHover} text-base font-medium`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="pt-16"> {/* Spacer for fixed header */}
                {/* Hero Section */}
                <section
                    id="hero"
                    className="relative py-20 md:py-32 overflow-hidden"
                >
                    {/* Blurred Gradient Background Layer */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-200 via-teal-300 to-purple-300 filter blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl mx-auto text-center">
                                {/* Using a light blue border and accent text */}
                                <div className={`inline-flex items-center border border-blue-500 px-4 py-1 text-sm font-medium text-blue-700 mb-4`}>
                                    Your Path to Academic Excellence
                                </div>
                                {/* Using dark text for the main heading */}
                                <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight`}>
                                    Unlock Your Full Academic Potential
                                </h1>
                                {/* Using slightly lighter dark text for description */}
                                <p className={`text-lg md:text-xl text-slate-700 mb-10 max-w-2xl mx-auto`}>
                                    Zenith provides a comprehensive platform for students and educators to manage courses, streamline studies, and achieve educational goals.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {/* Primary Button: Navy background, white text, square */}
                                    <Link
                                        href="/login"
                                        className={`font-semibold py-3 px-8 text-lg shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-900 hover:bg-blue-800 text-white focus:ring-blue-900 focus:ring-offset-white`}
                                    >
                                        Sign In to Zenith
                                    </Link>
                                    {/* Secondary Button: White background, navy border/text, square */}
                                    <Link
                                        href="#features"
                                        className={`font-semibold py-3 px-8 text-lg shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-slate-100 text-blue-700 border border-blue-700 focus:ring-blue-900 focus:ring-offset-white`}
                                    >
                                        Explore Features
                                    </Link>
                                </div>
                            </div>
                            {/* Using a light mode mockup with border */}
                            <div className={`mt-16 md:mt-24 transform transition-all duration-700 ease-out ${true ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                <img
                                    src="/dashboard.png" // Assuming a light themed mockup
                                    alt="Zenith Platform Dashboard"
                                    className={`rounded-lg shadow-2xl mx-auto max-w-4xl border border-slate-200`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    ref={featuresRef}
                    id="features"
                    className={`py-16 md:py-24 ${colors.primary} ${sectionAnimation} ${featuresInView ? 'opacity-100' : 'opacity-0 -translate-y-5'}`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                            <h2 className={`text-3xl md:text-4xl font-bold ${colors.textPrimary} mb-4`}>
                                Powerful Features for Success
                            </h2>
                            <p className={`text-lg ${colors.textSecondary}`}>
                                Zenith provides a comprehensive suite of tools designed for modern learning environments.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`${cardHover} ${fadeInUp} ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
                                    bg-white p-6 border ${colors.border}`} // Explicitly removing rounded-xl
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className={`mb-5 inline-flex items-center justify-center p-3 bg-blue-50`}> {/* Lighter blue background for icon */}
                                        {React.cloneElement(feature.icon as React.ReactElement, { className: `h-8 w-8 ${colors.accentText}` })}
                                    </div>
                                    <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-2`}>{feature.title}</h3>
                                    <p className={`${colors.textSecondary} text-sm`}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Platform Showcase (Course Management/Organization) */}
                <section
                    ref={platformRef} // Using the renamed ref
                    id="platform"
                    className={`py-16 md:py-24 ${colors.secondary} ${sectionAnimation} ${platformInView ? 'opacity-100' : 'opacity-0 -translate-y-5'}`} // Using the renamed inView state
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className={`${fadeInUp} ${platformInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} lg:pr-10`}> {/* Using the renamed inView state */}
                                <span className={`text-sm font-semibold uppercase ${colors.accentText} mb-2 block`}>Integrated Platform</span>
                                <h2 className={`text-3xl md:text-4xl font-bold ${colors.textPrimary} mb-6`}>
                                    Organize Everything in One Place
                                </h2>
                                <p className={`text-lg ${colors.textSecondary} mb-8`}>
                                    Zenith brings all your learning materials, assignments, deadlines, and communication tools into one unified platform, simplifying your academic life.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Manage all your courses and materials seamlessly",
                                        "Effortlessly track assignments and deadlines",
                                        "Quickly access study resources and notes",
                                        "Stay connected with educators and peers"
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckIcon className={`h-6 w-6 ${colors.accentText} mr-3 flex-shrink-0 mt-0.5`} />
                                            <span className={`${colors.textSecondary}`}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/demo"
                                    className={`${buttonBase} ${buttonPrimary} px-6 text-base inline-flex items-center`}
                                >
                                    Request a Demo
                                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                                </Link>
                            </div>
                            {/* Using a different mockup image representing organization */}
                            <div className={`${fadeInUp} ${platformInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} mt-10 lg:mt-0`} // Using the renamed inView state
                                style={{ transitionDelay: `150ms` }}
                            >
                                <img
                                    src="/platform.png" // Assuming a light themed mockup
                                    alt="Zenith Platform Organization"
                                    className={`rounded-xl shadow-xl border ${colors.border} w-full`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section
                    ref={testimonialsRef}
                    id="testimonials"
                    className={`py-16 md:py-24 ${colors.primary} ${sectionAnimation} ${testimonialsInView ? 'opacity-100' : 'opacity-0 -translate-y-5'}`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                            <UserGroupIcon className={`h-12 w-12 ${colors.accentText} mx-auto mb-4`} />
                            <h2 className={`text-3xl md:text-4xl font-bold ${colors.textPrimary} mb-4`}>
                                Trusted by Learners and Educators
                            </h2>
                            <p className={`text-lg ${colors.textSecondary}`}>
                                Hear what our users have to say about their Zenith experience.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className={`${cardHover} ${fadeInUp} ${testimonialsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
                                    bg-white p-8 border ${colors.border} flex flex-col`} // Explicitly removing rounded-xl
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400" : "text-slate-300"}`} />
                                        ))}
                                    </div>
                                    <p className={`${colors.textSecondary} italic mb-6 flex-grow`}>"{testimonial.content}"</p>
                                    <div className="flex items-center mt-auto">
                                        <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4 object-cover bg-slate-200" /> {/* Light background for avatar */}
                                        <div>
                                            <h4 className={`font-semibold ${colors.textPrimary}`}>{testimonial.author}</h4>
                                            <p className={`${colors.textSecondary} text-sm`}>{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section
                    ref={ctaRef}
                    id="cta"
                    className={`py-16 md:py-24 bg-gradient-to-r from-blue-800 to-blue-900 ${sectionAnimation} ${ctaInView ? 'opacity-100' : 'opacity-0 -translate-y-5'}`} // Gradient using navy accent colors
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6`}> {/* White text on dark blue gradient */}
                                Ready to Elevate Your Learning?
                            </h2>
                            <p className={`text-lg md:text-xl text-blue-100 mb-10`}> {/* Very light blue text on dark blue */}
                                Join thousands transforming their education with Zenith. Start your free trial today – no credit card required.
                            </p>
                            <Link
                                href="/signup"
                                className={`${buttonBase} bg-white hover:bg-slate-100 text-blue-800 py-4 px-10 text-lg shadow-md focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800`} // White button with dark blue text on gradient
                            >
                                Get Started For Free
                            </Link>
                            <p className="mt-4 text-sm text-blue-200">14-day free trial • Cancel anytime</p> {/* Another light blue shade */}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={`${colors.secondary} border-t ${colors.border}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <Link href="/" className="flex items-center mb-4">
                                {/* Assuming logo works on light background or use original */}
                                <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-8 w-auto" />
                                {/* <span className={`ml-2 text-xl font-bold ${colors.accentText}`}>Zenith</span> */}
                            </Link>
                            <p className={`text-sm ${colors.textSecondary} max-w-xs`}>
                                Empowering the next generation of learners and educators with a comprehensive learning platform.
                            </p>
                        </div>

                        <div>
                            <h3 className={`text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider mb-4`}>Quick Links</h3>
                            <ul className="space-y-2">
                                {navItems.map(item => (
                                    <li key={item.title}><Link href={item.href} className={`text-sm ${colors.textSecondary} ${colors.accentTextHover}`}>{item.title}</Link></li>
                                ))}
                                <li><Link href="/login" className={`text-sm ${colors.textSecondary} ${colors.accentTextHover}`}>Login</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className={`text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider mb-4`}>Legal</h3>
                            <ul className="space-y-2">
                                {legalLinks.map((link) => (
                                    <li key={link.title}>
                                        <Link
                                            href={link.href}
                                            className={`text-sm ${colors.textSecondary} ${colors.accentTextHover}`}
                                            target={link.href.startsWith('http') ? "_blank" : "_self"}
                                            rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={`mt-10 pt-8 border-t ${colors.border} text-center text-sm ${colors.textSecondary}`}>
                        © {new Date().getFullYear()} Zenith Learning Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;