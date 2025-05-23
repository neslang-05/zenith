"use client";

import React, { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Mail, Phone, Calendar, Building, Users, Eye, Clock,
  FileText as LessonFileText,
  MoreVertical, Filter, Upload, Share, FileText,
  BarChart2, AlertCircle, Check, X,
  Menu, ChevronLeft, LogOut, Settings, User, BookOpen, BarChart, Briefcase, ClipboardList
} from 'lucide-react';
import { auth, signOutUser, onAuthStateChanged, getUserProfile } from '@/lib/firebase'; // Adjust path
import { DocumentData } from 'firebase/firestore';

// --- SHARED NAV ITEM (ADAPTED FOR COLLAPSIBLE) ---
interface NavItemProps {
  iconElement: ReactNode;
  label: string;
  href: string;
  active: boolean;
  isSidebarOpen: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ iconElement, label, href, active, isSidebarOpen, onClick }) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <a
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out
                    ${active
                      ? 'bg-white text-blue-900 font-semibold shadow-md'
                      : 'text-white hover:bg-blue-800 hover:bg-opacity-50'
                    }
                    ${!isSidebarOpen ? 'justify-center' : ''}`} // Center icon when collapsed
        title={!isSidebarOpen ? label : undefined} // Tooltip for collapsed items
      >
        {iconElement}
        {isSidebarOpen && <span className="text-md whitespace-nowrap">{label}</span>}
      </a>
    </Link>
  );
};

const LogoutButton = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/login'); // Or your desired logout destination
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div
      onClick={handleLogout}
      className={`flex items-center space-x-3 text-white cursor-pointer hover:bg-blue-800 hover:bg-opacity-50 p-3 rounded-lg transition-colors duration-150 ease-in-out
                  ${!isSidebarOpen ? 'justify-center' : ''}`}
      title={!isSidebarOpen ? "Log out" : undefined}
    >
      <LogOut size={24} className="flex-shrink-0" />
      {isSidebarOpen && <span className="text-md whitespace-nowrap">Log out</span>}
    </div>
  );
};


interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<DocumentData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // To set active nav item

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.role === 'student') {
            setCurrentUser(profile);
          } else {
            // Not a student or no profile, redirect
            await signOutUser(); // Sign out if not a student
            router.push('/login'); // Or an unauthorized page
          }
        } catch (error) {
          console.error("Error fetching student profile:", error);
          await signOutUser();
          router.push('/login');
        }
      } else {
        setCurrentUser(null);
        router.push('/login');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const navItems = [
    { iconElement: <User size={24} />, label: 'Profile', href: '/student/profile' },
    { iconElement: <BookOpen size={24} />, label: 'Dashboard', href: '/student' }, // Main dashboard
    { iconElement: <Briefcase size={24} />, label: 'Materials', href: '/student?view=materials' }, // Link to dashboard view
    { iconElement: <BarChart size={24} />, label: 'Results', href: '/student/result' },
    { iconElement: <ClipboardList size={24} />, label: 'Assessments', href: '/student?view=assessments' }, // Link to dashboard view
    { iconElement: <Settings size={24} />, label: 'Settings', href: '/student/setting' },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Authenticating...</p>
        {/* Add a spinner here */}
      </div>
    );
  }

  if (!currentUser) {
    // This case should ideally be handled by the redirect in onAuthStateChanged
    // but as a fallback:
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <p className="text-xl text-gray-700">Redirecting to login...</p>
        </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-blue-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-72 sm:w-80' : 'w-20'}`}
      >
        <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} border-b border-blue-800 h-[73px]`}>
          {isSidebarOpen && (
            <Link href="/student" passHref legacyBehavior>
              <a className="flex items-center space-x-2">
                <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold whitespace-nowrap">Student Portal</span>
              </a>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white hover:bg-blue-800 rounded-md"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex-grow flex flex-col space-y-1.5 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              iconElement={item.iconElement}
              label={item.label}
              href={item.href}
              active={pathname === item.href || (item.href.includes('?view=') && pathname === '/student' && new URLSearchParams(window.location.search).get('view') === item.href.split('?view=')[1])}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </div>
        <div className="p-4 mt-auto border-t border-blue-800">
          <LogoutButton isSidebarOpen={isSidebarOpen} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
         {/* Top Header */}
        <header className="bg-white shadow-sm p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="relative w-full md:w-96">
                <input
                type="text"
                placeholder="Search..." // General search, context depends on page
                className="w-full p-3 pl-5 pr-12 rounded-full bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex items-center space-x-3 ml-4">
                {/* Notifications, User Avatar etc. can go here */}
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                  {currentUser.name ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : 'U'}
                </div>
            </div>
        </header>
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;