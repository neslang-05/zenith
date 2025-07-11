"use client";

import React, { useState, useEffect, useCallback } from 'react';
import StudentLayout from './StudentLayout'; // Ensure this path is correct
import { useSearchParams } from 'next/navigation';
import {
    auth, getUserProfile, getAllCourses, getStudentRegisteredCourses, isStudentRegistered,
    registerStudentForCourse, getStudentMarksForCourse, CourseData, MarksData, getCoursesByDepartmentAndSemester
} from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { BookOpen, ListChecks, CheckCircle, XCircle, PlusCircle, ExternalLink, AlertTriangle } from 'lucide-react';

// Loading Spinner
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

type StudentCourse = CourseData & { id: string; isRegistered?: boolean; marks?: MarksData | null };

// --- Available Courses for Registration ---
const AvailableCourses = ({ 
    courses, 
    studentProfile, 
    onRegister,
    refreshCourses
}: { 
    courses: StudentCourse[], 
    studentProfile: DocumentData, 
    onRegister: (courseId: string) => Promise<void>,
    refreshCourses: () => void
}) => {
    const [registeringId, setRegisteringId] = useState<string | null>(null);

    const handleRegister = async (course: StudentCourse) => {
        if (course.isRegistered) return;
        setRegisteringId(course.id);
        try {
            await onRegister(course.id);
            // Optimistically update or wait for refreshCourses
        } finally {
            setRegisteringId(null);
            refreshCourses(); // Ensure UI updates
        }
    };
    
    if (courses.filter(c => !c.isRegistered).length === 0) {
        return <p className="text-gray-600 dark:text-gray-400">No new courses available for registration at the moment.</p>
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Available Courses for Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.filter(c => !c.isRegistered).map(course => (
                    <div key={course.id} className="border dark:border-gray-700 p-4 rounded-md flex flex-col justify-between">
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-100">{course.courseName} ({course.courseCode})</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{course.academicYear} - By {course.facultyName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.description || "No description available."}</p>
                        </div>
                        <button 
                            onClick={() => handleRegister(course)}
                            disabled={registeringId === course.id}
                            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm rounded-md disabled:opacity-50 inline-flex items-center justify-center"
                        >
                            {registeringId === course.id ? <LoadingSpinner size="h-4 w-4 mr-1" color="border-white"/> : <PlusCircle size={16} className="mr-1"/>}
                            {registeringId === course.id ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- My Registered Courses & Marks ---
const MyMarks = ({ coursesWithMarks, studentUid }: { coursesWithMarks: StudentCourse[], studentUid: string }) => {
    const [loadingMarksForCourse, setLoadingMarksForCourse] = useState<string | null>(null);
    const [detailedMarks, setDetailedMarks] = useState<{ [courseId: string]: MarksData | null }>({});

    const fetchMarksForCourse = async (courseId: string) => {
        if (detailedMarks[courseId] !== undefined) return; // Already fetched or attempted

        setLoadingMarksForCourse(courseId);
        try {
            const marks = await getStudentMarksForCourse(courseId, studentUid);
            setDetailedMarks(prev => ({ ...prev, [courseId]: marks }));
        } catch (error) {
            console.error(`Error fetching marks for course ${courseId}:`, error);
            setDetailedMarks(prev => ({ ...prev, [courseId]: null })); // Mark as attempted with error
        } finally {
            setLoadingMarksForCourse(null);
        }
    };
    
    const registeredCourses = coursesWithMarks.filter(c => c.isRegistered);

    if (registeredCourses.length === 0) {
        return <p className="text-gray-600 dark:text-gray-400">You are not registered for any courses yet.</p>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">My Registered Courses & Marks</h3>
            <div className="space-y-4">
                {registeredCourses.map(course => {
                    const marks = course.marks || detailedMarks[course.id];
                    return (
                        <div key={course.id} className="border dark:border-gray-700 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-800 dark:text-gray-100">{course.courseName} ({course.courseCode})</h4>
                                <button 
                                    onClick={() => fetchMarksForCourse(course.id)} 
                                    className="text-xs text-indigo-600 hover:underline p-1"
                                    disabled={loadingMarksForCourse === course.id || marks !== undefined}
                                >
                                    {loadingMarksForCourse === course.id ? <LoadingSpinner size="h-3 w-3"/> : (marks === undefined ? "View Marks" : "Marks Loaded")}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{course.academicYear} - Taught by {course.facultyName}</p>
                            
                            {marks && (
                                <div className="mt-3 pt-2 border-t dark:border-gray-700 text-sm">
                                    <p><strong>Internal:</strong> {marks.internalPublished ? (marks.internalMarks ?? 'N/A') : <span className="italic text-gray-500">Not Published</span>}</p>
                                    <p><strong>Mid-Term:</strong> {marks.midTermPublished ? (marks.midTermMarks ?? 'N/A') : <span className="italic text-gray-500">Not Published</span>}</p>
                                    <p><strong>End-Term:</strong> {marks.endTermPublished ? (marks.endTermMarks ?? 'N/A') : <span className="italic text-gray-500">Not Published</span>}</p>
                                    {/* Display grade if available */}
                                    {marks.grade && <p><strong>Grade:</strong> {marks.grade}</p>}
                                </div>
                            )}
                             {marks === null && detailedMarks[course.id] === null && ( // explicit null means error or no marks
                                <p className="text-xs text-red-500 mt-1">Could not load marks for this course, or no marks entered yet.</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Student Dashboard Page ---
const StudentDashboardPage = () => {
    const [studentProfile, setStudentProfile] = useState<DocumentData | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [allCourses, setAllCourses] = useState<StudentCourse[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    
    const searchParams = useSearchParams();
    const activeView = searchParams.get('view') || 'dashboard'; // Default view

    const fetchStudentData = useCallback(async () => {
        const user = auth.currentUser;
        if (user) {
            setLoadingProfile(true);
            setLoadingCourses(true);
            try {
                const profile = await getUserProfile(user.uid);
                setStudentProfile(profile);

                if (profile) {
                    const studentDepartmentId = profile.departmentId;
                    const studentSemesterId = profile.semesterId;

                    let coursesForRegistration: StudentCourse[] = [];

                    if (studentDepartmentId && studentSemesterId) {
                        // Fetch courses specific to the student's department and semester
                        coursesForRegistration = await getCoursesByDepartmentAndSemester(studentDepartmentId, studentSemesterId);
                    } else {
                        // Fallback: If student has no assigned department/semester, perhaps show all courses or none
                        // For now, let's assume if these are not set, no specific courses are shown for registration.
                        // You might want to change this logic based on your application's requirements.
                        console.warn("Student profile is missing departmentId or semesterId. Cannot filter courses by semester.");
                        // Optionally, you could fetch all courses: coursesForRegistration = await getAllCourses();
                    }

                    const [registeredCoursesFromDb] = await Promise.all([
                        getStudentRegisteredCourses(user.uid)
                    ]);

                    const registeredCourseIds = new Set(registeredCoursesFromDb.map(rc => rc.id));
                    
                    // Fetch marks for registered courses and mark registered status for all relevant courses
                    const coursesWithMarksPromises = coursesForRegistration.map(async (course) => {
                        const isReg = registeredCourseIds.has(course.id);
                        let marksData: MarksData | null = null;
                        if (isReg) {
                            marksData = await getStudentMarksForCourse(course.id, user.uid);
                        }
                        return { ...course, isRegistered: isReg, marks: marksData };
                    });

                    const processedCourses = await Promise.all(coursesWithMarksPromises);
                    setAllCourses(processedCourses);
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
            } finally {
                setLoadingProfile(false);
                setLoadingCourses(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const handleRegisterForCourse = async (courseId: string) => {
        if (!studentProfile || !studentProfile.uid) {
            console.error("Student profile not loaded.");
            return;
        }
        try {
            await registerStudentForCourse(courseId, studentProfile.uid, studentProfile.name, studentProfile.registrationNumber);
            // Refresh data after registration
            // fetchStudentData(); // This will be called by the component
            alert("Successfully registered for the course!");
        } catch (error) {
            console.error("Error registering for course:", error);
            alert("Failed to register for the course. It might already be registered or an error occurred.");
        }
    };

    if (loadingProfile) {
        return <StudentLayout><div className="flex justify-center items-center h-full"><LoadingSpinner size="h-8 w-8" /> <span className="ml-2">Loading profile...</span></div></StudentLayout>;
    }
    if (!studentProfile) {
        return <StudentLayout><p className="text-red-500">Student profile not found.</p></StudentLayout>;
    }

    const renderContent = () => {
        if (loadingCourses) return <div className="flex justify-center py-10"><LoadingSpinner /></div>;

        if (activeView === 'dashboard') {
            const registeredCount = allCourses.filter(c => c.isRegistered).length;
            const availableCount = allCourses.filter(c => !c.isRegistered).length;
            return (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                        Welcome, {studentProfile.name}!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">My Courses</h3>
                            <p className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{registeredCount}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">courses registered</p>
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Available for Registration</h3>
                            <p className="text-3xl font-semibold text-green-600 dark:text-green-400 mt-1">{availableCount}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">new courses</p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Use the sidebar to navigate to "Courses" to register or "My Marks" to view your academic progress.
                    </p>
                </div>
            );
        } else if (activeView === 'courses') {
            return (
                <div className="space-y-8">
                    <AvailableCourses courses={allCourses} studentProfile={studentProfile} onRegister={handleRegisterForCourse} refreshCourses={fetchStudentData} />
                    <MyMarks coursesWithMarks={allCourses.filter(c => c.isRegistered)} studentUid={studentProfile.uid} />
                </div>
            );
        } else if (activeView === 'marks') {
            return <MyMarks coursesWithMarks={allCourses.filter(c => c.isRegistered)} studentUid={studentProfile.uid} />;
        }
        // Fallback for other views from the original student dashboard (lessons, materials etc.)
        // These were in the very first `page.tsx` file you provided.
        // For brevity, I'm not re-including them here, but you'd integrate them similarly.
        const OriginalStudentDashboardContent = ({view}: {view: string}) => {
             if (view === 'lessons') return <div>Legacy Lessons Content Placeholder</div>;
             if (view === 'materials') return <div>Legacy Materials Content Placeholder</div>;
             return <div>Unknown view: {view}</div>;
        };
        return <OriginalStudentDashboardContent view={activeView} />;

    };

    return (
        <StudentLayout>
           {renderContent()}
        </StudentLayout>
    );
};

export default StudentDashboardPage;
