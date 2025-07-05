'use client';

import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    auth,
    onAuthStateChanged,
    signOutUser,
    createUserWithEmailAndPassword, // For creating auth users
    createUserProfile,             // For creating user profiles in Firestore
    createFacultyProfile,          // Specific for faculty profiles
    getAllStudents,
    getAllFaculty,
    getAllCourses,
    getRegisteredStudentsForCourse,
    getStudentMarksForCourse,
    upsertAdminEndTermMarks,
    publishAdminEndTermMarks,
    CourseData, MarksData,
    findStudentByRegNum, // if needed for specific search
    getUserProfile,
    createNewUserWithoutSigningOut,
    updateUserProfile,
    uploadProfileImage,
    getDepartments,
    getSemesters,
    getCourses,
    getAllMarksForCourse,
} from '@/lib/firebase'; // Relative path to lib
import { User } from 'firebase/auth';
import { DocumentData, Timestamp } from 'firebase/firestore';

import {
    LayoutDashboard, Users, BookOpen, BarChart3, Settings, LogOut, ChevronsLeft, ChevronsRight,
    Moon, Sun, Users2, Library, ClipboardList, Bell, PlusCircle, UploadCloud, DownloadCloud,
    FileText, Search, Edit3, Trash2, Eye, EyeOff, CheckCircle, XCircle, Send, Save, BookUser, UserPlus, Check, X, Home, Layers, Calendar
} from 'lucide-react';

import InstitutionStructureSettings from '@/components/InstitutionStructureSettings';

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

// --- Navigation Items ---
interface NavItem {
    name: string;
    icon: React.ElementType;
    pageKey: string;
}
const navItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, pageKey: 'dashboard' },
    { name: 'Student Management', icon: Users, pageKey: 'studentManagement' },
    { name: 'Faculty Management', icon: BookUser, pageKey: 'facultyManagement' },
    { name: 'Course & Marks Admin', icon: BookOpen, pageKey: 'courseMarksAdmin' },
    { name: 'System Settings', icon: Settings, pageKey: 'systemSettings' },
];

// Add these type definitions
interface Student extends DocumentData {
    id: string;
    name: string;
    createdAt?: Timestamp;
}

interface Course extends CourseData {
    id: string;
    createdAt?: Timestamp;
}

interface Department extends DocumentData {
    id: string;
    name: string;
    semesters: Semester[];
}

interface Semester extends DocumentData {
    id: string;
    name: string;
    courses: Course[];
}

interface RegistrationActivity {
    type: 'registration';
    user: string;
    role: string;
    time: string;
}

interface CourseActivity {
    type: 'course';
    course: string;
    action: string;
    by: string;
    time: string;
}

type Activity = RegistrationActivity | CourseActivity;

// --- Content Components ---

// --- DashboardContent (Enhanced) ---
const DashboardContent = () => {
    const [summary, setSummary] = useState({
        students: 0,
        faculty: 0,
        courses: 0,
        departments: 0,
    });
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all required data in parallel
                const [students, faculty, courses, departments] = await Promise.all([
                    getAllStudents(),
                    getAllFaculty(),
                    getAllCourses(),
                    getDepartments()
                ]);

                // Update summary with real data
                setSummary({
                    students: students.length,
                    faculty: faculty.length,
                    courses: courses.length,
                    departments: departments.length,
                });

                // Create recent activities from the latest data
                const activities: Activity[] = [];
                
                // Add latest student registrations
                if (students.length > 0) {
                    const latestStudents = students.slice(0, 3);
                    activities.push(...latestStudents.map((student: DocumentData & { id: string }) => {
                        const studentData = student as Student;
                        return {
                            type: 'registration' as const,
                            user: studentData.name || 'Unknown Student',
                            role: 'Student',
                            time: studentData.createdAt ? new Date(studentData.createdAt.toDate()).toLocaleString() : 'N/A'
                        };
                    }));
                }

                // Add latest course creations
                if (courses.length > 0) {
                    const latestCourses = courses.slice(0, 3);
                    activities.push(...latestCourses.map((course: DocumentData & { id: string }) => {
                        const courseData = course as Course;
                        return {
                            type: 'course' as const,
                            course: courseData.courseName,
                            action: 'created',
                            by: courseData.facultyName || 'Faculty',
                            time: courseData.createdAt ? new Date(courseData.createdAt.toDate()).toLocaleString() : 'N/A'
                        };
                    }));
                }

                // Sort activities by timestamp (most recent first)
                activities.sort((a, b) => {
                    const timeA = a.time === 'N/A' ? 0 : new Date(a.time).getTime();
                    const timeB = b.time === 'N/A' ? 0 : new Date(b.time).getTime();
                    return timeB - timeA;
                });

                setRecentActivities(activities.slice(0, 5)); // Show only 5 most recent activities
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="h-8 w-8" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Admin Dashboard</h2>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard title="Total Students" value={summary.students} icon={<Users size={28} className="text-indigo-600" />} />
                <SummaryCard title="Total Faculty" value={summary.faculty} icon={<BookUser size={28} className="text-green-600" />} />
                <SummaryCard title="Courses" value={summary.courses} icon={<BookOpen size={28} className="text-blue-600" />} />
                <SummaryCard title="Departments" value={summary.departments} icon={<Library size={28} className="text-yellow-600" />} />
            </div>
            {/* Quick Links */}
            <div className="flex flex-wrap gap-4 mb-8">
                <QuickLink href="#" label="Add Student" icon={<UserPlus size={18} />} />
                <QuickLink href="#" label="Add Faculty" icon={<UserPlus size={18} />} />
                <QuickLink href="#" label="Add Course" icon={<PlusCircle size={18} />} />
                <QuickLink href="#" label="System Settings" icon={<Settings size={18} />} />
            </div>
            {/* Recent Activity Log */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Activity</h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, idx) => (
                            <li key={idx} className="py-2 text-sm text-gray-600 dark:text-gray-300">
                                {activity.type === 'registration' && (
                                    <span><b>{activity.user}</b> registered as <b>{activity.role}</b> <span className="text-xs text-gray-400 ml-2">{activity.time}</span></span>
                                )}
                                {activity.type === 'course' && (
                                    <span>Course <b>{activity.course}</b> {activity.action} by <b>{activity.by}</b> <span className="text-xs text-gray-400 ml-2">{activity.time}</span></span>
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="py-2 text-sm text-gray-500 dark:text-gray-400">No recent activities</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

// --- SummaryCard Component ---
const SummaryCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center gap-4">
        <div>{icon}</div>
        <div>
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        </div>
    </div>
);

// --- QuickLink Component ---
const QuickLink = ({ href, label, icon }: { href: string, label: string, icon: React.ReactNode }) => (
    <a href={href} className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-200 rounded-md shadow-sm hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
        {icon}
        <span className="ml-2">{label}</span>
    </a>
);

// --- SystemSettingsContent (Modular with Tabs) ---
const settingsTabs = [
    { key: 'institute', label: 'Institute Details' },
    { key: 'structure', label: 'Institution Structure' },
];

const SystemSettingsContent = ({ adminUid }: { adminUid: string }) => {
    const [activeTab, setActiveTab] = useState(settingsTabs[0].key);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">System Settings</h2>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {settingsTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${activeTab === tab.key ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'institute' && <InstituteDetailsSettings adminUid={adminUid} />}
                {activeTab === 'structure' && <InstitutionStructureSettings />}
            </div>
        </div>
    );
};

// --- Placeholder Components for Each Tab ---
const InstituteDetailsSettings = ({ adminUid }: { adminUid: string }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        institutionName: '',
        address: '',
        contactNumber: '',
        photoURL: '',
    });
    const [profileLoaded, setProfileLoaded] = useState(false);
    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError(null);
            try {
                if (!adminUid) {
                    setError('Admin UID not found.');
                    setLoading(false);
                    return;
                }
                const profile = await getUserProfile(adminUid);
                if (!profile) throw new Error('Profile not found');
                setForm({
                    institutionName: profile.institutionName || '',
                    address: profile.address || '',
                    contactNumber: profile.contactNumber || '',
                    photoURL: profile.photoURL || '',
                });
                setLogoPreview(profile.photoURL || null);
                setProfileLoaded(true);
            } catch (err: any) {
                setError(err.message || 'Failed to load institute details.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [adminUid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setLogoUploading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!adminUid) throw new Error('Admin UID not found.');
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
            // Upload
            const url = await uploadProfileImage(adminUid, file);
            setForm(prev => ({ ...prev, photoURL: url }));
            setSuccess('Logo uploaded successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to upload logo.');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            if (!adminUid) throw new Error('Admin UID not found.');
            await updateUserProfile(adminUid, {
                institutionName: form.institutionName,
                address: form.address,
                contactNumber: form.contactNumber,
                photoURL: form.photoURL,
            });
            setSuccess('Institute details updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500 dark:text-gray-300">Loading institute details...</div>;
    return (
        <form className="max-w-xl mx-auto space-y-6" onSubmit={handleSave}>
            <h3 className="text-xl font-semibold mb-2">Institute Details</h3>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}
            <div>
                <label className="block text-sm font-medium mb-1">Institute Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="institutionName"
                    value={form.institutionName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                    type="text"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Institute Logo</label>
                <div className="flex items-center gap-4">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain rounded bg-gray-100 dark:bg-gray-700 border" />
                    ) : (
                        <div className="h-16 w-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border rounded text-gray-400">No Logo</div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={logoUploading}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {logoUploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                </div>
            </div>
            <div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

// --- StudentManagementContent ---
const StudentManagementContent = () => {
    const [students, setStudents] = useState<(DocumentData & { id: string })[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [studentName, setStudentName] = useState('');
    const [studentRegNum, setStudentRegNum] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | ''>('');
    const [selectedDepartmentName, setSelectedDepartmentName] = useState<string | ''>('');
    const [selectedSemesterId, setSelectedSemesterId] = useState<string | ''>('');
    const [selectedSemesterName, setSelectedSemesterName] = useState<string | ''>('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoadingStudents(true);
        setListError(null);
        try {
            const studentList = await getAllStudents();
            setStudents(studentList);
        } catch (err: any) {
            setListError(`Failed to load students: ${err.message}`);
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            const depList = await getDepartments();
            setDepartments(depList.map((dep: any) => ({ id: dep.id, name: dep.name, semesters: [] })));
        } catch (err: any) {
            console.error("Error fetching departments:", err);
            setListError(`Failed to load departments: ${err.message}`);
        }
    }, []);

    const fetchSemesters = useCallback(async (departmentId: string) => {
        if (!departmentId) { setSemesters([]); return; }
        try {
            const semList = await getSemesters(departmentId);
            setSemesters(semList.map((sem: any) => ({ id: sem.id, name: sem.name, courses: [] })));
        } catch (err: any) {
            console.error("Error fetching semesters:", err);
            setListError(`Failed to load semesters for department ${departmentId}: ${err.message}`);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchDepartments(); // Fetch departments on initial load
    }, [fetchStudents, fetchDepartments]);

    useEffect(() => {
        // Fetch semesters whenever selectedDepartmentId changes
        fetchSemesters(selectedDepartmentId);
        setSelectedSemesterId(''); // Reset semester when department changes
        setSelectedSemesterName('');
    }, [selectedDepartmentId, fetchSemesters]);

    const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!studentName.trim() || !studentRegNum.trim() || !studentEmail.trim() || !studentPassword.trim() || !selectedDepartmentId || !selectedSemesterId) {
            setFormError("All fields including Department and Semester are required.");
            return;
        }
        setIsCreatingStudent(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            await createNewUserWithoutSigningOut(
                studentEmail.trim(),
                studentPassword,
                'student',
                {
                    name: studentName.trim(),
                    registrationNumber: studentRegNum.trim().toUpperCase(),
                    departmentId: selectedDepartmentId,
                    departmentName: selectedDepartmentName,
                    semesterId: selectedSemesterId,
                    semesterName: selectedSemesterName,
                    sendWelcomeEmail: true,
                    initialPassword: studentPassword
                }
            );

            setFormSuccess(`Student '${studentName.trim()}' created successfully.`);
            setStudentName('');
            setStudentRegNum('');
            setStudentEmail('');
            setStudentPassword('');
            setSelectedDepartmentId(''); // Clear selections
            setSelectedDepartmentName('');
            setSelectedSemesterId('');
            setSelectedSemesterName('');
            fetchStudents(); // Refresh list
        } catch (err: any) {
            let specificError = "Failed to create student.";
            if (err.code === 'auth/email-already-in-use') specificError = "Email already registered.";
            else if (err.code === 'auth/invalid-email') specificError = "Invalid email format.";
            else if (err.code === 'auth/weak-password') specificError = "Password too weak (min 6 characters).";
            else specificError = `Error: ${err.message}`;
            setFormError(specificError);
        } finally {
            setIsCreatingStudent(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Student Management</h2>

            {/* Create Student Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">Add New Student</h3>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    {formError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{formError}</div>}
                    {formSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{formSuccess}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="studentRegNum" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration No.</label>
                            <input type="text" id="studentRegNum" value={studentRegNum} onChange={(e) => setStudentRegNum(e.target.value.toUpperCase())} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="departmentSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select 
                                id="departmentSelect"
                                value={selectedDepartmentId}
                                onChange={(e) => {
                                    const selectedDep = departments.find(dep => dep.id === e.target.value);
                                    setSelectedDepartmentId(e.target.value);
                                    setSelectedDepartmentName(selectedDep ? selectedDep.name : '');
                                }}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="semesterSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                            <select 
                                id="semesterSelect"
                                value={selectedSemesterId}
                                onChange={(e) => {
                                    const selectedSem = semesters.find(sem => sem.id === e.target.value);
                                    setSelectedSemesterId(e.target.value);
                                    setSelectedSemesterName(selectedSem ? selectedSem.name : '');
                                }}
                                required
                                disabled={!selectedDepartmentId} // Disable until a department is selected
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-- Select Semester --</option>
                                {semesters.map(sem => (
                                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="studentEmail" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Password</label>
                        <input type="password" id="studentPassword" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Student will be prompted to change this on first login. Min 6 characters.</p>
                    </div>
                    <button type="submit" disabled={isCreatingStudent} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isCreatingStudent ? <LoadingSpinner size="h-4 w-4 mr-2" color="border-white" /> : <UserPlus size={16} className="mr-2" />}
                        {isCreatingStudent ? 'Creating...' : 'Create Student'}
                    </button>
                </form>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-4">Note: An email with login credentials should be sent to the student. (This requires a backend email service setup).</p>
            </div>

            {/* Student List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Existing Students ({students.length})</h3>
                    <button onClick={fetchStudents} disabled={loadingStudents} className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50">
                        {loadingStudents ? 'Refreshing...' : 'Refresh List'}
                    </button>
                </div>
                {listError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{listError}</div>}
                {loadingStudents ? (
                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : students.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No students found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reg No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.registrationNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.departmentName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.semesterName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500 font-mono">{student.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- FacultyManagementContent ---
const FacultyManagementContent = () => {
    const [facultyList, setFacultyList] = useState<(DocumentData & { id: string })[]>([]);
    const [loadingFaculty, setLoadingFaculty] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [facultyName, setFacultyName] = useState('');
    const [facultyEmail, setFacultyEmail] = useState('');
    const [facultyPassword, setFacultyPassword] = useState('');
    const [departmentId, setDepartmentId] = useState<string | ''>('');
    const [departmentName, setDepartmentName] = useState<string | ''>('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isCreatingFaculty, setIsCreatingFaculty] = useState(false);

    const fetchFaculty = useCallback(async () => {
        setLoadingFaculty(true);
        setListError(null);
        try {
            const flist = await getAllFaculty();
            setFacultyList(flist);
        } catch (err: any) {
            setListError(`Failed to load faculty: ${err.message}`);
            setFacultyList([]);
        } finally {
            setLoadingFaculty(false);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            const fetchedDepartments = await getDepartments();
            setDepartments(fetchedDepartments.map((dep: any) => ({ id: dep.id, name: dep.name, semesters: [] })));
        } catch (err: any) {
            console.error("Error fetching departments:", err);
            setListError(`Failed to load departments: ${err.message}`);
        }
    }, []);

    useEffect(() => {
        fetchFaculty();
        fetchDepartments();
    }, [fetchFaculty, fetchDepartments]);

    const handleCreateFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!facultyName.trim() || !facultyEmail.trim() || !facultyPassword.trim() || !departmentId) {
            setFormError("Name, Email, Password, and Department are required.");
            return;
        }
        setIsCreatingFaculty(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            await createNewUserWithoutSigningOut(
                facultyEmail.trim(),
                facultyPassword,
                'faculty',
                {
                    name: facultyName.trim(),
                    departmentId: departmentId,
                    departmentName: departmentName
                }
            );

            setFormSuccess(`Faculty '${facultyName.trim()}' created successfully.`);
            setFacultyName('');
            setFacultyEmail('');
            setFacultyPassword('');
            setDepartmentId('');
            setDepartmentName('');
            fetchFaculty();
        } catch (err: any) {
            let specificError = "Failed to create faculty.";
            if (err.code === 'auth/email-already-in-use') specificError = "Email already registered.";
            else if (err.code === 'auth/invalid-email') specificError = "Invalid email format.";
            else if (err.code === 'auth/weak-password') specificError = "Password too weak (min 6 characters).";
            else specificError = `Error: ${err.message}`;
            setFormError(specificError);
        } finally {
            setIsCreatingFaculty(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Faculty Management</h2>

            {/* Create Faculty Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">Add New Faculty</h3>
                <form onSubmit={handleCreateFaculty} className="space-y-4">
                    {formError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{formError}</div>}
                    {formSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{formSuccess}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="facultyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" id="facultyName" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                         <div>
                            <label htmlFor="departmentSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select 
                                id="departmentSelect"
                                value={departmentId}
                                onChange={(e) => {
                                    const selectedDep = departments.find(dep => dep.id === e.target.value);
                                    setDepartmentId(e.target.value);
                                    setDepartmentName(selectedDep ? selectedDep.name : '');
                                }}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="facultyEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="facultyEmail" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="facultyPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Password</label>
                        <input type="password" id="facultyPassword" value={facultyPassword} onChange={(e) => setFacultyPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min 6 characters.</p>
                    </div>
                    <button type="submit" disabled={isCreatingFaculty} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isCreatingFaculty ? <LoadingSpinner size="h-4 w-4 mr-2" color="border-white"/> : <UserPlus size={16} className="mr-2" />}
                        {isCreatingFaculty ? 'Creating...' : 'Create Faculty'}
                    </button>
                </form>
            </div>

            {/* Faculty List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Existing Faculty ({facultyList.length})</h3>
                    <button onClick={fetchFaculty} disabled={loadingFaculty} className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50">
                        {loadingFaculty ? 'Refreshing...' : 'Refresh List'}
                    </button>
                </div>
                 {listError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{listError}</div>}
                {loadingFaculty ? (
                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : facultyList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No faculty found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {facultyList.map(faculty => (
                                    <tr key={faculty.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{faculty.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faculty.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faculty.departmentName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500 font-mono">{faculty.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Course & Marks Admin Content (for Admin to add End-Term Marks) ---
type AdminMarksData = MarksData & { studentUid: string, studentName?: string, registrationNumber?: string };

const CourseMarksAdminContent = ({ adminUser }: { adminUser: User }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [studentsMarks, setStudentsMarks] = useState<(AdminMarksData & { studentName?: string, registrationNumber?: string, id: string })[]>([]);

    // Function to fetch the entire institution structure
    const fetchInstitutionStructure = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const depList = await getDepartments();
            const departmentsWithNestedData: Department[] = await Promise.all(depList.map(async (dep: any) => {
                const semList = await getSemesters(dep.id);
                const semestersWithCourses: Semester[] = await Promise.all(semList.map(async (sem: any) => {
                    const courseList = await getCourses(dep.id, sem.id);
                    // Ensure Course object matches the expected Course interface, including all relevant fields
                    return { 
                        id: sem.id, 
                        name: sem.name, 
                        courses: courseList.map((c: any) => ({ 
                            id: c.id, 
                            courseName: c.courseName, // Use courseName from the already transformed object
                            courseCode: c.courseCode, // Use courseCode from the already transformed object
                            facultyUid: c.facultyUid || null, 
                            facultyName: c.facultyName || null, 
                            academicYear: c.academicYear || null, 
                            description: c.description || null,
                            credits: c.credits || null,
                            createdAt: c.createdAt || null, // Assuming createdAt is available if relevant
                        })) 
                    };
                }));
                return { id: dep.id, name: dep.name, semesters: semestersWithCourses };
            }));
            setDepartments(departmentsWithNestedData);
        } catch (err: any) {
            setError(err.message || 'Failed to load institution structure.');
        } finally { setLoading(false); }
    }, []);

    // Effect to fetch institution structure on component mount
    useEffect(() => {
        fetchInstitutionStructure();
    }, [fetchInstitutionStructure]);

    // Function to fetch marks for a selected course
    const fetchMarksForCourse = useCallback(async (courseId: string) => {
        setLoading(true); setError(null);
        try {
            const marks = await getAllMarksForCourse(courseId);
            const marksWithStudentDetails = await Promise.all(marks.map(async (mark) => {
                const studentProfile = await getUserProfile(mark.studentUid);
                return {
                    ...mark,
                    studentName: studentProfile?.name || 'N/A',
                    registrationNumber: studentProfile?.registrationNumber || 'N/A',
                };
            }));
            setStudentsMarks(marksWithStudentDetails);
        } catch (err: any) {
            setError(err.message || 'Failed to load marks for course.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch marks when selectedCourse changes
    useEffect(() => {
        if (selectedCourse) {
            fetchMarksForCourse(selectedCourse.id);
        } else {
            setStudentsMarks([]); // Clear marks if no course is selected
        }
    }, [selectedCourse, fetchMarksForCourse]);

    // Handler for selecting a course from the tree view
    const handleCourseSelect = useCallback((course: Course) => {
        setSelectedCourse(course);
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Course & Marks Admin</h2>

            {loading && (
                <div className="flex items-center justify-center p-4"><LoadingSpinner /> <span className="ml-2 text-gray-500">Loading institution structure...</span></div>
            )}
            {error && <div className="text-red-500 p-4">Error: {error}</div>}

            {!loading && !error && departments.length === 0 && (
                <div className="text-gray-500 p-4">No institution structure found. Please add departments, semesters, and courses in System Settings &gt; Institution Structure.</div>
            )}

            {!loading && !error && departments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Institution Structure Tree */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Academic Structure</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            {departments.map(department => (
                                <div key={department.id} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                                    <h4 className="font-bold text-lg text-gray-700 dark:text-gray-100 mb-2 flex items-center">
                                        <Layers size={20} className="mr-2 text-blue-500" />
                                        {department.name}
                                    </h4>
                                    <div className="ml-4 border-l pl-4 border-gray-300 dark:border-gray-600">
                                        {department.semesters.length > 0 ? (
                                            department.semesters.map(semester => (
                                                <div key={semester.id} className="mb-3 p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                                                    <h5 className="font-semibold text-md text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                                                        <Calendar size={18} className="mr-2 text-green-500" />
                                                        {semester.name}
                                                    </h5>
                                                    <div className="ml-4 border-l pl-4 border-gray-200 dark:border-gray-700">
                                                        {semester.courses.length > 0 ? (
                                                            semester.courses.map(course => (
                                                                <div 
                                                                    key={course.id} 
                                                                    className={`p-2 mb-1 rounded-md cursor-pointer flex items-center justify-between transition-colors 
                                                                                ${selectedCourse?.id === course.id ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                                                    onClick={() => handleCourseSelect(course)}
                                                                >
                                                                    <span className="flex items-center">
                                                                        <BookOpen size={16} className="mr-2 text-purple-500" />
                                                                        {course.courseName} ({course.courseCode})
                                                                    </span>
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{course.facultyName || 'N/A'}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">No courses in this semester.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No semesters in this department.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Marks Management for Selected Course */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Marks Management</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            {!selectedCourse ? (
                                <p className="text-gray-500 dark:text-gray-400">Select a course from the left to manage marks.</p>
                            ) : (
                                <div>
                                    <h4 className="text-lg font-bold mb-4">Marks for {selectedCourse.courseName} ({selectedCourse.courseCode})</h4>
                                    {loading ? (
                                        <div className="flex items-center justify-center p-4"><LoadingSpinner /> <span className="ml-2 text-gray-500">Loading marks...</span></div>
                                    ) : studentsMarks.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reg. No.</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Internal</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mid Term</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Term</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {studentsMarks.map((studentMark) => (
                                                        <tr key={studentMark.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{studentMark.studentName}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{studentMark.registrationNumber}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{studentMark.internalMarks || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{studentMark.midTermMarks || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{studentMark.endTermMarks || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button 
                                                                    onClick={() => { /* Implement Edit logic for marks */ }} 
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => { /* Implement Publish logic for marks */ }} 
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                >
                                                                    Publish
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No marks available for this course yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- GenericContent (Placeholder) ---
const GenericContent = ({ pageName }: { pageName: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{pageName}</h2>
        <p className="text-gray-600 dark:text-gray-300">Content for {pageName} will be displayed here. This feature is under development.</p>
    </div>
);

// --- Main Console Page Component ---
export default function ConsolePage() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activePageKey, setActivePageKey] = useState<string>(navItems[0].pageKey);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile && profile.role === 'admin') {
                        setUserProfile(profile);
                    } else {
                        // Not an admin or no profile, redirect
                        await signOutUser();
                        router.push('/login?error=unauthorized');
                    }
                } catch (error) {
                    console.error("Error fetching admin profile:", error);
                    await signOutUser();
                    router.push('/login?error=profile_error');
                }
            } else {
                router.push('/login');
            }
            setLoadingAuth(false);
        });

        const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

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
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light'); // Persist theme
    };
     useEffect(() => { // Load persisted theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    }, []);


    const renderPageContent = (): ReactNode => {
        if (!currentUser) return <GenericContent pageName="Loading user data..." />;
        switch (activePageKey) {
            case 'dashboard': return <DashboardContent />;
            case 'studentManagement': return <StudentManagementContent />;
            case 'facultyManagement': return <FacultyManagementContent />;
            case 'courseMarksAdmin': return <CourseMarksAdminContent adminUser={currentUser} />;
            case 'systemSettings': return <SystemSettingsContent adminUid={currentUser.uid} />;
            default: return <GenericContent pageName={navItems.find(item => item.pageKey === activePageKey)?.name || 'Page'} />;
        }
    };

    const activeNavItem = navItems.find(item => item.pageKey === activePageKey);

    if (loadingAuth) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><LoadingSpinner size="h-10 w-10" /><p className="ml-3 text-gray-700 dark:text-gray-300">Loading Admin Console...</p></div>;
    }
    if (!currentUser || !userProfile) return null; // Should be redirected

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex flex-col border-r dark:border-gray-700 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center px-4 border-b dark:border-gray-700 shrink-0">
                    {!isSidebarCollapsed && (
                        <Image src="/zenith-logo.svg" alt="Zenith Logo" width={90} height={28} className="dark:brightness-0 dark:invert" />
                    )}
                    <button onClick={toggleSidebar} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`} aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <button key={item.pageKey} onClick={() => setActivePageKey(item.pageKey)} title={item.name}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                                ${activePageKey === item.pageKey ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}
                                ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                            <item.icon size={20} className="shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t dark:border-gray-700 space-y-1.5 shrink-0">
                    <button onClick={handleThemeToggle} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        {isDarkMode ? <Sun size={20} className="shrink-0"/> : <Moon size={20} className="shrink-0"/>}
                        {!isSidebarCollapsed && <span className="truncate">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>
                    <button onClick={handleSignOut} title="Sign Out"
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={20} className="shrink-0"/>
                        {!isSidebarCollapsed && <span className="truncate">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 h-16 flex items-center justify-between px-6 border-b dark:border-gray-700 shadow-sm dark:shadow-none shrink-0">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                        {activeNavItem?.name || 'Admin Console'}
                    </h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{userProfile?.email}</span>
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {renderPageContent()}
                </div>
            </main>
        </div>
    );
}

