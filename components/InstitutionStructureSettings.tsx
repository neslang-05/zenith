// To enable drag-and-drop reordering, install:
// npm install @dnd-kit/core @dnd-kit/sortable

import React, { useEffect, useState } from 'react';
import {
  getDepartments, addDepartment, updateDepartment, deleteDepartment,
  getSemesters, addSemester, updateSemester, deleteSemester,
  getCourses, addCourseToSemester, updateCourseInSemester, deleteCourseInSemester
} from '@/lib/firebase';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { MoreVertical, Calendar, BookOpen, Layers, Plus, Search } from 'lucide-react';

// --- Types for nested UI structure ---
type Course = { id: string; name: string; code: string };
type Semester = { id: string; name: string; courses: Course[] };
type Department = { id: string; name: string; semesters: Semester[] };

// --- DRAGGABLE ITEM COMPONENT ---
function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function InstitutionStructureSettings() {
  // --- State for structure ---
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // --- State for selection/context ---
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  // --- State for search/filter ---
  const [search, setSearch] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [newCourse, setNewCourse] = useState({ name: '', code: '' });

  // --- Fetch nested structure ---
  useEffect(() => {
    async function fetchStructure() {
      setLoading(true); setError(null);
      try {
        const depList = await getDepartments();
        const departmentsWithSemesters: Department[] = await Promise.all(depList.map(async (dep: any) => {
          const semList = await getSemesters(dep.id);
          const semestersWithCourses: Semester[] = await Promise.all(semList.map(async (sem: any) => {
            const courseList = await getCourses(dep.id, sem.id);
            return { id: sem.id, name: sem.name, courses: courseList.map((c: any) => ({ id: c.id, name: c.name, code: c.code })) };
          }));
          return { id: dep.id, name: dep.name, semesters: semestersWithCourses };
        }));
        setDepartments(departmentsWithSemesters);
      } catch (err: any) {
        setError(err.message || 'Failed to load institution structure.');
      } finally { setLoading(false); }
    }
    fetchStructure();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  // --- Overview counts ---
  const overview = React.useMemo(() => {
    let semCount = 0, courseCount = 0;
    departments.forEach(dep => {
      if (dep.semesters) {
        semCount += dep.semesters.length;
        dep.semesters.forEach(sem => {
          if (sem.courses) courseCount += sem.courses.length;
        });
      }
    });
    return {
      departments: departments.length,
      semesters: semCount,
      courses: courseCount,
    };
  }, [departments]);

  // --- Filtered departments ---
  const filteredDepartments = search
    ? departments.filter(dep => dep.name.toLowerCase().includes(search.toLowerCase()))
    : departments;

  const handleAddDepartment = () => {
    // Implementation of handleAddDepartment
  };

  const handleAddSemester = () => {
    // Implementation of handleAddSemester
  };

  const handleAddCourse = () => {
    // Implementation of handleAddCourse
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Quick Actions & Overview */}
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="font-bold text-lg mb-4">+ Quick Actions</h4>
          {/* Add Department */}
          <form className="mb-4 flex gap-2" onSubmit={handleAddDepartment}>
            <input className="flex-1 px-3 py-2 border rounded" placeholder="Department name" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} />
            <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18}/></button>
          </form>
          {/* Add Semester (context-aware) */}
          {selectedDepartmentId && (
            <form className="mb-4 flex gap-2" onSubmit={handleAddSemester}>
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Semester name" value={newSemester} onChange={e => setNewSemester(e.target.value)} />
              <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18}/></button>
            </form>
          )}
          {/* Add Course (context-aware) */}
          {selectedSemesterId && (
            <form className="mb-4 flex gap-2" onSubmit={handleAddCourse}>
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Course name" value={newCourse.name} onChange={e => setNewCourse(c => ({ ...c, name: e.target.value }))} />
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Course code" value={newCourse.code} onChange={e => setNewCourse(c => ({ ...c, code: e.target.value }))} />
              <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18}/></button>
            </form>
          )}
        </div>
        {/* Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="font-bold text-lg mb-4">Overview</h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between"><span>Departments</span><span className="font-bold">{overview.departments}</span></div>
            <div className="flex justify-between"><span>Semesters</span><span className="font-bold">{overview.semesters}</span></div>
            <div className="flex justify-between"><span>Courses</span><span className="font-bold">{overview.courses}</span></div>
          </div>
        </div>
      </div>
      {/* Right: Institution Structure */}
      <div className="md:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Institution Structure</h3>
              <p className="text-gray-500 text-sm">Manage departments, semesters, and courses in a hierarchical structure</p>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16}/>
              <input
                className="pl-8 pr-3 py-2 border rounded bg-gray-50 dark:bg-gray-900"
                placeholder="Search departments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Collapsible, filterable, drag-and-drop structure */}
          <div>
            {/* Render filteredDepartments as collapsible panels, with badges, icons, and 3-dot menus. Use drag-and-drop logic as before. */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Remove all references to fetchDepartments and related handlers
// Remove or comment out the old DepartmentList, SemesterList, and CourseList usages for now
// Fix setSemesters and setCourses to expect the new nested types
// Prepare for new UI implementation

// (Remove or comment out the following:)
// - handleAddDepartment, handleUpdateDepartment, handleDeleteDepartment
// - DepartmentList, SemesterList, CourseList usages
// - setSemesters(list) and setCourses(list) in those components

// The main component now only fetches and sets the nested structure in departments
// The UI and handlers will be implemented in the next step 