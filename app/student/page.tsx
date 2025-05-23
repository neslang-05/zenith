"use client";

import React, { useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // To read query params for view
import StudentLayout from './StudentLayout'; // Adjust path if needed
import {
  Mail, Phone, Calendar, Building, Users, Eye, Clock,
  FileText as LessonFileText, MoreVertical, Filter, Upload, Share, FileText,
  BarChart2, AlertCircle, Check, X
} from 'lucide-react';

// Firebase imports (assuming these are still needed for content fetching within dashboard tabs)
import { auth, getUserProfile, getStudentResults, onAuthStateChanged, Timestamp } from '@/lib/firebase'; // Adjust path
import { DocumentData } from 'firebase/firestore';

// --- Re-import or redefine specific content components if not moved ---
// For brevity, I'm assuming ProfileContent, ResultsContent etc. are defined in this file
// or imported. If they were in the old page.tsx, keep them here or move them.

// --- STUDENT PROFILE SPECIFIC COMPONENTS ---
interface InfoItemProps { icon: ReactNode; label: string; }
const InfoItem: React.FC<InfoItemProps> = ({ icon, label }) => (<div className="flex items-center p-2 rounded-md"><div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-700 mr-3">{icon}</div><span className="text-gray-700 text-sm">{label}</span></div>);

interface ProfileContentProps {
  profile: DocumentData | null;
  loading: boolean;
}
const ProfileContent: React.FC<ProfileContentProps> = ({ profile, loading }) => {
  if (loading) {
    return <div className="text-center p-10 text-gray-700">Loading profile...</div>;
  }
  if (!profile) {
    return <div className="text-center p-10 text-red-600">Profile data not found.</div>;
  }
  const displayName = profile.name || profile.displayName || "Student Name";
  const displayUsername = profile.username || (profile.email ? `@${profile.email.split('@')[0]}` : "studentuser");
  const displayEmail = profile.email || "No email provided";
  const displayPhone = profile.phoneNumber || "No phone provided";
  let displayDob = "Not specified";
  if (profile.dateOfBirth) {
      if (profile.dateOfBirth instanceof Timestamp) {
          displayDob = profile.dateOfBirth.toDate().toLocaleDateString();
      } else if (typeof profile.dateOfBirth === 'string') {
          const date = new Date(profile.dateOfBirth);
          if (!isNaN(date.getTime())) { displayDob = date.toLocaleDateString(); }
          else { displayDob = profile.dateOfBirth; }
      }
  }
  const displayCity = profile.city || "Not specified";
  const displayGender = profile.gender || "Not specified";
  const displayAddress = profile.address || "Not specified";
  const displayBio = profile.bio || "No bio available.";
  const initials=displayName.split(" ").map((n:string)=>n[0]).filter((char:string)=>char&&char.match(/[a-zA-Z]/)).join("").toUpperCase()||"S";


  return (<div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto"><div className="flex flex-col sm:flex-row mb-8 items-center sm:items-start"><div className="mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0"><div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-5xl font-semibold">{initials}</div></div><div className="text-center sm:text-left flex-grow"><h1 className="text-3xl font-bold text-gray-800">{displayName}</h1><p className="text-gray-600 mb-4">{displayUsername}</p><div className="space-y-2"><div className="flex items-center justify-center sm:justify-start text-gray-700"><Mail className="mr-2 text-blue-600" size={20} /><span>{displayEmail}</span></div><div className="flex items-center justify-center sm:justify-start text-gray-700"><Phone className="mr-2 text-blue-600" size={20} /><span>{displayPhone}</span></div></div></div></div><hr className="border-gray-200 mb-6" /><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6"><InfoItem icon={<Calendar size={20} className="text-blue-600" />} label={`Born: ${displayDob}`} /><InfoItem icon={<Building size={20} className="text-blue-600" />} label={`City: ${displayCity}`} /><InfoItem icon={<Users size={20} className="text-blue-600" />} label={`Gender: ${displayGender}`} /><InfoItem icon={<Eye size={20} className="text-blue-600" />} label={`Address: ${displayAddress}`} /></div><hr className="border-gray-200 mb-6" /><div className="mb-6"><h2 className="font-semibold text-xl text-gray-800 mb-3">About Me</h2><div className="bg-gray-50 rounded-lg p-4 min-h-[8rem]"><p className="text-gray-700 whitespace-pre-wrap">{displayBio}</p></div></div><div className="flex justify-end space-x-4"><button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm">Edit Profile</button></div></div>);
};


// --- STUDENT DASHBOARD (RESULTS) SPECIFIC COMPONENTS ---
// ... (Keep SemesterResultCard, ResultsContent as they were in your original StudentPage.tsx)
interface SemesterResultCardProps { examName: string; university: string; lastUpdated: string; subjectCount: number; }
const SemesterResultCard: React.FC<SemesterResultCardProps> = ({ examName, university, lastUpdated, subjectCount }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="mb-4"><h2 className="text-xl font-bold text-gray-800">{examName}</h2><p className="text-gray-600 text-sm">{university}</p></div>
    <div className="mb-3 text-sm text-gray-700 flex items-center"><FileText size={16} className="mr-2 text-indigo-600" /><span>{subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}</span></div>
    <div className="flex items-center justify-between text-gray-500 text-sm"><span>Last update: {lastUpdated}</span><div className="w-6 h-6 flex items-center justify-center space-x-0.5 cursor-pointer"><div className="w-1 h-1 bg-gray-500 rounded-full"></div><div className="w-1 h-1 bg-gray-500 rounded-full"></div><div className="w-1 h-1 bg-gray-500 rounded-full"></div></div></div>
  </div>
);
interface GroupedResult { examName: string; university: string; lastUpdated: string; subjectCount: number;}
interface ResultsContentProps { results: (DocumentData & { id: string })[]; loading: boolean; studentProfile: DocumentData | null;}
const ResultsContent: React.FC<ResultsContentProps> = ({ results, loading, studentProfile }) => {
  if (loading) return <div className="text-center p-10 text-gray-700">Loading results...</div>;
  if (!results || results.length === 0) return <div className="text-center p-10 text-gray-600">No results found.</div>;
  const processResults = (inputResults: (DocumentData & { id: string })[],profile: DocumentData | null): GroupedResult[] => {
    const groupedByExamName: { [examName: string]: { subjects: Array<any>; latestTimestamp: Timestamp | null; }} = {};
    const university = profile?.institutionName || "Manipur Technical University";
    inputResults.forEach(result => {
      const examName = result.examName || "Unnamed Exam";
      if (!groupedByExamName[examName]) groupedByExamName[examName] = { subjects: [], latestTimestamp: null,};
      groupedByExamName[examName].subjects.push({ subjectName: result.subjectName, marks: result.marks, subjectCode: result.subjectCode,});
      const currentTimestamp = result.timestamp as Timestamp;
      if (currentTimestamp) if (!groupedByExamName[examName].latestTimestamp || currentTimestamp.toMillis() > (groupedByExamName[examName].latestTimestamp as Timestamp).toMillis()) groupedByExamName[examName].latestTimestamp = currentTimestamp;
    });
    return Object.keys(groupedByExamName).map(examName => {
      const group = groupedByExamName[examName];
      const lastUpdatedDate = group.latestTimestamp ? new Date(group.latestTimestamp.seconds * 1000) : null;
      return { examName: examName, university: university, lastUpdated: lastUpdatedDate ? lastUpdatedDate.toLocaleDateString() : "N/A", subjectCount: group.subjects.length,};
    }).sort((a, b) => a.examName.localeCompare(b.examName));
  };
  const groupedSemesterResults = processResults(results, studentProfile);
  if (groupedSemesterResults.length === 0 && !loading) return <div className="text-center p-10 text-gray-600">No results available.</div>;
  return (<><h1 className="text-3xl font-bold text-gray-800 mb-8">Marksheets / Exam Results</h1><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{groupedSemesterResults.map((item, index) => (<SemesterResultCard key={index} examName={item.examName} university={item.university} lastUpdated={item.lastUpdated} subjectCount={item.subjectCount} />))}</div></>);
};


// --- LESSONS DASHBOARD SPECIFIC COMPONENTS (Unchanged from original) ---
// ... (Keep LessonCourseCard, LessonsContent)
interface LessonCourseCardProps { title: string; progress: number; duration: string; students: string; type: string; assignment: boolean; }
const LessonCourseCard: React.FC<LessonCourseCardProps> = ({ title, progress, duration, students, type, assignment }) => ( /* ... existing code ... */ <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"><div className="flex mb-4 items-center"><div className="w-16 h-16 mr-4 relative"><svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" strokeWidth="3.5" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeDasharray={`${progress}, 100`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-indigo-700">{progress}%</div></div><div><h3 className="font-bold text-lg text-gray-800">{title}</h3></div></div><div className="flex items-center mb-3 text-sm"><div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center mr-3"><span>{type}</span></div><div className="flex items-center text-gray-600"><Clock size={16} className="mr-1" /><span>{duration}</span></div></div><div className="flex items-center justify-between text-sm text-gray-600">{assignment && (<div className="flex items-center"><LessonFileText size={16} className="mr-1 text-green-600" /><span>Assignment</span></div>)}<div className="flex items-center"><Users size={16} className="mr-1" /><span>{students}</span></div></div></div>);
const LessonsContent = () => { const courses = [ { title: 'Data Structures & Algorithms', progress: 80, duration: '30 min', students: '100 students', type: 'Lesson', assignment: true }, { title: 'Computer Network', progress: 100, duration: '60 min', students: '102 students', type: 'Lesson', assignment: true }, { title: 'Computer Graphics', progress: 50, duration: '50 min', students: '120 students', type: 'Lesson', assignment: false }, { title: 'Operating System', progress: 60, duration: '20 min', students: '130 students', type: 'Lesson', assignment: true } ]; return (<><div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg"><h1 className="text-3xl font-bold mb-2">Hello, Kurosaki <span className="text-yellow-300">👋</span></h1><p className="text-indigo-100">Nice to have you back. Get ready and continue your lessons today.</p></div><div className="mb-10"><div className="bg-white p-6 rounded-lg shadow-lg"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">Learning Activity</h2><div className="flex items-center text-sm text-gray-600"><div className="flex items-center mr-4"><span className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-1.5"></span><span>Minutes</span></div><div className="flex items-center mr-4"><span className="w-2.5 h-2.5 bg-pink-500 rounded-full mr-1.5"></span><span>Exams</span></div><div className="text-gray-500">🗓️ Last Semester</div></div></div><div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><p>Learning Activity Chart Placeholder</p></div></div></div><h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Courses</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{courses.map((course, index) => (<LessonCourseCard key={index} title={course.title} progress={course.progress} duration={course.duration} students={course.students} type={course.type} assignment={course.assignment} />))}</div></>);};

// --- MATERIALS DASHBOARD SPECIFIC COMPONENTS (Unchanged from original) ---
// ... (Keep MaterialCourseCard, MaterialsContent)
interface MaterialCourseCardProps { title: string; files: number; edited: string; }
const MaterialCourseCard: React.FC<MaterialCourseCardProps> = ({ title, files, edited }) => { return ( <div className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 relative transition-shadow"><button className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"><MoreVertical size={18} /></button><h3 className="font-semibold text-gray-800 mb-3 pr-8">{title}</h3> <div className="flex items-center mb-2 text-sm text-gray-600"><FileText size={16} className="mr-2 text-indigo-600" /> <span>{files} files</span></div><div className="text-xs text-gray-500">{edited}</div></div>);};
const MaterialsContent = () => { const [activeFilterTab, setActiveFilterTab] = useState('Wiki'); const filterTabs = ['Folder', 'Page', 'PDF', 'Words', 'PPT', 'Wiki']; const materialsData = [ { title: 'Data Structures & Algorithms', files: 12, edited: 'Edited 2 hours ago' }, { title: 'Computer Organisation', files: 32, edited: 'Edited 1 day ago' }, { title: 'Artificial Intelligence', files: 32, edited: 'Edited 1 hours ago' }, { title: 'Computer Network', files: 22, edited: 'Edited 1 hours ago' }, { title: 'Computer Graphics', files: 20, edited: 'Edited 30 min ago' }, { title: 'Digital Processing Unit', files: 8, edited: 'Edited 4 hours ago' }, { title: 'Operating System', files: 10, edited: 'Edited 3 hours ago' }, { title: 'Data Science', files: 25, edited: 'Edited 2 hours ago' }, { title: 'Theory of Computation', files: 20, edited: 'Edited 5 hours ago' } ]; const filteredMaterials = materialsData;  return ( <><div className="mb-6"><div className="flex border-b border-gray-300">{filterTabs.map(tab => (<button key={tab} className={`py-2.5 px-5 text-sm font-medium focus:outline-none ${activeFilterTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-400'}`} onClick={() => setActiveFilterTab(tab)}>{tab}</button>))}</div></div><div className="mb-6 flex justify-between items-center"><div className="flex items-center space-x-3"><button className="flex items-center gap-1.5 bg-white py-2 px-4 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm text-gray-700"><Filter size={16} /><span>Add Filter</span></button><button className="flex items-center gap-1.5 bg-white py-2 px-4 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm text-gray-700"><Upload size={16} /><span>Upload</span></button><button className="bg-white p-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700"><Share size={16} /></button></div><div className="text-sm text-gray-600">{filteredMaterials.length} contents</div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{filteredMaterials.map((card, index) => ( <MaterialCourseCard key={index} title={card.title} files={card.files} edited={card.edited} />))}</div></>);};

// --- ASSESSMENTS SPECIFIC COMPONENTS (Unchanged from original) ---
// ... (Keep SummaryCard, AssessmentCard, AssessmentsContent)
interface SummaryCardProps { title: string; count: number | string; icon: ReactNode; color: string; }
const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, icon, color }) => { return ( <div className={`${color} rounded-lg p-4 flex items-center justify-between shadow-sm`}><div><h3 className="text-gray-600 text-sm font-medium">{title}</h3><p className="text-2xl font-bold mt-1">{count}</p></div><div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">{icon}</div></div>);};
interface Assessment { title: string; course: string; date: string; time: string; duration: string; status: 'upcoming' | 'completed' | 'missed'; urgency?: 'high' | 'medium' | 'low'; weight?: string; score?: string; grade?: string; penalty?: string; }
interface AssessmentCardProps { assessment: Assessment; }
const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => { let statusIndicator: ReactNode; let statusDetails: ReactNode; if (assessment.status === 'upcoming') { let urgencyColor = 'bg-yellow-100 text-yellow-800'; if (assessment.urgency === 'high') urgencyColor = 'bg-red-100 text-red-800'; if (assessment.urgency === 'low') urgencyColor = 'bg-green-100 text-green-800'; statusIndicator = (<div className={`${urgencyColor} text-xs px-2 py-1 rounded-full font-medium flex items-center`}><AlertCircle size={12} className="mr-1" />{assessment.urgency === 'high' ? 'Urgent' : assessment.urgency === 'medium' ? 'Approaching' : 'Upcoming'}</div>); statusDetails = (<div className="mt-2 text-sm text-gray-600"><span className="font-medium">Weight: </span>{assessment.weight}</div>); } else if (assessment.status === 'completed') { statusIndicator = (<div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center"><Check size={12} className="mr-1" />Completed</div>); statusDetails = (<div className="mt-2 text-sm text-gray-600"><span className="font-medium">Score: </span>{assessment.score} ({assessment.grade})</div>); } else if (assessment.status === 'missed') { statusIndicator = (<div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium flex items-center"><X size={12} className="mr-1" />Missed</div>); statusDetails = (<div className="mt-2 text-sm text-red-600">{assessment.penalty}</div>); } return ( <div className="bg-white rounded-lg shadow-sm p-4 relative"><div className="flex justify-between items-start pr-10"><div><h3 className="font-medium text-lg">{assessment.title}</h3><p className="text-sm text-gray-600 mt-1">{assessment.course}</p></div>{statusIndicator}</div><div className="mt-4 flex items-center flex-wrap"><div className="flex items-center text-sm text-gray-600 mr-4 mb-1 sm:mb-0"><Calendar size={16} className="mr-1" />{assessment.date}</div><div className="flex items-center text-sm text-gray-600 mb-1 sm:mb-0"><Clock size={16} className="mr-1" />{assessment.time} ({assessment.duration})</div></div>{statusDetails}<button className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"><MoreVertical size={16} /></button></div>);};
const AssessmentsContent: React.FC = () => { const [activeTab, setActiveTab] = useState('Upcoming'); const assessmentTabs = ['Upcoming', 'Completed', 'Missed', 'All']; const assessments: Assessment[] = [ { title: 'Data Structures Midterm', course: 'Data Structures & Algorithms', date: 'May 20, 2025', time: '10:00 AM - 12:00 PM', duration: '2 hours', status: 'upcoming', urgency: 'high', weight: '30%' }, { title: 'Operating Systems Quiz 3', course: 'Operating System', date: 'May 22, 2025', time: '2:00 PM - 3:00 PM', duration: '1 hour', status: 'upcoming', urgency: 'medium', weight: '15%' }, { title: 'Computer Graphics Project', course: 'Computer Graphics', date: 'May 25, 2025', time: '11:59 PM', duration: 'Submission', status: 'upcoming', urgency: 'low', weight: '25%' }, { title: 'AI Programming Lab', course: 'Artificial Intelligence', date: 'May 18, 2025', time: '3:00 PM - 5:00 PM', duration: '2 hours', status: 'completed', score: '92/100', grade: 'A' }, { title: 'Computer Networks Quiz', course: 'Computer Network', date: 'May 12, 2025', time: '9:00 AM - 10:00 AM', duration: '1 hour', status: 'completed', score: '78/100', grade: 'B' }, { title: 'Data Science Assignment 2', course: 'Data Science', date: 'May 10, 2025', time: '11:59 PM', duration: 'Submission', status: 'missed', penalty: 'Late submission: -10%' } ]; const filteredAssessments = assessments.filter(assessment => { if (activeTab === 'All') return true; if (activeTab === 'Upcoming') return assessment.status === 'upcoming'; if (activeTab === 'Completed') return assessment.status === 'completed'; if (activeTab === 'Missed') return assessment.status === 'missed'; return true; }); return (<><div className="pb-4"><h1 className="text-2xl font-bold text-gray-800">Assessments</h1><p className="text-gray-600">Track your upcoming and past assessments</p></div><div className="mb-4"><div className="flex border-b border-gray-300">{assessmentTabs.map(tab => (<button key={tab} className={`py-2 px-4 text-sm sm:text-base focus:outline-none ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab(tab)}>{tab}</button>))}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4"><SummaryCard title="Upcoming" count={assessments.filter(a => a.status === 'upcoming').length} icon={<Calendar size={20} className="text-blue-500" />} color="bg-blue-50" /><SummaryCard title="Completed" count={assessments.filter(a => a.status === 'completed').length} icon={<Check size={20} className="text-green-500" />} color="bg-green-50" /><SummaryCard title="Missed" count={assessments.filter(a => a.status === 'missed').length} icon={<X size={20} className="text-red-500" />} color="bg-red-50" /><SummaryCard title="Overall Grade" count="B+" icon={<BarChart2 size={20} className="text-purple-500" />} color="bg-purple-50" /></div><div className="space-y-4">{filteredAssessments.length > 0 ? (filteredAssessments.map((assessment, index) => (<AssessmentCard key={index} assessment={assessment} />))) : (<div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">No assessments in this category.</div>)}</div></>);};


type ActiveView = 'dashboard_profile' | 'lessons' | 'materials' | 'dashboard_results' | 'assessments'; // Renamed for clarity

const StudentDashboardPage = () => {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') as ActiveView | null;
  const [activeView, setActiveView] = useState<ActiveView>(initialView || 'lessons'); // Default to lessons or based on query

  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<DocumentData | null>(null);
  const [resultsData, setResultsData] = useState<(DocumentData & { id: string })[]>([]);
  
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [loadingResults, setLoadingResults] = useState<boolean>(true);

  useEffect(() => {
    const viewFromQuery = searchParams.get('view') as ActiveView | null;
    if (viewFromQuery && viewFromQuery !== activeView) {
      setActiveView(viewFromQuery);
    }
  }, [searchParams, activeView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        setCurrentUserUid(null); // Handled by layout redirect
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserUid) {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
          const profile = await getUserProfile(currentUserUid);
          setProfileData(profile);
        } catch (error) { console.error("Error fetching dashboard profile:", error); }
        finally { setLoadingProfile(false); }
      };
      const fetchResults = async () => {
        setLoadingResults(true);
        try {
          const results = await getStudentResults(currentUserUid);
          setResultsData(results);
        } catch (error) { console.error("Error fetching dashboard results:", error); }
        finally { setLoadingResults(false); }
      };
      
      if (activeView === 'dashboard_profile' || activeView === 'dashboard_results' || !profileData) fetchProfile();
      if (activeView === 'dashboard_results' || resultsData.length === 0) fetchResults();

    }
  }, [currentUserUid, activeView, profileData, resultsData.length]);


  const renderContent = () => {
    // The nav items in StudentLayout handle navigation.
    // This component now focuses on rendering content based on `activeView` for *this specific page* (the main dashboard).
    // Other pages (/student/profile, /student/results, etc.) will have their own content.
    // The `activeView` here is mainly for the dashboard tabs (materials, assessments) if those are query-param driven.
    
    // Default to lessons if no specific view is matched from query for this page
    let contentToRender: ReactNode = <LessonsContent />;

    if (activeView === 'dashboard_profile') { // This would be if you had a profile tab on the main dashboard
        contentToRender = <ProfileContent profile={profileData} loading={loadingProfile} />;
    } else if (activeView === 'materials') {
        contentToRender = <MaterialsContent />;
    } else if (activeView === 'dashboard_results') { // This for a results tab on the main dashboard
        contentToRender = <ResultsContent results={resultsData} loading={loadingResults} studentProfile={profileData} />;
    } else if (activeView === 'assessments') {
        contentToRender = <AssessmentsContent />;
    } else { // Default to lessons
        contentToRender = <LessonsContent />;
    }
    return contentToRender;
  };

  return (
    <StudentLayout>
      {/* 
        The activeView logic here is a bit complex because it's for the *dashboard page* itself,
        which can show different content sections based on query parameters.
        The NavItems in StudentLayout handle direct page navigations.
        If the Profile and Results tabs on the dashboard are meant to show the same content as
        /student/profile and /student/result, you might simplify this or make those NavItems
        point to those pages directly instead of using query params.

        For simplicity, I'm making this dashboard primarily show Lessons, Materials, Assessments.
        The dedicated Profile and Results pages will handle their content.
      */}
      {renderContent()}
    </StudentLayout>
  );
};

export default StudentDashboardPage;