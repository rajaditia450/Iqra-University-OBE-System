import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Department, Program, Course, Student, InstructorCourse } from '../types';
import { apiService } from '../services/apiService';
import { DEFAULT_TEMP_PASSWORD } from '../utils/config';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus, 
  Check, 
  FileSpreadsheet, 
  Search, 
  RefreshCw, 
  Link, 
  Unlink, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  LogOut, 
  Layers, 
  UserPlus, 
  Sliders, 
  Download,
  Info,
  BarChart3,
  Lock,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import FacultyDirectoryTab from './admin/FacultyDirectoryTab';
import { matchTeacher, getTeacherId } from '../utils/teacherUtils';
import { AnimatePresence } from 'motion/react';
import Toast from './Toast';

const getAutomaticAcademicYear = (): string => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0 = January, 11 = December
  const currentYear = currentDate.getFullYear();
  // First 6 months (January to June) -> Spring, otherwise Fall
  const term = currentMonth < 6 ? 'Spring' : 'Fall';
  return `${term}-${currentYear}`;
};

const getAcademicYearOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const options: string[] = [];
  // Generate options from currentYear - 3 to currentYear + 2
  for (let y = currentYear - 3; y <= currentYear + 2; y++) {
    options.push(`Spring-${y}`);
    options.push(`Fall-${y}`);
  }
  return options;
};

interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
  departmentId: string;
  departmentName?: string;
}

interface SemesterPlan {
  programId: string;
  semester: string;
  courseCodes: string[];
}

interface StudentCourseBinding {
  studentRegNo: string;
  courseCode: string;
}

interface TeacherCourseAssignment {
  teacherId: string;
  courseCode: string;
  programId?: string;
  section?: string;
  academicYear?: string;
  status?: 'active' | 'closed';
}

interface DeptAdminDashboardProps {
  onLogout: () => void;
  adminName?: string;
}

const DEFAULT_TEACHERS: Teacher[] = [
  { id: 'INS-CS-001', employeeId: 'INS-CS-001', name: 'Prof. Dr. Jameel Ahmed', email: 'jameel@iqra.edu.pk', designation: 'Professor', departmentId: 'computing' },
  { id: 'INS-CS-002', employeeId: 'INS-CS-002', name: 'Dr. Asim Imdad', email: 'asim@iqra.edu.pk', designation: 'Associate Professor', departmentId: 'computing' },
  { id: 'INS-CS-003', employeeId: 'INS-CS-003', name: 'Dr. Tariq Soomro', email: 'tariq.soomro@iqra.edu.pk', designation: 'Professor', departmentId: 'computing' },
  { id: 'INS-CS-004', employeeId: 'INS-CS-004', name: 'Dr. Sajjad Ahmad', email: 'sajjad@iqra.edu.pk', designation: 'Assistant Professor', departmentId: 'computing' },
  { id: 'INS-CS-005', employeeId: 'INS-CS-005', name: 'Dr. Farhan Shaikh', email: 'farhan@iqra.edu.pk', designation: 'Associate Professor', departmentId: 'business' },
  { id: 'INS-CS-006', employeeId: 'INS-CS-006', name: 'Prof. Dr. Kamran Raza', email: 'kamran.raza@iqra.edu.pk', designation: 'Professor', departmentId: 'computing' }
];

const DEFAULT_SEMESTER_PLANS: SemesterPlan[] = [
  // BSCS Plans
  {
    programId: 'bscs',
    semester: '1st',
    courseCodes: ['CMC111', 'GER111', 'GER121', 'GER131', 'GER141', 'GER151']
  },
  {
    programId: 'bscs',
    semester: '2nd',
    courseCodes: ['MTE111', 'CMC112', 'CMC121', 'GER122', 'GER132', 'GER142']
  },
  {
    programId: 'bscs',
    semester: '3rd',
    courseCodes: ['MTE212', 'CMC222', 'CMC251', 'CSC252', 'CMC261']
  },
  {
    programId: 'bscs',
    semester: '4th',
    courseCodes: ['MTE213', 'MTE221', 'CSC223', 'CMC241', 'CMC253', 'GER261']
  },
  {
    programId: 'bscs',
    semester: '5th',
    courseCodes: ['CMC331', 'CSC354', 'CMC362', 'CMC371', 'CSC332']
  },
  {
    programId: 'bscs',
    semester: '6th',
    courseCodes: ['CMC381', 'CSC382', 'ESC311']
  },
  {
    programId: 'bscs',
    semester: '7th',
    courseCodes: ['CSC442', 'GER462', 'CMC491', 'GER443']
  },
  {
    programId: 'bscs',
    semester: '8th',
    courseCodes: ['GER463', 'CMC492']
  },

  // BSAI Plans
  {
    programId: 'bsai',
    semester: '1st',
    courseCodes: ['CMC111', 'GER111', 'GER151', 'GER131', 'GER121', 'GER141']
  },
  {
    programId: 'bsai',
    semester: '2nd',
    courseCodes: ['CMC112', 'GER132', 'CMC121', 'GER142', 'GER122', 'MTE111']
  },
  {
    programId: 'bsai',
    semester: '3rd',
    courseCodes: ['CMC251', 'CMC222', 'AIC211', 'CMC261', 'MTE212']
  },
  {
    programId: 'bsai',
    semester: '4th',
    courseCodes: ['CMC241', 'AIC212', 'MTE213', 'CMC252', 'MTE221', 'GER261']
  },
  {
    programId: 'bsai',
    semester: '5th',
    courseCodes: ['AIC221', 'CMC362', 'CMC331', 'CMC371']
  },
  {
    programId: 'bsai',
    semester: '6th',
    courseCodes: ['AIC323', 'AIE423', 'AIC331', 'ESC311']
  },
  {
    programId: 'bsai',
    semester: '7th',
    courseCodes: ['CMC491', 'CSC442', 'GER462', 'GER443']
  },
  {
    programId: 'bsai',
    semester: '8th',
    courseCodes: ['GER463', 'CMC492']
  }
];

export default function DeptAdminDashboard({ onLogout, adminName = "Department Administrator" }: DeptAdminDashboardProps) {
  // Global Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>([]);
  const [studentBindings, setStudentBindings] = useState<StudentCourseBinding[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherCourseAssignment[]>([]);
  const [adminProfile, setAdminProfile] = useState<{ departmentId?: string; departmentName?: string; employeeId?: string } | null>(null);

  // Find which department this administrator manages.
  const managedDeptId = useMemo(() => {
    if (adminProfile?.departmentId) {
      return adminProfile.departmentId;
    }
    if (departments.length === 1) {
      return departments[0].id;
    }
    const nameLower = adminName.toLowerCase();
    if (nameLower.includes('computing') || nameLower.includes('cs') || nameLower.includes('ai') || nameLower.includes('se') || nameLower.includes('tech')) {
      return 'computing';
    }
    if (nameLower.includes('business') || nameLower.includes('bba') || nameLower.includes('management') || nameLower.includes('finance')) {
      return 'business';
    }
    if (nameLower.includes('engineering') || nameLower.includes('ee') || nameLower.includes('electronic')) {
      return 'engineering';
    }
    if (nameLower.includes('fashion') || nameLower.includes('design') || nameLower.includes('media')) {
      return 'fashion_design';
    }
    if (nameLower.includes('humanities') || nameLower.includes('sciences')) {
      return 'humanities';
    }
    const saved = localStorage.getItem('IQRA_OBE_ADMIN_MANAGED_DEPT');
    if (saved && departments.some(d => d.id === saved)) {
      return saved;
    }
    return departments[0]?.id || 'computing';
  }, [departments, adminName, adminProfile]);

  // Programs belonging to the active admin's department
  const adminPrograms = useMemo(() => {
    return programs.filter(p => p.departmentId === managedDeptId);
  }, [programs, managedDeptId]);

  const currentDeptObj = useMemo(() => {
    return departments.find(d => d.id === managedDeptId);
  }, [departments, managedDeptId]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'semester-plans' | 'courses' | 'teachers' | 'teacher-assignments' | 'student-enrollment' | 'attainment-reports'>('semester-plans');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab 6: Reports State
  const [selectedReportProg, setSelectedReportProg] = useState<string>('bscs');
  const [selectedReportCourseCode, setSelectedReportCourseCode] = useState<string>('');
  const [programGAReport, setProgramGAReport] = useState<any>(null);
  const [courseAttainmentReport, setCourseAttainmentReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // New 6 reports sub-tab states
  const [subReportTab, setSubReportTab] = useState<'legacy' | 'co-summary' | 'po-attainment' | 'gap-analysis' | 'at-risk' | 'instructor-performance' | 'cohort-comparison'>('legacy');
  const [coSummaryReport, setCoSummaryReport] = useState<any>(null);
  const [poAttainmentReport, setPoAttainmentReport] = useState<any>(null);
  const [gapAnalysisReport, setGapAnalysisReport] = useState<any>(null);
  const [atRiskReport, setAtRiskReport] = useState<any>(null);
  const [instructorPerformanceReport, setInstructorPerformanceReport] = useState<any>(null);
  const [cohortComparisonReport, setCohortComparisonReport] = useState<any>(null);

  // Filters for new reports
  const [coSummarySemester, setCoSummarySemester] = useState<string>('Fall 2025');
  const [coSummaryYear, setCoSummaryYear] = useState<string>('2025');
  const [atRiskSemester, setAtRiskSemester] = useState<string>('Fall 2025');
  const [cohortGaId, setCohortGaId] = useState<string>('GA-1');

  // Tab 1: Semester Plans Edit State
  const [selectedPlanProg, setSelectedPlanProg] = useState<string>('bscs');
  const [selectedPlanSem, setSelectedPlanSem] = useState<string>('1st');
  const [planSearch, setPlanSearch] = useState<string>('');

  // Tab 2: Course Creation State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseType, setCourseType] = useState<'core' | 'elective'>('core');
  const [courseCreditHours, setCourseCreditHours] = useState<number>(3);
  const [courseSubtype, setCourseSubtype] = useState<'Theory' | 'Lab'>('Theory');
  const [courseDept, setCourseDept] = useState('computing');
  const [courseProg, setCourseProg] = useState('bscs');
  const [courseGAs, setCourseGAs] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  // Tab 3: Teacher Creation State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherEmployeeId, setTeacherEmployeeId] = useState('');
  const [teacherDesignation, setTeacherDesignation] = useState('Lecturer');
  const [teacherDept, setTeacherDept] = useState('computing');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Tab 4: Teacher Course Assignment State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedCourseCodeForTeacher, setSelectedCourseCodeForTeacher] = useState('');
  const [selectedProgramForTeacher, setSelectedProgramForTeacher] = useState('');
  const [assignmentAcademicYear, setAssignmentAcademicYear] = useState(getAutomaticAcademicYear());
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Tab 5: Student Binding State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentRegNo, setSelectedStudentRegNo] = useState<string>('');

  // Synchronize Tab 1 default program when adminPrograms load or change
  useEffect(() => {
    if (adminPrograms.length > 0) {
      const isValid = adminPrograms.some(p => p.id === selectedPlanProg);
      if (!isValid) {
        setSelectedPlanProg(adminPrograms[0].id);
      }
    }
  }, [adminPrograms, selectedPlanProg]);

  // Synchronize Tab 2 Department/Program default selection when managedDeptId loads/changes
  useEffect(() => {
    setCourseDept(managedDeptId);
    const pList = programs.filter(p => p.departmentId === managedDeptId);
    if (pList.length > 0) {
      setCourseProg(pList[0].id);
    }
  }, [managedDeptId, programs]);

  // Synchronize Tab 3 Department default selection when managedDeptId loads/changes
  useEffect(() => {
    setTeacherDept(managedDeptId);
  }, [managedDeptId]);
  const [selectedCourseCodeForStudent, setSelectedCourseCodeForStudent] = useState('');
  const [studentCourseStatuses, setStudentCourseStatuses] = useState<Record<string, Record<string, 'studied' | 'studying' | 'failed' | 'later' | 'deferred'>>>({});
  const [studentTab, setStudentTab] = useState<'all' | 'studying' | 'failed' | 'studied' | 'deferred'>('all');
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({
    "1st": true,
    "2nd": true,
    "3rd": true,
    "4th": true,
    "5th": true,
    "6th": true,
    "7th": true,
    "8th": true
  });

  // Tab 6 Reports computed list
  const reportCourses = useMemo(() => {
    return courses.filter(c => c.departmentId === managedDeptId && (!selectedReportProg || c.programId === selectedReportProg));
  }, [courses, managedDeptId, selectedReportProg]);

  useEffect(() => {
    if (reportCourses.length > 0) {
      const codeExists = reportCourses.some(c => c.code === selectedReportCourseCode);
      if (!codeExists) {
        setSelectedReportCourseCode(reportCourses[0].code);
      }
    } else {
      setSelectedReportCourseCode('');
    }
  }, [reportCourses, selectedReportCourseCode]);

  // Fetch New Reports
  useEffect(() => {
    if (activeTab !== 'attainment-reports') return;

    const fetchNewReports = async () => {
      setLoadingReport(true);
      try {
        if (subReportTab === 'co-summary' && selectedReportProg) {
          const data = await apiService.getCOAttainmentSummary(selectedReportProg, coSummarySemester, coSummaryYear);
          setCoSummaryReport(data);
        } else if (subReportTab === 'po-attainment' && selectedReportProg) {
          const data = await apiService.getPOAttainment(selectedReportProg);
          setPoAttainmentReport(data);
        } else if (subReportTab === 'gap-analysis' && selectedReportProg) {
          const data = await apiService.getGapAnalysis(selectedReportProg);
          setGapAnalysisReport(data);
        } else if (subReportTab === 'at-risk' && selectedReportProg) {
          const data = await apiService.getAtRiskStudents(selectedReportProg, atRiskSemester);
          setAtRiskReport(data);
        } else if (subReportTab === 'instructor-performance') {
          const data = await apiService.getInstructorPerformance(managedDeptId);
          setInstructorPerformanceReport(data);
        } else if (subReportTab === 'cohort-comparison' && selectedReportProg) {
          const data = await apiService.getCohortComparison(selectedReportProg, cohortGaId);
          setCohortComparisonReport(data);
        }
      } catch (err) {
        console.warn("Failed to fetch sub report:", err);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchNewReports();
  }, [subReportTab, selectedReportProg, coSummarySemester, coSummaryYear, atRiskSemester, cohortGaId, activeTab, managedDeptId]);

  // Fetch Program GA Attainment
  useEffect(() => {
    if (activeTab !== 'attainment-reports' || !selectedReportProg) return;

    const fetchProgramGAReport = async () => {
      setLoadingReport(true);
      try {
        const report = await apiService.getProgramGAAttainment(selectedReportProg);
        setProgramGAReport(report);
      } catch (err) {
        console.warn("Failed to fetch program GA report:", err);
        setProgramGAReport(null);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchProgramGAReport();
  }, [selectedReportProg, activeTab]);

  // Fetch Course Attainment
  useEffect(() => {
    if (activeTab !== 'attainment-reports' || !selectedReportCourseCode || !selectedReportProg) {
      setCourseAttainmentReport(null);
      return;
    }

    const fetchCourseReport = async () => {
      try {
        const report = await apiService.getCourseAttainment(selectedReportCourseCode, selectedReportProg);
        setCourseAttainmentReport(report);
      } catch (err) {
        console.warn("Failed to fetch course attainment report:", err);
        setCourseAttainmentReport(null);
      }
    };

    fetchCourseReport();
  }, [selectedReportCourseCode, selectedReportProg, activeTab]);

  // Load all initial data and set fallback local storage structures
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Load basic OBE data from service or localStorage
      let obData;
      const isBackend = !!localStorage.getItem('access');
      try {
        obData = await apiService.getAllData();
      } catch (err) {
        if (isBackend) {
          obData = { departments: [], programs: [], courses: [], gas: [] };
          setErrorMsg("Could not retrieve data from the backend server. Please make sure the server is online.");
        } else {
          obData = apiService.getLocalStorageData();
        }
      }
      setDepartments(obData.departments || []);
      setPrograms(obData.programs || []);
      setCourses(obData.courses || []);

      // 2. Load admin profile from backend
      try {
        const profile = await apiService.getDeptAdminProfile();
        setAdminProfile(profile);
      } catch (err) {
        console.warn("Failed to fetch admin profile from backend, using adminName detection.", err);
      }

      // 3. Load Students
      const studentList = await apiService.getStudents();
      setStudents(studentList);

      // 4. Load Teachers from backend or fallback to Local Storage
      let loadedTeachers: Teacher[] = [];
      try {
        const fetchedTeachers = await apiService.getTeachers();
        if (Array.isArray(fetchedTeachers)) {
          loadedTeachers = fetchedTeachers.map((t: any) => ({
            ...t,
            id: t.id,
            employeeId: t.employeeId || t.employee_id || t.id,
            name: t.name,
            email: t.email,
            departmentId: t.departmentId || t.department_id
          }));
        }
      } catch (err) {
        console.warn("Backend API for teachers offline. Falling back to local storage.");
        const savedTeachers = localStorage.getItem('IQRA_OBE_TEACHERS');
        if (savedTeachers) {
          loadedTeachers = JSON.parse(savedTeachers);
        } else {
          localStorage.setItem('IQRA_OBE_TEACHERS', JSON.stringify(DEFAULT_TEACHERS));
          loadedTeachers = DEFAULT_TEACHERS;
        }
      }
      setTeachers(loadedTeachers);

      // 5. Load Semester Plans from backend or fallback to Local Storage
      let loadedPlans: SemesterPlan[] = [];
      try {
        const fetchedPlans = await apiService.getSemesterPlans();
        if (Array.isArray(fetchedPlans)) {
          loadedPlans = fetchedPlans.map((p: any) => ({
            programId: p.programId,
            semester: p.semester,
            courseCodes: p.courseCodes || []
          }));
        }
      } catch (err) {
        console.warn("Backend API for semester plans offline. Falling back to local storage.");
        const savedPlans = localStorage.getItem('IQRA_OBE_SEMESTER_PLANS');
        if (savedPlans) {
          try {
            loadedPlans = JSON.parse(savedPlans);
          } catch (e) {
            loadedPlans = DEFAULT_SEMESTER_PLANS;
          }
        } else {
          loadedPlans = DEFAULT_SEMESTER_PLANS;
        }
      }
      setSemesterPlans(loadedPlans);

      // 6. Load Student Bindings
      const savedBindings = localStorage.getItem('IQRA_OBE_STUDENT_BINDINGS');
      let bindingsNeedReset = loadedPlans.length === 0;
      if (savedBindings && !bindingsNeedReset) {
        try {
          const parsedB = JSON.parse(savedBindings);
          if (parsedB.some((b: any) => b.courseCode === 'SE-311' || b.courseCode === 'AI-381')) {
            bindingsNeedReset = true;
          } else {
            setStudentBindings(parsedB);
          }
        } catch (e) {
          bindingsNeedReset = true;
        }
      } else {
        bindingsNeedReset = true;
      }

      if (bindingsNeedReset) {
        const defaultBindings: StudentCourseBinding[] = [];
        // Add BSCS 6th semester students
        ['012-fa22-22012', '045-fa22-22045', '089-fa22-22089', '104-fa22-22104'].forEach(regNo => {
          ['CMC381', 'CSC382', 'ESC311'].forEach(code => {
            defaultBindings.push({ studentRegNo: regNo, courseCode: code });
          });
        });
        // Add BSAI 4th semester students
        ['001-fa23-23001', '002-fa23-23002'].forEach(regNo => {
          ['CMC241', 'AIC212', 'MTE213', 'CMC252', 'MTE221', 'GER261'].forEach(code => {
            defaultBindings.push({ studentRegNo: regNo, courseCode: code });
          });
        });
        // Add BSAI 3rd semester student
        ['003-sp24-24003'].forEach(regNo => {
          ['CMC251', 'CMC222', 'AIC211', 'CMC261', 'MTE212'].forEach(code => {
            defaultBindings.push({ studentRegNo: regNo, courseCode: code });
          });
        });
        // Add BSAI 2nd semester student
        ['004-fa24-24004'].forEach(regNo => {
          ['CMC112', 'GER132', 'CMC121', 'GER142', 'GER122', 'MTE111'].forEach(code => {
            defaultBindings.push({ studentRegNo: regNo, courseCode: code });
          });
        });

        localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(defaultBindings));
        setStudentBindings(defaultBindings);
      }

      // 6.5 Load Custom Student Course Statuses
      const savedStatuses = localStorage.getItem('IQRA_OBE_STUDENT_COURSE_STATUSES');
      if (savedStatuses) {
        try {
          setStudentCourseStatuses(JSON.parse(savedStatuses));
        } catch (e) {
          console.error("Failed to parse custom student course statuses", e);
        }
      }

      // 7. Load Teacher Course Assignments from backend or fallback to Local Storage
      let loadedAssignments: TeacherCourseAssignment[] = [];
      try {
        const fetchedAssignments = await apiService.getCourseAssignments();
        if (Array.isArray(fetchedAssignments)) {
          loadedAssignments = fetchedAssignments.map((a: any) => ({
            teacherId: a.teacherId || a.instructor || a.employeeId,
            courseCode: a.courseCode || a.course_code || a.code,
            programId: a.programId || a.program_id || a.program,
            academicYear: a.academicYear || a.academic_year || 'Fall-2024',
            status: a.status || 'active'
          }));
        }
      } catch (err) {
        console.warn("Backend API for course assignments offline. Falling back to local storage.");
        const savedAssignments = localStorage.getItem('IQRA_OBE_TEACHER_ASSIGNMENTS');
        if (savedAssignments) {
          try {
            loadedAssignments = JSON.parse(savedAssignments);
          } catch (e) {
            loadedAssignments = [];
          }
        } else {
          loadedAssignments = [
            { teacherId: 'INS-CS-001', courseCode: 'CMC381', programId: 'bscs' },
            { teacherId: 'INS-CS-001', courseCode: 'AIC211', programId: 'bsai' },
            { teacherId: 'INS-CS-002', courseCode: 'CSC382', programId: 'bscs' },
            { teacherId: 'INS-CS-003', courseCode: 'AIC212', programId: 'bsai' },
            { teacherId: 'INS-CS-004', courseCode: 'CMC241', programId: 'bsse' }
          ];
          localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(loadedAssignments));
        }
      }
      setTeacherAssignments(loadedAssignments);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to synchronize department administration records.");
    } finally {
      setLoading(false);
    }
  };

  // Synchronizes changes in student/teacher assignments to the global `IQRA_OBE_INSTRUCTOR_COURSES`
  // so that the Instructor Dashboard seamlessly reflects the updated course schedules and student lists.
  const syncToInstructorCourses = (
    currentCourses: Course[],
    currentTeachers: Teacher[],
    currentAssignments: TeacherCourseAssignment[],
    currentBindings: StudentCourseBinding[],
    currentStudents: Student[]
  ) => {
    // 1. Get existing InstructorCourses list
    let existingInstructorCourses: InstructorCourse[] = [];
    try {
      existingInstructorCourses = apiService.getLocalInstructorCourses();
    } catch (e) {
      existingInstructorCourses = [];
    }

    // 2. We want to construct or update the list of InstructorCourses.
    // For each teacher assignment, we make sure an InstructorCourse exists.
    // If a course is not assigned to any teacher, it won't appear in the instructor's courses.
    const assignmentMap = new Map<string, { teacherId: string; courseCode: string; programId?: string; academicYear?: string }>();

    const updatedInstructorCourses: InstructorCourse[] = currentAssignments.map(assignment => {
      const teacher = currentTeachers.find(t => matchTeacher(t, assignment.teacherId));
      const course = currentCourses.find(c => c.code === assignment.courseCode);
      const matchedDept = departments.find(d => d.id === (course?.departmentId || 'computing'));
      
      const defaultDeptProgram = programs.find(p => p.departmentId === managedDeptId)?.id || 'bscs';
      const fallbackProgramId = course?.programId || programs.find(p => p.departmentId === course?.departmentId)?.id || defaultDeptProgram;
      const finalProgramId = assignment.programId || fallbackProgramId;
      const matchedProg = programs.find(p => p.id === finalProgramId);

      const employeeId = teacher?.employeeId || assignment.teacherId;
      let academicYear = assignment.academicYear || 'Fall-2024';
      academicYear = academicYear.replace(/ /g, '-');
      if (academicYear) {
        academicYear = academicYear.charAt(0).toUpperCase() + academicYear.slice(1);
      }
      const uniqId = `course-assigned-${assignment.courseCode}-${employeeId}-${finalProgramId}-${academicYear}`;

      assignmentMap.set(uniqId, {
        teacherId: employeeId,
        courseCode: assignment.courseCode,
        programId: finalProgramId || undefined,
        academicYear: academicYear || 'Fall-2024'
      });

      // Find matching students for this course based on bindings
      const studentRegs = currentBindings
        .filter(b => b.courseCode === assignment.courseCode)
        .map(b => b.studentRegNo);

      const courseStudents = currentStudents
        .filter(s => {
          const isBound = studentRegs.includes(s.regNo);
          if (!isBound) return false;
          if (assignment.programId) {
            return s.programId === assignment.programId;
          }
          return true;
        })
        .map(s => {
          // Preserve existing marks if student was already in this course
          const existingCourse = existingInstructorCourses.find(ec => ec.id === uniqId) || 
                                 existingInstructorCourses.find(ec => ec.code === assignment.courseCode && !ec.id.includes('-'));
          const existingStudent = existingCourse?.students.find(es => es.regNo === s.regNo);
          return {
            regNo: s.regNo,
            name: s.name,
            marks: existingStudent?.marks || {}
          };
        });

      // Find if this course already has initialized units/categories, otherwise set defaults
      const existingCourse = existingInstructorCourses.find(ec => ec.id === uniqId) || 
                             existingInstructorCourses.find(ec => ec.code === assignment.courseCode && !ec.id.includes('-'));
      
      const standardCategories = [
        { name: "Assignments", percentage: 15, units: 3 },
        { name: "Quizzes", percentage: 10, units: 3 },
        { name: "Class Participation", percentage: 5, units: 1 },
        { name: "Class Project", percentage: 15, units: 1 },
        { name: "Presentation", percentage: 5, units: 1 },
        { name: "Mid Term", percentage: 20, units: 1 },
        { name: "Final", percentage: 30, units: 1 }
      ];

      const standardUnitsData = {
        "Assignments": [
          { unitNo: 1, passing: 5, totalMarks: 10, weightage: 33.3 },
          { unitNo: 2, passing: 5, totalMarks: 10, weightage: 33.3 },
          { unitNo: 3, passing: 5, totalMarks: 10, weightage: 33.4 }
        ],
        "Quizzes": [
          { unitNo: 1, passing: 5, totalMarks: 10, weightage: 33.3 },
          { unitNo: 2, passing: 5, totalMarks: 10, weightage: 33.3 },
          { unitNo: 3, passing: 5, totalMarks: 10, weightage: 33.4 }
        ],
        "Class Participation": [{ unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }],
        "Class Project": [{ unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }],
        "Presentation": [{ unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }],
        "Mid Term": [{ unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }],
        "Final": [{ unitNo: 1, passing: 20, totalMarks: 40, weightage: 100 }]
      };

      const baseTitle = course?.title || 'Unknown Course';
      const finalTitle = assignment.programId && matchedProg ? `${baseTitle} (${matchedProg.code.toUpperCase()})` : baseTitle;

      return {
        id: existingCourse?.id || uniqId,
        code: assignment.courseCode,
        title: finalTitle,
        courseType: course?.courseType || 'Theory',
        departmentId: course?.departmentId || 'computing',
        departmentName: matchedDept?.name || 'Department of Computing and Technology',
        programId: finalProgramId,
        programName: matchedProg?.name || 'Bachelor of Science in Computer Science',
        creditHours: course?.creditHours !== undefined ? course.creditHours : 3,
        categories: existingCourse?.categories || standardCategories,
        unitsData: existingCourse?.unitsData || standardUnitsData,
        students: courseStudents,
        obeQuestions: existingCourse?.obeQuestions || [],
        obeMarks: existingCourse?.obeMarks || {},
        selectedGradingSystem: existingCourse?.selectedGradingSystem || 'relative',
        academicYear: academicYear || existingCourse?.academicYear || 'Fall-2024',
        status: assignment.status || existingCourse?.status || 'active'
      };
    });

    // Save to local storage
    localStorage.setItem('IQRA_OBE_INSTRUCTOR_COURSES', JSON.stringify(updatedInstructorCourses));

    // Sync enrollments to backend sequentially to avoid SQLite database locks (500 errors)
    (async () => {
      for (const ic of updatedInstructorCourses) {
        if (ic.students && ic.students.length > 0) {
          try {
            await apiService.enrollStudents(
              ic.id,
              ic.students.map(s => ({ regNo: s.regNo, name: s.name }))
            );
          } catch (e: any) {
            console.warn('Enrollment sync failed, attempting self-healing for:', ic.id, e);
            const errMsg = e.message || '';
            if (errMsg.toLowerCase().includes('not found')) {
              // Try to recreate assignment on backend
              const details = assignmentMap.get(ic.id);
              if (details) {
                try {
                  console.log('Re-creating missing assignment on backend for self-healing:', details);
                  await apiService.assignCourse(
                    details.teacherId,
                    details.courseCode,
                    details.programId,
                    details.academicYear
                  );
                  // Retry enrollment
                  await apiService.enrollStudents(
                    ic.id,
                    ic.students.map(s => ({ regNo: s.regNo, name: s.name }))
                  );
                  console.log('Self-healing enrollment sync successful for:', ic.id);
                  continue; // Succeeded! Skip warning toast
                } catch (retryErr: any) {
                  console.error('Self-healing retry failed:', retryErr);
                }
              }
            }
            // If self-healing failed or was not applicable, trigger warning toast
            triggerNotification(`Enrollment sync warning: ${e.message}`, true);
          }
        }
      }
    })();
  };

  // Show a status update or feedback message helper
  const triggerNotification = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMsg(message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(message);
      setErrorMsg(null);
    }
    setTimeout(() => {
      setErrorMsg(null);
      setSuccessMsg(null);
    }, 2000);
  };

  // === CORE FUNCTIONALITIES ===

  // 1. Create Course Manually
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim()) {
      triggerNotification("Please fill in the course code and title", true);
      return;
    }

    const uppercaseCode = courseCode.trim().toUpperCase();
    if (courses.some(c => c.code === uppercaseCode)) {
      triggerNotification(`Course with code ${uppercaseCode} already exists`, true);
      return;
    }

    const newCourse: Course = {
      id: `course-manual-${Date.now()}`,
      code: uppercaseCode,
      title: courseTitle.trim(),
      type: courseType,
      departmentId: courseDept,
      programId: courseProg,
      mappedGAs: courseGAs,
      creditHours: courseCreditHours,
      courseType: courseSubtype
    };

    try {
      await apiService.createCourse(newCourse);
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);

      // Clean inputs
      setCourseCode('');
      setCourseTitle('');
      setCourseGAs([]);
      setCourseCreditHours(3);
      setCourseSubtype('Theory');

      triggerNotification(`Course ${uppercaseCode} - ${newCourse.title} created successfully!`);
    } catch (err) {
      triggerNotification("Failed to save the new course.", true);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`Are you sure you want to permanently delete the course "${course.code} - ${course.title}"?`)) {
      return;
    }
    try {
      const idToDelete = course.id || course.code;
      await apiService.deleteCourse(idToDelete);
      setCourses(prev => prev.filter(c => (c.id !== course.id && c.code !== course.code)));
      triggerNotification(`Course ${course.code} deleted successfully.`);
    } catch (err: any) {
      triggerNotification(err.message || "Failed to delete the course.", true);
    }
  };

  // 2. Import Courses from Excel File
  const handleImportCoursesExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'idle', message: 'Reading file...' });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          setImportStatus({ type: 'error', message: 'The Excel file is empty.' });
          return;
        }

        let importedCount = 0;
        let skippedCount = 0;
        const currentLocalData = apiService.getLocalStorageData();
        const updatedCourseList = [...currentLocalData.courses];

        data.forEach((row, idx) => {
          const rawCode = row['Course Code'] || row['code'] || row['CourseCode'];
          const rawTitle = row['Course Title'] || row['title'] || row['CourseTitle'];
          const rawType = row['Type'] || row['type'] || 'core';
          const rawDept = row['Department ID'] || row['departmentId'] || 'computing';
          const rawProg = row['Program ID'] || row['programId'] || 'bscs';
          const rawGAs = row['Mapped GAs'] || row['mappedGAs'] || '';

          if (rawCode && rawTitle) {
            const codeClean = String(rawCode).trim().toUpperCase();
            // Check duplicates
            if (updatedCourseList.some(c => c.code === codeClean)) {
              skippedCount++;
            } else {
              const gaList = String(rawGAs).split(',').map(s => s.trim());
              const newC: Course = {
                id: `course-imported-${Date.now()}-${idx}`,
                code: codeClean,
                title: String(rawTitle).trim(),
                type: String(rawType).toLowerCase().includes('elective') ? 'elective' : 'core',
                departmentId: String(rawDept).trim().toLowerCase(),
                programId: String(rawProg).trim().toLowerCase(),
                mappedGAs: gaList
              };
              updatedCourseList.push(newC);
              importedCount++;
            }
          }
        });

        if (importedCount > 0) {
          const updatedDB = { ...currentLocalData, courses: updatedCourseList };
          apiService.saveLocalStorageData(updatedDB);
          setCourses(updatedCourseList);
          setImportStatus({ 
            type: 'success', 
            message: `Successfully imported ${importedCount} courses! (Skipped ${skippedCount} duplicate codes)` 
          });
          triggerNotification(`Imported ${importedCount} courses successfully!`);
        } else {
          setImportStatus({ 
            type: 'error', 
            message: `No new courses were imported. (Skipped ${skippedCount} duplicates)` 
          });
        }
      } catch (err: any) {
        console.error(err);
        setImportStatus({ type: 'error', message: 'Failed to parse Excel file. Check column headers.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadExcelTemplate = () => {
    const headers = [
      ["Course Code", "Course Title", "Type", "Department ID", "Program ID", "Mapped GAs"],
      ["CS-312", "Web Engineering", "core", "computing", "bscs", "GA-1, GA-2, GA-4"],
      ["SE-422", "Software Architecture", "core", "computing", "bscs", "GA-3, GA-4"],
      ["MKT-101", "Principles of Marketing", "core", "business", "bba", "GA-B1, GA-B3"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses Template");
    XLSX.writeFile(wb, "iqra_courses_import_template.xlsx");
  };

  // 3. Add Teachers
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherEmployeeId.trim()) {
      triggerNotification("Please fill in teacher name, institutional email, and employee ID", true);
      return;
    }

    const lowercaseEmail = teacherEmail.trim().toLowerCase();
    const empId = teacherEmployeeId.trim().toUpperCase();

    if (teachers.some(t => t.email.toLowerCase() === lowercaseEmail)) {
      triggerNotification(`Teacher with email ${lowercaseEmail} already registered`, true);
      return;
    }
    if (teachers.some(t => matchTeacher(t, empId))) {
      triggerNotification(`Teacher with employee ID ${empId} already registered`, true);
      return;
    }

    try {
      const payload = {
        name: teacherName.trim(),
        email: lowercaseEmail,
        employeeId: empId,
        designation: teacherDesignation,
        departmentId: teacherDept
      };

      const createdTeacher = await apiService.createTeacher(payload);

      const newTeacher: Teacher = {
        id: createdTeacher.employeeId || empId,
        employeeId: createdTeacher.employeeId || empId,
        name: createdTeacher.name || payload.name,
        email: createdTeacher.email || payload.email,
        departmentId: createdTeacher.departmentId || payload.departmentId,
        designation: createdTeacher.designation || payload.designation,
        departmentName: createdTeacher.departmentName
      };

      const updatedTeachers = [...teachers, newTeacher];
      setTeachers(updatedTeachers);
      localStorage.setItem('IQRA_OBE_TEACHERS', JSON.stringify(updatedTeachers));

      setTeacherName('');
      setTeacherEmail('');
      setTeacherEmployeeId('');
      setTeacherDesignation('Lecturer');

      triggerNotification(`Teacher ${newTeacher.name} registered. Default login password: ${DEFAULT_TEMP_PASSWORD}`);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to onboard faculty.", true);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    const t = teachers.find(x => matchTeacher(x, id));
    if (!t) return;
    
    if (window.confirm(`Are you sure you want to remove teacher ${t.name}?`)) {
      try {
        const empId = getTeacherId(t);
        await apiService.deleteTeacher(empId);

        const updatedTeachers = teachers.filter(x => !matchTeacher(x, empId));
        const updatedAssignments = teacherAssignments.filter(x => x.teacherId !== t.id && x.teacherId !== empId);

        setTeachers(updatedTeachers);
        setTeacherAssignments(updatedAssignments);

        localStorage.setItem('IQRA_OBE_TEACHERS', JSON.stringify(updatedTeachers));
        localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

        // Get all course codes that still have an active assignment after this removal
        const activeCourseCodesAfterRemoval = new Set(updatedAssignments.map(a => a.courseCode));

        // Drop bindings for courses that no longer have any teacher assigned
        const cleanedBindings = studentBindings.filter(b =>
          activeCourseCodesAfterRemoval.has(b.courseCode)
        );
        setStudentBindings(cleanedBindings);
        localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(cleanedBindings));

        syncToInstructorCourses(courses, updatedTeachers, updatedAssignments, cleanedBindings, students);
        triggerNotification(`Teacher ${t.name} and their assignments successfully deleted.`);
      } catch (err: any) {
        console.error(err);
        triggerNotification(err.message || `Failed to delete teacher ${t.name}`, true);
      }
    }
  };

  // 4. Assign Course to Teacher
  const handleAssignCourseToTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedCourseCodeForTeacher) {
      triggerNotification("Please select both a teacher and a course", true);
      return;
    }

    // Check if assignment already exists with same parameters
    const exists = teacherAssignments.some(
      a => a.teacherId === selectedTeacherId && 
           a.courseCode === selectedCourseCodeForTeacher &&
           a.programId === (selectedProgramForTeacher || undefined) &&
           a.academicYear === assignmentAcademicYear
    );

    if (exists) {
      triggerNotification(`This teacher assignment for course code ${selectedCourseCodeForTeacher} in program/term ${assignmentAcademicYear} already exists.`, true);
      return;
    }

    // Validation check: Another teacher cannot teach the same course in the same program/academic year
    const targetProg = selectedProgramForTeacher || undefined;
    const conflictingAssignment = teacherAssignments.find(a => {
      // Must be the same course code
      if (a.courseCode !== selectedCourseCodeForTeacher) return false;
      // Must be the same academic year
      if (a.academicYear !== assignmentAcademicYear) return false;
      // Must be a different teacher
      if (a.teacherId === selectedTeacherId) return false;

      // Program check:
      if (targetProg) {
        // Conflicting if the existing is "All Programs (Shared)" (undefined) or matches our target program
        return !a.programId || a.programId === targetProg;
      }
      // If we are assigning to "All Programs", it conflicts with any existing assignment for this course
      return true;
    });

    if (conflictingAssignment) {
      const conflictingTeacher = teachers.find(t => matchTeacher(t, conflictingAssignment.teacherId));
      const conflictingProgObj = programs.find(p => p.id === conflictingAssignment.programId);
      const progDesc = conflictingProgObj ? conflictingProgObj.code.toUpperCase() : 'All Programs (Shared)';
      
      triggerNotification(
        `Cannot assign course: ${selectedCourseCodeForTeacher} is already being taught by ${conflictingTeacher?.name || 'another teacher'} in ${progDesc} for ${assignmentAcademicYear}.`,
        true
      );
      return;
    }

    const newAssignment: TeacherCourseAssignment = {
      teacherId: selectedTeacherId,
      courseCode: selectedCourseCodeForTeacher,
      programId: selectedProgramForTeacher || undefined,
      academicYear: assignmentAcademicYear,
      status: 'active'
    };

    try {
      await apiService.assignCourse(
        selectedTeacherId,
        selectedCourseCodeForTeacher,
        selectedProgramForTeacher || undefined,
        assignmentAcademicYear
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to save course assignment to backend.", true);
      return;
    }

    const updatedAssignments = [...teacherAssignments, newAssignment];
    setTeacherAssignments(updatedAssignments);
    localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

    // Instantly sync changes into IQRA_OBE_INSTRUCTOR_COURSES
    syncToInstructorCourses(courses, teachers, updatedAssignments, studentBindings, students);

    const teacherObj = teachers.find(t => matchTeacher(t, selectedTeacherId));
    const progObj = programs.find(p => p.id === selectedProgramForTeacher);
    const suffix = progObj ? ` for ${progObj.code.toUpperCase()}` : '';
    triggerNotification(`Successfully assigned course ${selectedCourseCodeForTeacher}${suffix} to ${teacherObj?.name}`);
  };

  const handleRemoveTeacherAssignment = async (teacherId: string, courseCode: string, programId?: string) => {
    const assignment = teacherAssignments.find(
      a => a.teacherId === teacherId && 
           a.courseCode === courseCode && 
           a.programId === programId
    );
    const t = teachers.find(x => matchTeacher(x, teacherId));
    const employeeId = t?.employeeId || teacherId;
    const assignmentProgId = assignment?.programId || programId;
    const finalProgId = assignmentProgId || courses.find(c => c.code === courseCode)?.programId || programs.find(p => p.departmentId === managedDeptId)?.id || 'bscs';
    
    let acadYear = assignment?.academicYear || 'Fall-2024';
    acadYear = acadYear.replace(/ /g, '-');
    if (acadYear) {
      acadYear = acadYear.charAt(0).toUpperCase() + acadYear.slice(1);
    }
    const backendCourseId = `course-assigned-${courseCode}-${employeeId}-${finalProgId}-${acadYear}`;

    try {
      await apiService.removeCourseAssignment(teacherId, courseCode, programId, acadYear);
      await apiService.deleteInstructorCourse(backendCourseId);
    } catch (err: any) {
      console.warn("Failed to remove course assignment or instructor course from backend. Syncing locally.", err);
      if (err && err.message) {
        triggerNotification(`Warning: ${err.message}`, true);
      }
    }

    const updatedAssignments = teacherAssignments.filter(
      a => !(a.teacherId === teacherId && 
             a.courseCode === courseCode && 
             a.programId === programId)
    );
    setTeacherAssignments(updatedAssignments);
    localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

    // Get all course codes that still have an active assignment after this removal
    const activeCourseCodesAfterRemoval = new Set(updatedAssignments.map(a => a.courseCode));

    // Drop bindings for courses that no longer have any teacher assigned
    const cleanedBindings = studentBindings.filter(b =>
      activeCourseCodesAfterRemoval.has(b.courseCode)
    );
    setStudentBindings(cleanedBindings);
    localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(cleanedBindings));

    syncToInstructorCourses(courses, teachers, updatedAssignments, cleanedBindings, students);
    triggerNotification(`Removed course assignment ${courseCode} from teacher.`);
  };

  const handleFinalizeCourse = async (assignment: TeacherCourseAssignment) => {
    const teacher = teachers.find(t => matchTeacher(t, assignment.teacherId));
    const course = courses.find(c => c.code === assignment.courseCode);
    const defaultDeptProgram = programs.find(p => p.departmentId === managedDeptId)?.id || 'bscs';
    const fallbackProgramId = course?.programId || programs.find(p => p.departmentId === course?.departmentId)?.id || defaultDeptProgram;
    const finalProgramId = assignment.programId || fallbackProgramId;
    const employeeId = teacher?.employeeId || assignment.teacherId;
    let acadYear = assignment.academicYear || 'Fall-2024';
    acadYear = acadYear.replace(/ /g, '-');
    if (acadYear) {
      acadYear = acadYear.charAt(0).toUpperCase() + acadYear.slice(1);
    }
    const courseId = `course-assigned-${assignment.courseCode}-${employeeId}-${finalProgramId}-${acadYear}`;

    if (!window.confirm(`Are you sure you want to CLOSE THE SEMESTER for course ${assignment.courseCode} (${course?.title || ''})?\n\nThis will lock the course, snapshot current student marks, compute final letter grades & GPA, and finalize official transcripts. Instructors will NO LONGER be able to modify any marks.`)) {
      return;
    }

    try {
      // 1. Hit the backend finalize-course endpoint
      await apiService.finalizeCourse(courseId, acadYear);

      // 2. Locally mark assignment as closed
      const updatedAssignments = teacherAssignments.map(a => {
        if (a.teacherId === assignment.teacherId && a.courseCode === assignment.courseCode && a.programId === assignment.programId) {
          return { ...a, status: 'closed' as const };
        }
        return a;
      });

      setTeacherAssignments(updatedAssignments);
      localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

      // 3. Instantly sync changes to InstructorCourses
      syncToInstructorCourses(courses, teachers, updatedAssignments, studentBindings, students);

      triggerNotification(`Successfully finalized and closed ${assignment.courseCode} for academic year ${acadYear}. Transcripts generated!`);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to finalize and close course.", true);
    }
  };

  // 5. Manage Predefined Plans
  const handleAddCourseToSemesterPlan = async (code: string) => {
    const updatedPlans = semesterPlans.map(plan => {
      if (plan.programId === selectedPlanProg && plan.semester === selectedPlanSem) {
        if (plan.courseCodes.includes(code)) return plan;
        return { ...plan, courseCodes: [...plan.courseCodes, code] };
      }
      return plan;
    });

    // If plan doesn't exist yet, create it
    const planExists = semesterPlans.some(p => p.programId === selectedPlanProg && p.semester === selectedPlanSem);
    let finalPlans = updatedPlans;
    if (!planExists) {
      finalPlans = [...semesterPlans, { programId: selectedPlanProg, semester: selectedPlanSem, courseCodes: [code] }];
    }

    const activePlan = finalPlans.find(p => p.programId === selectedPlanProg && p.semester === selectedPlanSem);
    if (activePlan) {
      try {
        await apiService.saveSemesterPlan(activePlan.programId, activePlan.semester, activePlan.courseCodes);
      } catch (err) {
        console.warn("Failed to save semester plan to backend.", err);
      }
    }

    setSemesterPlans(finalPlans);
    localStorage.setItem('IQRA_OBE_SEMESTER_PLANS', JSON.stringify(finalPlans));
    triggerNotification(`Added course ${code} to ${selectedPlanProg.toUpperCase()} ${selectedPlanSem} plan.`);
  };

  const handleRemoveCourseFromSemesterPlan = async (code: string) => {
    const updatedPlans = semesterPlans.map(plan => {
      if (plan.programId === selectedPlanProg && plan.semester === selectedPlanSem) {
        return { ...plan, courseCodes: plan.courseCodes.filter(c => c !== code) };
      }
      return plan;
    });

    const activePlan = updatedPlans.find(p => p.programId === selectedPlanProg && p.semester === selectedPlanSem);
    if (activePlan) {
      try {
        await apiService.saveSemesterPlan(activePlan.programId, activePlan.semester, activePlan.courseCodes);
      } catch (err) {
        console.warn("Failed to update semester plan on backend.", err);
      }
    }

    setSemesterPlans(updatedPlans);
    localStorage.setItem('IQRA_OBE_SEMESTER_PLANS', JSON.stringify(updatedPlans));
    triggerNotification(`Removed course ${code} from ${selectedPlanProg.toUpperCase()} ${selectedPlanSem} plan.`);
  };

  // 6. Retrieve Registered Students & Auto-enroll based on Semester Plan
  const handleAutoEnrollStudents = () => {
    if (students.length === 0) {
      triggerNotification("No registered students found in Admissions.", true);
      return;
    }

    let enrollCount = 0;
    const newBindings: StudentCourseBinding[] = [...studentBindings];

    students.forEach(student => {
      const sem = student.semester || '1st';
      const prog = student.programId || 'bscs';

      // Find the predefined plan for this program and semester
      const plan = semesterPlans.find(p => p.programId === prog && p.semester === sem);
      if (plan && plan.courseCodes.length > 0) {
        plan.courseCodes.forEach(code => {
          // Check if already bound
          const alreadyBound = newBindings.some(
            b => b.studentRegNo === student.regNo && b.courseCode === code
          );
          if (!alreadyBound) {
            newBindings.push({ studentRegNo: student.regNo, courseCode: code });
            enrollCount++;
          }
        });
      }
    });

    setStudentBindings(newBindings);
    localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(newBindings));

    // Propagate to teacher dashboard courses immediately
    syncToInstructorCourses(courses, teachers, teacherAssignments, newBindings, students);

    if (enrollCount > 0) {
      triggerNotification(`Auto-enrollment complete! Enrolled students into ${enrollCount} semester-plan courses.`);
    } else {
      triggerNotification("All students are already fully enrolled according to their semester plans.", false);
    }
  };

  // 7. Manual Bind/Unbind for Specific Student
  const handleManualBindCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentRegNo || !selectedCourseCodeForStudent) {
      triggerNotification("Please select both a student and a course", true);
      return;
    }

    const alreadyBound = studentBindings.some(
      b => b.studentRegNo === selectedStudentRegNo && b.courseCode === selectedCourseCodeForStudent
    );

    if (alreadyBound) {
      triggerNotification("Student is already enrolled in this course.", true);
      return;
    }

    const newBinding: StudentCourseBinding = {
      studentRegNo: selectedStudentRegNo,
      courseCode: selectedCourseCodeForStudent
    };

    const updatedBindings = [...studentBindings, newBinding];
    setStudentBindings(updatedBindings);
    localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(updatedBindings));

    syncToInstructorCourses(courses, teachers, teacherAssignments, updatedBindings, students);

    const studentObj = students.find(s => s.regNo === selectedStudentRegNo);
    triggerNotification(`Manually enrolled ${studentObj?.name} in course ${selectedCourseCodeForStudent}`);
    setSelectedCourseCodeForStudent('');
  };

  const handleManualUnbindCourse = (regNo: string, code: string) => {
    const updatedBindings = studentBindings.filter(
      b => !(b.studentRegNo === regNo && b.courseCode === code)
    );
    setStudentBindings(updatedBindings);
    localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(updatedBindings));

    syncToInstructorCourses(courses, teachers, teacherAssignments, updatedBindings, students);

    const studentObj = students.find(s => s.regNo === regNo);
    triggerNotification(`Unenrolled ${studentObj?.name} from course ${code}`);
  };

  // Student academic pathway course status helpers
  const getCourseStatus = (studentRegNo: string, courseCode: string): 'studied' | 'studying' | 'failed' | 'later' | 'deferred' => {
    const student = students.find(s => s.regNo === studentRegNo);

    // 1. Is it currently bound/enrolled? If so, check if there is an active teacher assigned to this course.
    const hasTeacherAssigned = teacherAssignments.some(
      a => a.courseCode === courseCode && (!a.programId || a.programId === student?.programId)
    );

    const isStudying = studentBindings.some(
      b => b.studentRegNo === studentRegNo && b.courseCode === courseCode
    );
    if (isStudying && hasTeacherAssigned) return 'studying';

    // 2. Is there an explicit override?
    const studentOverrides = studentCourseStatuses[studentRegNo];
    if (studentOverrides && studentOverrides[courseCode]) {
      const overrideStatus = studentOverrides[courseCode];
      // If override is 'studying' but it's not in bindings anymore, it means it was unenrolled, so treat as deferred/failed/etc.
      if (overrideStatus !== 'studying') {
        return overrideStatus;
      }
    }

    // 3. Fallback to default calculation based on student's current semester vs course's semester
    if (!student) return 'deferred';

    // Find the course's semester in the student's program plans
    const coursePlan = semesterPlans.find(
      p => p.programId === student.programId && p.courseCodes.includes(courseCode)
    );

    if (!coursePlan) {
      // Not in the regular curriculum for this program (e.g. general department course)
      return 'deferred';
    }

    const parseSem = (semStr: string): number => {
      const num = parseInt(semStr);
      return isNaN(num) ? 1 : num;
    };

    const studentSemNum = parseSem(student.semester || '1st');
    const courseSemNum = parseSem(coursePlan.semester);

    if (courseSemNum < studentSemNum) {
      return 'studied'; // By default, courses in previous semesters are already completed
    } else if (courseSemNum === studentSemNum) {
      return 'deferred'; // Remaining/Deferred (not currently in bindings, but in current semester)
    } else {
      return 'later'; // Future semester
    }
  };

  const updateStudentCourseStatus = (studentRegNo: string, courseCode: string, newStatus: 'studied' | 'studying' | 'failed' | 'later' | 'deferred') => {
    // 1. Update bindings based on the new status
    let updatedBindings = [...studentBindings];
    const isCurrentlyEnrolled = studentBindings.some(
      b => b.studentRegNo === studentRegNo && b.courseCode === courseCode
    );

    if (newStatus === 'studying') {
      if (!isCurrentlyEnrolled) {
        updatedBindings.push({ studentRegNo, courseCode });
      }
    } else {
      if (isCurrentlyEnrolled) {
        updatedBindings = updatedBindings.filter(
          b => !(b.studentRegNo === studentRegNo && b.courseCode === courseCode)
        );
      }
    }

    setStudentBindings(updatedBindings);
    localStorage.setItem('IQRA_OBE_STUDENT_BINDINGS', JSON.stringify(updatedBindings));
    syncToInstructorCourses(courses, teachers, teacherAssignments, updatedBindings, students);

    // 2. Update custom statuses
    const updatedStatuses = {
      ...studentCourseStatuses,
      [studentRegNo]: {
        ...(studentCourseStatuses[studentRegNo] || {}),
        [courseCode]: newStatus
      }
    };
    setStudentCourseStatuses(updatedStatuses);
    localStorage.setItem('IQRA_OBE_STUDENT_COURSE_STATUSES', JSON.stringify(updatedStatuses));

    const studentObj = students.find(s => s.regNo === studentRegNo);
    const courseObj = courses.find(c => c.code === courseCode);
    
    // Custom notifications depending on transition
    let msg = `Updated ${courseCode} status for ${studentObj?.name}`;
    if (newStatus === 'studying') {
      msg = `Enrolled ${studentObj?.name} in ${courseCode} - ${courseObj?.title}`;
    } else if (newStatus === 'failed') {
      msg = `Marked ${courseCode} as Failed / Backlog for ${studentObj?.name}. They need to register for this backlog course.`;
    } else if (newStatus === 'studied') {
      msg = `Marked ${courseCode} as Already Studied / Passed for ${studentObj?.name}.`;
    } else if (newStatus === 'deferred') {
      msg = `Unenrolled ${studentObj?.name} from ${courseCode} (Moved to Deferred / Remaining).`;
    }
    triggerNotification(msg);
  };


  // === FILTER & SEARCH CALCULATIONS ===

  // Active Semester Plan Courses
  const activeSemesterPlanCourses = useMemo(() => {
    const plan = semesterPlans.find(p => p.programId === selectedPlanProg && p.semester === selectedPlanSem);
    return plan ? plan.courseCodes : [];
  }, [semesterPlans, selectedPlanProg, selectedPlanSem]);

  // Available courses (global courses that are NOT in any semester plan of the selected program)
  const availableCoursesForPlan = useMemo(() => {
    return courses.filter(c => {
      // Filter by department and program of current plan
      const deptMatch = c.departmentId === (programs.find(p => p.id === selectedPlanProg)?.departmentId || 'computing');
      const isAlreadyInAnyPlan = semesterPlans
        .filter(p => p.programId === selectedPlanProg)
        .some(p => p.courseCodes.includes(c.code));
      const searchMatch = planSearch === '' || 
        c.code.toLowerCase().includes(planSearch.toLowerCase()) || 
        c.title.toLowerCase().includes(planSearch.toLowerCase());
      
      return deptMatch && !isAlreadyInAnyPlan && searchMatch;
    });
  }, [courses, selectedPlanProg, semesterPlans, planSearch, programs]);

  // Course Filter List (Tab 2)
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const isSameDept = c.departmentId === managedDeptId;
      if (!isSameDept) return false;
      const q = courseSearch.toLowerCase().trim();
      return q === '' || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    });
  }, [courses, courseSearch, managedDeptId]);

  // Teacher Filter List (Tab 3)
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const isSameDept = t.departmentId === managedDeptId;
      if (!isSameDept) return false;
      const q = teacherSearch.toLowerCase().trim();
      return q === '' || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [teachers, teacherSearch, managedDeptId]);

  // Teacher Assignments Grid (Tab 4)
  const filteredAssignments = useMemo(() => {
    return teacherAssignments.filter(a => {
      const teacher = teachers.find(t => matchTeacher(t, a.teacherId));
      const course = courses.find(c => c.code === a.courseCode);
      if (!course || course.departmentId !== managedDeptId) {
        return false;
      }
      const q = assignmentSearch.toLowerCase().trim();

      return q === '' || 
        (teacher?.name || '').toLowerCase().includes(q) || 
        a.courseCode.toLowerCase().includes(q) || 
        (course?.title || '').toLowerCase().includes(q);
    });
  }, [teacherAssignments, teachers, courses, assignmentSearch, managedDeptId]);

  // Student Filter List (Tab 5)
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const isSameDept = s.departmentId === managedDeptId;
      if (!isSameDept) return false;
      const q = studentSearch.toLowerCase().trim();
      return q === '' || s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q);
    });
  }, [students, studentSearch, managedDeptId]);

  // Selected student's current bindings
  const selectedStudentCurrentCourses = useMemo(() => {
    if (!selectedStudentRegNo) return [];
    return studentBindings
      .filter(b => b.studentRegNo === selectedStudentRegNo)
      .map(b => courses.find(c => c.code === b.courseCode))
      .filter((c): c is Course => !!c);
  }, [selectedStudentRegNo, studentBindings, courses]);

  // Available courses to bind manually for selected student (of their department/program)
  const availableCoursesForSelectedStudent = useMemo(() => {
    if (!selectedStudentRegNo) return [];
    const student = students.find(s => s.regNo === selectedStudentRegNo);
    if (!student) return [];

    const enrolledCodes = selectedStudentCurrentCourses.map(c => c.code);

    return courses.filter(c => {
      // Must be same program or department and not already enrolled
      const isSameProgram = c.programId === student.programId;
      const isSameDept = c.departmentId === student.departmentId;
      const isNotEnrolled = !enrolledCodes.includes(c.code);
      return (isSameProgram || isSameDept) && isNotEnrolled;
    });
  }, [selectedStudentRegNo, students, courses, selectedStudentCurrentCourses]);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center space-y-4">
          <img 
            src="/iqralogo.png" 
            alt="Iqra University Logo" 
            className="mx-auto h-20 w-auto object-contain mb-2 animate-pulse"
            referrerPolicy="no-referrer"
          />
          <p className="text-sm font-sans font-semibold text-indigo-950 animate-pulse">Initializing Department Administrative Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/iqralogo.png" 
              alt="Iqra University Logo" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">OBE Department Administration</h1>
              <p className="text-xs font-semibold text-indigo-600/80 uppercase tracking-widest">
                {currentDeptObj ? `${currentDeptObj.name} Portal` : `${adminName}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* HORIZONTAL NAVBAR TABS */}
        <div className="border-t border-slate-100 bg-slate-50/40">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-6 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('semester-plans')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'semester-plans' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Semester Plans (Fixed)</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'courses' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Course Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teachers' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Faculty Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher-assignments')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teacher-assignments' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Teacher Assignments</span>
              </button>

              <button
                onClick={() => setActiveTab('student-enrollment')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'student-enrollment' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Student Enrollments</span>
              </button>

              <button
                onClick={() => setActiveTab('attainment-reports')}
                className={`flex items-center space-x-2 py-3.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'attainment-reports' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>OBE Attainment Reports</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* DYNAMIC NOTIFICATIONS */}
      <AnimatePresence>
        {successMsg && (
          <Toast
            message={successMsg}
            type="success"
            onClose={() => setSuccessMsg(null)}
          />
        )}
        {errorMsg && (
          <Toast
            message={errorMsg}
            type="error"
            onClose={() => setErrorMsg(null)}
          />
        )}
      </AnimatePresence>

      {/* DASHBOARD CONTENT WRAPPER */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8">
        
        {/* ACTIVE MODULE CONTAINER */}
        <section className="w-full">
          
          {/* TAB 1: PREDEFINED SEMESTER PLANS */}
          {activeTab === 'semester-plans' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Predefined Semester Plans</h2>
                    <p className="text-xs text-slate-500">Manage the fixed curriculum set of courses studying in each academic semester.</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <div>
                      <select 
                        value={selectedPlanProg} 
                        onChange={(e) => setSelectedPlanProg(e.target.value)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                      >
                        {adminPrograms.map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={selectedPlanSem} 
                        onChange={(e) => setSelectedPlanSem(e.target.value)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                      >
                        {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => (
                          <option key={s} value={s}>{s} Semester</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* CURRENT SEMESTER MAP */}
                <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-5 mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-3.5 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                    <span>Fixed Course Plan: {programs.find(p => p.id === selectedPlanProg)?.code} • {selectedPlanSem} Semester</span>
                  </h3>
                  
                  {activeSemesterPlanCourses.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-xs font-medium">
                      No courses mapped to this semester yet. Pick from the catalog list below to append.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {activeSemesterPlanCourses.map(code => {
                        const matchC = courses.find(c => c.code === code);
                        return (
                          <div 
                            key={code} 
                            className="bg-white border border-slate-200 hover:border-indigo-200 p-3.5 rounded-xl shadow-sm flex items-start justify-between gap-3 group transition-all"
                          >
                            <div className="min-w-0">
                              <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider mb-1.5">
                                {code}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 truncate">{matchC?.title || 'Unknown Course'}</h4>
                              <p className="text-[10px] font-semibold text-slate-400 capitalize">{matchC?.type || 'core'} course</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveCourseFromSemesterPlan(code)}
                              className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              title="Remove from Semester Plan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ADD COURSES TO CURRICULUM SECTION */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Core/Elective Courses</h3>
                    <div className="relative max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search global catalog..." 
                        value={planSearch} 
                        onChange={(e) => setPlanSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl outline-none text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  {availableCoursesForPlan.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 border border-slate-200/60 rounded-xl">
                      No matching courses available to add.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                      {availableCoursesForPlan.map(c => (
                        <div 
                          key={c.code}
                          className="bg-slate-50/50 border border-slate-200 hover:bg-white hover:border-slate-300 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                {c.code}
                              </span>
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded capitalize">
                                {c.type}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-700 truncate">{c.title}</h4>
                          </div>
                          <button
                            onClick={() => handleAddCourseToSemesterPlan(c.code)}
                            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: COURSE CATALOG & EXCEL IMPORT */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* CREATE MANUAL COURSE */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Manage Course Catalog</h2>
                <p className="text-xs text-slate-500 mb-6">Create courses individually or import standard curriculum mappings in bulk.</p>

                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Course Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SE-312"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl text-xs font-medium outline-none transition-all uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Course Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Web Engineering"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl text-xs font-medium outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Course Type</label>
                    <select 
                      value={courseType} 
                      onChange={(e) => setCourseType(e.target.value as 'core' | 'elective')}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="core">Core Course</option>
                      <option value="elective">Elective Course</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Course Subtype</label>
                    <select 
                      value={courseSubtype} 
                      onChange={(e) => setCourseSubtype(e.target.value as 'Theory' | 'Lab')}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="Theory">Theory</option>
                      <option value="Lab">Lab (Practical)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Credit Hours</label>
                    <select 
                      value={courseCreditHours} 
                      onChange={(e) => setCourseCreditHours(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="1">1 Credit Hour</option>
                      <option value="2">2 Credit Hours</option>
                      <option value="3">3 Credit Hours</option>
                      <option value="4">4 Credit Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Department</label>
                    <select 
                      value={courseDept} 
                      onChange={(e) => {
                        setCourseDept(e.target.value);
                        // Default first program of dept
                        const pList = programs.filter(p => p.departmentId === e.target.value);
                        if (pList.length > 0) setCourseProg(pList[0].id);
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      {departments.filter(d => d.id === managedDeptId).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Program (Curriculum)</label>
                    <select 
                      value={courseProg} 
                      onChange={(e) => setCourseProg(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      {programs.filter(p => p.departmentId === courseDept).map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Register Course</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* IMPORT EXCEL CONTAINER */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Import Courses in Bulk</h3>
                    <p className="text-[11px] text-slate-500">Upload standard Excel files to speed up onboarding catalogs.</p>
                  </div>
                  <button 
                    onClick={downloadExcelTemplate}
                    className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-600 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Excel Template</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 border-2 border-dashed border-slate-200 hover:border-indigo-400 p-5 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/5 text-center transition-all relative">
                    <input 
                      type="file" 
                      accept=".xlsx, .xls"
                      onChange={handleImportCoursesExcel}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileSpreadsheet className="mx-auto h-8 w-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Drag & drop your Excel sheet here, or click to browse</p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports XLSX, XLS files with standardized column headers</p>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl h-full flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Import Verification</h4>
                    {importStatus.type === 'idle' ? (
                      <p className="text-[11px] text-slate-500 italic">No files selected. Uploading will automatically parse and display skipped counts.</p>
                    ) : importStatus.type === 'success' ? (
                      <div className="space-y-1">
                        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                          <Check className="h-4.5 w-4.5" />
                          <span>Parsing Successful!</span>
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{importStatus.message}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1.5">
                          <AlertCircle className="h-4.5 w-4.5" />
                          <span>Parsing Failed</span>
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{importStatus.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* COURSE LISTING TABLE */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Current Catalog Registry</h3>
                    <p className="text-[11px] text-slate-500">System registers {courses.length} courses.</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search code or title..." 
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl outline-none text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-3 text-left">Code</th>
                        <th className="px-5 py-3 text-left">Title</th>
                        <th className="px-5 py-3 text-left">Type</th>
                        <th className="px-5 py-3 text-left">Subtype</th>
                        <th className="px-5 py-3 text-left">Credits</th>
                        <th className="px-5 py-3 text-left">Curriculum Program</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-white">
                      {filteredCourses.map(c => {
                        const matchedProg = programs.find(p => p.id === c.programId);
                        return (
                          <tr key={c.id || c.code} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-5 py-3.5 text-indigo-600 font-mono font-bold uppercase">{c.code}</td>
                            <td className="px-5 py-3.5 text-slate-800 font-bold">{c.title}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                c.type === 'core' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {c.type}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                c.courseType === 'Lab' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                              }`}>
                                {c.courseType || 'Theory'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-700 font-bold">
                              {c.creditHours !== undefined ? `${c.creditHours} Cr. Hr` : '3 Cr. Hr'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{matchedProg?.name || 'Computing Global'}</td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteCourse(c)}
                                className="text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-red-100 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                title="Delete Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* TAB 3: FACULTY MANAGEMENT */}
          {activeTab === 'teachers' && (
            <FacultyDirectoryTab
              teachers={teachers}
              departments={departments}
              teacherAssignments={teacherAssignments}
              managedDeptId={managedDeptId}
              onAddTeacher={async (name, email, employeeId, designation) => {
                const lowercaseEmail = email.trim().toLowerCase();
                const empId = employeeId.trim().toUpperCase();

                if (teachers.some(t => t.email.toLowerCase() === lowercaseEmail)) {
                  triggerNotification(`Teacher with email ${lowercaseEmail} already registered`, true);
                  return;
                }
                if (teachers.some(t => matchTeacher(t, empId))) {
                  triggerNotification(`Teacher with employee ID ${empId} already registered`, true);
                  return;
                }

                try {
                  const newT: Teacher = await apiService.createTeacher({
                    name,
                    email: lowercaseEmail,
                    employeeId: empId,
                    designation,
                    departmentId: managedDeptId,
                    password: DEFAULT_TEMP_PASSWORD
                  } as any);

                  const updatedTeachers = [...teachers, newT];
                  setTeachers(updatedTeachers);
                  triggerNotification(`Successfully onboarded ${name}. Temporary password is "${DEFAULT_TEMP_PASSWORD}".`);
                } catch (err: any) {
                  triggerNotification(err.message || 'Failed to onboard teacher', true);
                }
              }}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}


          {/* TAB 4: TEACHER COURSE ASSIGNMENT */}
          {activeTab === 'teacher-assignments' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Teacher Course Assignments</h2>
                <p className="text-xs text-slate-500 mb-6">Assign courses to faculty members. This automatically provisions their digital grading spreadsheets.</p>

                <form onSubmit={handleAssignCourseToTeacher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-slate-50/40 p-4 rounded-2xl border border-slate-100 mb-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Select Teacher</label>
                    <select 
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                      required
                    >
                      <option value="">Select Faculty...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.employeeId || t.id}>{t.name} ({t.employeeId || t.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Select Course Code</label>
                    <select 
                      value={selectedCourseCodeForTeacher}
                      onChange={(e) => setSelectedCourseCodeForTeacher(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                      required
                    >
                      <option value="">Select Course...</option>
                      {courses.filter(c => c.departmentId === managedDeptId).map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Target Program (Optional)</label>
                    <select 
                      value={selectedProgramForTeacher}
                      onChange={(e) => setSelectedProgramForTeacher(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="">All Programs (Shared)</option>
                      {adminPrograms.map(p => (
                        <option key={p.id} value={p.id}>{p.code.toUpperCase()} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Academic Year</label>
                    <select 
                      value={assignmentAcademicYear}
                      onChange={(e) => setAssignmentAcademicYear(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                      required
                    >
                      {getAcademicYearOptions().map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Link className="h-3.5 w-3.5" />
                      <span>Assign Course</span>
                    </button>
                  </div>
                </form>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Assigned Courses Grid</h3>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search teacher or course..." 
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl outline-none text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-3 text-left">Teacher</th>
                        <th className="px-5 py-3 text-left">Course</th>
                        <th className="px-5 py-3 text-left">Program</th>
                        <th className="px-5 py-3 text-center">Term / Year</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-white">
                      {filteredAssignments.map((a, idx) => {
                        const teacher = teachers.find(t => matchTeacher(t, a.teacherId));
                        const course = courses.find(c => c.code === a.courseCode);
                        const prog = programs.find(p => p.id === a.programId);
                        const isClosed = a.status === 'closed';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{teacher?.name || 'Unknown Teacher'}</div>
                              <div className="text-[10px] text-slate-400 font-mono font-normal">{teacher?.email || ''}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-mono font-bold text-indigo-650">{a.courseCode}</div>
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">{course?.title || ''}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prog ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                {prog ? prog.code.toUpperCase() : 'ALL PROGRAMS'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center font-mono text-slate-500 font-bold">
                              {a.academicYear || 'Fall-2024'}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {isClosed ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border border-emerald-200">
                                  <Lock className="w-2.5 h-2.5" />
                                  CLOSED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border border-sky-200">
                                  <span className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" />
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {!isClosed ? (
                                  <button
                                    onClick={() => handleFinalizeCourse(a)}
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-150 shadow-xs transition-all cursor-pointer"
                                    title="Close Semester & Generate Permanent Transcripts"
                                  >
                                    <Award className="h-3.5 w-3.5" />
                                    <span>Close Semester</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 italic bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100">
                                    <Award className="h-3.5 w-3.5" />
                                    Sealed
                                  </span>
                                )}
                                <button
                                  onClick={() => handleRemoveTeacherAssignment(a.teacherId, a.courseCode, a.programId)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all"
                                >
                                  <Unlink className="h-3.5 w-3.5" />
                                  <span>Unassign</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* TAB 5: STUDENT ENROLLMENTS */}
          {activeTab === 'student-enrollment' && (
            <div className="space-y-6">
              {/* SYSTEM LEVEL AUTOMATION BUTTON */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">Auto-Enroll Registered Students</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      Automatically pulls the registered students database from the Admissions section and assigns them to courses corresponding exactly with their program curriculum and current study semester plans.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleAutoEnrollStudents}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                      <span>Sync & Auto-Enroll Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* MANUAL INDIVIDUAL BINDINGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LIST OF STUDENTS */}
                <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Directory</h3>
                    <p className="text-[10px] text-slate-400">Select a student to edit manual course bindings.</p>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl outline-none text-xs font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {filteredStudents.map(s => {
                      const matchedProg = programs.find(p => p.id === s.programId);
                      const isSelected = selectedStudentRegNo === s.regNo;
                      return (
                        <button
                          key={s.regNo}
                          onClick={() => setSelectedStudentRegNo(s.regNo)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-0.5 ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-600/5' 
                              : 'border-slate-150 hover:bg-slate-50 bg-slate-50/20'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">{s.name}</span>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono font-bold tracking-tight text-slate-500 uppercase">{s.regNo}</span>
                            <span>{matchedProg?.code || s.programId.toUpperCase()} • {s.semester || '1st'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COURSE BINDING CONTROLS FOR SELECTED STUDENT */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  {selectedStudentRegNo === '' ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                      <Users className="h-12 w-auto text-slate-300 mb-3" />
                      <h4 className="text-xs font-bold text-slate-700">No Student Selected</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mt-1">Please pick a student from the directory sidebar to audit or manually edit their registered courses.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Student Details Card */}
                      {(() => {
                        const s = students.find(x => x.regNo === selectedStudentRegNo);
                        if (!s) return null;
                        const matchedProg = programs.find(p => p.id === s.programId);
                        
                        // Get all curriculum courses for this program
                        const progPlans = semesterPlans.filter(p => p.programId === s.programId);
                        const curriculumCodes: string[] = Array.from(new Set(progPlans.flatMap(p => p.courseCodes))) as string[];

                        let studiedCount = 0;
                        let studyingCount = 0;
                        let failedCount = 0;
                        let deferredCount = 0;
                        let laterCount = 0;

                        curriculumCodes.forEach(code => {
                          const stat = getCourseStatus(s.regNo, code);
                          if (stat === 'studied') studiedCount++;
                          else if (stat === 'studying') studyingCount++;
                          else if (stat === 'failed') failedCount++;
                          else if (stat === 'deferred') deferredCount++;
                          else if (stat === 'later') laterCount++;
                        });

                        // Count additional enrolled courses outside standard curriculum
                        const additionalEnrolled = selectedStudentCurrentCourses.filter(c => !curriculumCodes.includes(c.code));
                        studyingCount += additionalEnrolled.length;

                        return (
                          <div className="space-y-4">
                            <div className="bg-slate-50/50 p-5 border border-slate-200/80 rounded-2xl">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-800">{s.name}</h3>
                                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-200 uppercase font-mono">{s.regNo}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{matchedProg?.name || 'Undergraduate student'} • <span className="font-bold text-indigo-600">{s.semester || '1st'} Semester</span></p>
                                </div>
                                <div className="text-right flex flex-wrap md:flex-col gap-1.5 justify-start items-start md:items-end">
                                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                                    Managed Course Load: <span className="text-xs font-black">{studyingCount}</span> Active Courses
                                  </span>
                                  {studyingCount > 5 && (
                                    <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                                      ⚠️ Overloaded (&gt; 5 courses)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Counters Panel */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center transition-all">
                                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
                                <div className="text-lg font-black text-emerald-800 mt-0.5">{studiedCount}</div>
                              </div>
                              <div className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center transition-all">
                                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Studying</span>
                                <div className="text-lg font-black text-indigo-800 mt-0.5">{studyingCount}</div>
                              </div>
                              <div className="bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl p-3 text-center transition-all">
                                <span className="text-[9px] font-bold text-red-700 uppercase tracking-wider">Backlogs / Failed</span>
                                <div className="text-lg font-black text-red-800 mt-0.5">{failedCount}</div>
                              </div>
                              <div className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-xl p-3 text-center transition-all">
                                <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Deferred</span>
                                <div className="text-lg font-black text-amber-800 mt-0.5">{deferredCount}</div>
                              </div>
                              <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-center transition-all col-span-2 sm:col-span-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Future</span>
                                <div className="text-lg font-black text-slate-700 mt-0.5">{laterCount}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Pathway Advising policy tip */}
                      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs text-indigo-950 leading-relaxed">
                        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold">Student Pathway Advising Note</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            To register a student for a previous <strong>Failed / Backlog</strong> course, simply click <strong>Enroll Now</strong>. To keep their course load balanced (e.g. at 5 courses), you may drop a current semester course by marking it as <strong>Deferred / Remaining</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Add Custom Elective or Outside Course */}
                      <div className="bg-slate-50/40 border border-slate-200 p-4 rounded-xl space-y-2.5">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Enroll in Outside / Department Elective Course</h4>
                        <form onSubmit={handleManualBindCourse} className="flex gap-3">
                          <select
                            value={selectedCourseCodeForStudent}
                            onChange={(e) => setSelectedCourseCodeForStudent(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                            required
                          >
                            <option value="">Choose Course...</option>
                            {availableCoursesForSelectedStudent.map(c => (
                              <option key={c.code} value={c.code}>{c.code} - {c.title} ({c.type})</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Enroll</span>
                          </button>
                        </form>
                      </div>

                      {/* Filter Sub-Tabs */}
                      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1.5">
                        <button
                          onClick={() => setStudentTab('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            studentTab === 'all' 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          📋 All Curriculum
                        </button>
                        <button
                          onClick={() => setStudentTab('studying')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            studentTab === 'studying' 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Studying Now
                        </button>
                        <button
                          onClick={() => setStudentTab('failed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            studentTab === 'failed' 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Failed / Backlogs
                        </button>
                        <button
                          onClick={() => setStudentTab('studied')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            studentTab === 'studied' 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </button>
                        <button
                          onClick={() => setStudentTab('deferred')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            studentTab === 'deferred' 
                              ? 'bg-amber-600 text-white shadow-xs' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Deferred
                        </button>
                      </div>

                      {/* Course Catalog List Display */}
                      <div className="space-y-4">
                        {(() => {
                          const s = students.find(x => x.regNo === selectedStudentRegNo);
                          if (!s) return null;

                          const progPlans = semesterPlans.filter(p => p.programId === s.programId);
                          const orderedSemestersList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
                          
                          // Sort semester plans in typical ordered list
                          const sortedPlans = progPlans.sort((a, b) => orderedSemestersList.indexOf(a.semester) - orderedSemestersList.indexOf(b.semester));

                          // If showing filtered tabs (e.g. Failed, Studying, etc.)
                          if (studentTab !== 'all') {
                            const filteredCourses = courses.filter(c => {
                              // Filter courses matching the specific status
                              const isSameProg = c.programId === s.programId;
                              const isSameDept = c.departmentId === s.departmentId;
                              if (!isSameProg && !isSameDept) return false;
                              
                              const stat = getCourseStatus(s.regNo, c.code);
                              return stat === studentTab;
                            });

                            if (filteredCourses.length === 0) {
                              return (
                                <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs font-medium bg-slate-50/50">
                                  No courses found with status "{studentTab.toUpperCase()}" for this student.
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-2.5">
                                {filteredCourses.map(c => {
                                  const status = getCourseStatus(s.regNo, c.code);
                                  return (
                                    <div 
                                      key={c.code}
                                      className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-mono text-[10px] font-black text-indigo-600 uppercase">{c.code}</span>
                                          <span className={`text-[9px] font-bold px-1.5 rounded-full capitalize ${
                                            c.type === 'core' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                          }`}>
                                            {c.type}
                                          </span>
                                        </div>
                                        <h5 className="text-xs font-black text-slate-800">{c.title}</h5>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {/* Status actions */}
                                        {status === 'studying' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studied')}
                                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-150 transition-all flex items-center gap-1 cursor-pointer"
                                              title="Mark course as successfully passed"
                                            >
                                              <Check className="h-3 w-3" />
                                              <span>Pass</span>
                                            </button>
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'failed')}
                                              className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-150 transition-all flex items-center gap-1 cursor-pointer"
                                              title="Mark course as failed (needs repeat)"
                                            >
                                              <AlertCircle className="h-3 w-3" />
                                              <span>Fail</span>
                                            </button>
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'deferred')}
                                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                                              title="Unenroll and defer to later"
                                            >
                                              <Unlink className="h-3 w-3" />
                                              <span>Drop</span>
                                            </button>
                                          </div>
                                        )}

                                        {status === 'failed' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studying')}
                                              className="bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                              title="Enroll student in current semester as backlog repeat"
                                            >
                                              <Plus className="h-3 w-3" />
                                              <span>Enroll Now</span>
                                            </button>
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studied')}
                                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-150 transition-all cursor-pointer"
                                              title="Mark course as passed/completed"
                                            >
                                              <span>Mark Passed</span>
                                            </button>
                                          </div>
                                        )}

                                        {status === 'deferred' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studying')}
                                              className="bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                              title="Enroll in current term studying schedule"
                                            >
                                              <Plus className="h-3 w-3" />
                                              <span>Enroll Now</span>
                                            </button>
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studied')}
                                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-150 transition-all cursor-pointer"
                                              title="Mark as already completed"
                                            >
                                              <span>Mark Passed</span>
                                            </button>
                                          </div>
                                        )}

                                        {status === 'studied' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'failed')}
                                              className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-150 transition-all cursor-pointer"
                                              title="Change status to failed backlog"
                                            >
                                              <span>Mark Failed</span>
                                            </button>
                                            <button
                                              onClick={() => updateStudentCourseStatus(s.regNo, c.code, 'studying')}
                                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-300 transition-all cursor-pointer"
                                              title="Repeat course enrollment"
                                            >
                                              <span>Enroll (Repeat)</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }

                          // General "All Curriculum" View - grouped by curriculum semesters
                          return (
                            <div className="space-y-4">
                              {sortedPlans.map(plan => {
                                const isExpanded = expandedSemesters[plan.semester] !== false;
                                return (
                                  <div 
                                    key={plan.semester} 
                                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                                  >
                                    {/* Semester header row */}
                                    <button
                                      onClick={() => setExpandedSemesters({
                                        ...expandedSemesters,
                                        [plan.semester]: !isExpanded
                                      })}
                                      className="w-full bg-slate-50/55 hover:bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between text-left transition-all"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-800">{plan.semester} Semester Plan</span>
                                        <span className="bg-slate-200/60 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                          {plan.courseCodes.length} Courses
                                        </span>
                                      </div>
                                      <div>
                                        {isExpanded ? (
                                          <ChevronUp className="h-4 w-4 text-slate-400" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4 text-slate-400" />
                                        )}
                                      </div>
                                    </button>

                                    {/* Expandable courses list */}
                                    {isExpanded && (
                                      <div className="p-4 space-y-3.5 divide-y divide-slate-100 bg-white">
                                        {plan.courseCodes.map((code, idx) => {
                                          const cObj = courses.find(c => c.code === code);
                                          const status = getCourseStatus(s.regNo, code);
                                          if (!cObj) return null;

                                          return (
                                            <div 
                                              key={code} 
                                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 ${idx === 0 ? 'pt-0' : ''}`}
                                            >
                                              <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-mono text-[10px] font-black text-indigo-600 uppercase">{code}</span>
                                                  
                                                  {/* Status badge */}
                                                  {status === 'studied' && (
                                                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                                                      <Check className="h-2.5 w-2.5" /> Completed
                                                    </span>
                                                  )}
                                                  {status === 'studying' && (
                                                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-150 flex items-center gap-0.5">
                                                      <BookOpen className="h-2.5 w-2.5" /> Studying Now
                                                    </span>
                                                  )}
                                                  {status === 'failed' && (
                                                    <span className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-0.5">
                                                      <AlertCircle className="h-2.5 w-2.5" /> Failed / Backlog
                                                    </span>
                                                  )}
                                                  {status === 'deferred' && (
                                                    <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-0.5">
                                                      <Clock className="h-2.5 w-2.5" /> Deferred
                                                    </span>
                                                  )}
                                                  {status === 'later' && (
                                                    <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                                      Future Sem
                                                    </span>
                                                  )}
                                                </div>
                                                <h5 className="text-xs font-black text-slate-800">{cObj.title}</h5>
                                              </div>

                                              {/* Actions column */}
                                              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                                {status === 'studying' && (
                                                  <>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studied')}
                                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-emerald-150 transition-all flex items-center gap-0.5 cursor-pointer"
                                                      title="Mark as passed"
                                                    >
                                                      <Check className="h-2.5 w-2.5" /> Pass
                                                    </button>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'failed')}
                                                      className="bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-red-150 transition-all flex items-center gap-0.5 cursor-pointer"
                                                      title="Mark as failed"
                                                    >
                                                      <AlertCircle className="h-2.5 w-2.5" /> Fail
                                                    </button>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'deferred')}
                                                      className="bg-slate-50 hover:bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                                      title="Unenroll/Drop course"
                                                    >
                                                      Drop
                                                    </button>
                                                  </>
                                                )}

                                                {status === 'failed' && (
                                                  <>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studying')}
                                                      className="bg-indigo-600 hover:bg-indigo-750 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-xs transition-all flex items-center gap-0.5 cursor-pointer"
                                                      title="Enroll backlog in current term"
                                                    >
                                                      <Plus className="h-2.5 w-2.5" /> Enroll Now
                                                    </button>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studied')}
                                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-emerald-150 transition-all cursor-pointer"
                                                    >
                                                      Mark Passed
                                                    </button>
                                                  </>
                                                )}

                                                {status === 'deferred' && (
                                                  <>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studying')}
                                                      className="bg-indigo-600 hover:bg-indigo-750 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-xs transition-all flex items-center gap-0.5 cursor-pointer"
                                                    >
                                                      <Plus className="h-2.5 w-2.5" /> Enroll Now
                                                    </button>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studied')}
                                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-emerald-150 transition-all cursor-pointer"
                                                    >
                                                      Mark Passed
                                                    </button>
                                                  </>
                                                )}

                                                {status === 'studied' && (
                                                  <>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'failed')}
                                                      className="bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-red-150 transition-all cursor-pointer"
                                                    >
                                                      Mark Failed
                                                    </button>
                                                    <button
                                                      onClick={() => updateStudentCourseStatus(s.regNo, code, 'studying')}
                                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                                    >
                                                      Repeat
                                                    </button>
                                                  </>
                                                )}

                                                {status === 'later' && (
                                                  <button
                                                    onClick={() => updateStudentCourseStatus(s.regNo, code, 'studying')}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-0.5 cursor-pointer"
                                                    title="Enroll early"
                                                  >
                                                    <Plus className="h-2.5 w-2.5" /> Enroll Early
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OBE ATTAINMENT REPORTS */}
          {activeTab === 'attainment-reports' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Program selection and info header */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">Department OBE Attainment Analytics</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      Monitor student competencies, Washington Accord Graduate Attribute (GA) compliance, and Course Learning Outcome (CLO) attainment percentages across your department programs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">Active Program:</span>
                    <select
                      value={selectedReportProg}
                      onChange={(e) => setSelectedReportProg(e.target.value)}
                      className="bg-slate-50 text-xs font-bold text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                    >
                      {adminPrograms.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-Reports Switcher */}
              <div className="flex flex-wrap gap-2 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/40">
                <button
                  onClick={() => setSubReportTab('legacy')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'legacy' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>GA & Course Profile</span>
                </button>
                <button
                  onClick={() => setSubReportTab('co-summary')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'co-summary' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>CO Attainment Summary</span>
                </button>
                <button
                  onClick={() => setSubReportTab('po-attainment')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'po-attainment' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>PO Attainment Profile</span>
                </button>
                <button
                  onClick={() => setSubReportTab('gap-analysis')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'gap-analysis' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Gap Analysis Ledger</span>
                </button>
                <button
                  onClick={() => setSubReportTab('at-risk')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'at-risk' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>At-Risk Students</span>
                </button>
                <button
                  onClick={() => setSubReportTab('instructor-performance')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'instructor-performance' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Instructor Performance</span>
                </button>
                <button
                  onClick={() => setSubReportTab('cohort-comparison')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    subReportTab === 'cohort-comparison' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Cohort Comparison</span>
                </button>
              </div>

              {loadingReport ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-20 flex flex-col items-center justify-center text-slate-400 gap-3 shadow-sm">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">Loading real-time reporting analytics...</span>
                </div>
              ) : (
                <>
                  {/* VIEW 1: LEGACY GA & COURSE PROFILE */}
                  {subReportTab === 'legacy' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* PANEL 1: PROGRAM-WIDE GA ATTAINMENT */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
                            Graduate Attribute (GA) Attainment Profile
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Aggregated student score metrics across all contributing courses mapping to program attributes.
                          </p>
                        </div>

                        {programGAReport && programGAReport.attributes && programGAReport.attributes.length > 0 ? (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            <div className="bg-slate-50 p-3.5 border border-slate-200/50 rounded-xl flex items-center justify-between text-xs text-slate-500 font-bold">
                              <span>Attainment Threshold:</span>
                              <span className="font-mono text-indigo-950 font-black">{programGAReport.attainmentThreshold || 50}%</span>
                            </div>
                            
                            {programGAReport.attributes.map((attr: any) => {
                              const score = attr.averageAttainment || attr.score || 0;
                              const scorePct = Math.min(100, Math.max(0, score));
                              const isPassed = score >= (programGAReport.attainmentThreshold || 50);

                              return (
                                <div 
                                  key={attr.id}
                                  className="bg-slate-50/40 border border-slate-200/60 p-4.5 rounded-xl hover:bg-white transition-all space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                                        {attr.id}
                                      </span>
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                        isPassed 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                          : 'bg-amber-50 text-amber-700 border-amber-100'
                                      }`}>
                                        {isPassed ? 'Passed' : 'Needs Review'}
                                      </span>
                                    </div>
                                    <span className="font-mono text-xs text-slate-400 font-bold">
                                      {attr.contributingCoursesCount || attr.contributingCourses?.length || 0} Courses mapped
                                    </span>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800">{attr.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{attr.description || 'Washington Accord compliance attribute measure.'}</p>
                                  </div>

                                  <div className="space-y-1 pt-1">
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                                      <span>Average Attainment score:</span>
                                      <span className="font-mono text-indigo-950 font-black">{score.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isPassed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${scorePct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                            No attributes found. Assign GAs inside your Course Catalog.
                          </div>
                        )}
                      </div>

                      {/* PANEL 2: COURSE ATTAINMENT */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                              <GraduationCap className="h-4.5 w-4.5 text-indigo-600" />
                              Course Attainment Ledger
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Select a course within the department to inspect target outcome attainment.
                            </p>
                          </div>
                          <div>
                            <select
                              value={selectedReportCourseCode}
                              onChange={(e) => setSelectedReportCourseCode(e.target.value)}
                              className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none w-full sm:w-44 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                            >
                              <option value="">Select Course...</option>
                              {reportCourses.map(c => (
                                <option key={c.code} value={c.code}>{c.code} - {c.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {!selectedReportCourseCode ? (
                          <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
                            <GraduationCap className="h-12 w-auto text-slate-300 mb-3" />
                            <h4 className="text-xs font-bold text-slate-700">No Course Selected</h4>
                            <p className="text-[11px] text-slate-400 max-w-xs mt-1">Choose a course from the dropdown above to view its real-time CLO-to-GA attainment metrics.</p>
                          </div>
                        ) : courseAttainmentReport ? (
                          <div className="space-y-6">
                            
                            {/* Metric widgets */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-center space-y-1">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Average Marks</p>
                                <p className="text-xl font-mono font-black text-indigo-950">
                                  {courseAttainmentReport.averageMarks?.toFixed(1) || '0.0'}
                                  <span className="text-[11px] text-slate-400 font-bold ml-1">/ {courseAttainmentReport.maxMarks || 100}</span>
                                </p>
                              </div>
                              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-center space-y-1">
                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pass Rate</p>
                                <p className="text-xl font-mono font-black text-emerald-700">
                                  {courseAttainmentReport.passedCount || 0}
                                  <span className="text-[11px] text-slate-400 font-bold font-sans ml-1">of {courseAttainmentReport.totalCount || 0} students</span>
                                </p>
                              </div>
                            </div>

                            {/* Course Attainment Gauge */}
                            <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-indigo-950">Overall Attainment Percentage</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  courseAttainmentReport.attainmentStatus === 'Passed' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {courseAttainmentReport.attainmentStatus || 'Passed'}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                                  <span>Index score:</span>
                                  <span className="font-mono text-indigo-950 font-black">{courseAttainmentReport.attainmentPercentage?.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      courseAttainmentReport.attainmentStatus === 'Passed' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${courseAttainmentReport.attainmentPercentage || 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Mapped GAs List */}
                            {courseAttainmentReport.mappedGA && courseAttainmentReport.mappedGA.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Attributes Mapping</h4>
                                <div className="flex flex-wrap gap-2">
                                  {courseAttainmentReport.mappedGA.map((gaCode: string, idx: number) => (
                                    <span key={idx} className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                                      {gaCode}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                            No OBE marks or target mapping data found for this course.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: CO ATTAINMENT SUMMARY */}
                  {subReportTab === 'co-summary' && coSummaryReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
                            Course-Level Learning Outcome (CLO) Summary
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Real-time outcome attainment matrices across department courses.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            value={coSummarySemester}
                            onChange={(e) => setCoSummarySemester(e.target.value)}
                            className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none"
                          >
                            <option value="Fall 2025">Fall 2025</option>
                            <option value="Spring 2025">Spring 2025</option>
                            <option value="Fall 2024">Fall 2024</option>
                          </select>
                          <select
                            value={coSummaryYear}
                            onChange={(e) => setCoSummaryYear(e.target.value)}
                            className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none"
                          >
                            <option value="2025">Academic Year 2025</option>
                            <option value="2024">Academic Year 2024</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {coSummaryReport.courses && coSummaryReport.courses.map((c: any, i: number) => (
                          <div key={i} className="border border-slate-200/80 rounded-2xl p-5 hover:bg-slate-50/30 transition-all space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{c.courseCode}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">Class Size: {c.classSize} students</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800">{c.courseTitle}</h4>
                              </div>
                              <div className="flex items-center gap-3 self-start sm:self-center">
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Course Average</p>
                                  <p className="text-sm font-mono font-black text-indigo-950">{c.courseAverage}%</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  c.courseTier === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  c.courseTier === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {c.courseTier} Tier
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                              {Object.entries(c.cloAttainments).map(([cloCode, attainment]: [string, any]) => (
                                <div key={cloCode} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-extrabold text-indigo-700 uppercase">{cloCode}</span>
                                    <span className={`text-[9px] font-bold px-1.5 rounded-full ${
                                      attainment.tier === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                      attainment.tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                      'bg-rose-100 text-rose-800'
                                    }`}>
                                      {attainment.tier}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                      <span>Attainment:</span>
                                      <span className="font-mono text-indigo-950">{attainment.attainmentRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          attainment.tier === 'High' ? 'bg-emerald-500' :
                                          attainment.tier === 'Medium' ? 'bg-amber-500' :
                                          'bg-rose-500'
                                        }`}
                                        style={{ width: `${attainment.attainmentRate}%` }}
                                      />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-mono text-right mt-1">
                                      Passed: {attainment.passedCount}/{attainment.totalCount}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: PO ATTAINMENT PROFILE */}
                  {subReportTab === 'po-attainment' && poAttainmentReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Layers className="h-4.5 w-4.5 text-indigo-600" />
                          Program Learning Outcome (PLO) Attainment Dashboard
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Washington Accord engineering capability parameters audit.
                        </p>
                      </div>

                      {/* Header overview metrics */}
                      <div className="bg-indigo-50/40 border border-indigo-100/50 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Overall Program Attainment</span>
                          <h4 className="text-lg font-bold text-indigo-950">{poAttainmentReport.programName}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Attainment Rate</p>
                            <p className="text-2xl font-mono font-black text-indigo-950">{poAttainmentReport.overallAttainment}%</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            poAttainmentReport.overallTier === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {poAttainmentReport.overallTier} Tier
                          </span>
                        </div>
                      </div>

                      {/* Custom SVG Bar Profile to act as Radar replacement */}
                      <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">PLO Attainment Matrix Visualizer</h4>
                        <div className="space-y-3">
                          {poAttainmentReport.radarData && poAttainmentReport.radarData.map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4">
                              <span className="font-mono text-[10px] font-black text-indigo-950 w-10 shrink-0">{d.po}</span>
                              <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden relative">
                                <div 
                                  className="h-full bg-indigo-600 transition-all duration-1000"
                                  style={{ width: `${d.attainment}%` }}
                                />
                                <span className="absolute inset-y-0 left-2.5 flex items-center text-[9px] font-black text-white font-mono drop-shadow">
                                  {d.attainment}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PO detailed cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {poAttainmentReport.pos && poAttainmentReport.pos.map((p: any, i: number) => (
                          <div key={i} className="border border-slate-200 bg-white p-5 rounded-2xl hover:border-slate-300 transition-all space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded uppercase">{p.poId}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  p.hecStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  p.hecStatus === 'Review Required' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                  'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {p.hecStatus}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                p.tier === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                p.tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {p.tier}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-slate-800">{p.text}</h5>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                                <span>Index Attainment:</span>
                                <span className="font-mono text-indigo-950 font-black">{p.attainment}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    p.tier === 'High' ? 'bg-emerald-500' :
                                    p.tier === 'Medium' ? 'bg-amber-500' :
                                    'bg-rose-500'
                                  }`}
                                  style={{ width: `${p.attainment}%` }}
                                />
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Mapped Washington Accord GAs:</span>
                              {p.mappedGAs && p.mappedGAs.map((ga: string, j: number) => (
                                <span key={j} className="bg-slate-100 text-slate-600 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">{ga}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW 4: GAP ANALYSIS LEDGER */}
                  {subReportTab === 'gap-analysis' && gapAnalysisReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Sliders className="h-4.5 w-4.5 text-indigo-600" />
                          Washington Accord Graduate Attribute (GA) Gap Analysis
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Assess deficient program competencies and map academic improvement targets.
                        </p>
                      </div>

                      {/* Summary blocks */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-center">
                          <p className="text-[9px] font-bold uppercase text-slate-400">Total Attributes</p>
                          <p className="text-xl font-mono font-black text-slate-800">{gapAnalysisReport.summary.total}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-200/60 p-4 rounded-xl text-center">
                          <p className="text-[9px] font-bold uppercase text-rose-500">Critical Gaps</p>
                          <p className="text-xl font-mono font-black text-rose-700">{gapAnalysisReport.summary.critical}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl text-center">
                          <p className="text-[9px] font-bold uppercase text-amber-500">Moderate Gaps</p>
                          <p className="text-xl font-mono font-black text-amber-700">{gapAnalysisReport.summary.moderate}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-xl text-center">
                          <p className="text-[9px] font-bold uppercase text-emerald-500">Healthy GAs</p>
                          <p className="text-xl font-mono font-black text-emerald-700">{gapAnalysisReport.summary.healthy}</p>
                        </div>
                      </div>

                      {/* Warning box if any critical gap */}
                      {gapAnalysisReport.summary.critical > 0 && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 flex gap-3.5">
                          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-rose-950">Action Required: Critical Outcomes Gap Identified</h5>
                            <p className="text-[11px] text-rose-700 leading-relaxed">
                              The following Washington Accord attributes fell below the desired 50% benchmark and require urgent syllabus review or course mapping updates:
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {gapAnalysisReport.criticalGaps && gapAnalysisReport.criticalGaps.map((cg: string, idx: number) => (
                                <span key={idx} className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-md">{cg}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gap ledger list */}
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            <tr>
                              <th className="px-5 py-3 text-left">Attribute ID</th>
                              <th className="px-5 py-3 text-left">Graduate Attribute Name</th>
                              <th className="px-5 py-3 text-center">Mapped Courses</th>
                              <th className="px-5 py-3 text-left">Average Attainment</th>
                              <th className="px-5 py-3 text-center">Status Badge</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-white">
                            {gapAnalysisReport.gaps && gapAnalysisReport.gaps.map((g: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/40 transition-all">
                                <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">{g.gaId}</td>
                                <td className="px-5 py-3.5 text-slate-800 font-bold">{g.name}</td>
                                <td className="px-5 py-3.5 text-center font-mono font-bold">{g.mappedCoursesCount} courses</td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-indigo-950 font-black w-10 shrink-0">{g.averageAttainment}%</span>
                                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${
                                          g.gapStatus === 'Healthy' ? 'bg-emerald-500' :
                                          g.gapStatus === 'Moderate' ? 'bg-amber-500' :
                                          'bg-rose-500'
                                        }`}
                                        style={{ width: `${g.averageAttainment}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                                    g.gapStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    g.gapStatus === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {g.gapStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW 5: AT-RISK STUDENTS */}
                  {subReportTab === 'at-risk' && atRiskReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                            Academic At-Risk & Deficient Cohort Identifier
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Early-alert intervention radar flagging students with multiple deficient learning outcomes.
                          </p>
                        </div>

                        <div>
                          <select
                            value={atRiskSemester}
                            onChange={(e) => setAtRiskSemester(e.target.value)}
                            className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none"
                          >
                            <option value="Fall 2025">Fall 2025</option>
                            <option value="Spring 2025">Spring 2025</option>
                            <option value="Fall 2024">Fall 2024</option>
                          </select>
                        </div>
                      </div>

                      {/* Overview banner */}
                      <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Alert Summary</span>
                          <h4 className="text-sm font-bold text-rose-950">Early alerts identify {atRiskReport.atRiskCount} deficient students requiring academic counseling.</h4>
                        </div>
                        <span className="bg-rose-600 text-white font-mono text-xs font-black px-4 py-1.5 rounded-full self-start sm:self-center">
                          {atRiskReport.atRiskCount} Students Flagged
                        </span>
                      </div>

                      {/* At-risk student card directory */}
                      <div className="space-y-4">
                        {atRiskReport.students && atRiskReport.students.map((st: any, i: number) => (
                          <div key={i} className="border border-slate-200 rounded-2xl p-5 hover:border-rose-200 hover:bg-rose-50/10 transition-all space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold text-slate-800">{st.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono font-normal">({st.regNo})</span>
                                  <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 rounded">Batch {st.batch}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono">Enrolled: {st.semester}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-bold">Deficient: <b className="text-rose-600 font-mono">{st.failedCloCount} outcomes</b></span>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
                                  st.riskLevel === 'High' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                }`}>
                                  {st.riskLevel} Risk
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3.5 space-y-2">
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Failed CLO Audit Trail</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {st.failures && st.failures.map((f: any, j: number) => (
                                  <div key={j} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{f.courseCode}</span>
                                        <span className="text-[10px] font-bold text-slate-700">{f.courseTitle}</span>
                                      </div>
                                      <p className="text-[9px] font-mono text-slate-400 uppercase">Deficient CLO: {f.clo}</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                      {f.score}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW 6: INSTRUCTOR PERFORMANCE */}
                  {subReportTab === 'instructor-performance' && instructorPerformanceReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Users className="h-4.5 w-4.5 text-indigo-600" />
                          Faculty Instruction Performance Profile
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Inspect instructor syllabus execution compliance and target CLO success metrics.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {instructorPerformanceReport.instructors && instructorPerformanceReport.instructors.map((ins: any, i: number) => (
                          <div key={i} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 bg-white transition-all space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{ins.name}</h4>
                                <p className="text-[10px] text-indigo-600 font-bold font-mono">{ins.designation} • {ins.employeeId}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Overall Avg</span>
                                <span className="font-mono text-sm font-black text-indigo-950">{ins.overallAverage}%</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {ins.courses && ins.courses.map((co: any, j: number) => (
                                <div key={j} className="bg-slate-50/50 border border-slate-200/60 p-3.5 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase block">{co.courseCode}</span>
                                      <span className="text-xs font-bold text-slate-700">{co.courseTitle}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      co.courseTier === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                                    }`}>
                                      {co.courseTier}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">CLO Performance Tiers</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {co.clos && co.clos.map((cl: any, k: number) => (
                                        <div key={k} className="bg-white border border-slate-100 rounded-lg p-2 text-center space-y-0.5">
                                          <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">{cl.clo}</span>
                                          <p className="text-xs font-mono font-black text-slate-800">{cl.average}%</p>
                                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                                            cl.tier === 'High' ? 'bg-emerald-50 text-emerald-600' :
                                            cl.tier === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                            'bg-rose-50 text-rose-600'
                                          }`}>
                                            {cl.tier}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW 7: COHORT COMPARISON */}
                  {subReportTab === 'cohort-comparison' && cohortComparisonReport && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <RefreshCw className="h-4.5 w-4.5 text-indigo-600" />
                            Academic Term Cohort Comparison Trends
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Track and compare OBE performance metrics and attribute compliance across multiple academic terms.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-600">Select GA Attribute:</span>
                          <select
                            value={cohortGaId}
                            onChange={(e) => setCohortGaId(e.target.value)}
                            className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none"
                          >
                            <option value="GA-1">GA-1 Academic Education</option>
                            <option value="GA-2">GA-2 Problem Analysis</option>
                            <option value="GA-3">GA-3 Design/Development</option>
                            <option value="GA-4">GA-4 Investigation</option>
                            <option value="GA-5">GA-5 Modern Tool Usage</option>
                          </select>
                        </div>
                      </div>

                      {/* Chart visual representation */}
                      <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dynamic Trend Profile: Overall Avg vs. Selected Attribute ({cohortComparisonReport.gaFilter})</h4>
                        <div className="space-y-4 pt-2">
                          {cohortComparisonReport.chartData && cohortComparisonReport.chartData.map((cd: any, idx: number) => {
                            const gaVal = cd[cohortComparisonReport.gaFilter] || 50;
                            return (
                              <div key={idx} className="space-y-1.5">
                                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">{cd.term}</span>
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Overall */}
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                                      <span>Overall Program Avg:</span>
                                      <span className="font-mono text-indigo-950">{cd.overall}%</span>
                                    </div>
                                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${cd.overall}%` }} />
                                    </div>
                                  </div>
                                  {/* GA */}
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                                      <span>{cohortComparisonReport.gaFilter} Average:</span>
                                      <span className="font-mono text-indigo-600">{gaVal}%</span>
                                    </div>
                                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${gaVal}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Trend list metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {cohortComparisonReport.trends && cohortComparisonReport.trends.map((t: any, i: number) => (
                          <div key={i} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400">{t.term}</span>
                            <p className="text-lg font-mono font-black text-indigo-950">{t.overallAverage}%</p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              t.overallTier === 'High' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {t.overallTier} Tier
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

        </section>
      </main>
    </div>
  );
}
