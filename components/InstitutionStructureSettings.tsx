// To enable drag-and-drop reordering, install:
// npm install @dnd-kit/core @dnd-kit/sortable

import React, { useEffect, useState } from 'react';
import {
  getDepartments, addDepartment, updateDepartment, deleteDepartment,
  getSemesters, addSemester, updateSemester, deleteSemester,
  getCourses
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
import { MoreVertical, Calendar, BookOpen, Layers, Plus, Search, ChevronDown, ChevronRight, Check, X, Trash2, Edit3, ChevronUp } from 'lucide-react';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';

// Loading Spinner
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

// --- Types for nested UI structure ---
interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  // Add other properties that are returned by getCourses if needed for display/logic in this component
}

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

export default function InstitutionStructureSettings({ currentUser, userProfile }: { currentUser: User | null; userProfile: DocumentData | null; }) {
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

  // New state for quick actions dropdowns
  const [selectedDepartmentForSemesterAdd, setSelectedDepartmentForSemesterAdd] = useState<string | ''>('');

  // State for managing edit/delete operations
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState<string>('');
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);

  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [editingSemesterName, setEditingSemesterName] = useState<string>('');
  const [deletingSemesterId, setDeletingSemesterId] = useState<string | null>(null);

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
            return {
              id: sem.id,
              name: sem.name,
              courses: courseList.map((c: any) => ({
                id: c.id,
                courseName: c.courseName,
                courseCode: c.courseCode
              }))
            };
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
    // Use the selected department from the dropdown, or the tree selection if available
    const targetDepartmentId = selectedDepartmentForSemesterAdd || selectedDepartmentId;
    if (!targetDepartmentId) { setError("Please select a department to add the semester to."); return; }
    if (!newSemester.trim()) { setError("Semester name cannot be empty."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const addedSemId = await addSemester(targetDepartmentId, newSemester);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === targetDepartmentId
          ? { ...dep, semesters: [...dep.semesters, { id: addedSemId, name: newSemester, courses: [] }] }
          : dep
      ));
      setNewSemester('');
      setSelectedDepartmentForSemesterAdd(''); // Clear dropdown after adding
      setSuccess("Semester added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add semester.");
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

  const handleUpdateDepartment = async (departmentId: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await updateDepartment(departmentId, editingDepartmentName);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === departmentId ? { ...dep, name: editingDepartmentName } : dep
      ));
      setEditingDepartmentId(null);
      setEditingDepartmentName('');
      setSuccess("Department updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update department.");
    } finally { setLoading(false); }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await deleteDepartment(departmentId);
      setDepartments(prevDeps => prevDeps.filter(dep => dep.id !== departmentId));
      setDeletingDepartmentId(null);
      setSuccess("Department deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete department.");
    } finally { setLoading(false); }
  };

  const handleUpdateSemester = async (departmentId: string, semesterId: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await updateSemester(departmentId, semesterId, editingSemesterName);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === departmentId
          ? {
              ...dep,
              semesters: dep.semesters.map(sem =>
                sem.id === semesterId ? { ...sem, name: editingSemesterName } : sem
              ),
            }
          : dep
      ));
      setEditingSemesterId(null);
      setEditingSemesterName('');
      setSuccess("Semester updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update semester.");
    } finally { setLoading(false); }
  };

  const handleDeleteSemester = async (departmentId: string, semesterId: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await deleteSemester(departmentId, semesterId);
      setDepartments(prevDeps => prevDeps.map(dep =>
        dep.id === departmentId
          ? { ...dep, semesters: dep.semesters.filter(sem => sem.id !== semesterId) }
          : dep
      ));
      setDeletingSemesterId(null);
      setSuccess("Semester deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete semester.");
    } finally { setLoading(false); }
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
          {/* Add Semester (context-aware) -> now always visible with dropdown */}
          <form className="mb-4 flex flex-col gap-2" onSubmit={handleAddSemester}>
            <select
              className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200"
              value={selectedDepartmentForSemesterAdd}
              onChange={e => setSelectedDepartmentForSemesterAdd(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2 border rounded" placeholder="Semester name" value={newSemester} onChange={e => setNewSemester(e.target.value)} />
              <button className="bg-indigo-600 text-white rounded p-2" type="submit"><Plus size={18} /></button>
            </div>
          </form>

          {/* Overview Counts */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-4">Overview</h4>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>Departments: <span className="font-semibold">{overview.departments}</span></p>
              <p>Semesters: <span className="font-semibold">{overview.semesters}</span></p>
              <p>Courses: <span className="font-semibold">{overview.courses}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Institution Structure Tree */}
      <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Institution Structure</h3>
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search departments..."
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-6"><LoadingSpinner /> <span className="ml-2 text-gray-500">Loading structure...</span></div>
        ) : filteredDepartments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No departments found. Please add one.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredDepartments.map(dep => `department-${dep.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {filteredDepartments.map(department => (
                  <DraggableItem key={`department-${department.id}`} id={`department-${department.id}`}>
                    <div
                      className={`p-4 border rounded-lg bg-gray-100 dark:bg-gray-700 ${selectedDepartmentId === department.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-600'}`}
                      onClick={() => setSelectedDepartmentId(department.id === selectedDepartmentId ? null : department.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
                          <Layers size={20} className="mr-2 text-blue-500" />
                          {editingDepartmentId === department.id ? (
                            <input
                              type="text"
                              value={editingDepartmentName}
                              onChange={e => setEditingDepartmentName(e.target.value)}
                              onClick={e => e.stopPropagation()} // Prevent closing on input click
                              className="input-field-inline"
                            />
                          ) : (
                            <>{department.name}</>
                          )}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {editingDepartmentId === department.id ? (
                            <button onClick={e => { e.stopPropagation(); handleUpdateDepartment(department.id); }} className="btn-action-icon text-green-600"><Check size={16} /></button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setEditingDepartmentId(department.id); setEditingDepartmentName(department.name); }} className="btn-action-icon"><Edit3 size={16} /></button>
                          )}
                          {deletingDepartmentId === department.id ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-red-500">Confirm Delete?</span>
                              <button onClick={e => { e.stopPropagation(); handleDeleteDepartment(department.id); }} className="btn-action-icon text-red-600"><Check size={16} /></button>
                              <button onClick={e => { e.stopPropagation(); setDeletingDepartmentId(null); }} className="btn-action-icon text-gray-500"><X size={16} /></button>
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setDeletingDepartmentId(department.id); }} className="btn-action-icon text-red-600"><Trash2 size={16} /></button>
                          )}
                          <button onClick={e => { e.stopPropagation(); setSelectedDepartmentId(department.id === selectedDepartmentId ? null : department.id); }} className="btn-action-icon">
                            {selectedDepartmentId === department.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {selectedDepartmentId === department.id && (
                        <div className="ml-4 mt-3 border-l pl-4 border-gray-300 dark:border-gray-600">
                          {department.semesters.length > 0 ? (
                            <SortableContext items={department.semesters.map(sem => `semester-${sem.id}`)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-3">
                                {department.semesters.map(semester => (
                                  <DraggableItem key={`semester-${semester.id}`} id={`semester-${semester.id}`}>
                                    <div
                                      className={`p-3 border rounded-md bg-white dark:bg-gray-800 ${selectedSemesterId === semester.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700'}`}
                                      onClick={() => setSelectedSemesterId(semester.id === selectedSemesterId ? null : semester.id)}
                                    >
                                      <div className="flex justify-between items-center">
                                        <h5 className="font-semibold text-md text-gray-800 dark:text-gray-200 flex items-center">
                                          <Calendar size={18} className="mr-2 text-green-500" />
                                          {editingSemesterId === semester.id ? (
                                            <input
                                              type="text"
                                              value={editingSemesterName}
                                              onChange={e => setEditingSemesterName(e.target.value)}
                                              onClick={e => e.stopPropagation()} // Prevent closing on input click
                                              className="input-field-inline"
                                            />
                                          ) : (
                                            <>{semester.name}</>
                                          )}
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          {editingSemesterId === semester.id ? (
                                            <button onClick={e => { e.stopPropagation(); handleUpdateSemester(department.id, semester.id); }} className="btn-action-icon text-green-600"><Check size={16} /></button>
                                          ) : (
                                            <button onClick={e => { e.stopPropagation(); setEditingSemesterId(semester.id); setEditingSemesterName(semester.name); }} className="btn-action-icon"><Edit3 size={16} /></button>
                                          )}
                                          {deletingSemesterId === semester.id ? (
                                            <div className="flex items-center space-x-1">
                                              <span className="text-sm text-red-500">Confirm Delete?</span>
                                              <button onClick={e => { e.stopPropagation(); handleDeleteSemester(department.id, semester.id); }} className="btn-action-icon text-red-600"><Check size={16} /></button>
                                              <button onClick={e => { e.stopPropagation(); setDeletingSemesterId(null); }} className="btn-action-icon text-gray-500"><X size={16} /></button>
                                            </div>
                                          ) : (
                                            <button onClick={e => { e.stopPropagation(); setDeletingSemesterId(semester.id); }} className="btn-action-icon text-red-600"><Trash2 size={16} /></button>
                                          )}
                                          <button onClick={e => { e.stopPropagation(); setSelectedSemesterId(semester.id === selectedSemesterId ? null : semester.id); }} className="btn-action-icon">
                                            {selectedSemesterId === semester.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                          </button>
                                        </div>
                                      </div>

                                      {selectedSemesterId === semester.id && (
                                        <div className="ml-4 mt-3 border-l pl-4 border-gray-300 dark:border-gray-600">
                                          <h6 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Courses:</h6>
                                          {semester.courses.length > 0 ? (
                                            <SortableContext items={semester.courses.map(course => `course-${course.id}`)} strategy={verticalListSortingStrategy}>
                                              <div className="space-y-2">
                                                {semester.courses.map(course => (
                                                  <DraggableItem key={`course-${course.id}`} id={`course-${course.id}`}>
                                                    <div
                                                      key={course.id}
                                                      className="p-2 mb-1 rounded-md flex items-center justify-between bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                    >
                                                      <span className="flex items-center">
                                                        <BookOpen size={16} className="mr-2 text-purple-500" />
                                                        {course.courseName} ({course.courseCode})
                                                      </span>
                                                      {/* No edit/delete actions for courses from admin side */}
                                                    </div>
                                                  </DraggableItem>
                                                ))}
                                              </div>
                                            </SortableContext>
                                          ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No courses in this semester.</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </DraggableItem>
                                ))}
                              </div>
                            </SortableContext>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No semesters in this department.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </DraggableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
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