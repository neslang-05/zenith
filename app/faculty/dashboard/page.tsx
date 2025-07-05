"use client";

import React, { useState, useEffect, useCallback } from 'react';
import FacultyLayout from '../FacultyLayout'; // Adjust path if needed
import { useSearchParams } from 'next/navigation';
import {
    auth, getUserProfile, addCourse, getCoursesByFaculty, getRegisteredStudentsForCourse,
    upsertFacultyMarks, publishFacultyMarks, getStudentMarksForCourse, CourseData, MarksData, getAllStudents, registerStudentForCourse, getDepartments, getSemesters, getCourses, updateCourseInSemester, addSemester, addCourseToSemester
} from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { PlusCircle, Edit3, CheckCircle, XCircle, Send, Save, Users, ListChecks, Eye, ChevronDown, ChevronUp, Layers, Calendar, BookOpen } from 'lucide-react';

// Loading Spinner
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

// --- Add Course Component ---
const AddCourseForm = ({ facultyProfile, onCourseAdded }: { facultyProfile: DocumentData, onCourseAdded: () => void }) => {
    const [viewMode, setViewMode] = useState<'new' | 'existing'>('new'); // 'new' or 'existing'
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    const [description, setDescription] = useState('');
    const [credits, setCredits] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // States for existing course selection
    const [availableCourses, setAvailableCourses] = useState<(CourseData & { id: string, departmentId: string, semesterId: string })[]>([]);
    const [selectedExistingCourseId, setSelectedExistingCourseId] = useState<string | ''>('');

    // States for new course creation within structure
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentForCourse, setSelectedDepartmentForCourse] = useState<string | ''>('');
    const [semestersForDepartment, setSemestersForDepartment] = useState<Semester[]>([]);
    const [selectedSemesterForCourse, setSelectedSemesterForCourse] = useState<string | ''>('');
    const [newSemesterName, setNewSemesterName] = useState('');
    const [isCreatingNewSemester, setIsCreatingNewSemester] = useState(false);

    // Fetch departments and relevant existing courses on load
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!facultyProfile || !facultyProfile.departmentId) return; // Faculty must have a department and profile loaded

            try {
                // Fetch departments (only the faculty's department for simplicity in this form)
                const depList = await getDepartments();
                const facultyDepartment = depList.find((dep: { id: string, name: string }) => dep.id === facultyProfile.departmentId);
                if (facultyDepartment) {
                    // Ensure the department object itself is correctly typed
                    setDepartments([{ id: facultyDepartment.id, name: facultyDepartment.name, semesters: [] }]); 
                    setSelectedDepartmentForCourse(facultyDepartment.id);

                    // Fetch semesters and courses for this department
                    const semList = await getSemesters(facultyDepartment.id);
                    const allCoursesInFacultyDepartment: (CourseData & { id: string, departmentId: string, semesterId: string })[] = [];

                    for (const sem of semList) {
                        const coursesInSem = await getCourses(facultyDepartment.id, sem.id);
                        coursesInSem.forEach((course: CourseData & { id: string }) => {
                            // Filter: show courses not assigned, or assigned to current faculty
                            if (!course.facultyUid || course.facultyUid === facultyProfile.uid) {
                                allCoursesInFacultyDepartment.push({
                                    ...course, // Spread all properties from CourseData & { id: string }
                                    departmentId: facultyDepartment.id,
                                    semesterId: sem.id
                                });
                            }
                        });
                    }
                    setAvailableCourses(allCoursesInFacultyDepartment);
                    setSemestersForDepartment(semList.map((s: any) => ({ id: s.id, name: s.name, courses: [] }))); // Map only necessary fields
                }
            } catch (error) {
                console.error("Error fetching initial course data for faculty:", error);
                setFormError("Failed to load course options.");
            }
        };
        fetchInitialData();
    }, [facultyProfile]); // Depend on facultyProfile to re-fetch when it's available

    // Effect to update semesters when department changes (though for faculty it's usually just one department)
    useEffect(() => {
        const fetchSemestersForSelectedDepartment = async () => {
            if (selectedDepartmentForCourse) {
                try {
                    const sems = await getSemesters(selectedDepartmentForCourse);
                    setSemestersForDepartment(sems.map((s: any) => ({ id: s.id, name: s.name, courses: [] })));
                } catch (error) {
                    console.error("Error fetching semesters:", error);
                    setFormError("Failed to load semesters.");
                }
            }
        };
        fetchSemestersForSelectedDepartment();
    }, [selectedDepartmentForCourse]);

    const handleAddExistingCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExistingCourseId) {
            setFormError("Please select an existing course.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const courseToClaim = availableCourses.find(c => c.id === selectedExistingCourseId);
            if (!courseToClaim) { throw new Error("Selected course not found."); }

            // Update the existing course with faculty's UID and name
            await updateCourseInSemester(
                courseToClaim.departmentId,
                courseToClaim.semesterId,
                courseToClaim.id,
                { 
                    name: courseToClaim.courseName, 
                    code: courseToClaim.courseCode,
                }
            );
            setFormSuccess(`Course "${courseToClaim.courseName}" assigned to you successfully!`);
            setSelectedExistingCourseId('');
            onCourseAdded(); // Refresh course list in parent
        } catch (error: any) {
            setFormError(`Failed to assign course: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNewCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseName.trim() || !courseCode.trim() || !academicYear.trim()) {
            setFormError("Course Name, Code, and Academic Year are required.");
            return;
        }
        if (!selectedDepartmentForCourse || (!selectedSemesterForCourse && !isCreatingNewSemester)) {
            setFormError("Please select a Department and Semester, or create a new semester.");
            return;
        }
        if (isCreatingNewSemester && !newSemesterName.trim()) {
            setFormError("New semester name cannot be empty.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        let targetSemesterId = selectedSemesterForCourse;

        try {
            if (isCreatingNewSemester) {
                // Create new semester first
                targetSemesterId = await addSemester(selectedDepartmentForCourse, newSemesterName.trim());
                setFormSuccess(`New semester '${newSemesterName.trim()}' created.`);
            }

            const courseData: CourseData = {
                courseName: courseName.trim(),
                courseCode: courseCode.trim().toUpperCase(),
                facultyUid: facultyProfile.uid,
                facultyName: facultyProfile.name,
                academicYear: academicYear.trim(),
                description: description.trim(),
                credits: credits ? parseInt(credits) : undefined,
            };

            // Add course to the selected/newly created semester
            await addCourseToSemester(selectedDepartmentForCourse, targetSemesterId, { name: courseData.courseName, code: courseData.courseCode });
            
            setFormSuccess(`Course "${courseName}" added successfully!`);
            setCourseName(''); setCourseCode(''); setDescription(''); setCredits('');
            setAcademicYear(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
            setNewSemesterName('');
            setIsCreatingNewSemester(false);
            setSelectedSemesterForCourse('');
            onCourseAdded(); // Callback to refresh course list

        } catch (error: any) {
            setFormError(`Failed to add course: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add/Assign Course</h3>

            <div className="mb-4 border-b pb-4">
                <button 
                    onClick={() => setViewMode('new')} 
                    className={`mr-4 px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'new' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                    Add New Course
                </button>
                <button 
                    onClick={() => setViewMode('existing')} 
                    className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'existing' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                    Assign Existing Course
                </button>
            </div>

            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            {formSuccess && <p className="text-green-500 text-sm mb-4">{formSuccess}</p>}

            {viewMode === 'new' && (
                <form onSubmit={handleAddNewCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="newCourseDepartmentSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select 
                                id="newCourseDepartmentSelect"
                                value={selectedDepartmentForCourse}
                                onChange={(e) => setSelectedDepartmentForCourse(e.target.value)}
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
                            <label htmlFor="newCourseSemesterSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                            <select 
                                id="newCourseSemesterSelect"
                                value={selectedSemesterForCourse}
                                onChange={(e) => setSelectedSemesterForCourse(e.target.value)}
                                required={!isCreatingNewSemester}
                                disabled={!selectedDepartmentForCourse || isCreatingNewSemester}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-- Select Semester --</option>
                                {semestersForDepartment.map(sem => (
                                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                                ))}
                            </select>
                            <div className="mt-2 flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="createNewSemesterCheckbox" 
                                    checked={isCreatingNewSemester} 
                                    onChange={(e) => setIsCreatingNewSemester(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="createNewSemesterCheckbox" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Create New Semester</label>
                            </div>
                            {isCreatingNewSemester && selectedDepartmentForCourse && (
                                <input 
                                    type="text" 
                                    placeholder="New Semester Name" 
                                    value={newSemesterName} 
                                    onChange={(e) => setNewSemesterName(e.target.value)}
                                    required 
                                    className="mt-2 w-full input-style"
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Name</label>
                            <input type="text" id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Code</label>
                            <input type="text" id="courseCode" value={courseCode} onChange={e => setCourseCode(e.target.value.toUpperCase())} required className="mt-1 w-full input-style" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                            <input type="text" id="academicYear" value={academicYear} onChange={e => setAcademicYear(e.target.value)} required placeholder="e.g., 2023-2024" className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="credits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credits (Optional)</label>
                            <input type="number" id="credits" value={credits} onChange={e => setCredits(e.target.value)} className="mt-1 w-full input-style" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full input-style"></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex items-center">
                        {isSubmitting ? <LoadingSpinner size="h-4 w-4 mr-2" color="border-white" /> : <PlusCircle size={16} className="mr-2" />}
                        {isSubmitting ? 'Adding...' : 'Add Course'}
                    </button>
                </form>
            )}

            {viewMode === 'existing' && (
                <form onSubmit={handleAddExistingCourse} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select a course from your department that has not yet been assigned to a faculty, or is assigned to you.</p>
                    <div>
                        <label htmlFor="existingCourseSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Course</label>
                        <select 
                            id="existingCourseSelect"
                            value={selectedExistingCourseId}
                            onChange={(e) => setSelectedExistingCourseId(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">-- Select an Existing Course --</option>
                            {availableCourses.map(course => (
                                <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex items-center">
                        {isSubmitting ? <LoadingSpinner size="h-4 w-4 mr-2" color="border-white" /> : <CheckCircle size={16} className="mr-2" />}
                        {isSubmitting ? 'Assigning...' : 'Assign Selected Course'}
                    </button>
                </form>
            )}
            <style jsx>{`
                .input-style {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid;
                    border-radius: 0.375rem; /* rounded-md */
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
                }
                .dark .input-style {
                    background-color: #374151; /* gray-700 */
                    border-color: #4B5563; /* gray-600 */
                    color: white;
                }
                .input-style {
                    border-color: #D1D5DB; /* gray-300 */
                }
                .btn-primary {
                    padding: 0.5rem 1rem;
                    border: 1px solid transparent;
                    font-size: 0.875rem; /* text-sm */
                    font-weight: 500; /* font-medium */
                    border-radius: 0.375rem; /* rounded-md */
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
                    color: white;
                    background-color: #4F46E5; /* indigo-600 */
                }
                .btn-primary:hover {
                    background-color: #4338CA; /* indigo-700 */
                }
                .btn-primary:disabled {
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
};

// --- Manage Marks Component ---
type FacultyMarksData = MarksData & { studentUid: string, studentName?: string, registrationNumber?: string };

// Define nested interfaces for institution structure within faculty dashboard
interface Department { // Extend DocumentData if you want Firestore fields like 'id'
    id: string;
    name: string;
    semesters: Semester[];
}

interface Semester {
    id: string;
    name: string;
    courses: (CourseData & { id: string })[];
}

const ManageMarks = ({ facultyProfile, courses }: { facultyProfile: DocumentData, courses: (CourseData & { id: string })[]}) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [registeredStudents, setRegisteredStudents] = useState<(DocumentData & { id: string })[]>([]);
    const [studentMarks, setStudentMarks] = useState<FacultyMarksData[]>([]);
    
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingMarks, setLoadingMarks] = useState(false);

    const [currentInternalMarks, setCurrentInternalMarks] = useState<{ [studentUid: string]: string }>({});
    const [currentMidTermMarks, setCurrentMidTermMarks] = useState<{ [studentUid: string]: string }>({});
    const [marksError, setMarksError] = useState<string | null>(null);
    const [marksSuccess, setMarksSuccess] = useState<string | null>(null);

    const handleCourseSelect = async (courseId: string) => {
        setSelectedCourseId(courseId);
        if (!courseId) {
            setRegisteredStudents([]);
            setStudentMarks([]);
            return;
        }
        setLoadingStudents(true); setLoadingMarks(true);
        try {
            const studentsList = await getRegisteredStudentsForCourse(courseId);
            setRegisteredStudents(studentsList);

            const marksListPromises = studentsList.map(async (student) => {
                const marks = await getStudentMarksForCourse(courseId, student.id);
                return { 
                    studentUid: student.id, 
                    studentName: student.studentName,
                    registrationNumber: student.registrationNumber,
                    ...marks 
                } as FacultyMarksData;
            });
            const resolvedMarks = await Promise.all(marksListPromises);
            setStudentMarks(resolvedMarks);

            const initialInternal: { [uid: string]: string } = {};
            const initialMidTerm: { [uid: string]: string } = {};
            resolvedMarks.forEach(sm => {
                initialInternal[sm.studentUid] = String(sm.internalMarks || '');
                initialMidTerm[sm.studentUid] = String(sm.midTermMarks || '');
            });
            setCurrentInternalMarks(initialInternal);
            setCurrentMidTermMarks(initialMidTerm);

        } catch (error) {
            console.error("Error fetching students/marks:", error);
            setMarksError("Failed to load student or marks data.");
        } finally {
            setLoadingStudents(false); setLoadingMarks(false);
        }
    };

    const handleMarkChange = (studentUid: string, type: 'internal' | 'midTerm', value: string) => {
        if (type === 'internal') {
            setCurrentInternalMarks(prev => ({ ...prev, [studentUid]: value }));
        } else {
            setCurrentMidTermMarks(prev => ({ ...prev, [studentUid]: value }));
        }
    };

    const handleSaveMark = async (studentUid: string, type: 'internal' | 'midTerm') => {
        if (!selectedCourseId || !facultyProfile) return;
        const markValue = type === 'internal' ? currentInternalMarks[studentUid] : currentMidTermMarks[studentUid];
        
        setMarksError(null); setMarksSuccess(null);
        try {
            const marksToUpdate: any = {};
            if (type === 'internal') marksToUpdate.internalMarks = markValue;
            else marksToUpdate.midTermMarks = markValue;

            await upsertFacultyMarks(selectedCourseId, studentUid, marksToUpdate, facultyProfile.uid);
            setMarksSuccess(`${type === 'internal' ? 'Internal' : 'Mid-Term'} mark for ${studentUid} saved.`);
            // Refresh marks for this student
            const updatedMark = await getStudentMarksForCourse(selectedCourseId, studentUid);
             setStudentMarks(prev => prev.map(sm => sm.studentUid === studentUid ? { ...sm, ...updatedMark, [type === 'internal' ? 'internalMarks' : 'midTermMarks']: markValue } : sm));
        } catch (error: any) {
            setMarksError(`Failed to save mark: ${error.message}`);
        }
    };

    const handlePublishMark = async (studentUid: string, type: 'internal' | 'midTerm') => {
        if (!selectedCourseId || !facultyProfile) return;
        setMarksError(null); setMarksSuccess(null);
        try {
            await publishFacultyMarks(selectedCourseId, studentUid, type, facultyProfile.uid);
            setMarksSuccess(`${type === 'internal' ? 'Internal' : 'Mid-Term'} mark for ${studentUid} published.`);
            // Refresh marks for this student
             const updatedMark = await getStudentMarksForCourse(selectedCourseId, studentUid);
             setStudentMarks(prev => prev.map(sm => sm.studentUid === studentUid ? { ...sm, ...updatedMark, [type === 'internal' ? 'internalPublished' : 'midTermPublished']: true } : sm));

            // TODO: Notify student (backend)
        } catch (error: any) {
            setMarksError(`Failed to publish mark: ${error.message}`);
        }
    };
    
    const selectedCourseDetails = courses.find(c => c.id === selectedCourseId);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Manage Student Marks</h3>
            <div className="mb-4">
                <label htmlFor="courseSelectMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Course</label>
                <select 
                    id="courseSelectMarks"
                    value={selectedCourseId}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                >
                    <option value="">-- Select a Course --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                    ))}
                </select>
            </div>

            {selectedCourseId && selectedCourseDetails && (
                <div>
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-6 mb-2">
                        Students in: {selectedCourseDetails.courseName}
                    </h4>
                    {marksError && <p className="text-red-500 text-sm my-2">{marksError}</p>}
                    {marksSuccess && <p className="text-green-500 text-sm my-2">{marksSuccess}</p>}

                    {loadingStudents || loadingMarks ? <LoadingSpinner /> : registeredStudents.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No students registered.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="th-style">Student Name</th>
                                        <th className="th-style">Reg No.</th>
                                        <th className="th-style">Internal Mark</th>
                                        <th className="th-style">Mid-Term Mark</th>
                                        <th className="th-style">End-Term (Admin)</th>
                                        <th className="th-style">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {studentMarks.map(sm => (
                                        <tr key={sm.studentUid}>
                                            <td className="td-style">{sm.studentName || 'N/A'}</td>
                                            <td className="td-style text-xs">{sm.registrationNumber || 'N/A'}</td>
                                            <td className="td-style">
                                                <input type="text" value={currentInternalMarks[sm.studentUid] || ''} onChange={e => handleMarkChange(sm.studentUid, 'internal', e.target.value)} className="mark-input" placeholder="N/A" disabled={sm.internalPublished}/>
                                                {sm.internalPublished && <span title="Published"><CheckCircle size={14} className="icon-published" /></span>}
                                            </td>
                                            <td className="td-style">
                                                <input type="text" value={currentMidTermMarks[sm.studentUid] || ''} onChange={e => handleMarkChange(sm.studentUid, 'midTerm', e.target.value)} className="mark-input" placeholder="N/A" disabled={sm.midTermPublished}/>
                                                {sm.midTermPublished && <span title="Published"><CheckCircle size={14} className="icon-published" /></span>}
                                            </td>
                                            <td className="td-style text-gray-500 dark:text-gray-400">
                                                {sm.endTermMarks || '-'} {sm.endTermPublished && <span title="Published"><CheckCircle size={14} className="icon-published" /></span>}
                                            </td>
                                            <td className="td-style space-x-1 md:space-x-2 whitespace-nowrap">
                                                {!sm.internalPublished && (
                                                    <>
                                                    <button onClick={() => handleSaveMark(sm.studentUid, 'internal')} className="btn-action-sm text-indigo-600" title="Save Internal"><Save size={15}/></button>
                                                    <button onClick={() => handlePublishMark(sm.studentUid, 'internal')} className="btn-action-sm text-green-600" title="Publish Internal"><Send size={15}/></button>
                                                    </>
                                                )}
                                                {!sm.midTermPublished && (
                                                    <>
                                                    <button onClick={() => handleSaveMark(sm.studentUid, 'midTerm')} className="btn-action-sm text-indigo-600" title="Save Mid-Term"><Save size={15}/></button>
                                                    <button onClick={() => handlePublishMark(sm.studentUid, 'midTerm')} className="btn-action-sm text-green-600" title="Publish Mid-Term"><Send size={15}/></button>
                                                    </>
                                                )}
                                                {(sm.internalPublished || sm.midTermPublished) && !( !sm.internalPublished && !sm.midTermPublished) && <span className="text-xs text-gray-400">Marks saved/published.</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
             <style jsx>{`
                .th-style { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .dark .th-style { color: #D1D5DB; }
                .td-style { padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #374151; }
                .dark .td-style { color: #E5E7EB; }
                .mark-input { width: 4rem; padding: 0.25rem 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; font-size: 0.875rem; }
                .dark .mark-input { background-color: #4B5563; border-color: #6B7280; color: white; }
                .mark-input:disabled { background-color: #F3F4F6; }
                .dark .mark-input:disabled { background-color: #374151; opacity: 0.7; }
                .icon-published { display: inline; margin-left: 0.25rem; color: #10B981; }
                .btn-action-sm { padding: 0.25rem; border-radius: 0.25rem; }
                .btn-action-sm:hover { background-color: #F3F4F6; }
                .dark .btn-action-sm:hover { background-color: #4B5563; }
            `}</style>
        </div>
    );
};


// --- List Faculty's Courses ---
const ListCourses = ({ courses, onSelectCourse }: { courses: (CourseData & { id: string })[], onSelectCourse: (courseId: string) => void }) => {
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registeredStudents, setRegisteredStudents] = useState<(DocumentData & { id: string })[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [allStudents, setAllStudents] = useState<(DocumentData & { id: string })[]>([]);
    const [registrationError, setRegistrationError] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const students = await getAllStudents();
                setAllStudents(students);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchAllStudents();
    }, []);

    const handleRegisterStudents = async (courseId: string) => {
        setSelectedCourseId(courseId);
        setShowRegisterModal(true);
        setLoadingStudents(true);
        try {
            const existingStudents = await getRegisteredStudentsForCourse(courseId);
            setRegisteredStudents(existingStudents);
        } catch (error) {
            console.error('Error fetching registered students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleConfirmRegistration = async () => {
        if (!selectedCourseId) return;
        
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;

        setRegistrationError(null);
        setRegistrationSuccess(null);
        
        try {
            const registrationPromises = selectedStudents.map(studentId => {
                const student = allStudents.find(s => s.id === studentId);
                if (!student) throw new Error(`Student ${studentId} not found`);
                
                return registerStudentForCourse(
                    selectedCourseId,
                    student.id,
                    student.name,
                    student.registrationNumber
                );
            });

            await Promise.all(registrationPromises);
            setRegistrationSuccess(`Successfully registered ${selectedStudents.length} students to ${course.courseName}`);
            setSelectedStudents([]);
            
            // Refresh registered students list
            const updatedStudents = await getRegisteredStudentsForCourse(selectedCourseId);
            setRegisteredStudents(updatedStudents);
        } catch (error: any) {
            setRegistrationError(error.message || 'Failed to register students');
        }
    };

    if (courses.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">You have not added any courses yet.</p>;
    }

    return (
        <>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">My Courses ({courses.length})</h3>
            <div className="space-y-3">
                {courses.map(course => (
                    <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100">{course.courseName} ({course.courseCode})</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{course.academicYear} - {course.credits ? `${course.credits} credits` : 'No credit info'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleRegisterStudents(course.id)}
                                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Register Students
                                </button>
                                <button 
                                    onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {expandedCourseId === course.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>
                        {expandedCourseId === course.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.description || "No description."}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Register Students Modal */}
        {showRegisterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Register Students to Course
                    </h3>
                    
                    {registrationError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{registrationError}</div>
                    )}
                    {registrationSuccess && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{registrationSuccess}</div>
                    )}

                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Currently Registered Students:</h4>
                        {loadingStudents ? (
                            <p>Loading...</p>
                        ) : registeredStudents.length === 0 ? (
                            <p className="text-gray-500">No students registered yet</p>
                        ) : (
                            <ul className="space-y-1">
                                {registeredStudents.map(student => (
                                    <li key={student.id} className="text-sm">
                                        {student.studentName} ({student.registrationNumber})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Register New Students:</h4>
                        <div className="max-h-60 overflow-y-auto border rounded-md">
                            {allStudents.map(student => {
                                const isRegistered = registeredStudents.some(rs => rs.id === student.id);
                                if (isRegistered) return null;
                                
                                return (
                                    <label
                                        key={student.id}
                                        className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents([...selectedStudents, student.id]);
                                                } else {
                                                    setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        {student.name} ({student.registrationNumber})
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setShowRegisterModal(false);
                                setSelectedStudents([]);
                                setRegistrationError(null);
                                setRegistrationSuccess(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmRegistration}
                            disabled={selectedStudents.length === 0}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Register Selected Students
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};


// --- Main Faculty Dashboard Page ---
const FacultyDashboardPage = () => {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'dashboard';

    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [facultyProfile, setFacultyProfile] = useState<DocumentData | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStructure, setLoadingStructure] = useState(true); // New state for institution structure loading
    const [error, setError] = useState<string | null>(null);
    const [facultyCourses, setFacultyCourses] = useState<(CourseData & { id: string })[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]); // New state for structured departments

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setCurrentUser(user);
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile && profile.role === 'faculty') {
                        setFacultyProfile(profile);
                        // Fetch courses and structure only after profile is loaded
                        await fetchFacultyCourses(user.uid);
                        await fetchInstitutionStructure(user.uid); // Fetch structure specific to faculty
                    } else {
                        // Redirect if not a faculty member
                        window.location.href = '/'; // Or a more specific unauthorized page
                    }
                } catch (err: any) {
                    console.error("Error fetching faculty profile:", err);
                    setError(err.message || 'Failed to load faculty profile.');
                }
            } else {
                // Not authenticated, redirect to login
                window.location.href = '/login';
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchFacultyCourses = useCallback(async (facultyUid: string) => {
        setLoadingCourses(true); setError(null);
        try {
            const courses = await getCoursesByFaculty(facultyUid);
            setFacultyCourses(courses);
        } catch (err: any) {
            setError(err.message || 'Failed to load your courses.');
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    // New function to fetch institution structure relevant to the faculty
    const fetchInstitutionStructure = useCallback(async (facultyUid: string) => {
        setLoadingStructure(true); setError(null);
        try {
            const depList = await getDepartments();
            const departmentsWithNestedData: Department[] = await Promise.all(depList.map(async (dep: any) => {
                const semList = await getSemesters(dep.id);
                const semestersWithCourses: Semester[] = await Promise.all(semList.map(async (sem: any) => {
                    const courseList = await getCourses(dep.id, sem.id);
                    // Filter courses by facultyUid and ensure type consistency
                    const facultySpecificCourses = courseList.filter(c => c.facultyUid === facultyUid).map(c => ({ 
                        id: c.id, 
                        courseName: c.courseName, 
                        courseCode: c.courseCode, 
                        facultyUid: c.facultyUid, 
                        facultyName: c.facultyName, 
                        academicYear: c.academicYear, 
                        description: c.description,
                        credits: c.credits,
                        createdAt: c.createdAt,
                    }));
                    return { id: sem.id, name: sem.name, courses: facultySpecificCourses };
                }));
                // Only include semesters that have courses for this faculty
                const relevantSemesters = semestersWithCourses.filter(sem => sem.courses.length > 0);
                return { id: dep.id, name: dep.name, semesters: relevantSemesters };
            }));
            // Only include departments that have relevant semesters for this faculty
            const relevantDepartments = departmentsWithNestedData.filter(dep => dep.semesters.length > 0);
            setDepartments(relevantDepartments);
        } catch (err: any) {
            setError(err.message || 'Failed to load institution structure.');
        } finally {
            setLoadingStructure(false);
        }
    }, []);

    if (loadingAuth) {
        return (
            <FacultyLayout>
                <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <LoadingSpinner size="h-10 w-10" />
                    <p className="ml-3 text-xl text-gray-700 dark:text-gray-300">Authenticating Faculty...</p>
                </div>
            </FacultyLayout>
        );
    }

    if (!currentUser || !facultyProfile) {
        return null; // Redirect handled by useEffect
    }

    const renderContent = () => {
        if (error) {
            return <div className="text-red-500 p-4">Error: {error}</div>;
        }

        switch (view) {
            case 'dashboard':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Faculty Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Display summary of courses, students etc. */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Courses Assigned</h3>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{facultyCourses.length}</p>
                            </div>
                            {/* Add more summary cards as needed */}
                        </div>

                        {/* Section to display institution structure for assigned courses */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">My Courses (Structured)</h3>
                            {loadingStructure ? (
                                <div className="flex items-center justify-center p-4"><LoadingSpinner /> <span className="ml-2 text-gray-500">Loading academic structure...</span></div>
                            ) : departments.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No courses assigned to you or no institution structure defined.</p>
                            ) : (
                                <div>
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
                                                                            className="p-2 mb-1 rounded-md flex items-center justify-between bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            <span className="flex items-center">
                                                                                <BookOpen size={16} className="mr-2 text-purple-500" />
                                                                                {course.courseName} ({course.courseCode})
                                                                            </span>
                                                                            {/* Optionally add more course details here */}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No courses in this semester for you.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No semesters in this department for you.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AddCourseForm facultyProfile={facultyProfile} onCourseAdded={() => { fetchFacultyCourses(facultyProfile.uid); fetchInstitutionStructure(facultyProfile.uid); }} />
                        <ManageMarks facultyProfile={facultyProfile} courses={facultyCourses} />
                    </div>
                );
            case 'students':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Manage My Students</h2>
                        <p>Student management details will go here.</p>
                    </div>
                );
            default:
                return <p className="p-6 text-gray-700 dark:text-gray-300">Select a view from the sidebar.</p>;
        }
    };

    return (
        <FacultyLayout>
            {renderContent()}
        </FacultyLayout>
    );
};

export default FacultyDashboardPage;