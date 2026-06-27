import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Department, Program, Course, Student, InstructorCourse } from '../types';
import { apiService } from '../services/apiService';
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
  BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Teacher {
  id: string;
  name: string;
  email: string;
  departmentId: string;
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
}

interface DeptAdminDashboardProps {
  onLogout: () => void;
  adminName?: string;
}

const DEFAULT_TEACHERS: Teacher[] = [
  { id: 'teacher-1', name: 'Prof. Dr. Jameel Ahmed', email: 'jameel@iqra.edu.pk', departmentId: 'computing' },
  { id: 'teacher-2', name: 'Dr. Asim Imdad', email: 'asim@iqra.edu.pk', departmentId: 'computing' },
  { id: 'teacher-3', name: 'Dr. Tariq Soomro', email: 'tariq.soomro@iqra.edu.pk', departmentId: 'computing' },
  { id: 'teacher-4', name: 'Dr. Sajjad Ahmad', email: 'sajjad@iqra.edu.pk', departmentId: 'computing' },
  { id: 'teacher-5', name: 'Dr. Farhan Shaikh', email: 'farhan@iqra.edu.pk', departmentId: 'business' },
  { id: 'teacher-6', name: 'Prof. Dr. Kamran Raza', email: 'kamran.raza@iqra.edu.pk', departmentId: 'computing' }
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

  // Tab 1: Semester Plans Edit State
  const [selectedPlanProg, setSelectedPlanProg] = useState<string>('bscs');
  const [selectedPlanSem, setSelectedPlanSem] = useState<string>('1st');
  const [planSearch, setPlanSearch] = useState<string>('');

  // Tab 2: Course Creation State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseType, setCourseType] = useState<'core' | 'elective'>('core');
  const [courseDept, setCourseDept] = useState('computing');
  const [courseProg, setCourseProg] = useState('bscs');
  const [courseGAs, setCourseGAs] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  // Tab 3: Teacher Creation State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherDept, setTeacherDept] = useState('computing');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Tab 4: Teacher Course Assignment State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedCourseCodeForTeacher, setSelectedCourseCodeForTeacher] = useState('');
  const [selectedProgramForTeacher, setSelectedProgramForTeacher] = useState('');
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
      try {
        obData = await apiService.getAllData();
      } catch (err) {
        obData = apiService.getLocalStorageData();
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
            id: t.employeeId || t.employee_id || t.id,
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

      // 7. Load Teacher Course Assignments from backend or fallback to Local Storage
      let loadedAssignments: TeacherCourseAssignment[] = [];
      try {
        const fetchedAssignments = await apiService.getCourseAssignments();
        if (Array.isArray(fetchedAssignments)) {
          loadedAssignments = fetchedAssignments.map((a: any) => ({
            teacherId: a.teacherId || a.instructor || a.employeeId,
            courseCode: a.courseCode || a.course_code || a.code,
            programId: a.programId || a.program_id || a.program
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
    const updatedInstructorCourses: InstructorCourse[] = currentAssignments.map(assignment => {
      const teacher = currentTeachers.find(t => t.id === assignment.teacherId);
      const course = currentCourses.find(c => c.code === assignment.courseCode);
      const matchedDept = departments.find(d => d.id === (course?.departmentId || 'computing'));
      const finalProgramId = assignment.programId || course?.programId || 'bscs';
      const matchedProg = programs.find(p => p.id === finalProgramId);

      const uniqId = `course-${assignment.courseCode}-${assignment.teacherId}-${finalProgramId}`;

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
        courseType: 'Theory',
        departmentId: course?.departmentId || 'computing',
        departmentName: matchedDept?.name || 'Department of Computing and Technology',
        programId: finalProgramId,
        programName: matchedProg?.name || 'Bachelor of Science in Computer Science',
        creditHours: 3,
        categories: existingCourse?.categories || standardCategories,
        unitsData: existingCourse?.unitsData || standardUnitsData,
        students: courseStudents,
        obeQuestions: existingCourse?.obeQuestions || [],
        obeMarks: existingCourse?.obeMarks || {},
        selectedGradingSystem: existingCourse?.selectedGradingSystem || 'relative'
      };
    });

    // Save to local storage
    localStorage.setItem('IQRA_OBE_INSTRUCTOR_COURSES', JSON.stringify(updatedInstructorCourses));
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
    }, 5000);
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
      mappedGAs: courseGAs.length > 0 ? courseGAs : ['GA-1', 'GA-2']
    };

    try {
      await apiService.createCourse(newCourse);
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);

      // Clean inputs
      setCourseCode('');
      setCourseTitle('');
      setCourseGAs([]);

      triggerNotification(`Course ${uppercaseCode} - ${newCourse.title} created successfully!`);
    } catch (err) {
      triggerNotification("Failed to save the new course.", true);
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
          const rawGAs = row['Mapped GAs'] || row['mappedGAs'] || 'GA-1, GA-2';

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
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim()) {
      triggerNotification("Please fill in teacher name and email", true);
      return;
    }

    const lowercaseEmail = teacherEmail.trim().toLowerCase();
    if (teachers.some(t => t.email.toLowerCase() === lowercaseEmail)) {
      triggerNotification(`Teacher with email ${lowercaseEmail} already registered`, true);
      return;
    }

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: teacherName.trim(),
      email: lowercaseEmail,
      departmentId: teacherDept
    };

    const updatedTeachers = [...teachers, newTeacher];
    setTeachers(updatedTeachers);
    localStorage.setItem('IQRA_OBE_TEACHERS', JSON.stringify(updatedTeachers));

    setTeacherName('');
    setTeacherEmail('');

    triggerNotification(`Teacher ${newTeacher.name} successfully registered.`);
  };

  const handleDeleteTeacher = (id: string) => {
    const t = teachers.find(x => x.id === id);
    if (!t) return;
    
    if (window.confirm(`Are you sure you want to remove teacher ${t.name}?`)) {
      const updatedTeachers = teachers.filter(x => x.id !== id);
      const updatedAssignments = teacherAssignments.filter(x => x.teacherId !== id);

      setTeachers(updatedTeachers);
      setTeacherAssignments(updatedAssignments);

      localStorage.setItem('IQRA_OBE_TEACHERS', JSON.stringify(updatedTeachers));
      localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

      syncToInstructorCourses(courses, updatedTeachers, updatedAssignments, studentBindings, students);
      triggerNotification(`Teacher ${t.name} and their assignments successfully deleted.`);
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
           a.programId === (selectedProgramForTeacher || undefined)
    );

    if (exists) {
      triggerNotification("This teacher assignment with specified program already exists.", true);
      return;
    }

    const newAssignment: TeacherCourseAssignment = {
      teacherId: selectedTeacherId,
      courseCode: selectedCourseCodeForTeacher,
      programId: selectedProgramForTeacher || undefined
    };

    try {
      await apiService.assignCourse(selectedTeacherId, selectedCourseCodeForTeacher, selectedProgramForTeacher || undefined);
    } catch (err) {
      console.warn("Failed to save course assignment to backend. Syncing locally.", err);
    }

    const updatedAssignments = [...teacherAssignments, newAssignment];
    setTeacherAssignments(updatedAssignments);
    localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

    // Instantly sync changes into IQRA_OBE_INSTRUCTOR_COURSES
    syncToInstructorCourses(courses, teachers, updatedAssignments, studentBindings, students);

    const teacherObj = teachers.find(t => t.id === selectedTeacherId);
    const progObj = programs.find(p => p.id === selectedProgramForTeacher);
    const suffix = progObj ? ` for ${progObj.code.toUpperCase()}` : '';
    triggerNotification(`Successfully assigned course ${selectedCourseCodeForTeacher}${suffix} to ${teacherObj?.name}`);
  };

  const handleRemoveTeacherAssignment = async (teacherId: string, courseCode: string, programId?: string) => {
    try {
      await apiService.removeCourseAssignment(teacherId, courseCode, programId);
    } catch (err) {
      console.warn("Failed to remove course assignment from backend. Syncing locally.", err);
    }

    const updatedAssignments = teacherAssignments.filter(
      a => !(a.teacherId === teacherId && 
             a.courseCode === courseCode && 
             a.programId === programId)
    );
    setTeacherAssignments(updatedAssignments);
    localStorage.setItem('IQRA_OBE_TEACHER_ASSIGNMENTS', JSON.stringify(updatedAssignments));

    syncToInstructorCourses(courses, teachers, updatedAssignments, studentBindings, students);
    triggerNotification(`Removed course assignment ${courseCode} from teacher.`);
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
      const teacher = teachers.find(t => t.id === a.teacherId);
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
      {successMsg && (
        <div className="bg-emerald-500 text-white text-center py-2 px-4 font-semibold text-xs flex items-center justify-center gap-2 shadow-inner transition-all animate-fadeIn">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-500 text-white text-center py-2 px-4 font-semibold text-xs flex items-center justify-center gap-2 shadow-inner transition-all animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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
                        <th className="px-5 py-3 text-left">Curriculum Program</th>
                        <th className="px-5 py-3 text-left">Mapped GAs</th>
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
                            <td className="px-5 py-3.5 text-slate-500">{matchedProg?.name || 'Computing Global'}</td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400 max-w-xs truncate" title={c.mappedGAs.join(', ')}>
                              {c.mappedGAs.join(', ')}
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
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Faculty Directory</h2>
                <p className="text-xs text-slate-500 mb-6 font-medium">Add, manage, and audit instructors assigned to departments.</p>

                <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50/40 p-4 rounded-2xl border border-slate-100 mb-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Teacher Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Asim Imdad"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl text-xs font-medium outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Institutional Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. asim@iqra.edu.pk"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl text-xs font-medium outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Department</label>
                    <select 
                      value={teacherDept} 
                      onChange={(e) => setTeacherDept(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      {departments.filter(d => d.id === managedDeptId).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Onboard Faculty</span>
                    </button>
                  </div>
                </form>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Faculty Registry ({teachers.length} members)</h3>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or email..." 
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 rounded-xl outline-none text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeachers.map(t => {
                    const matchedDept = departments.find(d => d.id === t.departmentId);
                    // Count assigned courses
                    const courseCount = teacherAssignments.filter(a => a.teacherId === t.id).length;
                    return (
                      <div key={t.id} className="border border-slate-200 hover:border-indigo-200 bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between gap-4 group transition-all">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{t.email}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{matchedDept?.name || 'General Faculty'}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {courseCount} Active Courses
                          </span>
                          <button
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove teacher"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* TAB 4: TEACHER COURSE ASSIGNMENT */}
          {activeTab === 'teacher-assignments' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Teacher Course Assignments</h2>
                <p className="text-xs text-slate-500 mb-6">Assign courses to faculty members. This automatically provisions their digital grading spreadsheets.</p>

                <form onSubmit={handleAssignCourseToTeacher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50/40 p-4 rounded-2xl border border-slate-100 mb-8">
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
                        <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
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
                        <th className="px-5 py-3 text-left">Course Code</th>
                        <th className="px-5 py-3 text-left">Course Title</th>
                        <th className="px-5 py-3 text-left">Program</th>
                        <th className="px-5 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-white">
                      {filteredAssignments.map((a, idx) => {
                        const teacher = teachers.find(t => t.id === a.teacherId);
                        const course = courses.find(c => c.code === a.courseCode);
                        const prog = programs.find(p => p.id === a.programId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{teacher?.name || 'Unknown Teacher'}</div>
                              <div className="text-[10px] text-slate-400 font-mono font-normal">{teacher?.email || ''}</div>
                            </td>
                            <td className="px-5 py-3.5 text-indigo-600 font-mono font-bold">{a.courseCode}</td>
                            <td className="px-5 py-3.5 text-slate-700 font-medium">{course?.title || ''}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prog ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                {prog ? prog.code.toUpperCase() : 'ALL PROGRAMS'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => handleRemoveTeacherAssignment(a.teacherId, a.courseCode, a.programId)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all"
                              >
                                <Unlink className="h-3.5 w-3.5" />
                                <span>Unassign</span>
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
                        const matchedProg = programs.find(p => p.id === s?.programId);
                        return (
                          <div className="bg-slate-50/50 p-4 border border-slate-200/80 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-slate-800">{s?.name}</h3>
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-tight">{s?.regNo}</p>
                              </div>
                              <div className="text-right">
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                                  {matchedProg?.name} ({s?.semester || '1st'} Sem)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Add Course manual binding */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Enroll Student in Custom Course</h4>
                        <form onSubmit={handleManualBindCourse} className="flex gap-3">
                          <select
                            value={selectedCourseCodeForStudent}
                            onChange={(e) => setSelectedCourseCodeForStudent(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
                            required
                          >
                            <option value="">Choose Course...</option>
                            {availableCoursesForSelectedStudent.map(c => (
                              <option key={c.code} value={c.code}>{c.code} - {c.title} ({c.type})</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Enroll</span>
                          </button>
                        </form>
                      </div>

                      {/* Current Enrolled Courses */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Enrolled Course Catalog ({selectedStudentCurrentCourses.length} courses)</h4>
                        {selectedStudentCurrentCourses.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs font-medium">
                            This student has no course registrations currently. Enroll them above or trigger Auto-Enroll.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedStudentCurrentCourses.map(c => (
                              <div 
                                key={c.code}
                                className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase">{c.code}</span>
                                    <span className={`text-[9px] font-bold px-1.5 rounded-full capitalize ${
                                      c.type === 'core' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      {c.type}
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-800">{c.title}</h5>
                                </div>
                                <button
                                  onClick={() => handleManualUnbindCourse(selectedStudentRegNo, c.code)}
                                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                  title="Unenroll student"
                                >
                                  <Unlink className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
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

                  {loadingReport ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">Recalculating real-time attainment profiles...</span>
                    </div>
                  ) : programGAReport && programGAReport.attributes && programGAReport.attributes.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      <div className="bg-slate-50 p-3.5 border border-slate-200/50 rounded-xl flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span>Attainment Threshold:</span>
                        <span className="font-mono text-indigo-950 font-black">{programGAReport.attainmentThreshold || 50}%</span>
                      </div>
                      
                      {programGAReport.attributes.map((attr: any) => {
                        const passed = attr.attainmentStatus === 'Passed';
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

            </div>
          )}

        </section>
      </main>
    </div>
  );
}
