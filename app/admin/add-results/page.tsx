'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { CheckCircle, XCircle, Save, Send } from 'lucide-react'; // Import necessary icons
// Ensure necessary functions are imported
import { auth, findStudentByRegNum, addGenericResult, getAllCourses, getRegisteredStudentsForCourse,
    upsertAdminEndTermMarks, publishAdminEndTermMarks, getStudentMarksForCourse, CourseData, MarksData,
    getDepartments, getSemesters, getCoursesByDepartmentAndSemester
} from '@/lib/firebase';

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'h-5 w-5' }: { size?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-indigo-500`}></div>
);

// Interface for the found student data
interface FoundStudent extends DocumentData {
    id: string; // UID
    name?: string;
    email?: string;
    registrationNumber?: string;
}

const AddResultsPage = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null); // Get current user
    const [isAdmin, setIsAdmin] = useState(false); // Optional: Verify admin role

    // State for student search
    const [searchRegNum, setSearchRegNum] = useState('');
    const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // State for result form
    const [subjectName, setSubjectName] = useState('');
    const [marks, setMarks] = useState<string>('');
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isAddingResult, setIsAddingResult] = useState(false);

    // Get current user and optionally verify admin role
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            // --- Optional but recommended: Verify Admin Role ---
            // if (user) {
            //     try {
            //         const profile = await getUserProfile(user.uid); // Assumes getUserProfile exists
            //         if (profile && profile.role === 'admin') {
            //             setIsAdmin(true);
            //         } else {
            //             setIsAdmin(false);
            //             // Redirect or show error if not admin
            //             // router.push('/unauthorized');
            //         }
            //     } catch (error) {
            //         console.error("Error checking admin role:", error);
            //         setIsAdmin(false);
            //     }
            // } else {
            //     setIsAdmin(false);
            // }
             // --- End Optional ---
        });
        return () => unsubscribe();
    }, []);

    // Handler for searching student
    const handleSearchStudent = async (e?: React.FormEvent<HTMLFormElement>) => {
        if(e) e.preventDefault();
        const trimmedRegNum = searchRegNum.trim().toUpperCase(); // Standardize search input
        if (!trimmedRegNum) {
            setSearchError("Please enter a registration number.");
            return;
        }
        console.log(`Searching for registration number: ${trimmedRegNum}`); // Debug log
        setIsSearching(true);
        setSearchError(null);
        setFoundStudent(null);
        clearResultForm();
        setFormError(null);
        setFormSuccess(null);

        try {
            // Ensure findStudentByRegNum uses the correct field name and handles case if necessary
            const studentData = await findStudentByRegNum(trimmedRegNum);
            console.log("Search result:", studentData); // Debug log

            if (studentData) {
                // Cast or map to ensure correct structure
                 const typedStudent: FoundStudent = {
                    id: studentData.id,
                    name: studentData.name || 'N/A',
                    email: studentData.email || 'N/A',
                    registrationNumber: studentData.registrationNumber || 'N/A',
                };
                setFoundStudent(typedStudent);
            } else {
                setSearchError(`No student found with Registration Number: ${trimmedRegNum}`);
            }
        } catch (err) {
            console.error("Error searching student:", err);
            let errorMsg = "An error occurred while searching.";
             if (err instanceof Error && (err.message.toLowerCase().includes('permission denied') || err.message.toLowerCase().includes('missing index'))) {
                 errorMsg = "Search failed. Check Firestore rules or required indexes.";
                 // Check Firestore console for index creation prompts
            }
            setSearchError(errorMsg);
        } finally {
            setIsSearching(false);
        }
    };

     // Handler for adding result
     const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!foundStudent || !foundStudent.id || !foundStudent.registrationNumber) {
            setFormError("Internal Error: Student data is incomplete. Please search again.");
            return;
        }
        if (!currentUser) {
             setFormError("Authentication error. Please re-login.");
            return;
        }
        if (!subjectName.trim() || !marks.trim() || !examName.trim()) {
            setFormError("Please fill in Subject Name, Marks/Grade, and Exam Name.");
            return;
        }                                           

        setIsAddingResult(true);

        try {
            const resultData = {
                studentUid: foundStudent.id, // Use the student's UID (document ID)
                registrationNumber: foundStudent.registrationNumber, // Denormalize for display/queries
                subjectName: subjectName.trim(),
                marks: marks.trim(), // Keep as string for flexibility (e.g., 'A+', 'Absent')
                examName: examName.trim(),
                enteredBy: currentUser.uid,
                ...(academicYear.trim() && { academicYear: academicYear.trim() }),
            };
            console.log("Adding result data:", resultData); // Debug log

            await addGenericResult(resultData);

            setFormSuccess(`Result added successfully for ${foundStudent.name} (${foundStudent.registrationNumber})!`);
            clearResultForm(); // Clear form for next entry for the *same* student

        } catch (err) {
            console.error("Error adding result:", err);
             let errorMsg = "Failed to add the result.";
              if (err instanceof Error && (err.message.toLowerCase().includes('permission denied'))) {
                 errorMsg = "Permission denied adding result. Check Firestore rules.";
             }
            setFormError(errorMsg);
            setFormSuccess(null);
        } finally {
            setIsAddingResult(false);
        }
    };

    // Helper to clear result form fields
    const clearResultForm = () => {
        setSubjectName('');
        setMarks('');
        setExamName('');
        setAcademicYear('');
    };

    // --- JSX Section ---
    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">
            {/* Header */}
            <header className="mb-8 pb-4 border-b border-gray-300">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add Student Results</h1>
                 <p className="text-gray-600 mt-1">Search for a student by Registration Number and enter their marks or grades.</p>
                 <Link href="/admin/dashboard" legacyBehavior><a className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline mt-2 inline-block">← Back to Admin Dashboard</a></Link>
            </header>

            {/* Student Search Section */}
            <section className="mb-10 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">1. Find Student by Registration Number</h2>
                 <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row items-start gap-3">
                     <div className="flex-grow w-full sm:w-auto">
                         <label htmlFor="searchRegNum" className="sr-only">Registration Number</label>
                         <input
                             type="text"
                             id="searchRegNum"
                             value={searchRegNum}
                             // Convert to uppercase as user types for consistency
                             onChange={(e) => setSearchRegNum(e.target.value.toUpperCase())}
                             placeholder="Enter Student Registration Number"
                             required
                             disabled={isSearching}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                         />
                     </div>
                     <button
                         type="submit"
                         className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                         disabled={isSearching || !searchRegNum.trim()} // Disable if input is empty
                     >
                          {isSearching ? <LoadingSpinner size="h-4 w-4 mr-2"/> : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                         )}
                          {isSearching ? 'Searching...' : 'Search Student'}
                     </button>
                 </form>
                  {/* Search Error Display */}
                 {searchError && <p className="text-red-600 text-sm mt-3">{searchError}</p>}
            </section>

             {/* Result Form Section (Show only if student is found) */}
            {foundStudent && (
                 <section className="bg-white shadow-md rounded-lg p-6 transition-opacity duration-300 ease-in-out">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">2. Enter Result for Found Student</h2>
                     {/* Display Found Student Info */}
                     <div className="bg-indigo-50 p-4 rounded border border-indigo-200 mb-6 text-sm">
                         <p><span className="font-medium text-indigo-900">Name:</span> {foundStudent.name}</p>
                         <p><span className="font-medium text-indigo-900">Reg No:</span> {foundStudent.registrationNumber}</p>
                         <p><span className="font-medium text-indigo-900">Email:</span> {foundStudent.email}</p>
                         <p className="text-xs"><span className="font-medium text-indigo-900">UID:</span> <span className="font-mono text-indigo-700">{foundStudent.id}</span></p>
                     </div>

                     {/* Form for adding a result */}
                    <form onSubmit={handleAddResult} className="space-y-4">
                          {/* Form Error/Success Messages */}
                         {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm" role="alert">{formError}</div>}
                         {formSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm" role="alert">{formSuccess}</div>}

                          {/* Result Input Fields */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {/* Subject Name */}
                            <div> <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label> <input type="text" id="subjectName" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required disabled={isAddingResult} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                             {/* Marks/Grade */}
                            <div> <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks / Grade <span className="text-red-500">*</span></label> <input type="text" id="marks" value={marks} onChange={(e) => setMarks(e.target.value)} required disabled={isAddingResult} placeholder="e.g., 85 or A+" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                             {/* Exam Name */}
                             <div> <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">Exam Name / Semester <span className="text-red-500">*</span></label> <input type="text" id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} required disabled={isAddingResult} placeholder="e.g., Semester 1 Final" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>
                         </div>
                          {/* Academic Year (Optional) */}
                         <div> <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year (Optional)</label> <input type="text" id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} disabled={isAddingResult} placeholder="e.g., 2024-2025" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"/> </div>

                         {/* Submit Button */}
                        <button type="submit" disabled={isAddingResult} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed">
                             {isAddingResult ? <LoadingSpinner size="h-4 w-4 mr-2"/> : (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                             )}
                             {isAddingResult ? 'Adding...' : 'Add Result'}
                        </button>
                     </form>
                 </section>
            )}

            {/* Admin Course Marks Section */}
            <CourseMarksAdminContent adminUser={currentUser} />
        </div>
    );
};


export type Course = CourseData & { id: string };

type AdminMarksData = MarksData & { studentUid: string, courseId?: string, courseName?: string, marks: string };

// Admin component for viewing and managing end-term marks for courses
// This will be a separate, more complex component that handles course selection, student listing, and marks entry
interface CourseMarksAdminContentProps {
    adminUser: User | null; // Ensure adminUser is passed and typed correctly
}

const CourseMarksAdminContent = ({ adminUser }: CourseMarksAdminContentProps) => {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]); // To store all available courses
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [registeredStudents, setRegisteredStudents] = useState<FoundStudent[]>([]);
    const [courseMarks, setCourseMarks] = useState<{ [studentUid: string]: AdminMarksData }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [marksChanged, setMarksChanged] = useState<Set<string>>(new Set()); // Track which students' marks have changed
    const [isPublishing, setIsPublishing] = useState<string | null>(null); // Track publishing state per student
    const [isSaving, setIsSaving] = useState<string | null>(null); // Track saving state per student


    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const fetchedDepartments = await getDepartments();
                setDepartments(fetchedDepartments);
                const fetchedSemesters = await getSemesters(selectedDepartment);
                setSemesters(fetchedSemesters);
            } catch (err) {
                console.error("Error fetching departments or semesters:", err);
                setError("Failed to load departments or semesters.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [selectedDepartment]);

    // Fetch courses based on selected department and semester
    useEffect(() => {
        const fetchCourses = async () => {
            if (selectedDepartment && selectedSemester) {
                setLoading(true);
                setError(null);
                try {
                    const courses = await getCoursesByDepartmentAndSemester(selectedDepartment, selectedSemester);
                    setAllCourses(courses);
                    setSelectedCourse(null); // Reset selected course when filters change
                    setRegisteredStudents([]); // Clear students
                    setCourseMarks({}); // Clear marks
                } catch (err) {
                    console.error("Error fetching courses:", err);
                    setError("Failed to load courses for the selected department and semester.");
                } finally {
                    setLoading(false);
                }
            } else {
                setAllCourses([]); // Clear courses if filters are not fully selected
            }
        };
        fetchCourses();
    }, [selectedDepartment, selectedSemester]);


    const handleCourseSelect = async (courseId: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setMarksChanged(new Set()); // Reset changed marks
        try {
            const course = allCourses.find(c => c.id === courseId);
            if (course) {
                setSelectedCourse(course);

                // Fetch registered students for the selected course
                const students = await getRegisteredStudentsForCourse(course.id);
                setRegisteredStudents(students);

                // Fetch existing marks for these students for the selected course
                const marksMap: { [key: string]: AdminMarksData } = {};
                for (const student of students) {
                    const existingMarks = await getStudentMarksForCourse(student.id, course.id);
                    // Initialize with proper structure if no marks exist
                    marksMap[student.id] = {
                        ...existingMarks,
                        studentUid: student.id,
                        marks: (existingMarks?.endTermMarks as string) || '' // Ensure marks is always a string
                    } as AdminMarksData; // Cast to ensure type compatibility
                }
                setCourseMarks(marksMap);
            } else {
                setError("Selected course not found.");
            }
        } catch (err) {
            console.error("Error loading course details or student marks:", err);
            setError("Failed to load course details or student marks.");
        } finally {
            setLoading(false);
        }
    };

    const handleEndTermMarkChange = (studentUid: string, value: string) => {
        setCourseMarks(prev => ({
            ...prev,
            [studentUid]: { ...prev[studentUid], marks: value, courseId: selectedCourse?.id, courseName: selectedCourse?.courseName } // Ensure courseId and courseName are set
        }));
        setMarksChanged(prev => new Set(prev).add(studentUid)); // Mark student's score as changed
        setSuccess(null); // Clear success message on change
    };


    const handleSaveEndTermMark = async (studentUid: string) => {
        if (!adminUser) {
            setError("Authentication error: Admin user not found.");
            return;
        }
        if (!selectedCourse) {
            setError("No course selected.");
            return;
        }

        const studentMarks = courseMarks[studentUid];
        if (!studentMarks || !studentMarks.marks.trim()) {
            setError("Marks cannot be empty for saving.");
            return;
        }

        setIsSaving(studentUid); // Set saving state for this student
        setError(null);
        try {
            await upsertAdminEndTermMarks(
                studentUid,
                selectedCourse.id,
                studentMarks.marks.trim(),
                adminUser.uid,
                selectedCourse.courseName // Pass course name
            );
            setSuccess(`Marks for ${registeredStudents.find(s => s.id === studentUid)?.name} saved successfully.`);
            setMarksChanged(prev => { const newState = new Set(prev); newState.delete(studentUid); return newState; }); // Remove from changed set

        } catch (err) {
            console.error("Error saving marks:", err);
            setError(`Failed to save marks for ${registeredStudents.find(s => s.id === studentUid)?.name}.`);
        } finally {
            setIsSaving(null); // Clear saving state
        }
    };

    const handlePublishEndTermMark = async (studentUid: string) => {
        if (!adminUser) {
            setError("Authentication error: Admin user not found.");
            return;
        }
        if (!selectedCourse) {
            setError("No course selected.");
            return;
        }

        const studentMarks = courseMarks[studentUid];
        if (!studentMarks || !studentMarks.marks.trim()) {
            setError("Marks cannot be empty for publishing.");
            return;
        }

        setIsPublishing(studentUid); // Set publishing state for this student
        setError(null);
        try {
            await publishAdminEndTermMarks(
                studentUid,
                selectedCourse.id,
                studentMarks.marks.trim(),
                adminUser.uid,
                selectedCourse.courseName
            );
            setSuccess(`Marks for ${registeredStudents.find(s => s.id === studentUid)?.name} published successfully.`);

        } catch (err) {
            console.error("Error publishing marks:", err);
            setError(`Failed to publish marks for ${registeredStudents.find(s => s.id === studentUid)?.name}.`);
        } finally {
            setIsPublishing(null); // Clear publishing state
        }
    };

    return (
        <section className="mt-10 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">3. Add End-Term Marks by Course</h2>
            {loading && <div className="text-center py-4"><LoadingSpinner /> <p className="mt-2 text-gray-600">Loading data...</p></div>}
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm mb-4" role="alert">{success}</div>}

            {/* Department and Semester Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="department-select" className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                    <select
                        id="department-select"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">Select Semester</label>
                    <select
                        id="semester-select"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Semester --</option>
                        {semesters.map((sem) => (
                            <option key={sem.id} value={sem.id}>{sem.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Course Selection */}
            {selectedDepartment && selectedSemester && allCourses.length > 0 && (
                <div className="mb-6">
                    <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                    <select
                        id="course-select"
                        value={selectedCourse?.id || ''}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Course --</option>
                        {allCourses.map((course) => (
                            <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                        ))}
                    </select>
                </div>
            )}
            {selectedDepartment && selectedSemester && allCourses.length === 0 && !loading && !error && (
                <p className="text-gray-600 text-sm italic">No courses found for the selected department and semester.</p>
            )}


            {/* Registered Students and Marks Entry */}
            {selectedCourse && (registeredStudents.length > 0 ? (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Students Registered for {selectedCourse.courseName}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Marks</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registeredStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.registrationNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <input
                                                type="text"
                                                value={courseMarks[student.id]?.marks || ''}
                                                onChange={(e) => handleEndTermMarkChange(student.id, e.target.value)}
                                                className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter marks"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {marksChanged.has(student.id) && (
                                                    <button
                                                        onClick={() => handleSaveEndTermMark(student.id)}
                                                        disabled={isSaving === student.id}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                    >
                                                        {isSaving === student.id ? <LoadingSpinner size="h-3 w-3 mr-1"/> : <Save className="h-3 w-3 mr-1" />}
                                                        {isSaving === student.id ? 'Saving...' : 'Save'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handlePublishEndTermMark(student.id)}
                                                    disabled={isPublishing === student.id || !courseMarks[student.id]?.marks.trim() || marksChanged.has(student.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                >
                                                    {isPublishing === student.id ? <LoadingSpinner size="h-3 w-3 mr-1"/> : <Send className="h-3 w-3 mr-1" />}
                                                    {isPublishing === student.id ? 'Publishing...' : 'Publish'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 mt-4">No students registered for this course yet.</p>
            ))}
        </section>
    );
};

export default AddResultsPage;