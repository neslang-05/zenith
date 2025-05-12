"use client";

import React, { useState, ReactNode } from 'react';
import { Search, Mail, Phone, Calendar, Building, Users, Eye, Clock, FileText } from 'lucide-react'; // Added Clock, FileText

// --- SHARED INTERFACES & COMPONENTS ---

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  const getIcon = () => {
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
      case 'book': // For Lessons
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} flex items-center`}>
              <div className={`h-2 border-r-2 ${active ? activeBorderClasses : inactiveBorderClasses} mx-1`}></div>
            </div>
          </div>
        );
      case 'briefcase':
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} rounded-sm`}></div>
          </div>
        );
      case 'chart': // For Results
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} rounded-sm flex items-end justify-between px-0.5`}>
              <div className={`w-1 h-2 ${active ? activeIconElementClasses : activeIconElementClasses }`}></div>
              <div className={`w-1 h-3 ${active ? activeIconElementClasses : activeIconElementClasses}`}></div>
            </div>
          </div>
        );
      case 'clipboard':
        return (
          <div className={iconBaseClasses}>
            <div className={`w-5 h-4 border-2 ${active ? activeBorderClasses : inactiveBorderClasses} flex flex-col justify-center items-center`}>
              <div className={`w-3 h-0.5 ${active ? activeIconElementClasses : activeIconElementClasses} mb-0.5`}></div>
              <div className={`w-3 h-0.5 ${active ? activeIconElementClasses : activeIconElementClasses}`}></div>
            </div>
          </div>
        );
      default:
        return null;
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
      {getIcon()}
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

interface SemesterResultCardProps {
  semester: string;
  university: string;
  edited: string;
}

const SemesterResultCard: React.FC<SemesterResultCardProps> = ({ semester, university, edited }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">{semester} Semester Result</h2>
        <p className="text-gray-600">{university}</p>
      </div>
      <div className="flex items-center justify-between text-gray-500 text-sm">
        <span>{edited}</span>
        <div className="w-6 h-6 flex items-center justify-center space-x-0.5 cursor-pointer">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const ResultsContent = () => {
  const semesterResults = [
    { semester: '1st', university: 'Manipur Technical University', edited: 'Edited 4 years ago' },
    { semester: '2nd', university: 'Manipur Technical University', edited: 'Edited 4 years ago' },
    { semester: '3rd', university: 'Manipur Technical University', edited: 'Edited 3 years ago' },
    { semester: '4th', university: 'Manipur Technical University', edited: 'Edited 3 years ago' },
    { semester: '5th', university: 'Manipur Technical University', edited: 'Edited 2 years ago' },
    { semester: '6th', university: 'Manipur Technical University', edited: 'Edited 2 years ago' },
    { semester: '7th', university: 'Manipur Technical University', edited: 'Edited 1 year ago' },
    { semester: '8th', university: 'Manipur Technical University', edited: 'Edited 1 year ago' }
  ];
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Marksheets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterResults.map((item, index) => (
          <SemesterResultCard
            key={index}
            semester={item.semester}
            university={item.university}
            edited={item.edited}
          />
        ))}
      </div>
    </>
  );
};

// --- STUDENT PROFILE SPECIFIC COMPONENTS ---

interface InfoItemProps {
  icon: ReactNode;
  label: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label }) => {
  return (
    <div className="flex items-center p-2 rounded-md">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-700 mr-3">
        {icon}
      </div>
      <span className="text-gray-700 text-sm">{label}</span>
    </div>
  );
};

const ProfileContent = () => {
  const profileData = {
    name: "Kurosaki Ichigo",
    username: "@kuro",
    email: "kurosaki@gmail.com",
    phone: "91+123**678**",
    dob: "28 October 2000",
    city: "Imphal City",
    gender: "Male",
    address: "Sagolband Sayang",
    bio: "A substitute Soul Reaper dedicated to protecting the innocent."
  };
  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row mb-8 items-center sm:items-start">
        <div className="mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
          <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-5xl font-semibold">
            {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
        </div>
        <div className="text-center sm:text-left flex-grow">
          <h1 className="text-3xl font-bold text-gray-800">{profileData.name}</h1>
          <p className="text-gray-600 mb-4">{profileData.username}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start text-gray-700">
              <Mail className="mr-2 text-blue-600" size={20} />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start text-gray-700">
              <Phone className="mr-2 text-blue-600" size={20} />
              <span>{profileData.phone}</span>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
        <InfoItem icon={<Calendar size={20} className="text-blue-600" />} label={`Born: ${profileData.dob}`} />
        <InfoItem icon={<Building size={20} className="text-blue-600" />} label={`City: ${profileData.city}`} />
        <InfoItem icon={<Users size={20} className="text-blue-600" />} label={`Gender: ${profileData.gender}`} />
        <InfoItem icon={<Eye size={20} className="text-blue-600" />} label={`Address: ${profileData.address}`} />
      </div>
      <hr className="border-gray-200 mb-6" />
      <div className="mb-6">
        <h2 className="font-semibold text-xl text-gray-800 mb-3">About Me</h2>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[8rem]">
          <p className="text-gray-700 whitespace-pre-wrap">{profileData.bio || "No bio available."}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

// --- LESSONS DASHBOARD SPECIFIC COMPONENTS ---
interface CourseCardProps {
  title: string;
  progress: number;
  duration: string;
  students: string;
  type: string;
  assignment: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, progress, duration, students, type, assignment }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex mb-4 items-center">
        <div className="w-16 h-16 mr-4 relative">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e6e6e6" // Light grey for the background track
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4F46E5" // Indigo for progress
              strokeWidth="3.5"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-indigo-700">
            {progress}%
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        </div>
      </div>
      <div className="flex items-center mb-3 text-sm">
        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center mr-3">
          <span>{type}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock size={16} className="mr-1" />
          <span>{duration}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        {assignment && (
          <div className="flex items-center">
            <FileText size={16} className="mr-1 text-green-600" />
            <span>Assignment</span>
          </div>
        )}
        <div className="flex items-center">
          <Users size={16} className="mr-1" />
          <span>{students}</span>
        </div>
      </div>
    </div>
  );
};

const LessonsContent = () => {
  const courses = [
    { title: 'Data Structures & Algorithms', progress: 80, duration: '30 min', students: '100 students', type: 'Lesson', assignment: true },
    { title: 'Computer Network', progress: 100, duration: '60 min', students: '102 students', type: 'Lesson', assignment: true },
    { title: 'Computer Graphics', progress: 50, duration: '50 min', students: '120 students', type: 'Lesson', assignment: false },
    { title: 'Operating System', progress: 60, duration: '20 min', students: '130 students', type: 'Lesson', assignment: true }
  ];

  return (
    <>
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Hello, Kurosaki <span className="text-yellow-300">👋</span>
        </h1>
        <p className="text-indigo-100">
          Nice to have you back. What an exciting day!<br />
          Get ready and continue your lessons today.
        </p>
      </div>

      {/* Learning Activity Chart - Simplified Placeholder */}
      <div className="mb-10">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Learning Activity</h2>
            <div className="flex items-center text-sm text-gray-600">
              <div className="flex items-center mr-4">
                <span className="w-2.5 h-2.5 bg-purple-600 rounded-full mr-1.5"></span>
                <span>Minutes</span>
              </div>
              <div className="flex items-center mr-4">
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full mr-1.5"></span>
                <span>Exams</span>
              </div>
              <div className="text-gray-500">🗓️ Last Semester</div>
            </div>
          </div>
          <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            {/* Actual chart would go here - using a placeholder */}
            <p>Learning Activity Chart Placeholder</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            title={course.title}
            progress={course.progress}
            duration={course.duration}
            students={course.students}
            type={course.type}
            assignment={course.assignment}
          />
        ))}
      </div>
    </>
  );
};


// --- MAIN PAGE COMPONENT (Orchestrator) ---
type ActiveView = 'profile' | 'results' | 'lessons' | 'materials' | 'assessments';

const StudentPage = () => {
  const [activeView, setActiveView] = useState<ActiveView>('lessons'); // Default to lessons view

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileContent />;
      case 'results':
        return <ResultsContent />;
      case 'lessons':
        return <LessonsContent />;
      // Add cases for 'materials', 'assessments'
      default:
        return <LessonsContent />; // Fallback to lessons
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">Student Dashboard</div>
        <div className="flex-grow flex flex-col space-y-2 p-4">
          <NavItem
            icon="user"
            label="Profile"
            active={activeView === 'profile'}
            onClick={() => setActiveView('profile')}
          />
          <NavItem
            icon="book" // Assuming 'book' icon is for Lessons
            label="Lessons"
            active={activeView === 'lessons'}
            onClick={() => setActiveView('lessons')}
          />
          <NavItem
            icon="briefcase"
            label="Materials"
            active={activeView === 'materials'}
            onClick={() => setActiveView('materials')}
          />
          <NavItem
            icon="chart"
            label="Results"
            active={activeView === 'results'}
            onClick={() => setActiveView('results')}
          />
          <NavItem
            icon="clipboard"
            label="Assessments"
            active={activeView === 'assessments'}
            onClick={() => setActiveView('assessments')}
          />
        </div>
        <div className="p-4 mt-auto border-t border-blue-800">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder={`Search in ${activeView}...`}
              className="w-full p-3 pl-5 pr-12 rounded-full bg-white text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="text-indigo-900 text-4xl font-bold">Zenith</div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentPage;