"use client";

import React, { useState, useEffect, useRef } from 'react';
import StudentLayout from '../StudentLayout';
import { FileText, Download, Filter, Search, ChevronDown, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { auth, getUserProfile, getStudentResults, StudentResult } from '@/lib/firebase';
import { DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Result extends StudentResult {
  totalMarks: number | null;
  semester: number;
  academicYear: string;
  status: 'pending' | 'published';
  lastUpdated: string;
}

interface SemesterGroup {
  semester: number;
  academicYear: string;
  results: Result[];
}

// --- Dummy Data (Temporary) ---
// const dummyResults: Result[] = [ ... ];
// --- End Dummy Data ---


const ResultsTable: React.FC<{ results: Result[] }> = ({ results }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Internal (20)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mid-Term (30)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End-Term (50)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total (100)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => (
            <tr key={result.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.courseCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.courseName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.internalMarks !== null && result.internalMarks !== undefined ? result.internalMarks : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.midTermMarks !== null && result.midTermMarks !== undefined ? result.midTermMarks : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.status === 'published' ? (result.endTermMarks !== null && result.endTermMarks !== undefined ? result.endTermMarks : '-') : 'Pending'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.status === 'published' ? (result.totalMarks !== null && result.totalMarks !== undefined ? result.totalMarks : '-') : 'Pending'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.status === 'published' ? (result.grade !== null && result.grade !== undefined ? result.grade : '-') : 'Pending'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  result.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status === 'published' ? 'Published' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SemesterResults: React.FC<{ semesterGroup: SemesterGroup }> = ({ semesterGroup }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const calculateSemesterStats = () => {
    // Filter for published results that have a grade (excluding 'I' potentially, depending on SGPA rules)
    // For this example, we'll include 'P' but exclude null, 'F', or 'I' for SGPA calculation base
    const resultsForSGPA = semesterGroup.results.filter(r =>
       r.status === 'published' && r.grade && !['F', 'I'].includes(r.grade)
    );

    if (resultsForSGPA.length === 0) {
         // If no published results with valid grades, we might still want to show total subjects
        const totalSubjectsCount = semesterGroup.results.length;
        const passedSubjectsCount = semesterGroup.results.filter(r => r.status === 'published' && r.grade && !['F', 'I'].includes(r.grade)).length;

        return {
             totalSubjects: totalSubjectsCount,
             passedSubjects: passedSubjectsCount,
             sgpa: 0 // Or null, depending on desired display
         };
    }

    const totalSubjectsCount = semesterGroup.results.length; // Count all subjects in the semester group
    const passedSubjectsCount = semesterGroup.results.filter(r => r.status === 'published' && r.grade && !['F', 'I'].includes(r.grade)).length;
    const sgpa = calculateSGPA(resultsForSGPA);

    return {
        totalSubjects: totalSubjectsCount,
        passedSubjects: passedSubjectsCount,
        sgpa: sgpa
    };
  };

  const stats = calculateSemesterStats();

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Semester {semesterGroup.semester} - {semesterGroup.academicYear}
          </h3>
          {/* Display stats even if SGPA is 0, indicate if no published results */}
           <p className="text-sm text-gray-500 mt-1">
              {stats ? (
                 stats.totalSubjects > 0
                  ? `SGPA: ${stats.sgpa.toFixed(2)} | Passed: ${stats.passedSubjects}/${stats.totalSubjects} subjects`
                  : 'No subjects in this semester group'
              ) : 'Calculating stats...'} {/* Should not happen with dummy data */}
           </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200">
          {semesterGroup.results.length > 0 ? (
             <ResultsTable results={semesterGroup.results} />
          ) : (
            <div className="p-4 text-sm text-gray-500">No results available for this semester and year.</div>
          )}
        </div>
      )}
    </div>
  );
};

const calculateSGPA = (results: Result[]): number => {
  const gradePoints: { [key: string]: number } = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0, 'I': 0
  };

  // Calculate points only for results included in SGPA calculation base (passed/graded subjects)
   // Note: This assumes all subjects contribute equally (e.g., same credits).
   // A real SGPA calculation would typically factor in credits per subject.
   // For this example, we'll do a simple average of grade points for subjects with valid grades.
  const validResults = results.filter(r => r.grade && gradePoints[r.grade] !== undefined);

  if (validResults.length === 0) return 0;


  const totalPoints = validResults.reduce((sum, result) => {
     // Assuming all subjects are 1 credit for this simple example calculation
     // In a real system, multiply by credit hours: sum + (result.grade ? gradePoints[result.grade] * result.credits : 0);
    return sum + (result.grade ? gradePoints[result.grade] : 0);
  }, 0);

  // In a real system, divide by total credit hours: totalPoints / totalCreditHours;
  // Here, we divide by the number of subjects included in the calculation
  return totalPoints / validResults.length;
};


const StudentResultPage = () => {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<DocumentData | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (resultsRef.current) {
      const input = resultsRef.current;
      const studentName = profileData?.name || currentUserUid || 'Student';
      const fileName = `results_${studentName.replace(/\s/g, '_')}.pdf`;

      try {
        const canvas = await html2canvas(input, {
          scale: 2, // Increase scale for better resolution
          useCORS: true, // If you have external images/fonts
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(fileName);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    } else {
      alert('No results content to download.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        setCurrentUserUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!currentUserUid) {
        setLoading(false);
        setResults([]);
        setProfileData(null);
        return;
      }
      try {
        const [profile, resultsData] = await Promise.all([
          getUserProfile(currentUserUid),
          getStudentResults(currentUserUid)
        ]);
        setProfileData(profile);
        
        // Map Firestore data to Result interface
        const mappedResults: Result[] = (resultsData as StudentResult[]).map((r) => {
          console.log('Raw StudentResult for course:', r.courseName, r);
          const semesterMatch = r.semesterName?.match(/\d+/); // Use optional chaining
          let semester = 0; // Default to 0

          if (semesterMatch && semesterMatch[0]) {
            const parsedSemester = parseInt(semesterMatch[0], 10); // Always use radix 10
            if (!isNaN(parsedSemester)) {
              semester = parsedSemester;
            }
          }
          const academicYear = r.academicYear || '';

          // Ensure marks are numbers
          const internal = r.internalMarks !== null && r.internalMarks !== undefined ? Number(r.internalMarks) : null;
          const midTerm = r.midTermMarks !== null && r.midTermMarks !== undefined ? Number(r.midTermMarks) : null;
          const endTerm = r.endTermMarks !== null && r.endTermMarks !== undefined ? Number(r.endTermMarks) : null;
          
          // Calculate total marks only if all components are available
          let totalMarks: number | null = null;
          if (internal !== null && midTerm !== null && endTerm !== null) {
            totalMarks = internal + midTerm + endTerm;
          }

          // Calculate grade based on total marks
          let grade: string | null = null;
          if (totalMarks !== null) {
            if (totalMarks >= 90) grade = 'A+';
            else if (totalMarks >= 80) grade = 'A';
            else if (totalMarks >= 70) grade = 'B+';
            else if (totalMarks >= 60) grade = 'B';
            else if (totalMarks >= 50) grade = 'C';
            else if (totalMarks >= 40) grade = 'D';
            else if (totalMarks < 40) grade = 'F';
          }

          // Determine status based on mark availability and publication status
          const hasAllMarks = internal !== null && midTerm !== null && endTerm !== null;
          const isPublished = r.internalPublished && r.midTermPublished && r.endTermPublished;
          const status = hasAllMarks && isPublished ? 'published' : 'pending';

          // Determine lastUpdated
          let lastUpdated = '';
          const times = [
            (r as any).facultyPublishedAt,
            (r as any).adminPublishedAt,
            (r as any).updatedAt
          ].filter(Boolean);
          if (times.length > 0) {
            const latest = times.reduce((a, b) => (a && b && a.seconds > b.seconds ? a : b));
            lastUpdated = latest.toDate ? latest.toDate().toISOString() : '';
          }

          return {
            ...r,
            totalMarks,
            semester,
            academicYear,
            status,
            lastUpdated,
            grade
          };
        });
        setResults(mappedResults);
      } catch (error) {
        console.error('Error fetching data:', error);
        setResults([]);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserUid]);

  const groupResultsBySemester = (results: Result[]): SemesterGroup[] => {
    const grouped = results.reduce((acc, result) => {
      // Use semester and academicYear for a unique key
      const key = `${result.semester}-${result.academicYear}`;
      if (!acc[key]) {
        acc[key] = {
          semester: result.semester,
          academicYear: result.academicYear,
          results: []
        };
      }
      acc[key].results.push(result);
      return acc;
    }, {} as { [key: string]: SemesterGroup });

    // Sort semesters in descending order (most recent first)
    return Object.values(grouped).sort((a, b) => {
        // Optional: Add secondary sort by academic year if semesters span multiple years
        if (a.academicYear !== b.academicYear) {
             // Simple string comparison works for YYYY-YYYY format
            return b.academicYear.localeCompare(a.academicYear);
        }
        return b.semester - a.semester;
    });
  };

  const filteredResults = results.filter(result => {
    const matchesSemester = selectedSemester === 'all' || result.semester === selectedSemester;
    const matchesSearch = searchTerm === '' ||
      result.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  const semesterGroups = groupResultsBySemester(filteredResults);
  // Get unique semesters from the *original* results list to populate the filter dropdown
  const uniqueSemesters = [...new Set(results.map(r => r.semester))].sort((a, b) => b - a);


  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Results</h1>
          <p className="text-gray-600 mt-2">View your academic performance and grades</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Semesters</option>
                {uniqueSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> {/* Add pointer-events-none so select is clickable */}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> {/* Add pointer-events-none */}
            </div>
          </div>

          {/* Download Button (currently non-functional placeholder) */}
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as PDF
          </button>
        </div>

        {semesterGroups.length > 0 ? (
          <div ref={resultsRef}>
            {semesterGroups.map((group) => (
              <SemesterResults key={`${group.semester}-${group.academicYear}`} semesterGroup={group} />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No results found matching your filters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Optional: Message if results state is empty BEFORE filtering */}
         {results.length === 0 && !loading && semesterGroups.length === 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                  <div className="flex">
                      <div className="flex-shrink-0">
                           <AlertCircle className="h-5 w-5 text-blue-400" /> {/* Using AlertCircle for general info */}
                      </div>
                      <div className="ml-3">
                          <p className="text-sm text-blue-700">
                              No academic results are available for your profile yet.
                          </p>
                      </div>
                  </div>
              </div>
         )}
      </div>
    </StudentLayout>
  );
};

export default StudentResultPage;