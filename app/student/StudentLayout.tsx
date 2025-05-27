"use client";

import React, { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, LogOut, Settings, User, BookOpen, BarChart, Briefcase, ClipboardList, Menu, ChevronLeft, Sun, Moon, Home
} from 'lucide-react';
import { auth, signOutUser, onAuthStateChanged, getUserProfile } from '@/lib/firebase';
import { DocumentData, User as FirebaseUser } from 'firebase/auth'; // Renamed User
import Image from 'next/image'; // For logo

// Loading Spinner
const LoadingSpinner = ({ size = 'h-8 w-8', color = 'text-indigo-600' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

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
                      ? 'bg-white text-blue-900 font-semibold shadow-md dark:bg-gray-700 dark:text-white'
                      : 'text-white hover:bg-blue-800 hover:bg-opacity-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                    ${!isSidebarOpen ? 'justify-center' : ''}`}
        title={!isSidebarOpen ? label : undefined}
      >
        {iconElement}
        {isSidebarOpen && <span className="text-md whitespace-nowrap truncate">{label}</span>}
      </a>
    </Link>
  );
};

const LogoutButton = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div
      onClick={handleLogout}
      className={`flex items-center space-x-3 text-white cursor-pointer hover:bg-blue-800 hover:bg-opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-150 ease-in-out
                  ${!isSidebarOpen ? 'justify-center' : ''}`}
      title={!isSidebarOpen ? "Log out" : undefined}
    >
      <LogOut size={22} className="flex-shrink-0" />
      {isSidebarOpen && <span className="text-md whitespace-nowrap truncate">Log out</span>}
    </div>
  );
};


interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // Use FirebaseUser
  const [studentProfile, setStudentProfile] = useState<DocumentData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.role === 'student') {
            setStudentProfile(profile);
          } else {
            await signOutUser();
            router.push('/login?error=unauthorized_student');
          }
        } catch (error) {
          console.error("Error fetching student profile:", error);
          await signOutUser();
          router.push('/login?error=profile_error');
        }
      } else {
        setCurrentUser(null);
        router.push('/login');
      }
      setAuthLoading(false);
    });

    // Theme persistence
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    } else {
       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
       setIsDarkMode(prefersDark);
       if (prefersDark) document.documentElement.classList.add('dark');
    }

    return () => unsubscribe();
  }, [router]);

  const handleThemeToggle = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    document.documentElement.classList.toggle('dark', newDarkModeState);
    localStorage.setItem('theme', newDarkModeState ? 'dark' : 'light');
  };

  const navItems = [
    { iconElement: <Home size={22} />, label: 'Dashboard', href: '/student' },
    { iconElement: <User size={22} />, label: 'My Profile', href: '/student/profile' },
    { iconElement: <BookOpen size={22} />, label: 'Courses', href: '/student?view=courses' },
    { iconElement: <ClipboardList size={22} />, label: 'My Marks', href: '/student?view=marks' },
    // { iconElement: <Briefcase size={22} />, label: 'Materials', href: '/student?view=materials' }, // From original
    // { iconElement: <BarChart size={22} />, label: 'Results (Legacy)', href: '/student/result' }, // Keep legacy or integrate
    { iconElement: <Settings size={22} />, label: 'Settings', href: '/student/setting' },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner size="h-10 w-10" />
        <p className="ml-3 text-xl text-gray-700 dark:text-gray-300">Authenticating Student...</p>
      </div>
    );
  }

  if (!currentUser || !studentProfile) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-xl text-gray-700 dark:text-gray-300">Redirecting to login...</p>
        </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <div
        className={`bg-blue-900 dark:bg-gray-800 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} border-b border-blue-800 dark:border-gray-700 h-[65px] shrink-0`}>
          {isSidebarOpen && (
            <Link href="/student" passHref legacyBehavior>
              <a className="flex items-center space-x-2">
                <Image src="/zenith-logo.svg" alt="Zenith Logo" width={30} height={30} className="dark:brightness-0 dark:invert" />
                <span className="text-lg font-bold whitespace-nowrap truncate">Student Portal</span>
              </a>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white hover:bg-blue-700 dark:hover:bg-gray-700 rounded-md"
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
              active={pathname === item.href || (item.href.includes('?view=') && pathname === '/student' && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('view') === item.href.split('?view=')[1])}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </div>
        <div className="p-4 mt-auto border-t border-blue-800 dark:border-gray-700 shrink-0">
            <button onClick={handleThemeToggle} title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className={`w-full flex items-center space-x-3 text-white cursor-pointer hover:bg-blue-800 hover:bg-opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-150 ease-in-out mb-1.5 ${!isSidebarOpen ? 'justify-center' : ''}`} >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
              {isSidebarOpen && <span className="text-md whitespace-nowrap truncate">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          <LogoutButton isSidebarOpen={isSidebarOpen} />
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 sm:p-5 flex items-center justify-between flex-shrink-0 border-b dark:border-gray-700">
            <div className="relative w-full md:w-96">
                <input
                type="text"
                placeholder="Search portal..."
                className="w-full p-3 pl-10 pr-4 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            </div>
            <div className="flex items-center space-x-4 ml-4">
                 <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                    {studentProfile?.name || 'Student'}
                </span>
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-200 font-semibold ring-2 ring-indigo-200 dark:ring-indigo-600">
                  {studentProfile?.photoURL ? <Image src={studentProfile.photoURL} alt="P" width={40} height={40} className="rounded-full object-cover" /> : (studentProfile?.name ? studentProfile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : 'S')}
                </div>
            </div>
        </header>
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;