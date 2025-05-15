"use client";

import React, { useState, ReactNode } from 'react';
import {
  Search, Mail, Phone, Calendar, Building, Users, Eye, Clock,
  FileText as LessonFileText, // Renamed for clarity if needed, or use FileText directly
  MoreVertical, Filter, Upload, Share, FileText,
  // --- Icons added for Assessments ---
  BarChart2, AlertCircle, Check, X
} from 'lucide-react';

// --- SHARED INTERFACES & COMPONENTS ---

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  const getIconElement = () => {
    const iconBaseClasses = "w-6 h-6 flex items-center justify-center";
    const activeIconContainerClasses = "bg-blue-900";
    const inactiveIconContainerClasses = "bg-white";
    const activeIconElementClasses = "bg-white";
    const inactiveIconElementClasses = "bg-blue-900";
    const activeBorderClasses = "border-blue-900";
    const inactiveBorderClasses = "border-white";

    switch (icon) {
      case 'user':
        return (
          <div className={`${iconBaseClasses} rounded-full ${active ? activeIconContainerClasses : inactiveIconContainerClasses}`}>
            <div className={`w-4 h-4 rounded-full ${active ? activeIconElementClasses : inactiveIconElementClasses}`}></div>
          </div>
        );
      case 'book':
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} flex items-center`}>
              <div className={`h-2 border-r-2 ${active ? activeBorderClasses : inactiveBorderClasses} mx-1`}></div>
            </div>
          </div>
        );
      case 'briefcase': // For Materials
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} rounded-sm`}></div>
          </div>
        );
      case 'chart':
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} rounded-sm flex items-end justify-between px-0.5`}>
              <div className={`w-1 h-2 ${active ? activeIconElementClasses : activeIconElementClasses }`}></div>
              <div className={`w-1 h-3 ${active ? activeIconElementClasses : activeIconElementClasses}`}></div>
            </div>
          </div>
        );
      case 'clipboard': // For Assessments
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} flex flex-col justify-center items-center`}>
              <div className={`w-3 h-0.5 ${active ? activeIconElementClasses : activeIconElementClasses} mb-0.5`}></div>
              <div className={`w-3 h-0.5 ${active ? activeIconElementClasses : activeIconElementClasses}`}></div>
            </div>
          </div>
        );
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded-sm" />; // Fallback
    }
  };

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out
                  ${active
                    ? 'bg-white text-blue-900 font-semibold shadow-md'
                    : 'text-white hover:bg-blue-800 hover:bg-opacity-50'
                  }`}
      onClick={onClick}
    >
      {getIconElement()}
      <span className="text-md">{label}</span>
    </div>
  );
};

const LogoutButton = () => {
  return (
    <div className="flex items-center space-x-2 text-white cursor-pointer hover:bg-blue-800 hover:bg-opacity-50 p-3 rounded-lg transition-colors duration-150 ease-in-out">
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white rounded flex items-center justify-center">
          <div className="w-2 h-2 border-t-2 border-r-2 border-white transform rotate-45"></div>
        </div>
      </div>
      <span className="text-md">Log out</span>
    </div>
  );
};

// --- STUDENT DASHBOARD (RESULTS) SPECIFIC COMPONENTS ---
interface SemesterResultCardProps { semester: string; university: string; edited: string; }
const SemesterResultCard: React.FC<SemesterResultCardProps> = ({ semester, university, edited }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="mb-8"><h2 className="text-xl font-bold text-gray-800">{semester} Semester Result</h2><p className="text-gray-600">{university}</p></div>
    <div className="flex items-center justify-between text-gray-500 text-sm"><span>{edited}</span><div className="w-6 h-6 flex items-center justify-center space-x-0.5 cursor-pointer"><div className="w-1 h-1 bg-gray-500 rounded-full"></div><div className="w-1 h-1 bg-gray-500 rounded-full"></div><div className="w-1 h-1 bg-gray-500 rounded-full"></div></div></div>
  </div>
);
const ResultsContent = () => {
  const semesterResults = [ { semester: '1st', university: 'Manipur Technical University', edited: 'Edited 4 years ago' }, { semester: '2nd', university: 'Manipur Technical University', edited: 'Edited 4 years ago' }, { semester: '3rd', university: 'Manipur Technical University', edited: 'Edited 3 years ago' }, { semester: '4th', university: 'Manipur Technical University', edited: 'Edited 3 years ago' }, { semester: '5th', university: 'Manipur Technical University', edited: 'Edited 2 years ago' }, { semester: '6th', university: 'Manipur Technical University', edited: 'Edited 2 years ago' }, { semester: '7th', university: 'Manipur Technical University', edited: 'Edited 1 year ago' }, { semester: '8th', university: 'Manipur Technical University', edited: 'Edited 1 year ago' } ];
  return (<><h1 className="text-3xl font-bold text-gray-800 mb-8">Marksheets</h1><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{semesterResults.map((item, index) => (<SemesterResultCard key={index} semester={item.semester} university={item.university} edited={item.edited} />))}</div></>);
};

// --- STUDENT PROFILE SPECIFIC COMPONENTS ---
interface InfoItemProps { icon: ReactNode; label: string; }
const InfoItem: React.FC<InfoItemProps> = ({ icon, label }) => (<div className="flex items-center p-2 rounded-md"><div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-700 mr-3">{icon}</div><span className="text-gray-700 text-sm">{label}</span></div>);
const ProfileContent = () => {
  const profileData = { name: "Kurosaki Ichigo", username: "@kuro", email: "kurosaki@gmail.com", phone: "91+123**678**", dob: "28 October 2000", city: "Imphal City", gender: "Male", address: "Sagolband Sayang", bio: "A substitute Soul Reaper dedicated to protecting the innocent." };
  return (<div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto"><div className="flex flex-col sm:flex-row mb-8 items-center sm:items-start"><div className="mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0"><div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-5xl font-semibold">{profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}</div></div><div className="text-center sm:text-left flex-grow"><h1 className="text-3xl font-bold text-gray-800">{profileData.name}</h1><p className="text-gray-600 mb-4">{profileData.username}</p><div className="space-y-2"><div className="flex items-center justify-center sm:justify-start text-gray-700"><Mail className="mr-2 text-blue-600" size={20} /><span>{profileData.email}</span></div><div className="flex items-center justify-center sm:justify-start text-gray-700"><Phone className="mr-2 text-blue-600" size={20} /><span>{profileData.phone}</span></div></div></div></div><hr className="border-gray-200 mb-6" /><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6"><InfoItem icon={<Calendar size={20} className="text-blue-600" />} label={`Born: ${profileData.dob}`} /><InfoItem icon={<Building size={20} className="text-blue-600" />} label={`City: ${profileData.city}`} /><InfoItem icon={<Users size={20} className="text-blue-600" />} label={`Gender: ${profileData.gender}`} /><InfoItem icon={<Eye size={20} className="text-blue-600" />} label={`Address: ${profileData.address}`} /></div><hr className="border-gray-200 mb-6" /><div className="mb-6"><h2 className="font-semibold text-xl text-gray-800 mb-3">About Me</h2><div className="bg-gray-50 rounded-lg p-4 min-h-[8rem]"><p className="text-gray-700 whitespace-pre-wrap">{profileData.bio || "No bio available."}</p></div></div><div className="flex justify-end space-x-4"><button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm">Edit Profile</button></div></div>);
};

// --- LESSONS DASHBOARD SPECIFIC COMPONENTS ---
interface LessonCourseCardProps { title: string; progress: number; duration: string; students: string; type: string; assignment: boolean; }
const LessonCourseCard: React.FC<LessonCourseCardProps> = ({ title, progress, duration, students, type, assignment }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex mb-4 items-center"><div className="w-16 h-16 mr-4 relative"><svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" strokeWidth="3.5" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeDasharray={`${progress}, 100`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-indigo-700">{progress}%</div></div><div><h3 className="font-bold text-lg text-gray-800">{title}</h3></div></div>
    <div className="flex items-center mb-3 text-sm"><div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center mr-3"><span>{type}</span></div><div className="flex items-center text-gray-600"><Clock size={16} className="mr-1" /><span>{duration}</span></div></div>
    <div className="flex items-center justify-between text-sm text-gray-600">{assignment && (<div className="flex items-center"><LessonFileText size={16} className="mr-1 text-green-600" /><span>Assignment</span></div>)}<div className="flex items-center"><Users size={16} className="mr-1" /><span>{students}</span></div></div>
  </div>
);
const LessonsContent = () => {
  const courses = [ { title: 'Data Structures & Algorithms', progress: 80, duration: '30 min', students: '100 students', type: 'Lesson', assignment: true }, { title: 'Computer Network', progress: 100, duration: '60 min', students: '102 students', type: 'Lesson', assignment: true }, { title: 'Computer Graphics', progress: 50, duration: '50 min', students: '120 students', type: 'Lesson', assignment: false }, { title: 'Operating System', progress: 60, duration: '20 min', students: '130 students', type: 'Lesson', assignment: true } ];
  return (<><div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg"><h1 className="text-3xl font-bold mb-2">Hello, Kurosaki <span className="text-yellow-300">👋</span></h1><p className="text-indigo-100">Nice to have you back. Get ready and continue your lessons today.</p></div><div className="mb-10"><div className="bg-white p-6 rounded-lg shadow-lg"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">Learning Activity</h2><div className="flex items-center text-sm text-gray-600"><div className="flex items-center mr-4"><span className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-1.5"></span><span>Minutes</span></div><div className="flex items-center mr-4"><span className="w-2.5 h-2.5 bg-pink-500 rounded-full mr-1.5"></span><span>Exams</span></div><div className="text-gray-500">🗓️ Last Semester</div></div></div><div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><p>Learning Activity Chart Placeholder</p></div></div></div><h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Courses</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{courses.map((course, index) => (<LessonCourseCard key={index} title={course.title} progress={course.progress} duration={course.duration} students={course.students} type={course.type} assignment={course.assignment} />))}</div></>);
};

// --- MATERIALS DASHBOARD SPECIFIC COMPONENTS ---
interface MaterialCourseCardProps { title: string; files: number; edited: string; }
const MaterialCourseCard: React.FC<MaterialCourseCardProps> = ({ title, files, edited }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 relative transition-shadow">
      <button className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700">
        <MoreVertical size={18} />
      </button>
      <h3 className="font-semibold text-gray-800 mb-3 pr-8">{title}</h3> {/* pr-8 to avoid overlap with button */}
      <div className="flex items-center mb-2 text-sm text-gray-600">
        <FileText size={16} className="mr-2 text-indigo-600" /> {/* Using the general FileText icon */}
        <span>{files} files</span>
      </div>
      <div className="text-xs text-gray-500">
        {edited}
      </div>
    </div>
  );
};

const MaterialsContent = () => {
  const [activeFilterTab, setActiveFilterTab] = useState('Wiki');
  const filterTabs = ['Folder', 'Page', 'PDF', 'Words', 'PPT', 'Wiki'];
  const materialsData = [ { title: 'Data Structures & Algorithms', files: 12, edited: 'Edited 2 hours ago' }, { title: 'Computer Organisation', files: 32, edited: 'Edited 1 day ago' }, { title: 'Artificial Intelligence', files: 32, edited: 'Edited 1 hours ago' }, { title: 'Computer Network', files: 22, edited: 'Edited 1 hours ago' }, { title: 'Computer Graphics', files: 20, edited: 'Edited 30 min ago' }, { title: 'Digital Processing Unit', files: 8, edited: 'Edited 4 hours ago' }, { title: 'Operating System', files: 10, edited: 'Edited 3 hours ago' }, { title: 'Data Science', files: 25, edited: 'Edited 2 hours ago' }, { title: 'Theory of Computation', files: 20, edited: 'Edited 5 hours ago' } ];
  const filteredMaterials = materialsData; // Placeholder for actual filtering

  return (
    <>
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          {filterTabs.map(tab => (
            <button
              key={tab}
              className={`py-2.5 px-5 text-sm font-medium focus:outline-none
                          ${activeFilterTab === tab 
                            ? 'border-b-2 border-indigo-600 text-indigo-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-400'}`}
              onClick={() => setActiveFilterTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-1.5 bg-white py-2 px-4 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm text-gray-700">
            <Filter size={16} /><span>Add Filter</span>
          </button>
          <button className="flex items-center gap-1.5 bg-white py-2 px-4 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm text-gray-700">
            <Upload size={16} /><span>Upload</span>
          </button>
          <button className="bg-white p-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700">
            <Share size={16} />
          </button>
        </div>
        <div className="text-sm text-gray-600">{filteredMaterials.length} contents</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMaterials.map((card, index) => (
          <MaterialCourseCard key={index} title={card.title} files={card.files} edited={card.edited} />
        ))}
      </div>
    </>
  );
};

// --- ASSESSMENTS SPECIFIC COMPONENTS (NEWLY ADDED) ---
interface SummaryCardProps {
  title: string;
  count: number | string;
  icon: ReactNode;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, icon, color }) => {
  return (
    <div className={`${color} rounded-lg p-4 flex items-center justify-between shadow-sm`}>
      <div>
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{count}</p>
      </div>
      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
    </div>
  );
}

interface Assessment {
  title: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'missed';
  urgency?: 'high' | 'medium' | 'low'; // Only for upcoming
  weight?: string; // Only for upcoming
  score?: string; // Only for completed
  grade?: string; // Only for completed
  penalty?: string; // Only for missed
}

interface AssessmentCardProps {
  assessment: Assessment;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  let statusIndicator: ReactNode;
  let statusDetails: ReactNode;
  
  if (assessment.status === 'upcoming') {
    let urgencyColor = 'bg-yellow-100 text-yellow-800';
    if (assessment.urgency === 'high') urgencyColor = 'bg-red-100 text-red-800';
    if (assessment.urgency === 'low') urgencyColor = 'bg-green-100 text-green-800';
    
    statusIndicator = (
      <div className={`${urgencyColor} text-xs px-2 py-1 rounded-full font-medium flex items-center`}>
        <AlertCircle size={12} className="mr-1" />
        {assessment.urgency === 'high' ? 'Urgent' : 
          assessment.urgency === 'medium' ? 'Approaching' : 'Upcoming'}
      </div>
    );
    
    statusDetails = (
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-medium">Weight: </span>{assessment.weight}
      </div>
    );
  } else if (assessment.status === 'completed') {
    statusIndicator = (
      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
        <Check size={12} className="mr-1" />
        Completed
      </div>
    );
    
    statusDetails = (
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-medium">Score: </span>{assessment.score} ({assessment.grade})
      </div>
    );
  } else if (assessment.status === 'missed') {
    statusIndicator = (
      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
        <X size={12} className="mr-1" />
        Missed
      </div>
    );
    
    statusDetails = (
      <div className="mt-2 text-sm text-red-600">
        {assessment.penalty}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative">
      {/* MODIFIED LINE: Added pr-10 to this div for spacing */}
      <div className="flex justify-between items-start pr-10"> 
        <div>
          <h3 className="font-medium text-lg">{assessment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{assessment.course}</p>
        </div>
        {statusIndicator}
      </div>
      
      <div className="mt-4 flex items-center flex-wrap"> {/* Added flex-wrap for responsiveness */}
        <div className="flex items-center text-sm text-gray-600 mr-4 mb-1 sm:mb-0"> {/* Added mb for small screens */}
          <Calendar size={16} className="mr-1" />
          {assessment.date}
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-1 sm:mb-0"> {/* Added mb for small screens */}
          <Clock size={16} className="mr-1" />
          {assessment.time} ({assessment.duration})
        </div>
      </div>
      
      {statusDetails}
      
      <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
        <MoreVertical size={16} />
      </button>
    </div>
  );
}

const AssessmentsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  const assessmentTabs = ['Upcoming', 'Completed', 'Missed', 'All'];
  
  const assessments: Assessment[] = [
    {
      title: 'Data Structures Midterm',
      course: 'Data Structures & Algorithms',
      date: 'May 20, 2025',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      status: 'upcoming',
      urgency: 'high',
      weight: '30%'
    },
    {
      title: 'Operating Systems Quiz 3',
      course: 'Operating System',
      date: 'May 22, 2025',
      time: '2:00 PM - 3:00 PM',
      duration: '1 hour',
      status: 'upcoming',
      urgency: 'medium',
      weight: '15%'
    },
    {
      title: 'Computer Graphics Project',
      course: 'Computer Graphics',
      date: 'May 25, 2025',
      time: '11:59 PM',
      duration: 'Submission',
      status: 'upcoming',
      urgency: 'low',
      weight: '25%'
    },
    {
      title: 'AI Programming Lab',
      course: 'Artificial Intelligence',
      date: 'May 18, 2025',
      time: '3:00 PM - 5:00 PM',
      duration: '2 hours',
      status: 'completed',
      score: '92/100',
      grade: 'A'
    },
    {
      title: 'Computer Networks Quiz',
      course: 'Computer Network',
      date: 'May 12, 2025',
      time: '9:00 AM - 10:00 AM',
      duration: '1 hour',
      status: 'completed',
      score: '78/100',
      grade: 'B'
    },
    {
      title: 'Data Science Assignment 2',
      course: 'Data Science',
      date: 'May 10, 2025',
      time: '11:59 PM',
      duration: 'Submission',
      status: 'missed',
      penalty: 'Late submission: -10%'
    }
  ];

  const filteredAssessments = assessments.filter(assessment => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return assessment.status === 'upcoming';
    if (activeTab === 'Completed') return assessment.status === 'completed';
    if (activeTab === 'Missed') return assessment.status === 'missed';
    return true; // Should not happen with current tabs
  });

  return (
    <>
      {/* Assessments Header */}
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
        <p className="text-gray-600">Track your upcoming and past assessments</p>
      </div>
      
      {/* Assessment Tabs */}
      <div className="mb-4">
        <div className="flex border-b border-gray-300">
          {assessmentTabs.map(tab => (
            <button
              key={tab}
              className={`py-2 px-4 text-sm sm:text-base focus:outline-none ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Assessments Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        <SummaryCard 
          title="Upcoming" 
          count={assessments.filter(a => a.status === 'upcoming').length} 
          icon={<Calendar size={20} className="text-blue-500" />}
          color="bg-blue-50"
        />
        <SummaryCard 
          title="Completed" 
          count={assessments.filter(a => a.status === 'completed').length} 
          icon={<Check size={20} className="text-green-500" />}
          color="bg-green-50"
        />
        <SummaryCard 
          title="Missed" 
          count={assessments.filter(a => a.status === 'missed').length} 
          icon={<X size={20} className="text-red-500" />}
          color="bg-red-50"
        />
        <SummaryCard 
          title="Overall Grade" // This is a placeholder value, actual calculation would be needed
          count="B+" 
          icon={<BarChart2 size={20} className="text-purple-500" />}
          color="bg-purple-50"
        />
      </div>
      
      {/* Assessments List */}
      <div className="space-y-4">
        {filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment, index) => (
              <AssessmentCard key={index} assessment={assessment} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              No assessments in this category.
            </div>
          )
        }
      </div>
    </>
  );
}


// --- MAIN PAGE COMPONENT (Orchestrator) ---
type ActiveView = 'profile' | 'results' | 'lessons' | 'materials' | 'assessments';

const StudentPage = () => {
  const [activeView, setActiveView] = useState<ActiveView>('assessments'); // Default to assessments for easy testing

  const renderContent = () => {
    switch (activeView) {
      case 'profile': return <ProfileContent />;
      case 'results': return <ResultsContent />;
      case 'lessons': return <LessonsContent />;
      case 'materials': return <MaterialsContent />;
      case 'assessments': return <AssessmentsContent />; // Added assessments view
      default: return <MaterialsContent />; // Fallback
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 sm:w-80 bg-blue-900 text-white flex flex-col flex-shrink-0"> {/* Adjusted width for responsiveness */}
        <div className="p-6 text-2xl font-bold border-b border-blue-800">Student Dashboard</div>
        <div className="flex-grow flex flex-col space-y-1.5 p-4">
          <NavItem icon="user" label="Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
          <NavItem icon="book" label="Lessons" active={activeView === 'lessons'} onClick={() => setActiveView('lessons')} />
          <NavItem icon="briefcase" label="Materials" active={activeView === 'materials'} onClick={() => setActiveView('materials')} />
          <NavItem icon="chart" label="Results" active={activeView === 'results'} onClick={() => setActiveView('results')} />
          <NavItem icon="clipboard" label="Assessments" active={activeView === 'assessments'} onClick={() => setActiveView('assessments')} />
        </div>
        <div className="p-4 mt-auto border-t border-blue-800">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto"> {/* Adjusted padding for responsiveness */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder={`Search in ${activeView}...`}
              className="w-full p-3 pl-5 pr-12 rounded-full bg-white text-gray-700 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex items-center space-x-3">
             <img src="/zenith-logo.svg" alt="Zenith Logo" className="h-8 sm:h-10 w-auto" /> {/* Adjusted logo size */}
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentPage;