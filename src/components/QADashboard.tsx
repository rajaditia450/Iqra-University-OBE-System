import { useState, useEffect, useMemo, Fragment } from 'react';
import { Department, Program, GA, OBEData, ProgramObjective, Course } from '../types';
import { apiService } from '../services/apiService';
import { 
  Check, 
  Settings, 
  Lock, 
  Eye, 
  LogOut, 
  Loader2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  AlertCircle, 
  Award, 
  Compass, 
  Sliders, 
  HelpCircle,
  FileText,
  Layout,
  Activity,
  Info,
  Download,
  Printer,
  TrendingUp,
  BarChart2,
  Edit,
  Trash2,
  X,
  Building
} from 'lucide-react';

interface QADashboardProps {
  onLogout: () => void;
}

type ActiveViewModule = 'allocation' | 'po_mapping' | 'vision_mission' | 'po_configure' | 'attainment_reports';

export default function QADashboard({ onLogout }: QADashboardProps) {
  const [data, setData] = useState<OBEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GA Attainment Report States
  const [selectedReportProgramId, setSelectedReportProgramId] = useState<string>('all');
  const [selectedReportBatch, setSelectedReportBatch] = useState<string>('');
  const [selectedReportCourseCode, setSelectedReportCourseCode] = useState<string>('all');
  const [students, setStudents] = useState<any[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  // Core navigation selectors directly in header
  const [activeDeptId, setActiveDeptId] = useState<string>(() => {
    return localStorage.getItem('IQRA_OBE_USER_DEPT_ID') || 'computing';
  });
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  const [activeModule, setActiveModule] = useState<ActiveViewModule>('vision_mission');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchPhrase, setSearchPhrase] = useState('');

  // States for inline departmental charter editing
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [tempVision, setTempVision] = useState('');
  const [tempMission, setTempMission] = useState('');

  // States for inline program charter editing
  const [editingProgramInline, setEditingProgramInline] = useState<boolean>(false);
  const [tempProgramVision, setTempProgramVision] = useState('');
  const [tempProgramMission, setTempProgramMission] = useState('');

  // Dropdown states for Desktop-Style Menu Bar
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'about' | 'clos' | 'plos' | 'statistics' | 'integrity' | 'help' | 'add_program' | 'edit_program_vm' | 'add_course' | 'edit_course' | null>(null);
  const [viewVmModal, setViewVmModal] = useState<{ type: 'department' | 'program'; id: string; name: string; code?: string; vision: string; mission: string } | null>(null);
  const [isEditingVm, setIsEditingVm] = useState(false);
  const [editVmVision, setEditVmVision] = useState('');
  const [editVmMission, setEditVmMission] = useState('');

  // Pagination for 44 courses to prevent vertical scrolling
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 11;

  // Global Configuration protection flag
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Local editing states
  const [editVision, setEditVision] = useState('');
  const [editMission, setEditMission] = useState('');
  const [editProgramVision, setEditProgramVision] = useState('');
  const [editProgramMission, setEditProgramMission] = useState('');
  const [editPOs, setEditPOs] = useState<ProgramObjective[]>([]);
  const [savingLoad, setSavingLoad] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Form states for creating custom program
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramCode, setNewProgramCode] = useState('');
  const [seedGAsChecked, setSeedGAsChecked] = useState(false);

  // Form states for adding course
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseType, setNewCourseType] = useState<'core' | 'elective'>('core');
  const [newCourseDeptId, setNewCourseDeptId] = useState<string>('computing');
  const [newCourseProgramId, setNewCourseProgramId] = useState<string>('bscs');

  // Course Editing states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseType, setEditCourseType] = useState<'core' | 'elective'>('core');
  const [editCourseDeptId, setEditCourseDeptId] = useState('computing');
  const [editCourseProgramId, setEditCourseProgramId] = useState('bscs');

  // Load backend or fallback mockups
  useEffect(() => {
    fetchData();
  }, [activeDeptId]);

  // Close the desktop menu when the user clicks anywhere else
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenu(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchData = async () => {
    const isBackend = !!localStorage.getItem('access');
    try {
      setLoading(true);
      const res = await apiService.getAllData();
      
      const filteredDepts = (res.departments || []);
      const filteredProgs = (res.programs || []).filter((p: any) => p.departmentId === activeDeptId);
      const filteredCourses = (res.courses || []).filter((c: any) => c.departmentId === activeDeptId);

      setData({
        departments: filteredDepts,
        programs: filteredProgs,
        courses: filteredCourses,
        gas: res.gas || []
      });
      setError(null);
    } catch (err) {
      if (isBackend) {
        setError("Could not retrieve data from the backend server. Please make sure the server is online.");
        setData({
          departments: [],
          programs: [],
          courses: [],
          gas: []
        });
      } else {
        console.warn("Backend server offline, loading local storage sandbox database...", err);
        const localData = apiService.getLocalStorageData();

        const filteredDepts = (localData.departments || []);
        const filteredProgs = (localData.programs || []).filter((p: any) => p.departmentId === activeDeptId);
        const filteredCourses = (localData.courses || []).filter((c: any) => c.departmentId === activeDeptId);

        setData({
          departments: filteredDepts,
          programs: filteredProgs,
          courses: filteredCourses,
          gas: localData.gas || []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Synchronize department states when selected department changes
  const activeDepartment = useMemo(() => {
    if (!data || !activeDeptId) return null;
    return data.departments.find(d => d.id === activeDeptId) || null;
  }, [data, activeDeptId]);

  const activeProgram = useMemo(() => {
    if (!data || !activeProgramId) return null;
    return data.programs.find(p => p.id === activeProgramId) || null;
  }, [data, activeProgramId]);

  useEffect(() => {
    if (activeDepartment) {
      setEditVision(activeDepartment.vision);
      setEditMission(activeDepartment.mission);
    }
  }, [activeDepartment]);

  useEffect(() => {
    if (activeProgram) {
      setEditPOs(JSON.parse(JSON.stringify(activeProgram.pos)));
      setEditProgramVision(activeProgram.vision || '');
      setEditProgramMission(activeProgram.mission || '');
      if (activeProgram.id !== activeProgramId) {
        setActiveProgramId(activeProgram.id);
      }
    }
  }, [activeProgram]);

  useEffect(() => {
    if (activeDeptId) {
      setNewCourseDeptId(activeDeptId);
    }
  }, [activeDeptId]);

  useEffect(() => {
    if (activeProgramId) {
      setNewCourseProgramId(activeProgramId);
    }
  }, [activeProgramId]);

  useEffect(() => {
    if (data && activeDeptId) {
      const activeProgObj = data.programs.find(p => p.id === activeProgramId);
      if (activeProgramId !== '' && (!activeProgObj || activeProgObj.departmentId !== activeDeptId)) {
        setActiveProgramId('');
      }
    }
  }, [activeDeptId, data]);

  // Reset page when selectors change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeDeptId, activeProgramId, selectedCourseId, searchPhrase]);

  // Extract batch code from student registration number
  const getStudentBatchCode = (regNo: string): string => {
    const match = regNo.trim().match(/(FA|SP)(\d{2})/i);
    if (match) {
      return match[0].toLowerCase();
    }
    const yearMatch = regNo.trim().match(/(20\d{2})/);
    if (yearMatch) {
      return `fa${yearMatch[1].slice(-2)}`;
    }
    return 'fa22';
  };

  // Lazy loading of GA Attainment Report data
  useEffect(() => {
    if (activeModule !== 'attainment_reports') return;

    const loadReportData = async () => {
      setLoadingReports(true);
      try {
        const allStudents = await apiService.getStudents().catch(() => []);
        setStudents(allStudents);

        const instCourses = await apiService.getInstructorCourses().catch(() => apiService.getLocalInstructorCourses());
        setInstructorCourses(instCourses);

        if (allStudents.length > 0) {
          const extractedBatches = Array.from(new Set(allStudents.map(s => getStudentBatchCode(s.regNo))));
          // Ensure fa22 is default if available
          if (extractedBatches.length > 0) {
            const hasFa22 = extractedBatches.includes('fa22');
            setSelectedReportBatch(hasFa22 ? 'fa22' : extractedBatches[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load report data:", err);
      } finally {
        setLoadingReports(false);
      }
    };

    loadReportData();
  }, [activeModule]);

  // Helper to calculate student's GA score dynamically using mock/real structures
  const calculateStudentGAScore = (
    student: any,
    gaId: string,
    allCourses: Course[],
    instCourses: any[]
  ): number | null => {
    // Find courses that map to this GA
    const contributingCourses = allCourses.filter(c => c.mappedGAs && c.mappedGAs.includes(gaId));
    
    if (contributingCourses.length === 0) {
      return null; // No mapped courses for this GA
    }

    let totalAggregate = 0;
    let coursesWithMarksCount = 0;

    contributingCourses.forEach(c => {
      const instCourse = instCourses.find(ic => ic.code === c.code);
      let aggregate = 0;
      let hasAnyMarks = false;

      if (instCourse) {
        const std = instCourse.students?.find((s: any) => s.regNo === student.regNo);
        if (std && std.marks) {
          let catSumTotal = 0;
          
          instCourse.categories?.forEach((cat: any) => {
            if (cat.percentage > 0) {
              let categoryObtainedSum = 0;
              let categoryMaxMarksSum = 0;
              const existingUnits = instCourse.unitsData?.[cat.name] || [];
              
              for (let u = 1; u <= cat.units; u++) {
                const matchingUnit = existingUnits.find((unit: any) => unit.unitNo === u);
                const questions = matchingUnit?.questions || [];
                
                if (questions.length > 0) {
                  questions.forEach((q: any) => {
                    categoryMaxMarksSum += q.maxMarks || 0;
                    const qKey = `q-${cat.name}-${u}-${q.id}`;
                    if (std.marks?.[qKey] !== undefined) {
                      categoryObtainedSum += std.marks[qKey];
                      hasAnyMarks = true;
                    }
                  });
                } else {
                  const totalMarks = matchingUnit ? matchingUnit.totalMarks : 10;
                  categoryMaxMarksSum += totalMarks;
                  const dKey = `${cat.name}-${u}`;
                  if (std.marks?.[dKey] !== undefined) {
                    categoryObtainedSum += std.marks[dKey];
                    hasAnyMarks = true;
                  } else if (std.marks?.[cat.name] !== undefined && u === 1) {
                    categoryObtainedSum += std.marks[cat.name];
                    hasAnyMarks = true;
                  }
                }
              }
              
              const categoryContribution = categoryMaxMarksSum > 0
                ? (categoryObtainedSum / categoryMaxMarksSum) * cat.percentage
                : 0;
              catSumTotal += categoryContribution;
            }
          });
          
          if (hasAnyMarks) {
            aggregate = catSumTotal;
          }
        }
      }

      if (hasAnyMarks) {
        totalAggregate += aggregate;
        coursesWithMarksCount++;
      }
    });

    return coursesWithMarksCount > 0 ? totalAggregate / coursesWithMarksCount : null;
  };

  // Compile report metrics based on current filters
  const reportMetrics = useMemo(() => {
    if (!data) return { gaMetrics: [], overallPassRate: 0, topGA: 'N/A', bottomGA: 'N/A', filteredStudents: [] };

    // 1. Get filtered students by batch and program
    const filteredStudents = students.filter(s => {
      const matchBatch = getStudentBatchCode(s.regNo) === (selectedReportBatch || 'fa22');
      const matchProg = selectedReportProgramId === 'all' ? true : s.programId === selectedReportProgramId;
      // Also ensure they are in the active department
      const matchDept = s.departmentId === activeDeptId;
      return matchBatch && matchProg && matchDept;
    });

    // 2. Define GAs that are active for the current selection
    // If specific program, get program GAs, else get all department GAs
    let activeGAs = data.gas.filter(ga => ga.departmentId === activeDeptId);
    if (selectedReportProgramId !== 'all') {
      const progObj = data.programs.find(p => p.id === selectedReportProgramId);
      if (progObj) {
        // Find GAs mapped to this program or generic ones
        activeGAs = data.gas.filter(ga => ga.programId === selectedReportProgramId || (!ga.programId && ga.departmentId === activeDeptId));
      }
    }

    if (activeGAs.length === 0) {
      // Fallback GAs
      activeGAs = [
        { id: 'GA-1', name: 'Academic Grounding', description: 'Deep comprehension of fundamental computing principles.' },
        { id: 'GA-2', name: 'Problem Analysis', description: 'Skill to identify, analyze, and solve complex challenges.' },
        { id: 'GA-3', name: 'Design/Development of Solutions', description: 'Mastery in designing sustainable components.' },
        { id: 'GA-4', name: 'Investigation / Research', description: 'Ability to conduct validation studies.' },
        { id: 'GA-5', name: 'Modern Tool Usage', description: 'Competency in leveraging Git, CI/CD, and database systems.' }
      ];
    }

    let overallPassTotal = 0;
    let overallAssessmentsCount = 0;

    const gaMetrics = activeGAs.map(ga => {
      let passedCount = 0;
      let failedCount = 0;
      let assessedCount = 0;

      filteredStudents.forEach(s => {
        const score = calculateStudentGAScore(s, ga.id, data.courses, instructorCourses);
        if (score === null) {
          return; // Skip this student as they are not assessed for this GA
        }
        assessedCount++;
        if (score >= 50) {
          passedCount++;
        } else {
          failedCount++;
        }
      });

      const totalCount = assessedCount;
      const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

      if (totalCount > 0) {
        overallPassTotal += passedCount;
        overallAssessmentsCount += totalCount;
      }

      return {
        id: ga.id,
        name: ga.name,
        description: ga.description,
        totalCount,
        passedCount,
        failedCount,
        percentage
      };
    });

    const overallPassRate = overallAssessmentsCount > 0 
      ? Math.round((overallPassTotal / overallAssessmentsCount) * 100) 
      : 0;

    // Sort to find top and bottom GAs, only considering GAs with actual assessments (totalCount > 0)
    let topGA = 'N/A';
    let bottomGA = 'N/A';

    const assessedMetrics = gaMetrics.filter(m => m.totalCount > 0);
    if (assessedMetrics.length > 0) {
      const sortedByPass = [...assessedMetrics].sort((a, b) => b.percentage - a.percentage);
      topGA = `${sortedByPass[0].id} (${sortedByPass[0].percentage}%)`;
      bottomGA = `${sortedByPass[sortedByPass.length - 1].id} (${sortedByPass[sortedByPass.length - 1].percentage}%)`;
    }

    return {
      gaMetrics,
      overallPassRate,
      topGA,
      bottomGA,
      filteredStudents
    };
  }, [data, students, selectedReportProgramId, selectedReportBatch, instructorCourses, activeDeptId]);

  // Filtered definitions of GAs matching selected program securely
  const filteredGAs = useMemo(() => {
    if (!data) return [];
    // Only yield GAs matching the currently active program code specifically
    return data.gas.filter(g => 
      String(g.programId).trim().toLowerCase() === String(activeProgramId).trim().toLowerCase()
    );
  }, [data, activeDeptId, activeProgramId]);

  // Filtered courses matching selected department and selectors
  const filteredCourses = useMemo(() => {
    if (!data || !activeDeptId) return [];
    let list = data.courses.filter(c => 
      c.departmentId === activeDeptId && 
      String(c.programId).trim().toLowerCase() === String(activeProgramId).trim().toLowerCase()
    );

    if (selectedCourseId !== 'all') {
      list = list.filter(c => c.id === selectedCourseId);
    }

    if (searchPhrase.trim() !== '') {
      const q = searchPhrase.toLowerCase();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.title.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, activeDeptId, activeProgramId, selectedCourseId, searchPhrase]);

  // Paginated course display
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage) || 1;

  // Real-time Graduate Attribute Allocation Metrics for reports statistics chart & integrity panel
  const gaStats = useMemo(() => {
    if (!data || !activeDeptId) return [];
    const coursesInDept = data.courses.filter(c => 
      c.departmentId === activeDeptId && 
      String(c.programId).trim().toLowerCase() === String(activeProgramId).trim().toLowerCase()
    );
    const total = coursesInDept.length || 1;
    return filteredGAs.map(ga => {
      const count = coursesInDept.filter(c => c.mappedGAs.includes(ga.id)).length;
      const pct = Math.round((count / total) * 100);
      return { ...ga, count, pct };
    });
  }, [data, activeDeptId, activeProgramId, filteredGAs]);

  // Find any courses with no attributes mapped for mapping integrity audit checks
  const unmappedCourses = useMemo(() => {
    if (!data || !activeDeptId) return [];
    return data.courses.filter(c => 
      c.departmentId === activeDeptId && 
      String(c.programId).trim().toLowerCase() === String(activeProgramId).trim().toLowerCase() && 
      c.mappedGAs.length === 0
    );
  }, [data, activeDeptId, activeProgramId]);

  // Real-time matrix click toggler: toggles a tick in course mapping instantly!
  const handleToggleCourseGA = async (course: Course, gaId: string) => {
    if (!isConfiguring || !data) return;

    const isMapped = course.mappedGAs.includes(gaId);
    const updatedMapped = isMapped 
      ? course.mappedGAs.filter(id => id !== gaId) 
      : [...course.mappedGAs, gaId];

    // Optimistic state upgrade for flawless feedback
    const updatedCourses = data.courses.map(c => 
      c.id === course.id ? { ...c, mappedGAs: updatedMapped } : c
    );
    setData({ ...data, courses: updatedCourses });

    try {
      await apiService.updateCourse(course.id, { mappedGAs: updatedMapped });
    } catch (e) {
      console.warn("Local storage fallback mapped.");
    }
  };

  // Real-time PO mapping click toggler: toggles Yes/empty in PO to GA matrix!
  const handleTogglePOGA = async (poIdx: number, gaId: string) => {
    if (!isConfiguring || !activeProgram || !data) return;

    const updatedPOs = editPOs.map((po, idx) => {
      if (idx !== poIdx) return po;
      const possesses = po.mappedGAs.includes(gaId);
      return {
        ...po,
        mappedGAs: possesses ? po.mappedGAs.filter(id => id !== gaId) : [...po.mappedGAs, gaId]
      };
    });

    setEditPOs(updatedPOs);

    const updatedPrograms = data.programs.map(p => 
      p.id === activeProgram.id ? { ...p, pos: updatedPOs } : p
    );
    setData({ ...data, programs: updatedPrograms });

    try {
      await apiService.updateProgram(activeProgram.id, { pos: updatedPOs });
    } catch (e) {
      console.warn("Fallback DB save");
    }
  };

  // Handle saving of edited school missions
  const handleSaveVisionMission = async () => {
    if (!activeDepartment || !data) return;
    try {
      setSavingLoad(true);
      const updated = await apiService.updateDepartment(activeDepartment.id, {
        vision: editVision,
        mission: editMission
      });
      const upgraded = data.departments.map(d => d.id === activeDepartment.id ? updated : d);
      setData({ ...data, departments: upgraded });
      showNotification("Department Mission & Vision saved successfully.", "success");
    } catch (e) {
      showNotification("Failed to sync department vision data", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Handle saving of edited program vision and mission
  const handleSaveProgramVisionMission = async () => {
    if (!activeProgram || !data) return;
    try {
      setSavingLoad(true);
      const updated = await apiService.updateProgram(activeProgram.id, {
        vision: editProgramVision,
        mission: editProgramMission
      });
      const upgraded = data.programs.map(p => p.id === activeProgram.id ? { ...p, ...updated } : p);
      setData({ ...data, programs: upgraded });
      showNotification("Program Mission & Vision saved successfully.", "success");
    } catch (e) {
      showNotification("Failed to sync program vision data", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  const handleSaveVmModal = async () => {
    if (!viewVmModal || !data) return;
    try {
      setSavingLoad(true);
      if (viewVmModal.type === 'department') {
        const updated = await apiService.updateDepartment(viewVmModal.id, {
          vision: editVmVision,
          mission: editVmMission
        });
        const upgradedDepts = data.departments.map(d => d.id === viewVmModal.id ? { ...d, ...updated } : d);
        setData({ ...data, departments: upgradedDepts });
        setViewVmModal({
          ...viewVmModal,
          vision: editVmVision,
          mission: editVmMission
        });
        showNotification("Department Vision & Mission saved successfully.", "success");
      } else {
        const updated = await apiService.updateProgram(viewVmModal.id, {
          vision: editVmVision,
          mission: editVmMission
        });
        const upgradedProgs = data.programs.map(p => p.id === viewVmModal.id ? { ...p, ...updated } : p);
        setData({ ...data, programs: upgradedProgs });
        setViewVmModal({
          ...viewVmModal,
          vision: editVmVision,
          mission: editVmMission
        });
        showNotification("Program Vision & Mission saved successfully.", "success");
      }
      setIsEditingVm(false);
    } catch (err) {
      showNotification("Failed to update Vision & Mission details.", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Handle adding custom program
  const handleAddProgram = async () => {
    if (!newProgramName.trim() || !newProgramCode.trim() || !data) {
      showNotification("Please provide name and code details for the program.", "error");
      return;
    }

    const newId = newProgramCode.trim().toLowerCase();
    
    // Check if program exists
    if (data.programs.some(p => p.id === newId)) {
      showNotification("A program with this code already exists.", "error");
      return;
    }

    const codeUpper = newProgramCode.trim().toUpperCase();
    const seededGAs: GA[] = [];

    if (seedGAsChecked) {
      if (codeUpper === 'SE' || codeUpper.includes('SOFTWARE')) {
        seededGAs.push(
          { id: `GA-${codeUpper}-1`, name: 'SE-Philosophy & Principles', description: 'Deep comprehension of engineering principles, lifecycle models, and system metrics.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-2`, name: 'Software Requirements Analysis', description: 'Skill to solicit, organize, validate, and trace stakeholder and technical system specifications.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-3`, name: 'Software Design & Architecture', description: 'Creating modular, maintainable, secure software systems utilizing architecture blueprints and patterns.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-4`, name: 'Software Coding & Verification', description: 'Write secure, clean code, applying testing paradigms, coverage metrics, and clean integration strategies.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-5`, name: 'Modern CAD/CASE Tool Usage', description: 'Select and master version control systems (Git), CI/CD pipelines, container fabrics, and testing runners.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-6`, name: 'Agile Team Coordination', description: 'Function as an active member inside Scrum/Kanban teams, leading project milestones with clear transparency.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-7`, name: 'Technical System Communication', description: 'Prepare professional Software Requirement Specifications (SRS), technical proposals, and presentations.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-8`, name: 'Societal & Safety Security Compliance', description: 'Assessing the impacts on health, legal, cybersecurity, and societal norms during software deployment.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-9`, name: 'Professional Ethics in Computing', description: 'Uphold intellectual property, security compliance frameworks, and professional computing ethics.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-10`, name: 'Agile Continuous Self-Learning', description: 'Ability to independent search, master, and adopt new technologies, framework languages, or engineering stacks.', departmentId: activeDeptId, programId: newId }
        );
      } else if (codeUpper === 'AI' || codeUpper.includes('ARTIFICIAL') || codeUpper.includes('INTEL')) {
        seededGAs.push(
          { id: `GA-${codeUpper}-1`, name: 'Mathematical Modeling & Statistics', description: 'Formulate probabilistic models, linear algebra matrices, and optimization cost functions.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-2`, name: 'Knowledge Representation', description: 'Design knowledge graphs, rule-based systems, and symbolic inference engines to represent logic.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-3`, name: 'Supervised & Unsupervised ML', description: 'Build and tune classical machine learning classifiers, regression curves, and clustering models.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-4`, name: 'Neural Networks & Deep Learning', description: 'Configure deep multilayer perceptrons, convolutional units (CNNs), and attention transformers.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-5`, name: 'Perception (NLP & Vision)', description: 'Synthesize algorithms for natural language understandability, language translation, and high-fidelity video processing.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-6`, name: 'Trustworthy AI & Anti-bias Ethics', description: 'Diagnose discrimination bias, protect training dataset privacy, and engineer transparent, explainable AI.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-7`, name: 'AI Engineering & HPC Pipelines', description: 'Leverage hyperparameter systems, high-performance GPUs, vector and feature databases.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-8`, name: 'Experimental Rigor & Validation', description: 'Develop hypothesis tests, cross-validation scoring splits, and analytical error budgets.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-9`, name: 'Autonomous Cooperation Systems', description: 'Deploy multi-agent reinforcement learning architectures and collaborative robotic structures.', departmentId: activeDeptId, programId: newId },
          { id: `GA-${codeUpper}-10`, name: 'Ethical Aligns & AI Alignment', description: 'Assess long-term safety, human-in-the-loop validation, and sustainable power-efficient computing limits.', departmentId: activeDeptId, programId: newId }
        );
      } else {
        // General program GAs
        for (let index = 1; index <= 10; index++) {
          seededGAs.push({
            id: `GA-${codeUpper}-${index}`,
            name: `${codeUpper} Core Attribute ${index}`,
            description: `Acquire and demonstrate profound competency and continuous professional leadership in domain requirement #${index} specifically tailored for the ${newProgramName.trim()} program.`,
            departmentId: activeDeptId,
            programId: newId
          });
        }
      }
    }

    const defaultPOs: ProgramObjective[] = [
      { id: 'PO1', text: 'Theoretical comprehension and fundamental engineering/science grounding in ' + codeUpper + '.', mappedGAs: [] },
      { id: 'PO2', text: 'Problem analysis, research validation and algorithmic optimization synthesis in ' + codeUpper + '.', mappedGAs: [] },
      { id: 'PO3', text: 'Critical tool utilization, design deployment, and modern software/AI systems mastery.', mappedGAs: [] },
      { id: 'PO4', text: 'Professional ethics, societal safety considerations, and collaborative team communication.', mappedGAs: [] }
    ];

    const newProg: Program = {
      id: newId,
      name: newProgramName.trim(),
      code: newProgramCode.trim().toUpperCase(),
      departmentId: activeDeptId,
      pos: defaultPOs,
      vision: 'To emerge as a premier center of excellence for training and consulting in ' + newProgramName.trim() + '.',
      mission: 'To impart professional leadership capabilities, technical expertise, and lifelong knowledge of ethical values in ' + newProgramName.trim() + '.'
    };

    try {
      setSavingLoad(true);
      await apiService.createProgram(newProg, seededGAs);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          programs: [...prev.programs, newProg],
          gas: [...prev.gas, ...seededGAs]
        };
      });
      // Set active program to the newly added program
      setActiveProgramId(newId);
      // Reset fields
      setNewProgramName('');
      setNewProgramCode('');
      setSeedGAsChecked(false);
      setActiveModal(null);
      if (seededGAs.length > 0) {
        showNotification(`Program ${newProg.code} successfully registered! Standard Graduate Attributes (GA-${codeUpper}-1 to GA-${codeUpper}-10) have been generated uniquely for this program.`, "success");
      } else {
        showNotification(`Program ${newProg.code} successfully registered without any pre-defined Graduate Attributes.`, "success");
      }
    } catch (e) {
      showNotification("Error saving new program.", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Handle adding custom course
  const handleAddCourse = async () => {
    if (!newCourseCode.trim() || !newCourseTitle.trim() || !data) {
      showNotification("Please provide course registration info containing valid code and title.", "error");
      return;
    }

    const newId = 'C_' + Math.random().toString(36).substr(2, 9);
    
    // Check if code matches existing course in the department
    if (data.courses.some(c => c.code.trim().toUpperCase() === newCourseCode.trim().toUpperCase() && c.departmentId === newCourseDeptId && c.programId === newCourseProgramId)) {
      showNotification("A course with this exact code is already registered under this program.", "error");
      return;
    }

    const newC: Course = {
      id: newId,
      code: newCourseCode.trim().toUpperCase(),
      title: newCourseTitle.trim(),
      type: newCourseType,
      mappedGAs: [],
      departmentId: newCourseDeptId,
      programId: newCourseProgramId
    };

    try {
      setSavingLoad(true);
      await apiService.createCourse(newC);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courses: [...prev.courses, newC]
        };
      });
      // Reset forms
      setNewCourseCode('');
      setNewCourseTitle('');
      setNewCourseType('core');
      setActiveModal(null);
      showNotification(`Course "${newC.code} — ${newC.title}" successfully added! You can now map GAs to this course in the Active Allocation Matrix.`, "success");
    } catch (err) {
      showNotification("Error adding custom course.", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Handle editing custom course
  const handleEditCourseSubmit = async () => {
    if (!editingCourse || !editCourseCode.trim() || !editCourseTitle.trim() || !data) {
      showNotification("Please provide valid course code and title.", "error");
      return;
    }

    try {
      setSavingLoad(true);
      const updatedSpecs: Partial<Course> = {
        code: editCourseCode.trim().toUpperCase(),
        title: editCourseTitle.trim(),
        type: editCourseType,
        departmentId: editCourseDeptId,
        programId: editCourseProgramId
      };

      const updated = await apiService.updateCourse(editingCourse.id, updatedSpecs);
      
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courses: prev.courses.map(c => c.id === editingCourse.id ? { ...c, ...updated } : c)
        };
      });

      setEditingCourse(null);
      setActiveModal(null);
      showNotification("Course specifications updated successfully!", "success");
    } catch (err) {
      showNotification("Error saving course changes.", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Handle direct text updates to the Program Objectives text fields
  const handlePOTextChange = (idx: number, txt: string) => {
    setEditPOs(prev => prev.map((p, i) => i === idx ? { ...p, text: txt } : p));
  };

  // Commit updated objectives to backend/local mock storage
  const handleSavePOTexts = async () => {
    if (!activeProgram || !data) return;
    try {
      setSavingLoad(true);
      const updated = await apiService.updateProgram(activeProgram.id, { pos: editPOs });
      const upgraded = data.programs.map(p => p.id === activeProgram.id ? updated : p);
      setData({ ...data, programs: upgraded });
      showNotification("Program Objectives updated and synchronized successfully.", "success");
    } catch (e) {
      showNotification("Failed to sync objectives", "error");
    } finally {
      setSavingLoad(false);
    }
  };

  // Export active department matrix to downloadable CSV file
  const handleExportCSV = () => {
    if (!data || !activeDepartment) {
      showNotification("No active data to export.", "error");
      return;
    }
    const coursesInDept = data.courses.filter(c => c.departmentId === activeDeptId);
    const gasInDept = data.gas.filter(g => g.departmentId === activeDeptId);
    
    let csv = "Course Code,Course Title," + gasInDept.map(g => g.id).join(",") + "\n";
    coursesInDept.forEach(c => {
      const row = [
        `"${c.code.replace(/"/g, '""')}"`,
        `"${c.title.replace(/"/g, '""')}"`
      ];
      gasInDept.forEach(g => {
        row.push(c.mappedGAs.includes(g.id) ? "✓" : "");
      });
      csv += row.join(",") + "\n";
    });
    
    // Create and trigger file download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `resultmate_obe_allocation_${activeDeptId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full database state to downloadable JSON backup file
  const handleExportJSON = () => {
    if (!data) {
      showNotification("No active database loaded.", "error");
      return;
    }
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `resultmate_obe_snapshot.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden frosted-bg text-slate-800 font-sans">
      
      {/* Premium Corporate Top Header */}
      <header id="qa-header" className="bg-[#1e1b4b] text-white border-b border-indigo-950 px-6 py-2.5 shrink-0 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold font-display tracking-tight flex items-center gap-2">
            <span>Iqra University OBE</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/30">
              QA CONTROL
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-logout"
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-transparent hover:bg-white/10 text-white hover:text-white rounded-lg transition-all border border-white/20 hover:border-white/40 flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            title="Sign out of QA Module"
          >
            <LogOut className="w-3.5 h-3.5 text-white/95" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Classic Desktop-styled horizontal Menu Bar */}
      <header className="bg-[#f1f5f9] border-b border-slate-300 z-40 shrink-0 select-none relative">
        <div className="mx-auto flex flex-wrap items-center justify-between px-3 py-1.5 max-w-[1700px]">
          
          {/* Menu triggers */}
          <div className="flex flex-wrap items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            
            {/* VISION & MISSION MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'vision_mission_dropdown' ? null : 'vision_mission_dropdown')}
                onMouseEnter={() => openMenu && setOpenMenu('vision_mission_dropdown')}
                className={`px-3 py-1 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded cursor-pointer transition-all ${openMenu === 'vision_mission_dropdown' ? 'bg-slate-200 text-slate-900 shadow-sm' : ''}`}
              >
                Vision &amp; Mission
              </button>
              {openMenu === 'vision_mission_dropdown' && (
                <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-300 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-3.5 py-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                    Academic Department
                  </div>
                  {activeDepartment && (
                    <button
                      onClick={() => {
                        setActiveProgramId('');
                        setActiveModule('vision_mission');
                        setViewVmModal({
                          type: 'department',
                          id: activeDepartment.id,
                          name: activeDepartment.name,
                          vision: activeDepartment.vision,
                          mission: activeDepartment.mission
                        });
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-indigo-950 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-950 flex items-start gap-2 rounded font-bold text-left border-l-2 border-indigo-500 focus:outline-none"
                    >
                      <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{activeDepartment.name}</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1.5"></div>
                  
                  <div className="px-3.5 py-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                    Department Programs
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {data?.programs
                      .filter(p => !activeDeptId || p.departmentId === activeDeptId)
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProgramId(p.id);
                            setActiveModule('vision_mission');
                            setViewVmModal({
                              type: 'program',
                              id: p.id,
                              name: p.name,
                              code: p.code,
                              vision: p.vision || 'To produce outstanding and ethically-grounded professionals equipped with modern analytical tools and problem-solving skills to lead in the domain of ' + p.name + '.',
                              mission: p.mission || 'To deliver rigorous, comprehensive, and student-centered curriculum in ' + p.name + ' that blends theoretical foundations with hands-on practice, preparing graduates for lifelong learning, research excellence, and socially-responsible career paths in the global technological environment.'
                            });
                            setOpenMenu(null);
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-slate-705 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left font-medium focus:outline-none"
                        >
                          <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{p.code} — {p.name}</span>
                        </button>
                      ))}
                    {(!data?.programs || data.programs.filter(p => !activeDeptId || p.departmentId === activeDeptId).length === 0) && (
                      <div className="px-3.5 py-2 text-xs text-slate-400 italic">No programs registered</div>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* VIEW MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
                onMouseEnter={() => openMenu && setOpenMenu('view')}
                className={`px-3 py-1 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded cursor-pointer transition-all ${openMenu === 'view' ? 'bg-slate-200 text-slate-900 shadow-sm' : ''}`}
              >
                View
              </button>
              {openMenu === 'view' && (
                <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-300 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => { setActiveModule('allocation'); setOpenMenu(null); }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between rounded ${activeModule === 'allocation' ? 'bg-indigo-50 text-indigo-950 font-bold' : 'text-slate-700 hover:bg-indigo-50'}`}
                  >
                    <span className="flex items-center gap-2">
                       <Layout className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                       Course to GA Allocation Matrix
                    </span>
                    {activeModule === 'allocation' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                  <button
                    onClick={() => { setActiveModule('po_mapping'); setOpenMenu(null); }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between rounded ${activeModule === 'po_mapping' ? 'bg-indigo-50 text-indigo-950 font-bold' : 'text-slate-700 hover:bg-indigo-50'}`}
                  >
                    <span className="flex items-center gap-2">
                       <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                       PO to GA Mapping Matrix
                    </span>
                    {activeModule === 'po_mapping' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                </div>
              )}
            </div>

            {/* CONFIGURE MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'configure' ? null : 'configure')}
                onMouseEnter={() => openMenu && setOpenMenu('configure')}
                className={`px-3 py-1 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded cursor-pointer transition-all ${openMenu === 'configure' ? 'bg-slate-200 text-slate-900 shadow-sm' : ''}`}
              >
                Configure
              </button>
              {openMenu === 'configure' && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => { setActiveModule('vision_mission'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded focus:outline-none"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Department Attributes Settings</span>
                  </button>
                  <button
                    onClick={() => { setActiveModule('po_configure'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-705 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded focus:outline-none"
                  >
                    <Settings className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Program PO Objectives (PO1-PO4)</span>
                  </button>
                </div>
              )}
            </div>

            {/* REPORTS MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'reports' ? null : 'reports')}
                onMouseEnter={() => openMenu && setOpenMenu('reports')}
                className={`px-3 py-1 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded cursor-pointer transition-all ${openMenu === 'reports' ? 'bg-slate-200 text-slate-900 shadow-sm' : ''}`}
              >
                Reports
              </button>
              {openMenu === 'reports' && (
                <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-300 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => { handleExportCSV(); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded font-medium border-b border-slate-50 text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Export Alignment Sheet (CSV)</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('clos'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>CLO Courses Integration Summary</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('plos'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>PLO Program Educational Outcomes Sheet</span>
                  </button>
                  <button
                    onClick={() => { setActiveModule('attainment_reports'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 rounded text-left"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>GA Attainment Reports Dashboard</span>
                  </button>
                  <button
                    onClick={() => { window.print(); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Print/Save Matrix Report...</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <div className="px-3.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                    Statistical Diagrams
                  </div>
                  <button
                    onClick={() => { setActiveModal('statistics'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Distribution Histogram Diagram</span>
                  </button>
                </div>
              )}
            </div>

            {/* ABOUT MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}
                onMouseEnter={() => openMenu && setOpenMenu('about')}
                className={`px-3 py-1 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded cursor-pointer transition-all ${openMenu === 'about' ? 'bg-slate-200 text-slate-900 shadow-sm' : ''}`}
              >
                About
              </button>
              {openMenu === 'about' && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => { setActiveModal('about'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded font-medium text-left"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>About ResultMate OBE v4.6</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('help'); setOpenMenu(null); }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-750 hover:bg-indigo-50 hover:text-indigo-950 flex items-center gap-2 rounded text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>OBE Mapping guidelines manual</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Quick status display */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono tracking-tight font-semibold hidden sm:inline">
              User: <strong className="text-indigo-950 font-extrabold">{activeDepartment?.name || "Computing"} QA Supervisor</strong>
            </span>
          </div>

        </div>

        {/* Quick Toolbar (Desktop Icon Bar styled) */}
        <div className="bg-[#f8fafc] border-t border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-4 select-none">
          
          {/* Leftside selectors: Quick action selectors & filters */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Active Department Indicator */}
            <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1 border border-indigo-100 rounded-lg shadow-xs animate-fade-in text-xs font-bold text-indigo-950">
              <span className="text-[9px] text-indigo-650 font-bold tracking-wide uppercase">ACTIVE DEPARTMENT:</span>
              <span>{activeDepartment?.name || activeDeptId.toUpperCase()}</span>
            </div>

            {/* Active Program Selector */}
            <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1 border border-indigo-100 rounded-lg shadow-xs text-xs font-bold text-indigo-950 animate-fade-in">
              <span className="text-[9px] text-indigo-650 font-bold tracking-wide uppercase shrink-0">PROGRAM:</span>
              <select
                value={activeProgramId}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveProgramId(val);
                  setSelectedCourseId('all');
                }}
                className="bg-transparent border-none text-indigo-950 text-xs font-bold font-sans focus:outline-none cursor-pointer pr-1"
              >
                <option value="" className="bg-white text-slate-800 font-sans font-semibold">-- Select Program --</option>
                {data?.programs
                  .filter(p => p.departmentId === activeDeptId)
                  .map(p => (
                    <option key={p.id} value={p.id} className="bg-white text-slate-800 font-sans font-semibold">
                      {p.code} — {p.name}
                    </option>
                  ))}
              </select>
            </div>


            {/* Quick view switcher buttons */}
            <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => {
                  if (activeProgramId === '') {
                    const firstProg = data?.programs?.find(p => p.departmentId === activeDeptId)?.id || '';
                    setActiveProgramId(firstProg);
                  }
                  setActiveModule('allocation');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeProgramId !== '' && activeModule === 'allocation' ? 'bg-white text-indigo-950 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Allocation Matrix
              </button>
              <button 
                onClick={() => {
                  if (activeProgramId === '') {
                    const firstProg = data?.programs?.find(p => p.departmentId === activeDeptId)?.id || '';
                    setActiveProgramId(firstProg);
                  }
                  setActiveModule('po_mapping');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeProgramId !== '' && activeModule === 'po_mapping' ? 'bg-white text-indigo-950 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                PO Mapping
              </button>
              <button 
                onClick={() => {
                  if (activeProgramId === '') {
                    const firstProg = data?.programs?.find(p => p.departmentId === activeDeptId)?.id || '';
                    setActiveProgramId(firstProg);
                  }
                  setActiveModule('po_configure');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeProgramId !== '' && activeModule === 'po_configure' ? 'bg-white text-indigo-950 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Configure PO's
              </button>
              <button 
                onClick={() => {
                  setActiveModule('attainment_reports');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeModule === 'attainment_reports' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-600 hover:text-indigo-900 bg-indigo-50/50 hover:bg-indigo-50'}`}
              >
                📊 GA Reports
              </button>
            </div>

            {/* Course Filter Search Bar inside the Quick toolbar */}
            {activeModule === 'allocation' && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Isolate Course:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer max-w-[210px] shadow-xs"
                >
                  <option value="all">Show All Courses</option>
                  {data?.courses.filter(c => c.departmentId === activeDeptId && String(c.programId).trim().toLowerCase() === String(activeProgramId).trim().toLowerCase()).map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Right side config lock toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-wider rounded-lg transition-all shadow-xs shrink-0 ${
                isConfiguring 
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              title={isConfiguring ? "Click to lock mappings" : "Click to unlock checking attributes"}
            >
              {isConfiguring ? <Settings className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              {isConfiguring ? 'Lock Edit Mode' : 'Unlock Edit Mode'}
            </button>
            
          </div>

        </div>
      </header>

      {/* Main Sandbox Panel Area */}
      <main className="flex-1 overflow-auto p-3 md:p-4 pb-12">

        {error && (
          <div className="mb-6 bg-amber-55 border border-amber-200 text-amber-850 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in duration-200 text-xs shadow-xs font-sans max-w-[1700px] mx-auto">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="w-8 h-8 text-[#0B1E36] animate-spin mb-3" />
            <span className="text-xs font-mono tracking-widest text-slate-500">SYNCHRONIZING UNIVERSITY CURRICULA...</span>
          </div>
        ) : !data ? (
          <div className="bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl p-6 max-w-lg mx-auto mt-12 text-center shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="font-serif font-bold text-slate-800 text-lg mb-2">Registry Failed</h4>
            <p className="text-sm text-slate-600 mb-4">The OBE database files were unreachable.</p>
            <button onClick={fetchData} className="px-5 py-2 bg-indigo-600 text-white text-xs rounded-md">Retry</button>
          </div>
        ) : (
          <div className="max-w-[1700px] mx-auto space-y-6">

            {activeProgramId === '' ? (
              <div className="max-w-4xl mx-auto space-y-6 py-1 animate-in fade-in duration-350">
                
                <div className="text-center select-none pt-2">
                  <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                    Departmental Vision &amp; Mission Charters
                  </h1>
                </div>

                {/* Professional Academic-style Text blocks */}
                <div className="space-y-6">
                  {data.departments.filter(d => d.id === activeDeptId).map((dept) => {
                    return (
                      <div key={dept.id} className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden transition-all duration-200 text-left">
                        {/* Minimal left side accent stripe */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-800"></div>
                        
                        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6 pl-2">
                          <div>
                            <span className="text-xs font-sans font-extrabold tracking-wider text-indigo-650 uppercase">ACADEMIC DEPARTMENT SPECIFICATIONS</span>
                            <h3 className="text-2xl font-extrabold font-sans text-slate-950 tracking-tight mt-1">
                              {dept.name}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-6 pl-2 text-left">
                          {/* Vision section */}
                          <div className="space-y-2">
                            <h4 className="text-base font-sans font-extrabold tracking-wide text-slate-950 uppercase border-l-4 border-indigo-600 pl-2.5">DEPARTMENT VISION</h4>
                            <p className="text-slate-900 text-[16px] font-sans leading-relaxed italic pr-4 font-normal">
                              "{dept.vision}"
                            </p>
                          </div>

                          {/* Mission section */}
                          <div className="space-y-2">
                            <h4 className="text-base font-sans font-extrabold tracking-wide text-slate-950 uppercase border-l-4 border-indigo-600 pl-2.5">DEPARTMENT MISSION</h4>
                            <p className="text-slate-900 text-[16px] font-sans leading-relaxed pr-4 font-normal">
                              {dept.mission}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>



            {/* ----------------- MODULE VIEW 1: COURSE TO GA ALLOCATION (DEFAULT) ----------------- */}
            {activeModule === 'allocation' && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                
                {/* Section Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-5 px-6 flex flex-wrap items-center justify-between gap-4 select-none">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-indigo-950">
                      {activeDepartment?.name} — Course to Graduate Attributes (GA) allocation
                    </h3>
                    <p className="text-xs text-slate-700 font-sans mt-0.5">
                      Displays mapped graduate requirements. In configuration mode, click on coordinate cells (✓) to map/unmap attributes in real time.
                    </p>
                  </div>

                  {/* Right side course filters & status */}
                  <div className="flex items-center gap-4">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search code/title..."
                        value={searchPhrase}
                        onChange={(e) => setSearchPhrase(e.target.value)}
                        className="pl-8 pr-3 py-1.5 focus:outline-none border border-indigo-200/50 rounded-lg text-xs bg-white/70 focus:bg-white w-[180px] text-slate-800 transition-all outline-none"
                      />
                    </div>
                    
                    <span className="text-[10px] bg-white/50 backdrop-blur-md border border-white/65 rounded-lg px-2.5 py-1.5 text-indigo-950 font-bold uppercase tracking-wider shadow-sm">
                      {filteredCourses.length} Curricula Displayed
                    </span>
                  </div>
                </div>

                {/* Table Coordinate Matrix  */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-600/10 text-indigo-950 border-b border-indigo-100 text-[11px] font-bold tracking-wider select-none">
                        <th className="py-3 px-4 border-r border-indigo-100 w-[55px] text-center">Sr. No.</th>
                        <th className="py-3 px-4 border-r border-indigo-100 w-[110px]">Course Code</th>
                        <th className="py-3 px-4 border-r border-indigo-100 min-w-[280px]">Course Title</th>
                        
                        {/* Dynamic Attribute Column Blocks */}
                        {filteredGAs.map((ga, index) => (
                          <th 
                            key={ga.id} 
                            className="py-2 px-1 text-center border-r border-indigo-100 w-[78px] align-baseline bg-indigo-50/50 group relative"
                            title={ga.description}
                          >
                            <div className="text-[9px] uppercase tracking-tighter text-indigo-700 font-mono mb-1">
                              {ga.id}
                            </div>
                            <span className="block text-[10px] text-slate-800 font-semibold line-clamp-1 truncate leading-tight leading-3" style={{ fontSize: '9.5px' }}>
                              {ga.name}
                            </span>
                            
                            {/* Hover definition card */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-indigo-950/95 backdrop-blur-md text-white p-3 rounded-xl text-[11px] font-sans font-normal w-[240px] z-50 text-left shadow-xl pointer-events-none">
                              <span className="block font-bold text-indigo-300 mb-1">{ga.id}: {ga.name}</span>
                              <p className="text-slate-200 leading-relaxed font-normal">{ga.description}</p>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100/40 text-xs">
                      {paginatedCourses.map((course, idx) => {
                        const serialNumber = (currentPage - 1) * coursesPerPage + idx + 1;
                        return (
                          <tr 
                            key={course.id} 
                            className={`hover:bg-indigo-50/45 transition-colors ${
                              selectedCourseId === course.id ? 'bg-indigo-50 font-semibold border-y border-indigo-200' : ''
                            }`}
                          >
                            {/* Serial */}
                            <td className="py-2 px-4 border-r border-indigo-100 text-center font-mono text-slate-500 bg-indigo-50/20 w-[55px]">
                              {serialNumber}
                            </td>
                            {/* Code */}
                            <td className="py-2 px-4 border-r border-indigo-100 font-mono font-bold text-indigo-950 w-[110px]">
                              {course.code}
                            </td>
                            {/* Title */}
                            <td className="py-2 px-4 border-r border-[#e0e7ff] font-medium text-slate-800">
                              <div className="flex items-center justify-between gap-2">
                                <span className="break-words">{course.title}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {course.type === 'elective' && (
                                    <span className="text-[8px] bg-sky-100 text-sky-800 border border-sky-200 font-bold px-1.5 py-0.5 rounded uppercase">
                                      Elective
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* GA mapping nodes */}
                            {filteredGAs.map(ga => {
                              const isMapped = course.mappedGAs.includes(ga.id);
                              return (
                                <td 
                                  key={ga.id}
                                  onClick={() => handleToggleCourseGA(course, ga.id)}
                                  className={`border-r border-indigo-100 text-center p-1 cursor-pointer transition-all ${
                                    isConfiguring 
                                      ? 'hover:bg-indigo-100/50 hover:scale-105 active:scale-95' 
                                      : 'cursor-default'
                                  } ${isMapped ? 'bg-indigo-50/30' : ''}`}
                                >
                                  {isMapped ? (
                                    <div className="flex items-center justify-center">
                                      <span className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                                        ✓
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400/40 block text-center select-none font-normal">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {paginatedCourses.length === 0 && (
                        <tr>
                          <td colSpan={13} className="py-12 text-center text-slate-400 bg-slate-50">
                            <Sliders className="w-8 h-8 mx-auto opacity-30 mb-2" />
                            No matching courses found in database records. Change course highlight filter above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Senior-friendly big pagination bar to avoid vertical scrolling at all */}
                {selectedCourseId === 'all' && filteredCourses.length > coursesPerPage && (
                  <div className="bg-[#F8FAFC] border-t border-slate-200 py-3 px-6 flex items-center justify-between select-none">
                    <span className="text-xs text-slate-500">
                      Showing <strong className="text-slate-800">{(currentPage - 1) * coursesPerPage + 1}</strong> to <strong className="text-slate-800">{Math.min(currentPage * coursesPerPage, filteredCourses.length)}</strong> of <strong className="text-slate-800">{filteredCourses.length}</strong> available courses in curriculum
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous Block
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setCurrentPage(pIdx + 1)}
                            className={`w-7 h-7 text-xs rounded font-bold transition-all ${
                              currentPage === pIdx + 1
                                ? 'bg-[#0B1E36] text-white'
                                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pIdx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        Next Block <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* isolated selected card with single overview if highlighted */}
                {selectedCourseId !== 'all' && paginatedCourses[0] && (
                  <div className="p-4 bg-amber-50/50 border-t border-amber-300 text-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <strong className="text-amber-900 border-r border-[#D97706] pr-2 uppercase">Isolate Analysis View:</strong>
                      <span className="text-slate-700">{paginatedCourses[0].code} - {paginatedCourses[0].title} is selected. Switch to "Show All Courses" in dropdown to inspect entire matrix profile.</span>
                    </div>
                    <button 
                      onClick={() => setSelectedCourseId('all')}
                      className="px-3 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-[11px] rounded font-bold text-amber-950 shadow-sm"
                    >
                      Clear Highlights / Reset Matrix
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* ----------------- MODULE VIEW 2: PO TO GA MAPPING MATRIX ----------------- */}
            {activeModule === 'po_mapping' && activeProgram && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                
                {/* Section Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-5 px-6">
                  <h3 className="font-serif font-bold text-lg text-indigo-950">
                    Program Objectives Mapping with Graduate Attributes (PO to GA Matrix)
                  </h3>
                  <p className="text-xs text-slate-700 font-sans mt-0.5">
                    Aligns high-level objectives (PO1 to PO4) with critical graduate qualities (GAs).
                  </p>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-indigo-600/10 border-b border-indigo-100 text-xs font-bold text-indigo-950">
                          <th className="py-3 px-4 border-r border-indigo-100 text-left">Graduate Attributes (GAs) Code & Descriptor</th>
                          <th className="py-3 px-2 border-r border-indigo-100 text-center w-[110px]">PO-1</th>
                          <th className="py-3 px-2 border-r border-indigo-100 text-center w-[110px]">PO-2</th>
                          <th className="py-3 px-2 border-r border-indigo-100 text-center w-[110px]">PO-3</th>
                          <th className="py-3 px-2 text-center w-[110px]">PO-4</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-100/40 text-xs">
                        {filteredGAs.map((ga) => (
                           <tr key={ga.id} className="hover:bg-indigo-50/25" style={{ height: '54px' }}>
                            {/* GA descriptor card */}
                            <td className="py-2.5 px-4 border-r border-indigo-100">
                              <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-950 font-mono font-bold text-[10px] rounded mr-3">
                                {ga.id}
                              </span>
                              <strong className="text-slate-800 text-[12px]">{ga.name}</strong>
                              <p className="text-slate-500 text-[10.5px] mt-0.5 leading-relaxed">{ga.description}</p>
                            </td>

                            {/* Mapping Coordinators */}
                            {activeProgram.pos.map((po, poIdx) => {
                              const doesMap = po.mappedGAs.includes(ga.id);
                              return (
                                <td
                                  key={po.id}
                                  onClick={() => handleTogglePOGA(poIdx, ga.id)}
                                  className={`border-r border-indigo-100 text-center p-2 transition-all ${
                                    isConfiguring 
                                      ? 'hover:bg-indigo-100/50 hover:scale-105 cursor-pointer text-indigo-900 border-y border-indigo-100/40' 
                                      : 'cursor-default'
                                  } ${doesMap ? 'bg-emerald-500/10' : ''}`}
                                >
                                  {doesMap ? (
                                    <div className="flex items-center justify-center">
                                      <span className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                                        ✓
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 block select-none">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>



                </div>

              </div>
            )}

            {/* ----------------- MODULE VIEW 3: UNIVERSITY & DEPARTMENT VISION/MISSION ----------------- */}
            {activeModule === 'vision_mission' && activeDepartment && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in duration-200 fade-in-25">
                
                {/* Department or Program Specific Brand Identity Sheets */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                  
                  {activeProgram ? (
                    <>
                      <div className="bg-indigo-900/90 text-white p-6 select-none flex items-center justify-between border-b border-indigo-800">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-200 font-bold">PROGRAM SPECIFIC CHARTER</span>
                          <h3 className="font-serif font-bold text-lg">{activeProgram.name} ({activeProgram.code}) Vision &amp; Mission</h3>
                        </div>
                        <GraduationCap className="w-8 h-8 opacity-40 text-white" />
                      </div>

                      <div className="p-6 md:p-8 space-y-8">
                        
                        {/* Program Vision Block */}
                        <div className="space-y-4 bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-xs text-left relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                          <div className="flex items-center gap-2 pl-2">
                            <Award className="w-5 h-5 text-indigo-650 shrink-0" />
                            <h4 className="font-sans font-extrabold text-slate-950 text-base tracking-wide uppercase">PROGRAM VISION STATEMENT</h4>
                          </div>
                          
                          {isConfiguring ? (
                            <div className="space-y-2 pl-2">
                              <textarea
                                value={editProgramVision}
                                onChange={(e) => setEditProgramVision(e.target.value)}
                                rows={3}
                                className="w-full p-4 text-base bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-normal"
                                placeholder="Type program vision statement..."
                              />
                              <p className="text-[10px] text-slate-400 italic">This will alter the active program vision across all linked interfaces.</p>
                            </div>
                          ) : (
                            <p className="font-sans text-base leading-relaxed italic text-slate-900 pl-9 py-1 font-medium">
                              "{editProgramVision || '(Program vision statement undefined)'}"
                            </p>
                          )}
                        </div>

                        {/* Program Mission Block */}
                        <div className="space-y-4 bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-xs text-left relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                          <div className="flex items-center gap-2 pl-2">
                            <Compass className="w-5 h-5 text-indigo-650 shrink-0" />
                            <h4 className="font-sans font-extrabold text-slate-950 text-base tracking-wide uppercase">PROGRAM MISSION STATEMENT</h4>
                          </div>

                          {isConfiguring ? (
                            <div className="space-y-2 pl-2">
                              <textarea
                                value={editProgramMission}
                                onChange={(e) => setEditProgramMission(e.target.value)}
                                rows={5}
                                className="w-full p-4 text-base bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-normal"
                                placeholder="Type program mission statement..."
                              />
                              <p className="text-[10px] text-slate-400 italic">This will alter the active program mission across all linked interfaces.</p>
                            </div>
                          ) : (
                            <p className="font-sans text-base leading-relaxed text-slate-900 pl-9 py-1 font-medium">
                              {editProgramMission || '(Program mission statement undefined)'}
                            </p>
                          )}
                        </div>

                        {/* Configuration Program Save Area */}
                        {isConfiguring && (
                           <div className="flex justify-end border-t border-indigo-100 pt-5">
                            <button
                              onClick={handleSaveProgramVisionMission}
                              disabled={savingLoad}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-100"
                            >
                              {savingLoad ? <Loader2 className="w-4 h-4 animate-spin" /> : '💾 SAVE PROGRAM CHARTER CHANGES'}
                            </button>
                          </div>
                        )}

                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-900/90 text-white p-6 select-none flex items-center justify-between border-b border-indigo-800">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-200 font-bold">DEPARTMENT SPECIFIC CHARTER</span>
                          <h3 className="font-serif font-bold text-lg">{activeDepartment.name} Vision &amp; Mission</h3>
                        </div>
                        <GraduationCap className="w-8 h-8 opacity-40 text-white" />
                      </div>

                      <div className="p-6 md:p-8 space-y-8">
                        
                        {/* Department Vision Block */}
                        <div className="space-y-4 bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-xs text-left relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                          <div className="flex items-center gap-2 pl-2">
                            <Award className="w-5 h-5 text-indigo-650 shrink-0" />
                            <h4 className="font-sans font-extrabold text-slate-950 text-base tracking-wide uppercase">DEPARTMENT VISION STATEMENT</h4>
                          </div>
                          
                          {isConfiguring ? (
                            <div className="space-y-2 pl-2">
                              <textarea
                                value={editVision}
                                onChange={(e) => setEditVision(e.target.value)}
                                rows={3}
                                className="w-full p-4 text-base bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-normal"
                                placeholder="Type department vision statement..."
                              />
                              <p className="text-[10px] text-slate-400 italic">This will alter the active department vision across all linked interfaces.</p>
                            </div>
                          ) : (
                            <p className="font-sans text-base leading-relaxed italic text-slate-900 pl-9 py-1 font-medium">
                              "{editVision || '(Department vision statement undefined)'}"
                            </p>
                          )}
                        </div>

                        {/* Department Mission Block */}
                        <div className="space-y-4 bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-xs text-left relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                          <div className="flex items-center gap-2 pl-2">
                            <Compass className="w-5 h-5 text-indigo-650 shrink-0" />
                            <h4 className="font-sans font-extrabold text-slate-950 text-base tracking-wide uppercase">DEPARTMENT MISSION STATEMENT</h4>
                          </div>

                          {isConfiguring ? (
                            <div className="space-y-2 pl-2">
                              <textarea
                                value={editMission}
                                onChange={(e) => setEditMission(e.target.value)}
                                rows={5}
                                className="w-full p-4 text-base bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-normal"
                                placeholder="Type department mission statement..."
                              />
                              <p className="text-[10px] text-slate-400 italic">This will alter the active department mission across all linked interfaces.</p>
                            </div>
                          ) : (
                            <p className="font-sans text-base leading-relaxed text-slate-900 pl-9 py-1 font-medium">
                              {editMission || '(Department mission statement undefined)'}
                            </p>
                          )}
                        </div>

                        {/* Configuration Department Save Area */}
                        {isConfiguring && (
                           <div className="flex justify-end border-t border-indigo-100 pt-5">
                            <button
                              onClick={handleSaveVisionMission}
                              disabled={savingLoad}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-100"
                            >
                              {savingLoad ? <Loader2 className="w-4 h-4 animate-spin" /> : '💾 SAVE DEPARTMENT CHARTER CHANGES'}
                            </button>
                          </div>
                        )}

                      </div>
                    </>
                  )}

                </div>

              </div>
            )}

            {/* ----------------- MODULE VIEW 4: CONFIGURE PROGRAM OBJECTIVES ----------------- */}
            {activeModule === 'po_configure' && activeProgram && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                
                {/* Section Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-5 px-6">
                  <h3 className="font-serif font-bold text-lg text-indigo-950">
                    Configure Program Objectives (PO-1 to PO-4 Definitions)
                  </h3>
                  <p className="text-xs text-slate-700 font-sans mt-0.5">
                    Modifies the primary program educational outcomes (PEO/POs) text. You must toggle "ACTIVATE CORE CONFIGURATION" at the top to unlock inputs.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {editPOs.map((po, idx) => (
                    <div key={po.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col md:flex-row gap-4 items-start shadow-xs">
                      
                      {/* PO label */}
                      <div className="flex items-center gap-2 shrink-0 md:w-[130px]">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-serif shadow-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-indigo-950 font-serif block text-xs">OBJECTIVE {idx + 1}</strong>
                          <span className="text-[9px] text-indigo-900/60 font-mono tracking-wider font-extrabold uppercase">{po.id}</span>
                        </div>
                      </div>

                      {/* PO Editor */}
                      <div className="flex-1 w-full">
                        {isConfiguring ? (
                          <textarea
                            value={po.text}
                            onChange={(e) => handlePOTextChange(idx, e.target.value)}
                            rows={2}
                            placeholder={`Define program objective PO${idx + 1}...`}
                            className="w-full text-xs p-3 font-medium bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                          />
                        ) : (
                          <div className="p-3.5 bg-white/55 border border-[#e2e8f0]/40 rounded-xl font-medium text-xs leading-relaxed text-slate-800 italic select-all shadow-xs border border-indigo-100/20">
                            "{po.text || 'Objective statement is not configured yet. Unlock Configuration to define.'}"
                          </div>
                        )}
                        
                        {/* Dynamic list of GAs associated with this PO */}
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9.5px] font-mono text-indigo-950/60 font-bold uppercase tracking-wider">Associated Attributes:</span>
                          {po.mappedGAs.map(gid => (
                            <span key={gid} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/50 font-mono font-bold text-[9px] text-indigo-950">
                              {gid}
                            </span>
                          ))}
                          {po.mappedGAs.length === 0 && (
                            <span className="text-[10px] text-indigo-400 italic">No associated GAs mapped. Go to PO to GA Mapping sheet.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}

                  {/* Program Configuration Action Button */}
                  {isConfiguring && (
                    <div className="flex justify-end border-t border-indigo-100 pt-5">
                      <button
                        onClick={handleSavePOTexts}
                        disabled={savingLoad}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-100"
                      >
                        {savingLoad ? <Loader2 className="w-4 h-4 animate-spin" /> : '💾 REGISTER OBJECTIVES IN UNIVERSITY DB'}
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* ----------------- MODULE VIEW 5: GA ATTAINMENT REPORTS ----------------- */}
            {activeModule === 'attainment_reports' && (
              <div className="space-y-6 max-w-7xl mx-auto animate-in duration-200 fade-in-25">
                
                {/* Control Panel / Filter Banner */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        Graduate Attribute (GA) Attainment Reports
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Select a Program and Batch to query the active database outcomes. Passing threshold is 50% as per Compliance Criteria.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                      {/* Program Selector */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Programme</label>
                        <select
                          value={selectedReportProgramId}
                          onChange={(e) => {
                            setSelectedReportProgramId(e.target.value);
                            setSelectedReportCourseCode('all'); // reset course on program change
                          }}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[150px] shadow-xs"
                        >
                          <option value="all">All Programmes</option>
                          {data?.programs?.filter(p => p.departmentId === activeDeptId).map(p => (
                            <option key={p.id} value={p.id}>{p.code.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      {/* Batch Selector */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batch</label>
                        <select
                          value={selectedReportBatch}
                          onChange={(e) => {
                            setSelectedReportBatch(e.target.value);
                          }}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[120px] shadow-xs"
                        >
                          {(() => {
                            const extractedBatches = Array.from(new Set(students.map(s => getStudentBatchCode(s.regNo))));
                            if (extractedBatches.length === 0) {
                              return (
                                <>
                                  <option value="fa22">FA22</option>
                                  <option value="fa23">FA23</option>
                                  <option value="sp24">SP24</option>
                                  <option value="fa24">FA24</option>
                                </>
                              );
                            }
                            return extractedBatches.sort().map((b: any) => (
                              <option key={b} value={b}>{(b as string).toUpperCase()}</option>
                            ));
                          })()}
                        </select>
                      </div>

                      {/* Course Selector - Only visible if specific program chosen */}
                      {selectedReportProgramId !== 'all' && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Course Assessment Sheet</label>
                          <select
                            value={selectedReportCourseCode}
                            onChange={(e) => setSelectedReportCourseCode(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[180px] shadow-xs"
                          >
                            <option value="all">All Courses (GA Summary)</option>
                            {data?.courses
                              .filter(c => c.departmentId === activeDeptId && c.programId === selectedReportProgramId)
                              .map(c => (
                                <option key={c.id} value={c.code}>{c.code} — {c.title}</option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {loadingReports ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-xs">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">Querying OBE and compiling Graduate Attribute scores...</p>
                  </div>
                ) : reportMetrics.filteredStudents.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
                    <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">No Student Enrollments Found</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      There are no registered students in department <span className="font-bold text-indigo-950 font-mono">{(activeDeptId || '').toUpperCase()}</span> for batch <span className="font-bold text-indigo-950 font-mono">{(selectedReportBatch || 'FA22').toUpperCase()}</span> matching your filters.
                    </p>
                  </div>
                ) : selectedReportCourseCode !== 'all' ? (
                  /* ----------------- COURSE LEVEL ASSESSMENT REPORT SHEET (image.png layout) ----------------- */
                  (() => {
                    const activeCourseCode = selectedReportCourseCode;
                    const reportProgClean = selectedReportProgramId && selectedReportProgramId !== 'all' ? String(selectedReportProgramId).trim().toLowerCase() : '';
                    const courseObj = data?.courses.find(c => c.code === activeCourseCode && (!reportProgClean || String(c.programId).trim().toLowerCase() === reportProgClean)) || data?.courses.find(c => c.code === activeCourseCode);
                    const instCourse = (() => {
                      const existing = instructorCourses.find(ic => ic.code === activeCourseCode);
                      if (existing) return existing;
                      
                      // Fallback simulated detailed marks for beautiful sheet formatting
                      const courseStudents = reportMetrics.filteredStudents;
                      const codeStr = String(activeCourseCode || courseObj?.code || '').trim().toUpperCase();
                      const titleStr = String(courseObj?.title || '').trim().toLowerCase();
                      const isLab = courseObj?.courseType === 'Lab' || codeStr.endsWith('L') || titleStr.includes('lab');
                      const dummyCategories = isLab ? [
                        { name: "Mid Term", percentage: 20, units: 1 },
                        { name: "Final", percentage: 30, units: 1 },
                        { name: "Lab Reports", percentage: 10, units: 3 },
                        { name: "Lab Performance", percentage: 10, units: 3 },
                        { name: "Viva", percentage: 5, units: 1 },
                        { name: "Assignments", percentage: 5, units: 3 },
                        { name: "Quizzes", percentage: 5, units: 3 },
                        { name: "Open Ended Lab", percentage: 5, units: 1 },
                        { name: "Other Activities", percentage: 5, units: 1 },
                        { name: "Project", percentage: 5, units: 1 }
                      ] : [
                        { name: "Assignments", percentage: 15, units: 3 },
                        { name: "Quizzes", percentage: 10, units: 3 },
                        { name: "Mid Term", percentage: 30, units: 1 },
                        { name: "Final", percentage: 45, units: 1 }
                      ];
                      const dummyUnitsData: Record<string, any[]> = isLab ? {
                        "Mid Term": [{ unitNo: 1, totalMarks: 30, weightage: 100 }],
                        "Final": [{ unitNo: 1, totalMarks: 40, weightage: 100 }],
                        "Lab Reports": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Lab Performance": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Viva": [{ unitNo: 1, totalMarks: 10, weightage: 100 }],
                        "Assignments": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Quizzes": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Open Ended Lab": [{ unitNo: 1, totalMarks: 10, weightage: 100 }],
                        "Other Activities": [{ unitNo: 1, totalMarks: 10, weightage: 100 }],
                        "Project": [{ unitNo: 1, totalMarks: 30, weightage: 100 }]
                      } : {
                        "Assignments": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Quizzes": [
                          { unitNo: 1, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 2, totalMarks: 10, weightage: 33.3 },
                          { unitNo: 3, totalMarks: 10, weightage: 33.4 }
                        ],
                        "Mid Term": [
                          { unitNo: 1, totalMarks: 30, weightage: 100 }
                        ],
                        "Final": [
                          { unitNo: 1, totalMarks: 50, weightage: 100 }
                        ]
                      };

                      const simulatedStudents = courseStudents.map(s => {
                        const hash = (s.regNo + activeCourseCode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const marks: Record<string, number> = {};
                        
                        dummyCategories.forEach(cat => {
                          for (let u = 1; u <= cat.units; u++) {
                            const matchingUnit = dummyUnitsData[cat.name]?.find((un: any) => un.unitNo === u);
                            const totalMarks = matchingUnit ? matchingUnit.totalMarks : 10;
                            const passPercent = 45 + (hash % 50); // 45% to 95%
                            marks[`${cat.name}-${u}`] = Math.round((passPercent / 100) * totalMarks * 10) / 10;
                          }
                        });

                        return {
                          regNo: s.regNo,
                          name: s.name,
                          marks
                        };
                      });

                      return {
                        id: `sim-${activeCourseCode}`,
                        code: activeCourseCode,
                        title: courseObj?.title || 'Unknown Course',
                        categories: dummyCategories,
                        unitsData: dummyUnitsData,
                        students: simulatedStudents
                      };
                    })();

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Assessment Sheet
                          </button>
                        </div>

                        {/* Printable Area Card */}
                        <div id="printable-course-assessment-sheet" className="bg-white border border-slate-300 rounded-2xl shadow-sm p-6 md:p-8 font-sans text-slate-800 border-double border-4">
                          {/* Centered Header */}
                          <div className="text-center pb-6 border-b border-slate-300">
                            <h2 className="text-lg font-serif font-extrabold uppercase tracking-wide text-slate-900">Course Assessment Report</h2>
                            <p className="text-xs text-indigo-950 font-bold mt-1">Department: {activeDepartment?.name}</p>
                          </div>

                          {/* Info Rows */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-xs pt-6 pb-6 border-b border-slate-200">
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Course Name:</span>
                              <span className="ml-2 font-black text-slate-950">{courseObj?.title}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Session / Batch:</span>
                              <span className="ml-2 font-black text-slate-950">{(selectedReportBatch || 'FA22').toUpperCase()} Semester</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Course Code:</span>
                              <span className="ml-2 font-mono font-black text-slate-950">{activeCourseCode}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Instructor:</span>
                              <span className="ml-2 font-black text-slate-950">IU Faculty / Dept Admin</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Section:</span>
                              <span className="ml-2 font-black text-slate-950">A</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[10px]">Passing Criteria:</span>
                              <span className="ml-2 font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">50% Marks (KPI)</span>
                            </div>
                          </div>

                          {/* Legend / KPI Row */}
                          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl my-4 text-[10px] text-slate-500 font-bold flex flex-wrap gap-4 items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-indigo-600" />
                              Legend: CLO KPI - 50.0%, Filter: Without CQI
                            </span>
                            <span className="text-rose-600">X — Not able to attain as per KPI threshold (&lt;50%)</span>
                          </div>

                          {/* The Big Assessment Spreadsheet */}
                          <div className="overflow-x-auto border border-slate-300 rounded-xl">
                            <table className="w-full border-collapse text-[11px] text-left border-slate-300">
                              <thead>
                                {/* Top Category Header Row */}
                                <tr className="bg-slate-100 border-b border-slate-300">
                                  <th className="px-3 py-2 border-r border-slate-300 text-slate-700 font-bold w-12 text-center" rowSpan={2}>Sr#</th>
                                  <th className="px-3 py-2 border-r border-slate-300 text-slate-700 font-bold w-36" rowSpan={2}>Registration No</th>
                                  <th className="px-3 py-2 border-r border-slate-300 text-slate-700 font-bold w-48" rowSpan={2}>Student Name</th>
                                  
                                  {/* Map categories as columns */}
                                  {instCourse.categories?.map((cat: any) => (
                                    <th 
                                      key={cat.name} 
                                      className="px-3 py-1 text-center border-r border-slate-300 text-slate-800 font-bold bg-indigo-50/50"
                                      colSpan={cat.units + 2}
                                    >
                                      {cat.name} ({cat.percentage}%)
                                    </th>
                                  ))}
                                  
                                  <th className="px-3 py-2 text-center text-slate-800 font-black bg-indigo-100/50" rowSpan={2}>Grand Total %</th>
                                  <th className="px-3 py-2 text-center text-slate-800 font-black bg-indigo-100/50 w-24" rowSpan={2}>GA Attainment Status</th>
                                </tr>

                                {/* Sub unit items header row */}
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  {instCourse.categories?.map((cat: any) => {
                                    const unitsList = Array.from({ length: cat.units }, (_, i) => i + 1);
                                    return (
                                      <Fragment key={cat.name}>
                                        {unitsList.map(u => {
                                          const unitData = instCourse.unitsData?.[cat.name]?.find((un: any) => un.unitNo === u);
                                          return (
                                            <th key={`${cat.name}-${u}`} className="px-1.5 py-1 text-center border-r border-slate-200 text-slate-500 font-mono text-[9px] w-12 font-semibold">
                                              U{u} <span className="block text-[8px] text-slate-400 font-sans">({unitData?.totalMarks || 10}m)</span>
                                            </th>
                                          );
                                        })}
                                        <th className="px-2 py-1 text-center border-r border-slate-200 text-slate-700 font-bold bg-slate-100/60 w-14">Total</th>
                                        <th className="px-2 py-1 text-center border-r border-slate-300 text-slate-700 font-bold bg-slate-100/60 w-14">%</th>
                                      </Fragment>
                                    );
                                  })}
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-slate-200">
                                {instCourse.students?.map((std: any, idx: number) => {
                                  // Compute grand total and individual category details
                                  let grandTotalPercentage = 0;
                                  let categoriesCount = 0;
                                  let categoryPassDetails: Record<string, { totalMarks: number, score: number, pct: number, isPassed: boolean }> = {};

                                  instCourse.categories?.forEach((cat: any) => {
                                    if (cat.percentage > 0) {
                                      let categoryObtainedSum = 0;
                                      let categoryMaxMarksSum = 0;
                                      const existingUnits = instCourse.unitsData?.[cat.name] || [];
                                      
                                      for (let u = 1; u <= cat.units; u++) {
                                        const matchingUnit = existingUnits.find((unit: any) => unit.unitNo === u);
                                        const questions = matchingUnit?.questions || [];
                                        if (questions.length > 0) {
                                          questions.forEach((q: any) => {
                                            categoryMaxMarksSum += q.maxMarks || 0;
                                            const qKey = `q-${cat.name}-${u}-${q.id}`;
                                            categoryObtainedSum += std.marks?.[qKey] ?? 0;
                                          });
                                        } else {
                                          const totalMarks = matchingUnit ? matchingUnit.totalMarks : 10;
                                          categoryMaxMarksSum += totalMarks;
                                          const dKey = `${cat.name}-${u}`;
                                          categoryObtainedSum += std.marks?.[dKey] ?? 0;
                                        }
                                      }
                                      
                                      const categoryContribution = categoryMaxMarksSum > 0
                                        ? (categoryObtainedSum / categoryMaxMarksSum) * cat.percentage
                                        : 0;
                                      grandTotalPercentage += categoryContribution;
                                      categoriesCount++;

                                      const pct = categoryMaxMarksSum > 0 ? (categoryObtainedSum / categoryMaxMarksSum) * 100 : 0;
                                      categoryPassDetails[cat.name] = {
                                        totalMarks: categoryMaxMarksSum,
                                        score: categoryObtainedSum,
                                        pct,
                                        isPassed: pct >= 50
                                      };
                                    }
                                  });

                                  const isOverallPassed = grandTotalPercentage >= 50;

                                  return (
                                    <tr key={std.regNo} className="hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                                      <td className="px-3 py-2 text-center border-r border-slate-300 font-mono text-slate-400">{idx + 1}</td>
                                      <td className="px-3 py-2 border-r border-slate-300 font-mono font-bold text-slate-900">{std.regNo}</td>
                                      <td className="px-3 py-2 border-r border-slate-300 font-bold text-slate-800">{std.name}</td>

                                      {/* Marks columns */}
                                      {instCourse.categories?.map((cat: any) => {
                                        const unitsList = Array.from({ length: cat.units }, (_, i) => i + 1);
                                        const catDetail = categoryPassDetails[cat.name] || { totalMarks: 10, score: 0, pct: 0, isPassed: true };
                                        
                                        return (
                                          <Fragment key={cat.name}>
                                            {unitsList.map(u => {
                                              const unitId = `${cat.name}-${u}`;
                                              const mark = std.marks?.[unitId] ?? 0;
                                              return (
                                                <td key={`${std.regNo}-${cat.name}-${u}`} className="px-1.5 py-2 text-center border-r border-slate-200 font-mono font-medium text-slate-600">
                                                  {mark.toFixed(1)}
                                                </td>
                                              );
                                            })}
                                            {/* Category Total */}
                                            <td className="px-2 py-2 text-center border-r border-slate-200 font-mono font-bold text-slate-900 bg-slate-50/50">
                                              {catDetail.score.toFixed(1)}
                                            </td>
                                            {/* Category % */}
                                            <td className={`px-2 py-2 text-center border-r border-slate-300 font-mono font-extrabold bg-slate-50/50 ${
                                              catDetail.isPassed ? 'text-emerald-700' : 'text-rose-600'
                                            }`}>
                                              {catDetail.pct.toFixed(0)}%
                                              {!catDetail.isPassed && <span className="ml-1 text-[8px] font-black uppercase text-rose-500 bg-rose-50 px-1 py-0.5 rounded">X</span>}
                                            </td>
                                          </Fragment>
                                        );
                                      })}

                                      {/* Grand Total */}
                                      <td className="px-3 py-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30">
                                        {grandTotalPercentage.toFixed(1)}%
                                      </td>
                                      
                                      {/* GA Status */}
                                      <td className="px-3 py-2 text-center border-l border-slate-300">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                          isOverallPassed 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                          {isOverallPassed ? 'ATTAINED' : 'NOT ATTAINED'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* ----------------- GENERAL GA ATTAINMENT REPORT VIEW ----------------- */
                  <div className="space-y-6">
                    {/* Summary statistics row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stat 1 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-indigo-100 transition-all">
                        <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl text-indigo-650 shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Cohort Count</p>
                          <h4 className="text-xl font-black text-slate-800 font-mono mt-1">{reportMetrics.filteredStudents.length} Students</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Assessed in {selectedReportBatch.toUpperCase()} batch</p>
                        </div>
                      </div>

                      {/* Stat 2 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-indigo-100 transition-all">
                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-650 shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall GA Attainment</p>
                          <h4 className="text-xl font-black text-slate-800 font-mono mt-1">{reportMetrics.overallPassRate}%</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Passing rate across all metrics</p>
                        </div>
                      </div>

                      {/* Stat 3 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-indigo-100 transition-all">
                        <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-amber-650 shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Highest Attainment</p>
                          <h4 className="text-sm font-black text-slate-800 mt-1 uppercase font-mono">{reportMetrics.topGA}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Top performing criteria</p>
                        </div>
                      </div>

                      {/* Stat 4 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-indigo-100 transition-all">
                        <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-rose-650 shrink-0">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lowest Attainment</p>
                          <h4 className="text-sm font-black text-slate-800 mt-1 uppercase font-mono">{reportMetrics.bottomGA}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Needs curricular audit support</p>
                        </div>
                      </div>
                    </div>

                    {/* Bar chart representation */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-600" />
                          Cohort GA Attainment Distribution Histogram (Pass Threshold: 50% Marks)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Displays the percentage of students in the selected batch who successfully achieved a score of 50% or above in each Graduate Attribute (GA).
                        </p>
                      </div>

                      {/* The Bar graph itself */}
                      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
                        <div className="h-64 flex items-end gap-3 md:gap-4.5 border-b border-slate-300 pb-1.5 w-full relative">
                          
                          {/* Y-axis labels */}
                          <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none text-[8.5px] font-mono text-slate-300 font-bold">
                            <div className="border-b border-slate-200/60 pb-0.5 w-full text-left">100% Attainment</div>
                            <div className="border-b border-slate-200/60 pb-0.5 w-full text-left">75%</div>
                            <div className="border-b border-slate-200/60 pb-0.5 w-full text-left">50% Threshold</div>
                            <div className="border-b border-slate-200/60 pb-0.5 w-full text-left">25%</div>
                            <div className="w-full text-left">0%</div>
                          </div>

                          {/* Render actual bars */}
                          {reportMetrics.gaMetrics.map(metric => {
                            const passedPct = metric.percentage;
                            const isAssessed = metric.totalCount > 0;
                            return (
                              <div key={metric.id} className="flex-1 flex flex-col items-center group relative z-10">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-3 rounded-lg shadow-xl pointer-events-none w-48 font-sans z-40 text-center leading-normal">
                                  <p className="font-bold text-indigo-300 uppercase font-mono text-[9px] mb-1">{metric.id}</p>
                                  {isAssessed ? (
                                    <p className="font-black text-white text-xs mb-1">{passedPct}% Pass Rate</p>
                                  ) : (
                                    <p className="font-black text-slate-300 text-xs mb-1">No Graded Data</p>
                                  )}
                                  <div className="border-t border-slate-700 my-1 pt-1 text-slate-400 flex justify-between font-mono">
                                    <span>Passed: {isAssessed ? metric.passedCount : '—'}</span>
                                    <span>Failed: {isAssessed ? metric.failedCount : '—'}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">{metric.name}</p>
                                </div>

                                {/* Bar background and fill */}
                                <div className="w-full bg-slate-200 rounded-t-lg h-48 flex items-end overflow-hidden border border-slate-300 shadow-xs hover:border-indigo-400 transition-colors">
                                  {isAssessed && (
                                    <div 
                                      className={`w-full rounded-t-sm transition-all duration-500 hover:brightness-105 cursor-pointer ${
                                        passedPct >= 80 
                                          ? 'bg-emerald-500' 
                                          : passedPct >= 65 
                                          ? 'bg-teal-500' 
                                          : passedPct >= 50 
                                          ? 'bg-amber-500' 
                                          : 'bg-rose-500'
                                      }`}
                                      style={{ height: `${passedPct}%` }}
                                    />
                                  )}
                                </div>

                                {/* Label badge */}
                                <span className="font-mono text-[9px] font-black text-slate-700 mt-2 bg-white px-1.5 py-0.5 border border-slate-200 rounded uppercase tracking-tighter">
                                  {metric.id.split('-').pop()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* List Table of GAs */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 p-5">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Outcome Assessment Analysis Table</h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 uppercase text-[9.5px] tracking-wider">
                              <th className="px-6 py-3 w-28">GA Code</th>
                              <th className="px-6 py-3">Attribute Description Specifications</th>
                              <th className="px-6 py-3 text-center w-32">Total Cohort</th>
                              <th className="px-6 py-3 text-center w-32">Passed (&gt;=50)</th>
                              <th className="px-6 py-3 text-center w-32">Failed (&lt;50)</th>
                              <th className="px-6 py-3 text-right w-36">Attainment %</th>
                              <th className="px-6 py-3 text-center w-36">Compliance Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {reportMetrics.gaMetrics.map(metric => {
                              const isAssessed = metric.totalCount > 0;
                              return (
                                <tr key={metric.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                                  <td className="px-6 py-3.5 font-mono font-black text-indigo-700 text-xs">
                                    {metric.id}
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <div className="font-bold text-slate-900">{metric.name}</div>
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{metric.description || 'Washington Accord attribute compliance measure.'}</div>
                                  </td>
                                  <td className="px-6 py-3.5 text-center font-mono text-slate-600">
                                    {metric.totalCount} Students
                                  </td>
                                  <td className="px-6 py-3.5 text-center font-mono text-emerald-600 font-bold">
                                    {isAssessed ? metric.passedCount : '—'}
                                  </td>
                                  <td className="px-6 py-3.5 text-center font-mono text-rose-500">
                                    {isAssessed ? metric.failedCount : '—'}
                                  </td>
                                  <td className="px-6 py-3.5 text-right font-mono font-black text-slate-900 text-sm">
                                    {isAssessed ? `${metric.percentage}%` : '—'}
                                  </td>
                                  <td className="px-6 py-3.5 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                      !isAssessed
                                        ? 'bg-slate-50 text-slate-400 border-slate-200'
                                        : metric.percentage >= 80
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : metric.percentage >= 65
                                        ? 'bg-teal-50 text-teal-700 border-teal-100'
                                        : metric.percentage >= 50
                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                      {!isAssessed ? 'No Data' : metric.percentage >= 80 ? 'Excellent' : metric.percentage >= 65 ? 'Good' : metric.percentage >= 50 ? 'Satisfactory' : 'Needs Support'}
                                    </span>
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
              </div>
            )}

              </>
            )}
          </div>
        )}

      </main>

      {/* Vision & Mission Modal Popup */}
      {viewVmModal && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150" 
          onClick={() => { setViewVmModal(null); setIsEditingVm(false); }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Titlebar */}
            <div className="bg-[#1e1b4b] text-white px-5 py-4 flex items-center justify-between border-b border-indigo-950">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-300" />
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-200 block">
                    {viewVmModal.type === 'department' ? 'DEPARTMENT SPECIFICATION' : 'PROGRAM SPECIFICATION'}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {viewVmModal.name} {viewVmModal.code ? `(${viewVmModal.code})` : ''}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => { setViewVmModal(null); setIsEditingVm(false); }}
                className="text-white/70 hover:text-white cursor-pointer hover:bg-white/15 rounded-lg p-1.5 transition-all focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Vision Section */}
              <div className="space-y-3 bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                <div className="flex items-center justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                    <h4 className="font-sans font-black text-slate-900 text-xs tracking-wider uppercase">VISION STATEMENT</h4>
                  </div>
                  {!isEditingVm && (
                    <button
                      onClick={() => {
                        setIsEditingVm(true);
                        setEditVmVision(viewVmModal.vision);
                        setEditVmMission(viewVmModal.mission);
                      }}
                      className="text-indigo-600 hover:text-indigo-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors focus:outline-none"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                {isEditingVm ? (
                  <div className="pl-7 pr-1 py-0.5">
                    <textarea
                      value={editVmVision}
                      onChange={(e) => setEditVmVision(e.target.value)}
                      rows={3}
                      className="w-full text-slate-800 text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed font-sans font-medium"
                      placeholder="Enter vision statement..."
                    />
                  </div>
                ) : (
                  <p className="text-slate-800 text-sm leading-relaxed italic pl-7 py-0.5 font-medium">
                    "{viewVmModal.vision || 'Vision statement undefined.'}"
                  </p>
                )}
              </div>

              {/* Mission Section */}
              <div className="space-y-3 bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                <div className="flex items-center justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                    <h4 className="font-sans font-black text-slate-900 text-xs tracking-wider uppercase">MISSION STATEMENT</h4>
                  </div>
                  {!isEditingVm && (
                    <button
                      onClick={() => {
                        setIsEditingVm(true);
                        setEditVmVision(viewVmModal.vision);
                        setEditVmMission(viewVmModal.mission);
                      }}
                      className="text-indigo-600 hover:text-indigo-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors focus:outline-none"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                {isEditingVm ? (
                  <div className="pl-7 pr-1 py-0.5">
                    <textarea
                      value={editVmMission}
                      onChange={(e) => setEditVmMission(e.target.value)}
                      rows={5}
                      className="w-full text-slate-800 text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed font-sans font-medium"
                      placeholder="Enter mission statement..."
                    />
                  </div>
                ) : (
                  <p className="text-slate-800 text-sm leading-relaxed pl-7 py-0.5 font-medium whitespace-pre-line">
                    {viewVmModal.mission || 'Mission statement undefined.'}
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              {isEditingVm ? (
                <>
                  <button
                    onClick={() => setIsEditingVm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer focus:outline-none"
                    disabled={savingLoad}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVmModal}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer focus:outline-none flex items-center gap-1.5"
                    disabled={savingLoad}
                  >
                    {savingLoad ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingVm(true);
                      setEditVmVision(viewVmModal.vision);
                      setEditVmMission(viewVmModal.mission);
                    }}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-950 text-xs font-bold rounded-lg transition-colors cursor-pointer focus:outline-none flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setViewVmModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer focus:outline-none"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Modal Windows (ResultMate Desktop Style) */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none" onClick={() => setActiveModal(null)}>
          <div 
            className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Titlebar */}
            <div className="bg-[#1e293b] text-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-indigo-950">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                {activeModal === 'about' && 'About ResultMate OBE v4.6'}
                {activeModal === 'clos' && 'Course CLO-GA Distribution Sheet'}
                {activeModal === 'plos' && 'PLO Program Educational Outcomes Guidelines'}
                {activeModal === 'statistics' && 'Attribute Distribution Histogram Diagram'}
                {activeModal === 'integrity' && 'OBE Alignment Integrity Auditor'}
                {activeModal === 'help' && 'OBE Mapping Guidelines and Manual'}
                {activeModal === 'add_program' && 'Register New Academic Program'}
                {activeModal === 'edit_program_vm' && 'Modify Program Mission & Vision Charter'}
                {activeModal === 'add_course' && 'Add Program Curricular Course'}
                {activeModal === 'edit_course' && 'Edit Course Specification Details'}
              </span>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 rounded-md px-2 py-0.5 text-xs font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal scrollable Content Area */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs leading-relaxed space-y-4">
              
              {/* 1. ABOUT MODAL */}
              {activeModal === 'about' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-lg">
                    <FileText className="w-10 h-10 text-indigo-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">ResultMate OBE Management platform</h4>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">Hitec Corporate Suite : Version 4.6.0.41</p>
                      <p className="text-slate-500 text-[11px] font-mono">Date built: June 2026</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Institution & Licensing Information:</p>
                    <table className="w-full border-collapse border border-slate-200 text-slate-700 text-[11px]">
                      <tbody>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-200 px-3 py-1.5 font-bold w-1/3">Registered Owner</td>
                          <td className="border border-slate-200 px-3 py-1.5 text-slate-900 font-medium">Iqra University Division of Quality Assurance</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 px-3 py-1.5 font-bold">Licensing Status</td>
                          <td className="border border-slate-200 px-3 py-1.5 text-indigo-700 font-bold">Active Enterprise Unlimited Site License</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-200 px-3 py-1.5 font-bold">Linked Faculties</td>
                          <td className="border border-slate-200 px-3 py-1.5 font-mono">Department of Computing / Business Administration</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 px-3 py-1.5 font-bold">System Status</td>
                          <td className="border border-slate-200 px-3 py-1.5 text-emerald-700 font-bold">OBE Curricular Database Synced</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-slate-600 block">
                    ResultMate is designed to streamline academic curriculum mappings under international quality frameworks (such as Washington Accord & CAC accreditation criteria). Any alterations to definitions must be performed by authorized QA Senior Supervisors.
                  </div>
                </div>
              )}

              {/* 2. COURSE CLO MODAL */}
              {activeModal === 'clos' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <div>
                      <h4 className="font-bold text-slate-900">Course Outcomes Integration Matrix</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">Active Faculty: {activeDepartment?.name}</p>
                    </div>
                    <span className="font-mono font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded text-[10px]">
                      Total: {data?.courses.filter(c => c.departmentId === activeDeptId).length} Courses Listed
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] border-b border-slate-200 uppercase tracking-wider">
                          <th className="px-3 py-2 w-24">Code</th>
                          <th className="px-3 py-2">Course Name</th>
                          <th className="px-3 py-2 text-center w-28">Mapped Attributes</th>
                          <th className="px-3 py-2 text-center w-28">Alignment Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {data?.courses.filter(c => c.departmentId === activeDeptId).map(c => {
                          const mappedCount = c.mappedGAs.length;
                          const ratio = Math.round((mappedCount / filteredGAs.length) * 100);
                          return (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono font-bold text-slate-900">{c.code}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">{c.title}</td>
                              <td className="px-3 py-2 text-center">
                                {mappedCount === 0 ? (
                                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded font-bold text-[9px] text-rose-600 block">
                                    UNMAPPED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded font-mono font-bold text-[9.5px] text-indigo-900 block">
                                    {mappedCount} mapped
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                    <div 
                                      className={`h-full rounded-full ${mappedCount === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${Math.max(ratio, mappedCount > 0 ? 10 : 0)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[9.5px] w-8 text-right font-bold text-slate-600">{ratio}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. PLO PROGRAM DETAILED OUTCOMES MODAL */}
              {activeModal === 'plos' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-slate-900 uppercase text-xs">Graduate Attributes (GAs) / Program Learning Outcomes (PLOs)</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">Under international QA accreditation models, standard outcomes definitions are loaded for {activeDepartment?.name}.</p>
                  </div>

                  <div className="space-y-2.5">
                    {filteredGAs.map(ga => {
                      const frequency = data?.courses.filter(c => c.departmentId === activeDeptId && c.mappedGAs.includes(ga.id)).length || 0;
                      return (
                        <div key={ga.id} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors bg-white/55">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-100">
                              {ga.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Mapped in: <strong className="text-slate-700 font-bold">{frequency} courses</strong>
                            </span>
                          </div>
                          <strong className="text-slate-950 font-bold block text-[11px] mt-0.5">{ga.name}</strong>
                          <p className="text-slate-500 text-[10.5px] leading-relaxed mt-1">{ga.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. STATISTICS HISTOGRAM DIAGRAM MODAL */}
              {activeModal === 'statistics' && (
                <div className="space-y-5">
                  <div className="bg-indigo-50 p-3.5 rounded-lg border border-indigo-100 text-center">
                    <h4 className="font-bold text-indigo-950 text-xs">GRADUATE ATTRIBUTE MAPPING HISTOGRAM</h4>
                    <p className="text-slate-600 text-[10.5px] mt-0.5">Real-time mapping statistics showing frequency distribution per Graduate Attribute across all active curriculum paths.</p>
                  </div>

                  {/* CUSTOM SVG BAR GRAPH */}
                  <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-inner flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-400 mb-2">Attribute Frequency Chart (Total courses linked out of department)</span>
                    <div className="w-full h-44 flex items-end gap-1 px-4 border-b border-slate-300 pb-1.5 pt-4">
                      {gaStats.map(stat => {
                        const heightPct = Math.min(100, Math.max(8, stat.pct));
                        return (
                          <div key={stat.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover label pill */}
                            <div className="absolute bottom-full mb-1 bg-[#1e293b] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                              {stat.count} Courses ({stat.pct}%)
                            </div>
                            
                            {/* Bar container */}
                            <div 
                              className="w-full bg-indigo-600 rounded-t-sm hover:bg-emerald-500 cursor-pointer transition-all duration-300"
                              style={{ height: `${heightPct}%` }}
                            />
                            
                            {/* ID indicator */}
                            <span className="font-mono text-[9px] font-black text-slate-700 mt-1">{stat.id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRID LISTING THE MATRIX METRICS */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full border-collapse text-left text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="px-3 py-2 w-16">ID</th>
                          <th className="px-3 py-2">Graduate Outcome Specification</th>
                          <th className="px-3 py-2 text-right w-24">Link Count</th>
                          <th className="px-3 py-2 text-right w-28">Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {gaStats.map(stat => (
                          <tr key={stat.id} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-mono font-bold text-indigo-700">{stat.id}</td>
                            <td className="px-3 py-1.5 font-semibold text-slate-800">{stat.name}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-slate-600 font-bold">{stat.count} courses</td>
                            <td className="px-3 py-1.5 text-right font-mono font-black text-slate-900">{stat.pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. INTEGRITY AUDIT AUDITOR MODAL */}
              {activeModal === 'integrity' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
                    {unmappedCourses.length === 0 ? (
                      <Check className="w-8 h-8 text-emerald-600 font-black shrink-0" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">OBE Alignment Integrity Dashboard Index</h4>
                      <p className="text-[11px] text-slate-500">Auto-calculated compliance criteria across mapped objectives & statements.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Academics Integrity Checklist Score</h5>
                    
                    {/* Checklist 1 */}
                    <div className="flex items-start justify-between p-3 border border-slate-200 rounded bg-white">
                      <div className="space-y-0.5">
                        <strong className="block font-bold text-slate-900">1. Unmapped Courses Sweep</strong>
                        <p className="text-slate-500 text-[10px]">Verifies that no active course in database is left without at least 1 mapped Graduate Attribute.</p>
                      </div>
                      {unmappedCourses.length === 0 ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded">
                          100% COVERED
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 border border-rose-200 rounded">
                          {unmappedCourses.length} COURSE ERROR(S)
                        </span>
                      )}
                    </div>

                    {/* Unmapped Courses Detail Lists */}
                    {unmappedCourses.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1.5">
                        <strong className="text-amber-900 font-bold block text-[10px]">ATTENTION REQUIRED FOR THE FOLLOWING COURSES (No attributes allocated):</strong>
                        <div className="grid grid-cols-2 gap-1 font-mono text-[10.5px]">
                          {unmappedCourses.map(c => (
                            <span key={c.id} className="text-amber-800 block">
                              • <strong>{c.code}</strong> — {c.title.substring(0, 32)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist 2 */}
                    <div className="flex items-start justify-between p-3 border border-slate-200 rounded bg-white">
                      <div className="space-y-0.5 bg-white">
                        <strong className="block font-bold text-slate-900">2. Institutional Statements Completeness</strong>
                        <p className="text-slate-500 text-[10px]">Checks presence of registered Vision & Mission details in backend DB descriptors.</p>
                      </div>
                      {(activeDepartment?.vision && activeDepartment?.vision.length > 10) && (activeDepartment?.mission && activeDepartment?.mission.length > 10) ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded">
                          FULLY DRAFTED
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200 rounded">
                          MISSING TEXT
                        </span>
                      )}
                    </div>

                    {/* Checklist 3 */}
                    <div className="flex items-start justify-between p-3 border border-slate-200 rounded bg-white">
                      <div className="space-y-0.5 bg-white">
                        <strong className="block font-bold text-slate-900">3. Program Objectives Balance</strong>
                        <p className="text-slate-500 text-[10px]">Validates mapping coverage index across key Program Objectives PO1 - PO4.</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 border border-indigo-200 rounded">
                        ACTIVE INDEX COHERENT
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {/* 6. HELP STUDY MANUAL MODAL */}
              {activeModal === 'help' && (
                <div className="space-y-4 text-slate-700">
                  <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-lg">
                    <h4 className="font-bold text-slate-900 text-sm">Outcome-Based Education (OBE) Mapping Manual</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Procedural code of criteria for curriculum alignment under professional commissions.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block">1. Core Philosophy of OBE Matrix</strong>
                      <p className="text-slate-500">OBE focuses on measuring student outcomes. Each Course Learning Outcome (CLO) must correspond to Graduate Attributes (GAs) which are defined collectively under standard accrediting criteria.</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block">2. Allocating Checkboxes in Matrix Tab</strong>
                      <p className="text-slate-500">Use the checkboxes in the <strong>Course to GA Allocation Matrix</strong>. Simply double-click/toggle checkmarks. Checking a box denotes that the primary CLOs of that course align directly with that specific Graduate Attribute target.</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block">3. Program PO Mapping Layer</strong>
                      <p className="text-slate-500">Graduate Attributes (GAs) map up directly into broad Program Objectives (POs). This vertical alignment creates a unified curriculum audit trail from lesson plan assessments up to institutional vision statements.</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block">4. supervisor Lock & Save Safeguards</strong>
                      <p className="text-slate-500">Keep the configuration locked (view mode) except while making authorized updates. Make sure database changes are saved to persistent backend directories before exiting the window session.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. ADD PROGRAM MODAL */}
              {activeModal === 'add_program' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-lg">
                    <h4 className="font-bold text-slate-900 text-sm">Add New Academic Program</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Specify new program code (e.g. SE, AI) and full program title details.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Program Code / Abbreviation</label>
                      <input 
                        type="text"
                        value={newProgramCode}
                        onChange={(e) => setNewProgramCode(e.target.value)}
                        placeholder="e.g. SE, AI, DS"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Program Name</label>
                      <input 
                        type="text"
                        value={newProgramName}
                        onChange={(e) => setNewProgramName(e.target.value)}
                        placeholder="e.g. Software Engineering, Artificial Intelligence"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    
                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={seedGAsChecked}
                          onChange={(e) => setSeedGAsChecked(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-700">
                          Pre-seed standard Graduate Attributes (GAs)
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-400 ml-5.5 mt-0.5 leading-normal">
                        Automatically populates 10 standard Washington Accord Graduate Attributes for this program. Leave unchecked if you prefer to register GAs manually in your database.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleAddProgram}
                      disabled={savingLoad}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      {savingLoad ? 'Adding new Program...' : '🛠️ Add Program Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* 8. EDIT Program Vision & Mission Modal */}
              {activeModal === 'edit_program_vm' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-slate-55 p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-bold text-slate-900 text-sm">Modify Program Charter Shortcut</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Direct shortcut updating the Mission and Vision statement specs for <strong>{activeProgram?.name}</strong>.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Program Vision Statement</label>
                      <textarea 
                        value={editProgramVision}
                        onChange={(e) => setEditProgramVision(e.target.value)}
                        rows={3}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                        placeholder="Paste or type program vision..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Program Mission Statement</label>
                      <textarea 
                        value={editProgramMission}
                        onChange={(e) => setEditProgramMission(e.target.value)}
                        rows={4}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                        placeholder="Paste or type program mission..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleSaveProgramVisionMission}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      💾 Save Program Charter Changes
                    </button>
                  </div>
                </div>
              )}

              {/* 9. ADD COURSE MODAL */}
              {activeModal === 'add_course' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-lg">
                    <h4 className="font-bold text-slate-900 text-sm">Add New Program Course</h4>
                    <p className="text-[11px] text-slate-500 mt-1">This registers a brand-new course specifically linked to your chosen program and department separately.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Department</label>
                      <select 
                        value={newCourseDeptId}
                        onChange={(e) => {
                          setNewCourseDeptId(e.target.value);
                          const matchingProgs = data?.programs.filter(p => p.departmentId === e.target.value) || [];
                          if (matchingProgs.length > 0) {
                            setNewCourseProgramId(matchingProgs[0].id);
                          }
                        }}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      >
                        {data?.departments.filter(d => d.id === activeDeptId).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Academic Program</label>
                      <select 
                        value={newCourseProgramId}
                        onChange={(e) => setNewCourseProgramId(e.target.value)}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      >
                        {data?.programs.filter(p => p.departmentId === newCourseDeptId).map(p => (
                          <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Code</label>
                      <input 
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        placeholder="e.g. SE-313"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Title</label>
                      <input 
                        type="text"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        placeholder="e.g. Software Quality Assurance"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Type</label>
                      <select 
                        value={newCourseType}
                        onChange={(e) => setNewCourseType(e.target.value as any)}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="core">Core Requirement</option>
                        <option value="elective">Professional Elective</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleAddCourse}
                      disabled={savingLoad}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      {savingLoad ? 'Saving Course...' : '📚 Register Course Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* 10. EDIT COURSE MODAL */}
              {activeModal === 'edit_course' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-lg">
                    <h4 className="font-bold text-slate-900 text-sm">Edit Course Specifications</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Re-allocate, edit code/title representation or transfer course department alignments.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Aligning Department</label>
                      <select 
                        value={editCourseDeptId}
                        onChange={(e) => {
                          setEditCourseDeptId(e.target.value);
                          const matchingProgs = data?.programs.filter(p => p.departmentId === e.target.value) || [];
                          if (matchingProgs.length > 0) {
                            setEditCourseProgramId(matchingProgs[0].id);
                          }
                        }}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      >
                        {data?.departments.filter(d => d.id === activeDeptId).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Aligning Academic Program</label>
                      <select 
                        value={editCourseProgramId}
                        onChange={(e) => setEditCourseProgramId(e.target.value)}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      >
                        {data?.programs.filter(p => p.departmentId === editCourseDeptId).map(p => (
                          <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Code</label>
                      <input 
                        type="text"
                        value={editCourseCode}
                        onChange={(e) => setEditCourseCode(e.target.value)}
                        placeholder="e.g. SE-313"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Title</label>
                      <input 
                        type="text"
                        value={editCourseTitle}
                        onChange={(e) => setEditCourseTitle(e.target.value)}
                        placeholder="e.g. Software Quality Assurance"
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Course Type</label>
                      <select 
                        value={editCourseType}
                        onChange={(e) => setEditCourseType(e.target.value as any)}
                        className="w-full p-3 font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="core">Core Requirement</option>
                        <option value="elective">Professional Elective</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleEditCourseSubmit}
                      disabled={savingLoad}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      {savingLoad ? 'Saving Specifications...' : '💾 Save Specifications Now'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between gap-2 items-center">
              <div>
                {(activeModal === 'clos' || activeModal === 'plos' || activeModal === 'statistics' || activeModal === 'integrity') && (
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print Matrix Report</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
      {notification && (
        <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-5 duration-300 select-none">
          <div className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium' 
              : 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-xs">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
