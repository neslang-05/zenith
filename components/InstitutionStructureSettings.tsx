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

// Loading Spinner
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

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

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) { setError("Department name cannot be empty."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const addedDepId = await addDepartment(newDepartment);
      setDepartments(prev => [...prev, { id: addedDepId, name: newDepartment, semesters: [] }]);
      setNewDepartment('');
      setSuccess("Department added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add department.");
    } finally { setLoading(false); }
  };

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId) { setError("Please select a department first."); return; }
    if (!newSemester.trim()) { setError("Semester name cannot be empty."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const addedSemId = await addSemester(selectedDepartmentId, newSemester);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === selectedDepartmentId
          ? { ...dep, semesters: [...dep.semesters, { id: addedSemId, name: newSemester, courses: [] }] }
          : dep
      ));
      setNewSemester('');
      setSuccess("Semester added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add semester.");
    } finally { setLoading(false); }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId || !selectedSemesterId) { setError("Please select a department and semester first."); return; }
    if (!newCourse.name.trim() || !newCourse.code.trim()) { setError("Course name and code cannot be empty."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const addedCourseId = await addCourseToSemester(selectedDepartmentId, selectedSemesterId, newCourse);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === selectedDepartmentId
          ? { ...dep, semesters: dep.semesters.map(sem =>
              sem.id === selectedSemesterId
                ? { ...sem, courses: [...sem.courses, { id: addedCourseId, name: newCourse.name, code: newCourse.code }] }
                : sem
            ) }
          : dep
      ));
      setNewCourse({ name: '', code: '' });
      setSuccess("Course added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add course.");
    } finally { setLoading(false); }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside a droppable area

    // Handle reordering within departments
    if (active.id.startsWith("department-") && over.id.startsWith("department-")) {
      const oldIndex = departments.findIndex(dep => dep.id === active.id);
      const newIndex = departments.findIndex(dep => dep.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setDepartments((deps) => arrayMove(deps, oldIndex, newIndex));
      }
    } else if (active.id.startsWith("semester-") && over.id.startsWith("semester-")) {
      // Find the department containing the semester
      setDepartments(prevDeps => prevDeps.map(dep => {
        if (dep.semesters.some(sem => sem.id === active.id || sem.id === over.id)) {
          const oldIndex = dep.semesters.findIndex(sem => sem.id === active.id);
          const newIndex = dep.semesters.findIndex(sem => sem.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            return { ...dep, semesters: arrayMove(dep.semesters, oldIndex, newIndex) };
          }
        }
        return dep;
      }));
    } else if (active.id.startsWith("course-") && over.id.startsWith("course-")) {
      // Find the department and semester containing the course
      setDepartments(prevDeps => prevDeps.map(dep => {
        return { // Return new object for immutability
          ...dep, 
          semesters: dep.semesters.map(sem => {
            if (sem.courses.some(course => course.id === active.id || course.id === over.id)) {
              const oldIndex = sem.courses.findIndex(course => course.id === active.id);
              const newIndex = sem.courses.findIndex(course => course.id === over.id);
              if (oldIndex !== -1 && newIndex !== -1) {
                return { ...sem, courses: arrayMove(sem.courses, oldIndex, newIndex) };
              }
            }
            return sem;
          })
        };
      }));
    }
    // This part will need more sophisticated logic for nested sorting and updating backend.
    console.log("Drag ended for:", active.id, "over", over.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Quick Actions & Overview */}
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="font-bold text-lg mb-4">+ Quick Actions</h4>
          {error && <div className="text-red-500 text-sm mb-2">Error: {error}</div>}
          {success && <div className="text-green-500 text-sm mb-2">Success: {success}</div>}
          {/* Add Department */}
          <form className="mb-4 flex gap-2" onSubmit={handleAddDepartment}>
            <input className="flex-1 px-3 py-2 border rounded" placeholder="Department name" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} />
            <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18} /></button>
          </form>
          {/* Add Semester (context-aware) */}
          {selectedDepartmentId && (
            <form className="mb-4 flex gap-2" onSubmit={handleAddSemester}>
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Semester name" value={newSemester} onChange={e => setNewSemester(e.target.value)} />
              <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18} /></button>
            </form>
          )}
          {/* Add Course (context-aware) */}
          {selectedSemesterId && (
            <form className="mb-4 flex gap-2" onSubmit={handleAddCourse}>
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Course name" value={newCourse.name} onChange={e => setNewCourse(c => ({ ...c, name: e.target.value }))} />
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Course code" value={newCourse.code} onChange={e => setNewCourse(c => ({ ...c, code: e.target.value }))} />
              <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18} /></button>
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
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
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
            {loading && (
              <div className="flex items-center justify-center p-4"><LoadingSpinner /> <span className="ml-2 text-gray-500">Loading structure...</span></div>
            )}
            {error && <div className="text-red-500 p-4">Error: {error}</div>}
            {success && <div className="text-green-500 p-4">Success: {success}</div>}

            {!loading && !error && filteredDepartments.length === 0 && (
              <div className="text-gray-500 p-4">No departments found. Add one to get started!</div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredDepartments.map(dep => dep.id)} strategy={verticalListSortingStrategy}>
                {filteredDepartments.map((department) => (
                  <DraggableItem key={department.id} id={department.id}>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-2 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200 flex items-center">
                          <Layers size={20} className="mr-2 text-blue-500" />
                          {department.name}
                          <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">({department.semesters.length} Semesters)</span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => {
                            setSelectedDepartmentId(department.id);
                            setSelectedSemesterId(null);
                          }} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">Select</button>
                          <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                        </div>
                      </div>
                      {selectedDepartmentId === department.id && (
                        <div className="ml-6 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <SortableContext items={department.semesters.map(sem => sem.id)} strategy={verticalListSortingStrategy}>
                            {department.semesters.map(semester => (
                              <DraggableItem key={semester.id} id={semester.id}>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-md text-gray-700 dark:text-gray-200 flex items-center">
                                      <Calendar size={18} className="mr-2 text-green-500" />
                                      {semester.name}
                                      <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">({semester.courses.length} Courses)</span>
                                    </h5>
                                    <div className="flex items-center space-x-2">
                                      <button onClick={() => setSelectedSemesterId(semester.id)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">Select</button>
                                      <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                                    </div>
                                  </div>
                                  {selectedSemesterId === semester.id && (
                                    <div className="ml-6 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                      <SortableContext items={semester.courses.map(course => course.id)} strategy={verticalListSortingStrategy}>
                                        {semester.courses.map(course => (
                                          <DraggableItem key={course.id} id={course.id}>
                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 mb-1 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center">
                                                <BookOpen size={16} className="mr-2 text-purple-500" />
                                                {course.name} ({course.code})
                                              </span>
                                              <MoreVertical size={14} className="text-gray-400 cursor-pointer" />
                                            </div>
                                          </DraggableItem>
                                        ))}
                                      </SortableContext>
                                    </div>
                                  )}
                                </div>
                              </DraggableItem>
                            ))}
                          </SortableContext>
                        </div>
                      )}
                    </div>
                  </DraggableItem>
                ))}
              </SortableContext>
            </DndContext>
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