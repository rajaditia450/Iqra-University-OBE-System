import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  LogOut, 
  GraduationCap, 
  Building, 
  BookOpen, 
  Check, 
  X, 
  UserPlus, 
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Student, Department, Program } from '../types';

interface AdmissionDashboardProps {
  onLogout: () => void;
  admissionName?: string;
}

export default function AdmissionDashboard({ onLogout, admissionName = "Admission Advisor" }: AdmissionDashboardProps) {
  // Global Data States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Input States
  const [isEditing, setIsEditing] = useState(false);
  const [editRegNo, setEditRegNo] = useState<string | null>(null);
  
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProgId, setSelectedProgId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<'Spring' | 'Summer' | 'Fall'>('Fall');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Directory Filter States
  const [filterDeptId, setFilterDeptId] = useState<string>('all');
  const [filterProgId, setFilterProgId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load departments & programs from apiService falling back to client-side storage
      let dbData;
      try {
        dbData = await apiService.getAllData();
      } catch (e) {
        dbData = apiService.getLocalStorageData();
      }
      
      setDepartments(dbData.departments || []);
      setPrograms(dbData.programs || []);
      
      // Fetch students via the apiService (with offline localStorage fallback)
      const studentList = await apiService.getStudents();
      setStudents(studentList);
    } catch (err: any) {
      console.error("Error loading admission dashboard data", err);
      setError("Failed to load records. Resetting system parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamically filter programs based on department choice in Form
  const formPrograms = useMemo(() => {
    if (!selectedDeptId) return [];
    return programs.filter(p => p.departmentId === selectedDeptId);
  }, [selectedDeptId, programs]);

  // Dynamically filter programs based on department choice in Filter Panel
  const filterPrograms = useMemo(() => {
    if (filterDeptId === 'all') return programs;
    return programs.filter(p => p.departmentId === filterDeptId);
  }, [filterDeptId, programs]);

  // Reset selected program in Form if department changes
  useEffect(() => {
    if (selectedDeptId && !isEditing) {
      const available = programs.filter(p => p.departmentId === selectedDeptId);
      if (available.length > 0) {
        setSelectedProgId(available[0].id);
      } else {
        setSelectedProgId('');
      }
    }
  }, [selectedDeptId, programs, isEditing]);

  // Reset selected program in Filters if department filter changes
  useEffect(() => {
    setFilterProgId('all');
  }, [filterDeptId]);

  // Filter and Search Logic for Directory
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter by Department
      const matchDept = filterDeptId === 'all' || student.departmentId === filterDeptId;
      // Filter by Program
      const matchProg = filterProgId === 'all' || student.programId === filterProgId;
      // Filter by Search Query (Name or RegNo)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' || 
        student.name.toLowerCase().includes(q) || 
        student.regNo.toLowerCase().includes(q);
      
      return matchDept && matchProg && matchSearch;
    });
  }, [students, filterDeptId, filterProgId, searchQuery]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = students.length;
    const spring = students.filter(s => s.batch === 'Spring').length;
    const summer = students.filter(s => s.batch === 'Summer').length;
    const fall = students.filter(s => s.batch === 'Fall').length;
    return { total, spring, summer, fall };
  }, [students]);

  // Form Reset
  const resetForm = () => {
    setRegNo('');
    setName('');
    setSelectedDeptId(departments[0]?.id || '');
    setSelectedProgId('');
    setSelectedBatch('Fall');
    setFormError(null);
    setIsEditing(false);
    setEditRegNo(null);
  };

  // Add / Edit Student Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Validate inputs
    const cleanRegNo = regNo.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanRegNo) {
      setFormError("Registration number is required");
      return;
    }
    if (!cleanName) {
      setFormError("Student name is required");
      return;
    }
    if (!selectedDeptId) {
      setFormError("Please select a department");
      return;
    }
    if (!selectedProgId) {
      setFormError("Please select a program");
      return;
    }

    // Check pattern for registration number e.g. FA22-BSCS-0012 or standard formats
    const regPattern = /^[A-Z0-9-]{3,20}$/i;
    if (!regPattern.test(cleanRegNo)) {
      setFormError("Invalid registration number format. Use alphanumeric characters and dashes (e.g. SP26-BSCS-0056).");
      return;
    }

    const newStudent: Student = {
      regNo: cleanRegNo,
      name: cleanName,
      departmentId: selectedDeptId,
      programId: selectedProgId,
      batch: selectedBatch
    };

    try {
      if (isEditing && editRegNo) {
        // Edit student
        const updated = await apiService.updateStudent(editRegNo, newStudent);
        setStudents(prev => prev.map(s => s.regNo === editRegNo ? updated : s));
        setSuccessMsg(`Student record for "${cleanName}" has been updated successfully!`);
        resetForm();
      } else {
        // Add student - Check if registration number already exists
        const exists = students.some(s => s.regNo.toUpperCase() === cleanRegNo);
        if (exists) {
          setFormError(`Registration Number "${cleanRegNo}" is already registered in the system.`);
          return;
        }

        const created = await apiService.createStudent(newStudent);
        setStudents(prev => [...prev, created]);
        setSuccessMsg(`Student "${cleanName}" has been successfully registered!`);
        resetForm();
      }

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving the student record.");
    }
  };

  // Populate form with student data for Editing
  const handleEditClick = (student: Student) => {
    setIsEditing(true);
    setEditRegNo(student.regNo);
    setRegNo(student.regNo);
    setName(student.name);
    setSelectedDeptId(student.departmentId);
    setSelectedProgId(student.programId);
    setSelectedBatch(student.batch);
    setFormError(null);
    setSuccessMsg(null);
    
    // Smooth scroll to form on mobile devices
    const formEl = document.getElementById('admission-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete student record
  const handleDeleteClick = async (student: Student) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete student "${student.name}" (${student.regNo})? This action is irreversible.`);
    if (!confirmDelete) return;

    try {
      await apiService.deleteStudent(student.regNo);
      setStudents(prev => prev.filter(s => s.regNo !== student.regNo));
      setSuccessMsg(`Student record for "${student.name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      
      // If we are currently editing the deleted student, reset the form
      if (editRegNo === student.regNo) {
        resetForm();
      }
    } catch (err: any) {
      alert("Error deleting student record. Please try again.");
    }
  };

  // Helper to get Department name from ID
  const getDeptName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  // Helper to get Program code/name from ID
  const getProgCode = (progId: string) => {
    const prog = programs.find(p => p.id === progId);
    return prog ? prog.code : progId;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Premium Corporate Top Header */}
      <header id="admission-header" className="bg-[#1e1b4b] text-white border-b border-indigo-950 px-6 py-4 shrink-0 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-indigo-400">
            IU
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
              <span>Iqra University OBE</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Admission Control
              </span>
            </h1>
            <p className="text-[11px] text-indigo-200/80 font-sans">Student Registry & Academic Enrollment Directory</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-indigo-200">Logged in as</span>
            <span className="text-sm font-bold text-white">{admissionName}</span>
          </div>
          <button
            id="btn-logout"
            onClick={onLogout}
            className="p-2.5 bg-indigo-950 hover:bg-red-950/60 text-indigo-200 hover:text-white rounded-xl transition-all border border-indigo-900/50 hover:border-red-900/40 flex items-center gap-2 cursor-pointer"
            title="Sign out of Admission Module"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-semibold">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6 max-w-[1700px] mx-auto w-full flex flex-col gap-6">
        
        {/* Statistics Panels */}
        <div id="stats-panel" className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <p className="text-2xl font-bold text-indigo-950">{stats.total} <span className="text-xs font-medium text-slate-500">Students</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Spring Semester</p>
              <p className="text-2xl font-bold text-slate-800">{stats.spring} <span className="text-xs font-medium text-slate-500">Active</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Summer Semester</p>
              <p className="text-2xl font-bold text-slate-800">{stats.summer} <span className="text-xs font-medium text-slate-500">Active</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fall Semester</p>
              <p className="text-2xl font-bold text-slate-800">{stats.fall} <span className="text-xs font-medium text-slate-500">Active</span></p>
            </div>
          </div>
        </div>

        {/* Loading and Error Overlays */}
        {loading ? (
          <div className="flex-1 bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-sans text-sm font-medium">Synchronizing databases, loading academic directory...</p>
          </div>
        ) : error ? (
          <div className="flex-1 bg-red-50 text-red-800 border border-red-200 rounded-[24px] p-8 flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-lg font-bold mb-2">Registry Load Alert</h2>
            <p className="text-sm mb-6 text-red-700">{error}</p>
            <button
              onClick={loadAllData}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Registry Load</span>
            </button>
          </div>
        ) : (
          /* Dual Columns Split Screen Workspace */
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
            
            {/* COLUMN 1: Student Registration Form */}
            <div id="admission-form-container" className="w-full lg:w-[400px] shrink-0 flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden h-fit max-h-full">
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {isEditing ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </div>
                  <h2 className="font-display font-bold text-slate-800 text-base">
                    {isEditing ? 'Edit Student Record' : 'Register New Student'}
                  </h2>
                </div>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel Edit Mode"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-none">
                {/* Form Message Prompts */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-start gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-100 flex items-start gap-2 font-medium"
                  >
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Field 1: Reg Number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-regno"
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. FA22-BSCS-0045"
                    disabled={isEditing} // Cannot edit Registration Number once saved to retain entity integrity
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium uppercase"
                    required
                  />
                  {isEditing && (
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Registration number cannot be changed to protect academic transcript links.
                    </p>
                  )}
                </div>

                {/* Field 2: Student Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Syeda Fatima Alvi"
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                    required
                  />
                </div>

                {/* Field 3: Department Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="select-dept"
                      value={selectedDeptId}
                      onChange={(e) => {
                        setSelectedDeptId(e.target.value);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-sm text-slate-800 outline-none cursor-pointer transition-all appearance-none font-medium pr-10"
                      required
                    >
                      <option value="" disabled>Choose Department...</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Field 4: Program Selection (Chained to Department) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Degree Program <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="select-program"
                      value={selectedProgId}
                      onChange={(e) => setSelectedProgId(e.target.value)}
                      disabled={!selectedDeptId}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-sm text-slate-800 outline-none cursor-pointer transition-all appearance-none font-medium pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="" disabled>Choose Degree Program...</option>
                      {formPrograms.map(p => (
                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  {!selectedDeptId && (
                    <p className="text-[10px] text-indigo-900/60 mt-1 font-medium">
                      Select Department first to reveal associated programs.
                    </p>
                  )}
                </div>

                {/* Field 5: Batch Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Admission Batch <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Spring', 'Summer', 'Fall'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBatch(b as 'Spring' | 'Summer' | 'Fall')}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          selectedBatch === b 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/10' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-2 flex gap-3">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    id="btn-submit"
                    type="submit"
                    className={`flex-1 py-3 text-white font-semibold text-xs rounded-xl transition-all shadow-md cursor-pointer text-center ${
                      isEditing 
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                    }`}
                  >
                    {isEditing ? 'Save Profile' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </div>

            {/* COLUMN 2: Student Directory Listing with Filters */}
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
              
              {/* Filter and Search Panel Header */}
              <div id="filter-header" className="p-5 border-b border-slate-100 bg-slate-50/40 flex flex-col gap-4 shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-display font-bold text-slate-800 text-base">Student Records Directory</h2>
                  </div>
                  
                  {/* Total Records Filtered Display */}
                  <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    Showing <span className="text-indigo-950 font-bold">{filteredStudents.length}</span> of {students.length} Records
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Name or Reg No..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>

                  {/* Dept filter */}
                  <div className="relative">
                    <select
                      id="filter-dept"
                      value={filterDeptId}
                      onChange={(e) => setFilterDeptId(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-xs text-slate-700 outline-none cursor-pointer transition-all appearance-none font-bold"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>

                  {/* Program filter */}
                  <div className="relative">
                    <select
                      id="filter-program"
                      value={filterProgId}
                      onChange={(e) => setFilterProgId(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl font-sans text-xs text-slate-700 outline-none cursor-pointer transition-all appearance-none font-bold"
                    >
                      <option value="all">All Programs</option>
                      {filterPrograms.map(p => (
                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Grid / Directory Directory Table */}
              <div className="flex-1 overflow-auto min-h-0">
                {filteredStudents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200/50">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-slate-700 text-sm mb-1">No Matching Records Found</h3>
                    <p className="text-slate-400 text-xs max-w-sm font-medium mb-4">
                      Try resetting filters, matching another Registration ID, or register a new student using the left-hand console.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterDeptId('all');
                        setFilterProgId('all');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Clear Search Filters
                    </button>
                  </div>
                ) : (
                  <div className="min-w-full inline-block align-middle">
                    <table className="min-w-full divide-y divide-slate-200 border-collapse table-auto">
                      <thead className="bg-slate-50 sticky top-0 z-10 shadow-xs border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Reg Number
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Program
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Batch
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 pr-8">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        <AnimatePresence initial={false}>
                          {filteredStudents.map((student) => (
                            <motion.tr
                              key={student.regNo}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="hover:bg-indigo-50/20 group transition-all"
                            >
                              {/* Reg No Badge */}
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[11px] font-bold font-mono rounded-lg border border-indigo-200 tracking-tight">
                                  {student.regNo}
                                </span>
                              </td>

                              {/* Student Name */}
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-950 transition-colors">
                                  {student.name}
                                </p>
                              </td>

                              {/* Department */}
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <p className="text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={getDeptName(student.departmentId)}>
                                  {getDeptName(student.departmentId)}
                                </p>
                              </td>

                              {/* Program Code */}
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold rounded-md">
                                  {getProgCode(student.programId)}
                                </span>
                              </td>

                              {/* Batch */}
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                  student.batch === 'Spring' 
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                                    : student.batch === 'Summer' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {student.batch}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium pr-8">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    id={`btn-edit-${student.regNo}`}
                                    onClick={() => handleEditClick(student)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                                    title={`Edit ${student.name}'s profile`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`btn-delete-${student.regNo}`}
                                    onClick={() => handleDeleteClick(student)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                    title={`Delete ${student.name}'s record`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
