'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, signOutUser } from '@/lib/firebase'; // Relative path to lib
import { User } from 'firebase/auth';

import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    ChevronsLeft,
    ChevronsRight,
    Moon,
    Sun,
    Users2, // For Dashboard "Total Students"
    Library, // For Dashboard "Active Courses"
    ClipboardList, // For Dashboard "Average Class Score"
    Bell, // For Dashboard "Pending Approvals"
    PlusCircle, // For "Add" buttons
    UploadCloud, // For "Import"
    DownloadCloud, // For "Export"
    FileText // For "Generate Reports"
} from 'lucide-react';

// Define navigation items
interface NavItem {
    name: string;
    icon: React.ElementType;
    pageKey: string;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, pageKey: 'dashboard' },
    { name: 'Student Management', icon: Users, pageKey: 'studentManagement' },
    { name: 'Course Administration', icon: BookOpen, pageKey: 'courseAdmin' },
    { name: 'Result Analytics', icon: BarChart3, pageKey: 'resultAnalytics' },
    { name: 'System Settings', icon: Settings, pageKey: 'systemSettings' },
];

// --- Dummy Content Components ---
const DashboardContent = () => (
    <div>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, Admin. Manage everything from here</p>
            </div>
            <button className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2">
                <DownloadCloud size={18} />
                <span>Export Report</span>
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
                { title: 'Total Students', value: '2,853', change: '+12% from last month', Icon: Users2, color: 'text-blue-500' },
                { title: 'Active Courses', value: '145', change: '+4 new this week', Icon: Library, color: 'text-purple-500' },
                { title: 'Average Class Score', value: '78.3%', change: '+2.1% from previous term', Icon: ClipboardList, color: 'text-green-500' },
                { title: 'Pending Approvals', value: '24', change: '-5 from yesterday', Icon: Bell, color: 'text-yellow-500', changeColor: 'text-red-500' },
            ].map(stat => (
                <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
                        <stat.Icon size={20} className={stat.color} />
                    </div>
                    <p className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.changeColor || 'text-green-500'}`}>{stat.change}</p>
                </div>
            ))}
        </div>

        <div className="flex flex-wrap space-x-0 sm:space-x-4 space-y-2 sm:space-y-0 mb-6">
            <button className="w-full sm:w-auto bg-gray-800 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-blue-500 flex items-center justify-center space-x-2">
                <PlusCircle size={18} />
                <span>Add New Student</span>
            </button>
            <button className="w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center space-x-2">
                <PlusCircle size={18} />
                <span>Create Course</span>
            </button>
            <button className="w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center space-x-2">
                <FileText size={18} />
                <span>Generate Reports</span>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Enrollments</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {[1,2,3,4,5].map(i => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2 last:border-b-0">Student {i} enrolled in Course {10+i} - {i} hour{i>1?'s':''} ago</li>
                    ))}
                </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Upcoming Deadlines</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                     {[1,2,3,4,5].map(i => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2 last:border-b-0">Assignment: Course 10{i}, Module {i} - {i} day{i>1?'s':''}</li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const StudentManagementContent = () => {
    const students = [
        { id: 'STU-1001', name: 'Joymangol', program: 'Computer Science', status: 'Active', lastActivity: '2 hours ago' },
        { id: 'STU-1002', name: 'Yaikhomba', program: 'Business Administration', status: 'Active', lastActivity: '1 day ago' },
        { id: 'STU-1003', name: 'Llhanba L', program: 'Electrical Engineering', status: 'Inactive', lastActivity: '2 weeks ago' },
        { id: 'STU-1004', name: 'Ryan L', program: 'Psychology', status: 'Active', lastActivity: '3 hours ago' },
        { id: 'STU-1005', name: 'Wilaim Oinam', program: 'Mathematics', status: 'Suspended', lastActivity: '1 month ago' },
    ];
    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
            case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-100';
            case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-100';
        }
    };
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Student Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage student records, enrollments, and academic progress.</p>
                </div>
                <button className="bg-gray-800 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-blue-500 flex items-center space-x-2">
                    <PlusCircle size={18} />
                    <span>Add Student</span>
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Student Records</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">View and manage all student information in the system.</p>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                    <input type="text" placeholder="Search students..." className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    <div className="flex space-x-2">
                        <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"> <UploadCloud size={16}/> <span>Import</span></button>
                        <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"> <DownloadCloud size={16}/> <span>Export</span></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['ID', 'Name', 'Program', 'Status', 'Last Activity', 'Actions'].map(header => (
                                   <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.program}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(student.status)}`}>{student.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.lastActivity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const GenericContent = ({ pageName }: { pageName: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{pageName}</h2>
        <p className="text-gray-600 dark:text-gray-300">Content for {pageName} will be displayed here.</p>
    </div>
);

export default function ConsolePage() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activePageKey, setActivePageKey] = useState<string>(navItems[0].pageKey);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/login');
            }
            setLoadingAuth(false);
        });
        // Check for system/persisted theme preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return () => unsubscribe();
    }, [router]);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const handleSignOut = async () => {
        try {
            await signOutUser();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const renderPageContent = (): ReactNode => {
        switch (activePageKey) {
            case 'dashboard': return <DashboardContent />;
            case 'studentManagement': return <StudentManagementContent />;
            default: return <GenericContent pageName={navItems.find(item => item.pageKey === activePageKey)?.name || 'Page'} />;
        }
    };

    const activeNavItem = navItems.find(item => item.pageKey === activePageKey);

    if (loadingAuth) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><p className="text-gray-700 dark:text-gray-300">Loading console...</p></div>;
    }
    if (!currentUser) return null; // Should be redirected by useEffect

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className={`bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex flex-col border-r dark:border-gray-700 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center px-4 border-b dark:border-gray-700">
                    {!isSidebarCollapsed && (
                        <Image src="/zenith-logo.svg" alt="Zenith Logo" width={90} height={28} className="dark:brightness-0 dark:invert" />
                    )}
                    <button onClick={toggleSidebar} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`} aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow p-3 space-y-1.5">
                    {navItems.map((item) => (
                        <button key={item.pageKey} onClick={() => setActivePageKey(item.pageKey)} title={item.name}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                                ${activePageKey === item.pageKey ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}
                                ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                            <item.icon size={20} />
                            {!isSidebarCollapsed && <span>{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t dark:border-gray-700 space-y-1.5">
                    <button onClick={handleThemeToggle} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {!isSidebarCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>
                    <button onClick={handleSignOut} title="Sign Out"
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 h-16 flex items-center px-6 border-b dark:border-gray-700 shadow-sm dark:shadow-none">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {activeNavItem?.name || 'Console'}
                    </h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {renderPageContent()}
                </div>
            </main>
        </div>
    );
}