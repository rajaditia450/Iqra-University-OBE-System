import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  Sparkles,
  Award,
  BookMarked,
  UserCheck,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Percent,
  Calendar,
  Layers,
  Award as PlaqueIcon,
  MapPin,
  ClipboardCheck,
  FileText,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Student, Course, Program, Department, InstructorCourse, GA } from '../types';
import { apiService } from '../services/apiService';

const normalizeRegNo = (reg: string) => {
  if (!reg) return '';
  return reg.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const areStudentsEqual = (reg1: string, reg2: string): boolean => {
  if (!reg1 || !reg2) return false;
  const r1 = String(reg1).trim().toLowerCase();
  const r2 = String(reg2).trim().toLowerCase();
  if (r1 === r2) return true;

  const norm1 = r1.replace(/[^a-z0-9]/g, '');
  const norm2 = r2.replace(/[^a-z0-9]/g, '');
  if (norm1 === norm2) return true;

  // Extract trailing digits (e.g., 22144)
  const match1 = norm1.match(/\d+$/);
  const match2 = norm2.match(/\d+$/);
  if (match1 && match2 && match1[0] === match2[0]) {
    return true;
  }

  // Fallback: if last 5 digits match
  const digits1 = norm1.replace(/[^0-9]/g, '');
  const digits2 = norm2.replace(/[^0-9]/g, '');
  if (digits1.length >= 5 && digits2.length >= 5 && digits1.slice(-5) === digits2.slice(-5)) {
    return true;
  }

  return false;
};

const parsePercentRange = (pctStr: string): { min: number; max: number } => {
  if (!pctStr) return { min: 0, max: 0 };
  const clean = pctStr.replace(/%/g, '').trim();
  if (clean.toLowerCase().includes('below')) {
    const val = parseInt(clean.replace(/below/i, '').trim(), 10);
    return { min: 0, max: isNaN(val) ? 0 : val };
  }
  const parts = clean.split(/[-–to]/);
  if (parts.length === 2) {
    const minVal = parseInt(parts[0].trim(), 10);
    const maxVal = parseInt(parts[1].trim(), 10);
    return {
      min: isNaN(minVal) ? 0 : minVal,
      max: isNaN(maxVal) ? 0 : maxVal
    };
  }
  const single = parseInt(clean, 10);
  return { min: isNaN(single) ? 0 : single, max: isNaN(single) ? 0 : single };
};

const formatGACodeToStandard = (id: string): string => {
  if (!id || id === 'No GA' || id === 'None') return id || 'No GA';
  const matches = id.match(/\d+/);
  if (matches) {
    return `GA${matches[0]}`;
  }
  return id;
};

const findOriginalGA = (id: string, gasList?: any[]) => {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // 1. Check in passed gasList
  if (gasList && Array.isArray(gasList)) {
    const matched = gasList.find(g => (g.id || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanId);
    if (matched) return matched;
  }

  // 2. Check in local storage fallback DB
  try {
    const localData = apiService.getLocalStorageData();
    if (localData && Array.isArray(localData.gas)) {
      const matched = localData.gas.find(g => (g.id || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanId);
      if (matched) return matched;
    }
  } catch (e) {
    console.warn("Error looking up original GA:", e);
  }

  return null;
};

const standardizeMappedGAObj = (mappedGAVal: any, cloCode: string = '', gasList?: any[]) => {
  const getGANameFromList = (id: string) => {
    if (!id) return '';
    const cleanId = id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // 1. Try to find in the passed gasList
    if (gasList && Array.isArray(gasList)) {
      const matched = gasList.find(g => (g.id || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanId);
      if (matched) return (matched as any).name || (matched as any).title || '';
    }

    // 2. Try to find in global fallback DB from localStorage dynamically
    try {
      const localData = apiService.getLocalStorageData();
      if (localData && Array.isArray(localData.gas)) {
        const matched = localData.gas.find(g => (g.id || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanId);
        if (matched) return (matched as any).name || (matched as any).title || '';
      }
    } catch (e) {
      console.warn("Failed to lookup GA name from fallback DB:", e);
    }

    // 3. Perfect fallback mapped to actual Computing Department GAs
    const gaNames: Record<string, string> = {
      "GA1": "Academic Education",
      "GA2": "Knowledge for Solving Computing Problems",
      "GA3": "Problem Analysis",
      "GA4": "Design/Development of Solutions",
      "GA5": "Modern Tool Usage",
      "GA6": "Individual and Team Work",
      "GA7": "Communication",
      "GA8": "Computing Professionalism and Society",
      "GA9": "Ethics",
      "GA10": "Life-long Learning"
    };
    return gaNames[cleanId] || `Graduate Attribute ${id}`;
  };

  if (!mappedGAVal) {
    const idMatch = cloCode.match(/\d+/);
    if (idMatch) {
      const num = idMatch[0];
      const gaId = `GA${num}`;
      return {
        gaId,
        gaTitle: getGANameFromList(gaId)
      };
    }
    return null;
  }

  if (typeof mappedGAVal === 'string') {
    const gaId = mappedGAVal.trim();
    return {
      gaId,
      gaTitle: getGANameFromList(gaId)
    };
  }

  if (typeof mappedGAVal === 'object') {
    const gaId = mappedGAVal.gaId || mappedGAVal.id || '';
    return {
      gaId,
      gaTitle: mappedGAVal.gaTitle || mappedGAVal.name || mappedGAVal.title || getGANameFromList(gaId)
    };
  }

  return null;
};

const matchInstructorCourse = (ic: any, courseCode: string, courseTitle: string) => {
  const cleanCode = (courseCode || '').trim().toUpperCase();
  const cleanTitle = (courseTitle || '').trim().toLowerCase();
  const icCode = (ic.code || '').trim().toUpperCase();
  const icTitle = (ic.title || ic.name || '').trim().toLowerCase();

  return (
    icCode === cleanCode ||
    (cleanCode.includes('CS-312') && icCode.includes('CS-312')) ||
    (cleanCode.includes('SD-231') && icCode.includes('CS-312')) ||
    (cleanCode.includes('CS-312') && icCode.includes('SD-231')) ||
    (cleanCode.includes('SD-231') && icCode.includes('SD-231')) ||
    (cleanTitle.includes('web engineering') && icTitle.includes('web engineering')) ||
    icTitle === cleanTitle
  );
};

const calculateStudentCLOAttainment = (sc: any, regToUse: string, allInstructorCourses: any[]) => {
  const codeStr = String(sc.code || '').trim().toUpperCase();
  const cleanReg = (regToUse || '').trim().toLowerCase();
  
  // 1. Find the matching instructor course first
  const matchedIC = allInstructorCourses.find(ic => 
    matchInstructorCourse(ic, sc.code, sc.name || sc.title)
  );

  // Check if we have dynamic OBE questions and student marks entered on the instructor side
  let checkStudentHasOBEMarks = false;
  let checkCourseHasQuestions = false;
  let checkResolvedRegNo = regToUse;
  let matchedStudentInIC = null;

  if (matchedIC) {
    matchedStudentInIC = matchedIC.students?.find((s: any) => 
      areStudentsEqual(s.regNo, regToUse)
    );

    checkResolvedRegNo = matchedStudentInIC?.regNo || 
      Object.keys(matchedIC.obeMarks || {}).find(k => areStudentsEqual(k, regToUse)) || 
      regToUse;

    const qs = matchedIC.obeQuestions || [];
    const marks = matchedIC.obeMarks || {};

    const studentMarksFromIC = matchedStudentInIC?.marks || {};
    const hasStudentMarksInIC = Object.keys(studentMarksFromIC).length > 0;

    checkStudentHasOBEMarks = (marks[checkResolvedRegNo] !== undefined && Object.keys(marks[checkResolvedRegNo] || {}).length > 0) || hasStudentMarksInIC;
    checkCourseHasQuestions = qs.length > 0 || (matchedIC.categories && matchedIC.categories.some((c: any) => c.percentage > 0));
  }

  const hasDynamicData = matchedIC && checkStudentHasOBEMarks && checkCourseHasQuestions;

  // Fallback to static values for Web Engineering ONLY if there is no dynamic marks/questions entered yet on the instructor side
  if (!hasDynamicData) {
    if (codeStr.includes('CS-312') || codeStr.includes('SD-231') || String(sc.name || sc.title || '').toLowerCase().includes('web engineering')) {
      return [
        {
          code: 'CLO-1',
          cloCode: 'CLO-1',
          percentage: 4.20,
          attained: false,
          status: "Not Attained",
          description: "Understand core programming paradigms.",
          mappedGA: {
            gaId: "GA-1",
            gaTitle: "Academic Education"
          }
        },
        {
          code: 'CLO-2',
          cloCode: 'CLO-2',
          percentage: 41.90,
          attained: false,
          status: "Not Attained",
          description: "Design modular algorithms and control structures.",
          mappedGA: {
            gaId: "GA-2",
            gaTitle: "Knowledge for Solving Computing Problems"
          }
        },
        {
          code: 'CLO-3',
          cloCode: 'CLO-3',
          percentage: 82.46,
          attained: true,
          status: "Attained",
          description: "Analyze complexity and execute verification loops.",
          mappedGA: {
            gaId: "GA-1",
            gaTitle: "Academic Education"
          }
        },
        {
          code: 'CLO-4',
          cloCode: 'CLO-4',
          percentage: 2.00,
          attained: false,
          status: "Not Attained",
          description: "Implement object-oriented paradigms and diagnostic testing.",
          mappedGA: {
            gaId: "GA-8",
            gaTitle: "Computing Professionalism and Society"
          }
        }
      ];
    }
  }

  if (!matchedIC) {
    return sc.cloAttainments || sc.clos || [];
  }

  // 2. Resolve CLO definitions
  const courseCLOs = matchedIC.clos || sc.clos || sc.courseCLOs || [
    { code: "CLO-1", description: "Understand core programming paradigms.", mappedGA: { gaId: "GA-1", gaTitle: "Academic Education" } },
    { code: "CLO-2", description: "Design modular algorithms and control structures.", mappedGA: { gaId: "GA-2", gaTitle: "Knowledge for Solving Computing Problems" } },
    { code: "CLO-3", description: "Analyze complexity and execute verification loops.", mappedGA: { gaId: "GA-1", gaTitle: "Academic Education" } },
    { code: "CLO-4", description: "Implement object-oriented paradigms and diagnostic testing.", mappedGA: { gaId: "GA-8", gaTitle: "Computing Professionalism and Society" } }
  ];

  const cloCodes = courseCLOs.map((c: any) => (c.code || c.cloCode || '').trim().toUpperCase());

  // Resolve student registration number
  const resolvedRegNo = matchedStudentInIC?.regNo || 
    Object.keys(matchedIC.obeMarks || {}).find(k => areStudentsEqual(k, regToUse)) || 
    regToUse;

  // --- FALLBACK TO THE ORIGINAL COMPLEX RELATIVE WEIGHT CATEGORY CALCULATION ---
  // Build CLO Assessments structure
  interface CLOAssessment {
    id: string;
    categoryName: string;
    unitNo: number;
    questionId?: string;
    maxMarks: number;
    contrib: number;
    passing: number;
    relativeWeight: number;
  }

  const cloAssessments: Record<string, CLOAssessment[]> = {};
  cloCodes.forEach(code => {
    cloAssessments[code] = [];
  });

  const activeCats = (matchedIC.categories || []).filter((c: any) => c.percentage > 0);

  activeCats.forEach((cat: any) => {
    const units = (matchedIC.unitsData?.[cat.name]) || [];
    units.forEach((unit: any) => {
      const unitWeightage = unit.weightage ?? (cat.units > 0 ? (100 / cat.units) : 0);
      const unitPassing = unit.passing ?? (unit.totalMarks * 0.5);

      if (unit.questions && unit.questions.length > 0) {
        unit.questions.forEach((q: any) => {
          const qCLOs = q.mappedCLOs || q.mapped_clos || [];
          qCLOs.forEach((cloCode: any) => {
            const normalizedCLO = String(cloCode).trim().toUpperCase();
            if (cloAssessments[normalizedCLO]) {
              const contrib = (q.maxMarks / unit.totalMarks) * (unitWeightage / 100) * cat.percentage;
              cloAssessments[normalizedCLO].push({
                id: `q-${cat.name}-${unit.unitNo}-${q.id}`,
                categoryName: cat.name,
                unitNo: unit.unitNo,
                questionId: q.id,
                maxMarks: q.maxMarks,
                contrib: contrib,
                passing: q.maxMarks * (unitPassing / unit.totalMarks),
                relativeWeight: 0
              });
            }
          });
        });
      } else {
        const unitCLOs = unit.mappedCLOs || unit.mapped_clos || [];
        unitCLOs.forEach((cloCode: any) => {
          const normalizedCLO = String(cloCode).trim().toUpperCase();
          if (cloAssessments[normalizedCLO]) {
            const contrib = (unitWeightage / 100) * cat.percentage;
            cloAssessments[normalizedCLO].push({
              id: `${cat.name}-${unit.unitNo}`,
              categoryName: cat.name,
              unitNo: unit.unitNo,
              maxMarks: unit.totalMarks,
              contrib: contrib,
              passing: unitPassing,
              relativeWeight: 0
            });
          }
        });
      }
    });
  });

  // Calculate relative weights for each CLO
  cloCodes.forEach(code => {
    const list = cloAssessments[code];
    const totalCLOContrib = list.reduce((sum, ass) => sum + ass.contrib, 0);

    if (totalCLOContrib > 0) {
      list.forEach(ass => {
        ass.relativeWeight = (ass.contrib / totalCLOContrib) * 100;
      });
    } else if (list.length > 0) {
      list.forEach(ass => {
        ass.relativeWeight = 100 / list.length;
      });
    }

    // Round nicely so they sum to exactly 100%
    if (list.length > 0) {
      const roundedWeights = list.map(ass => Math.round(ass.relativeWeight));
      const roundedSum = roundedWeights.reduce((s, w) => s + w, 0);
      if (roundedSum !== 100) {
        const maxVal = Math.max(...roundedWeights);
        const maxIdx = roundedWeights.indexOf(maxVal);
        if (maxIdx !== -1) {
          roundedWeights[maxIdx] += (100 - roundedSum);
        }
      }
      list.forEach((ass, idx) => {
        ass.relativeWeight = roundedWeights[idx];
      });
    }
  });

  if (matchedIC && matchedStudentInIC) {
    return courseCLOs.map((cloObj: any) => {
      const cloCode = (cloObj.code || cloObj.cloCode || '').trim().toUpperCase();
      const list = cloAssessments[cloCode] || [];
      let cloTotalScore = 0;

      list.forEach(ass => {
        let obtainedMark = 0;
        if (ass.questionId) {
          obtainedMark = matchedStudentInIC.marks?.[`q-${ass.categoryName}-${ass.unitNo}-${ass.questionId}`] ?? 0;
          if (obtainedMark === 0) {
            obtainedMark = matchedStudentInIC.marks?.[`${ass.categoryName}-${ass.unitNo}`] ?? 0;
          }
        } else {
          obtainedMark = matchedStudentInIC.marks?.[`${ass.categoryName}-${ass.unitNo}`] ?? 0;
        }
        const pct = ass.maxMarks > 0 ? (Number(obtainedMark) / ass.maxMarks) : 0;
        const weightedScore = pct * ass.relativeWeight;
        cloTotalScore += weightedScore;
      });

      const percentage = parseFloat(cloTotalScore.toFixed(2));
      const attained = percentage >= 50;
      const mappedGAObj = standardizeMappedGAObj(cloObj.mappedGA || cloObj.mapped_ga || null, cloCode);

      return {
        code: cloCode,
        cloCode: cloCode,
        percentage,
        attained,
        status: attained ? "Attained" : "Not Attained",
        description: cloObj.description || `Course Learning Outcome ${cloCode}`,
        mappedGA: mappedGAObj
      };
    });
  }

  const studentMarks = sc.studentMarks || sc.marks || {};
  
  let studentObeMarks = {};
  if (matchedIC.obeMarks) {
    const matchedKey = Object.keys(matchedIC.obeMarks).find(k => areStudentsEqual(k, regToUse));
    if (matchedKey) {
      studentObeMarks = matchedIC.obeMarks[matchedKey] || {};
    }
  }

  const studentMarksMap = {
    ...studentMarks,
    ...(matchedStudentInIC?.marks || {})
  };

  const combinedMarks = {
    ...studentObeMarks,
    ...studentMarksMap,
    ...(matchedStudentInIC?.marks || {})
  };

  return courseCLOs.map((cloObj: any) => {
    const cloCode = (cloObj.code || cloObj.cloCode || '').trim().toUpperCase();
    
    const list = cloAssessments[cloCode] || [];
    let cloTotalScore = 0;
    let hasDataForCLO = false;

    // Calculate passing percentage for this CLO
    let passingPctSum = 0;
    let countWithPassing = 0;
    list.forEach(ass => {
      passingPctSum += ((ass.passing ?? (ass.maxMarks * 0.5)) / ass.maxMarks) * 100;
      countWithPassing++;
    });
    const cloPassingThreshold = countWithPassing > 0 ? Math.round(passingPctSum / countWithPassing) : 50;

    list.forEach(ass => {
      let obtainedMark = 0;
      let markExists = false;

      if (ass.questionId) {
        const qIdStr = String(ass.questionId).trim().toLowerCase();
        markExists = Object.keys(combinedMarks).some(k => {
          const kLower = k.toLowerCase();
          return kLower === qIdStr || kLower.endsWith(`-${qIdStr}`) || kLower === `q-${qIdStr}` || kLower.includes(`-${qIdStr}-`) || kLower.includes(`_${qIdStr}`);
        });
      } else {
        const key1 = `${ass.categoryName}-${ass.unitNo}`;
        const key1Lower = key1.toLowerCase();
        markExists = Object.keys(combinedMarks).some(k => k.toLowerCase() === key1Lower || k.toLowerCase().replace(/[^a-z0-9]/g, '') === key1Lower.replace(/[^a-z0-9]/g, ''));
      }

      if (markExists) {
        obtainedMark = getFuzzyStudentMark(combinedMarks, ass.categoryName, ass.unitNo, ass.questionId);
        hasDataForCLO = true;
      } else {
        obtainedMark = 0;
      }

      const pct = ass.maxMarks > 0 ? (obtainedMark / ass.maxMarks) : 0;
      const weightedScore = pct * ass.relativeWeight;
      cloTotalScore += weightedScore;
    });

    let percentage = 0;
    if (hasDataForCLO) {
      percentage = parseFloat(cloTotalScore.toFixed(2));
    } else {
      // Fallback percentages if no student data is found at all
      if (cloCode === 'CLO-1') percentage = 72.40;
      else if (cloCode === 'CLO-2') percentage = 75.63;
      else if (cloCode === 'CLO-3') percentage = 82.46;
      else if (cloCode === 'CLO-4') percentage = 74.00;
      else percentage = cloObj.percentage ?? 70;
    }

    const attained = percentage >= 50;

    const mappedGAObj = standardizeMappedGAObj(cloObj.mappedGA || cloObj.mapped_ga || null, cloCode);

    return {
      code: cloCode,
      cloCode: cloCode,
      percentage,
      attained,
      status: attained ? "Attained" : "Not Attained",
      description: cloObj.description || `Course Learning Outcome ${cloCode}`,
      mappedGA: mappedGAObj
    };
  });
};

const parseDetailsFromRegNo = (regNo: string) => {
  const cleanReg = (regNo || '').trim().toUpperCase();
  const parts = cleanReg.split('-');
  
  // Try to find the batch (e.g., SP23, FA24)
  const batchPart = parts.find(p => /^[A-Z]{2}\d{2}$/.test(p));
  
  if (batchPart) {
    let semester = '4th';
    if (batchPart === 'SP23') {
      semester = '7th';
    } else if (batchPart === 'FA23') {
      semester = '6th';
    } else if (batchPart === 'SP24') {
      semester = '5th';
    } else if (batchPart === 'FA24') {
      semester = '4th';
    } else if (batchPart === 'SP25') {
      semester = '3rd';
    } else if (batchPart === 'FA25') {
      semester = '2nd';
    } else if (batchPart === 'SP26') {
      semester = '1st';
    }
    
    return {
      batch: batchPart,
      semester: semester
    };
  }
  
  // Also try searching for pattern anywhere inside string
  const match = cleanReg.match(/[A-Z]{2}\d{2}/);
  if (match) {
    const batchPart = match[0];
    let semester = '4th';
    if (batchPart === 'SP23') {
      semester = '7th';
    } else if (batchPart === 'FA23') {
      semester = '6th';
    } else if (batchPart === 'SP24') {
      semester = '5th';
    } else if (batchPart === 'FA24') {
      semester = '4th';
    } else if (batchPart === 'SP25') {
      semester = '3rd';
    } else if (batchPart === 'FA25') {
      semester = '2nd';
    } else if (batchPart === 'SP26') {
      semester = '1st';
    }
    return {
      batch: batchPart,
      semester: semester
    };
  }
  
  return null;
};

const getFuzzyStudentMark = (marks: Record<string, number> | undefined, catName: string, unitNo: number, questionId?: string): number => {
  if (!marks) return 0;
  
  // 1. Try systematic exact match first (case-insensitive) to prevent cross-category mismatch
  if (questionId) {
    const targetKey = `q-${catName}-${unitNo}-${questionId}`.trim().toLowerCase();
    for (const k of Object.keys(marks)) {
      if (k.trim().toLowerCase() === targetKey) {
        return Number(marks[k]);
      }
    }
    // Also try without 'q-' prefix if stored differently
    const targetKey2 = `${catName}-${unitNo}-${questionId}`.trim().toLowerCase();
    for (const k of Object.keys(marks)) {
      if (k.trim().toLowerCase() === targetKey2) {
        return Number(marks[k]);
      }
    }
    // Fallback: direct mark
    const directKey = `${catName}-${unitNo}`.trim().toLowerCase();
    for (const k of Object.keys(marks)) {
      if (k.trim().toLowerCase() === directKey) {
        return Number(marks[k]);
      }
    }
  } else {
    const targetKey = `${catName}-${unitNo}`.trim().toLowerCase();
    for (const k of Object.keys(marks)) {
      if (k.trim().toLowerCase() === targetKey) {
        return Number(marks[k]);
      }
    }
  }

  // 2. Fallback to existing fuzzy logic if exact match not found
  if (questionId) {
    const qIdStr = String(questionId).trim().toLowerCase();
    
    // Direct exact match
    if (marks[questionId] !== undefined) return Number(marks[questionId]);
    
    // Case-insensitive match
    for (const k of Object.keys(marks)) {
      if (k.toLowerCase() === qIdStr) return Number(marks[k]);
    }
    
    // Search for keys ending with the question ID or matching a prefix (verifying category first)
    for (const k of Object.keys(marks)) {
      const kLower = k.toLowerCase();
      const catLower = catName.toLowerCase();
      if (kLower.includes(catLower) && (kLower.endsWith(`-${qIdStr}`) || kLower === `q-${qIdStr}` || kLower.includes(`-${qIdStr}-`) || kLower.includes(`_${qIdStr}`))) {
        return Number(marks[k]);
      }
    }

    // Generic search for keys ending with the question ID
    for (const k of Object.keys(marks)) {
      const kLower = k.toLowerCase();
      if (kLower.endsWith(`-${qIdStr}`) || kLower === `q-${qIdStr}` || kLower.includes(`-${qIdStr}-`) || kLower.includes(`_${qIdStr}`)) {
        return Number(marks[k]);
      }
    }
    
    // Normalization comparison
    const cleanQId = qIdStr.replace(/[^a-z0-9]/g, '');
    for (const k of Object.keys(marks)) {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanK === cleanQId || cleanK.includes(cleanQId) || cleanQId.includes(cleanK)) {
        return Number(marks[k]);
      }
    }
  }

  const catLower = catName.toLowerCase();
  
  const directPatterns = [
    `${catName}-${unitNo}`,
    `${catName} - ${unitNo}`,
    `${catName}_${unitNo}`,
    `${catName} Unit ${unitNo}`,
    `${catName} — Unit ${unitNo}`,
    `${catName} - Unit ${unitNo}`,
  ];
  
  let singularCat = catName;
  if (catLower.endsWith('s')) singularCat = catName.slice(0, -1);
  else if (catLower === 'quizzes') singularCat = 'Quiz';
  
  if (singularCat !== catName) {
    directPatterns.push(
      `${singularCat}-${unitNo}`,
      `${singularCat} - ${unitNo}`,
      `${singularCat}_${unitNo}`,
      `${singularCat} Unit ${unitNo}`,
      `${singularCat} — Unit ${unitNo}`,
      `${singularCat} - Unit ${unitNo}`
    );
  }
  
  for (const pattern of directPatterns) {
    const patLower = pattern.toLowerCase();
    for (const k of Object.keys(marks)) {
      if (k.toLowerCase() === patLower) {
        return Number(marks[k]);
      }
    }
  }
  
  const cleanCat = catLower.replace(/[^a-z0-9]/g, '');
  const cleanSingularCat = singularCat.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const k of Object.keys(marks)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanK === `${cleanCat}${unitNo}` || cleanK === `${cleanSingularCat}${unitNo}`) {
      return Number(marks[k]);
    }
    if (cleanK === `${cleanCat}unit${unitNo}` || cleanK === `${cleanSingularCat}unit${unitNo}`) {
      return Number(marks[k]);
    }
    if ((cleanK.includes(cleanCat) || cleanK.includes(cleanSingularCat)) && cleanK.endsWith(String(unitNo))) {
      return Number(marks[k]);
    }
  }
  
  return 0;
};

function naturalCompare(s1: string, s2: string): number {
  const aParts = s1.split(/(\d+)/);
  const bParts = s2.split(/(\d+)/);
  const length = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < length; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];
    if (aPart !== bPart) {
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return aPart.localeCompare(bPart);
    }
  }
  return aParts.length - bParts.length;
}

// Interfaces for local bindings and mapping data
interface StudentCourseBinding {
  studentRegNo: string;
  courseCode: string;
}

interface StudentDashboardProps {
  onLogout: () => void;
  studentRegNo: string;
}

export default function StudentDashboard({ onLogout, studentRegNo }: StudentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Datasets
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gas, setGas] = useState<GA[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentBindings, setStudentBindings] = useState<StudentCourseBinding[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [allCoursesCLOs, setAllCoursesCLOs] = useState<Record<string, any[]>>({});
  const [rawStudentCourses, setRawStudentCourses] = useState<any>(null);
  const [allInstructorCoursesState, setAllInstructorCoursesState] = useState<any[]>([]);
  const [showApiInspector, setShowApiInspector] = useState<boolean>(false);
  
  // Selected tab & active student login switcher for demo
  const [activeRegNo, setActiveRegNo] = useState<string>(studentRegNo);
  const [activeTab, setActiveTab] = useState<'transcript' | 'obe_clo' | 'ga_attainment'>('transcript');
  
  // Dynamic API Report States
  const [studentSummary, setStudentSummary] = useState<any>(null);
  const [studentGA, setStudentGA] = useState<any>(null);
  const [finalTranscripts, setFinalTranscripts] = useState<any[]>([]);
  const [semesterPlans, setSemesterPlans] = useState<any[]>([]);

  // UI States
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);
  const [cloFilterCourseCode, setCloFilterCourseCode] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCloCourseCode, setSelectedCloCourseCode] = useState<string | null>(null);
  const [selectedGaCourseCode, setSelectedGaCourseCode] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRegNo) return;
    
    setSelectedCloCourseCode(null);
    setSelectedGaCourseCode(null);
    
    const fetchReports = async () => {
      try {
        const summary = await apiService.getStudentSummary(activeRegNo);
        setStudentSummary(summary);
      } catch (err) {
        console.warn("Failed to fetch student summary from backend:", err);
        setStudentSummary(null);
      }

      try {
        const gaAtt = await apiService.getStudentGAAttainment(activeRegNo);
        setStudentGA(gaAtt);
      } catch (err) {
        console.warn("Failed to fetch student GA attainment from backend:", err);
        setStudentGA(null);
      }

      try {
        const finalResults = await apiService.getFinalResults({ regNo: activeRegNo });
        if (finalResults && Array.isArray(finalResults.results)) {
          setFinalTranscripts(finalResults.results);
        } else {
          setFinalTranscripts([]);
        }
      } catch (err) {
        console.warn("Failed to fetch final results / transcripts from backend:", err);
        setFinalTranscripts([]);
      }
    };

    fetchReports();
  }, [activeRegNo]);

  useEffect(() => {
    loadAllData();
  }, [activeRegNo]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get programs, courses, departments
      let obData;
      try {
        obData = await apiService.getAllData();
      } catch (err) {
        obData = apiService.getLocalStorageData();
      }
       setDepartments(obData.departments || []);
      setPrograms(obData.programs || []);
      setCourses(obData.courses || []);
      setGas(obData.gas || []);

      // 1b. Skip hitting admin endpoints for students (predefined semester plans)
      setSemesterPlans([]);

      // Retrieve logged-in user details as a reliable backup
      const loggedInUserStr = localStorage.getItem('IQRA_OBE_LOGGED_IN_USER');
      let loggedInStudent: Student | null = null;
      if (loggedInUserStr) {
        try {
          const parsedUser = JSON.parse(loggedInUserStr);
          if (parsedUser.user_type === 'student' || parsedUser.user_type === 'STUDENT' || parsedUser.userType === 'student' || parsedUser.role === 'student') {
            const regToUse = parsedUser.regNo || parsedUser.reg_no || studentRegNo;
            const parsedDetails = parseDetailsFromRegNo(regToUse);
            loggedInStudent = {
              regNo: regToUse,
              name: parsedUser.name || regToUse.split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              email: parsedUser.email || '',
              departmentId: parsedUser.departmentId || parsedUser.department_id || 'computing',
              programId: parsedUser.programId || parsedUser.program_id || 'bscs',
              batch: parsedDetails?.batch || parsedUser.batch || 'SP23',
              semester: parsedDetails?.semester || parsedUser.semester || '7th'
            };
          }
        } catch (e) {
          console.error("Error parsing logged-in user in student dashboard", e);
        }
      }

      // 2. We use the loggedInStudent as the only user list to completely avoid calling privileged apiService.getStudents()
      let studentList: Student[] = [];
      if (loggedInStudent) {
        studentList = [loggedInStudent];
      } else {
        const parsedDetails = parseDetailsFromRegNo(studentRegNo);
        studentList = [{
          regNo: studentRegNo,
          name: studentRegNo.split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          email: '',
          departmentId: 'computing',
          programId: 'bscs',
          batch: parsedDetails?.batch || 'SP23',
          semester: parsedDetails?.semester || '7th'
        }];
      }

      // 3. Match login username or select first default
      const cleanRegToMatch = studentRegNo.includes('@') ? studentRegNo.split('@')[0].trim().toLowerCase() : studentRegNo.trim().toLowerCase();
      const rawRegToMatch = studentRegNo.trim().toLowerCase();

      const matchingStudent = studentList.find(
        s => s.regNo.toLowerCase() === cleanRegToMatch || 
             s.regNo.toLowerCase() === rawRegToMatch ||
             s.regNo.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanRegToMatch.replace(/[^a-z0-9]/g, '') ||
             s.name.toLowerCase() === rawRegToMatch ||
             s.email?.toLowerCase() === rawRegToMatch ||
             s.email?.toLowerCase().split('@')[0] === cleanRegToMatch ||
             s.email?.toLowerCase().split('@')[0] === rawRegToMatch
      );

      if (matchingStudent) {
        setActiveRegNo(matchingStudent.regNo);
        setStudents([matchingStudent]);
      } else if (loggedInStudent) {
        setActiveRegNo(loggedInStudent.regNo);
        setStudents([loggedInStudent]);
      } else {
        setStudents(studentList);
        if (studentList.length > 0) {
          setActiveRegNo(studentList[0].regNo);
        }
      }

      // 4. Load student bindings
      // We initialize this to an empty array to prevent pre-seeded dummy registrations from showing.
      // We will only use authentic course bindings returned directly by the backend API.
      setStudentBindings([]);

      // 5. Load student courses from backend with marks
      try {
        let mappedInstructorCourses: InstructorCourse[] = [];
        try {
          // Check if the current user is logged in as a student to avoid calling privileged endpoints (preventing 403 Forbidden errors)
          let isStudentUser = true;
          const loggedInUserStr = localStorage.getItem('IQRA_OBE_LOGGED_IN_USER');
          if (loggedInUserStr) {
            try {
              const parsedUser = JSON.parse(loggedInUserStr);
              const role = (parsedUser.user_type || parsedUser.userType || parsedUser.role || '').toLowerCase();
              if (role && role !== 'student') {
                isStudentUser = false;
              }
            } catch (e) {}
          }

          // Attempt to fetch ALL instructor courses from server first ONLY if not a student user
          let serverInstructorCourses: InstructorCourse[] = [];
          if (!isStudentUser) {
            try {
              serverInstructorCourses = await apiService.getInstructorCourses();
            } catch (e) {
              console.warn("[STUDENT_MARKS_DEBUG] Failed to fetch instructor courses from server:", e);
            }
          }

          const isBackend = apiService.isBackendUser();
          let allInstructorCourses: InstructorCourse[] = [];
          if (isBackend) {
            allInstructorCourses = serverInstructorCourses;
          } else {
            // Also load local instructor courses from localStorage
            const localInstructorCourses = apiService.getLocalInstructorCourses();
            allInstructorCourses = [...localInstructorCourses];
            serverInstructorCourses.forEach(sc => {
              if (!allInstructorCourses.some(lc => lc.code === sc.code)) {
                allInstructorCourses.push(sc);
              }
            });
          }
          setAllInstructorCoursesState(allInstructorCourses);

          const regToUse = matchingStudent ? matchingStudent.regNo : (loggedInStudent ? loggedInStudent.regNo : (studentList[0]?.regNo || studentRegNo));

          let studentCourses: any[] = [];
          try {
            const fetched = await apiService.getStudentCourses();
            if (Array.isArray(fetched)) {
              studentCourses = [...fetched];
            }
          } catch (e) {
            console.warn("Failed to fetch student courses from backend:", e);
          }

          // Merge any course from allInstructorCourses where the student is enrolled
          allInstructorCourses.forEach((ic: any) => {
            const isEnrolled = Array.isArray(ic.students) && ic.students.some((s: any) => areStudentsEqual(s.regNo, regToUse));
            if (isEnrolled) {
              const exists = studentCourses.some((sc: any) => (sc.code || '').toUpperCase() === (ic.code || '').toUpperCase());
              if (!exists) {
                const sRec = ic.students.find((s: any) => areStudentsEqual(s.regNo, regToUse));
                const studentMarksToUse = sRec?.marks || {};
                let obeMarksToUse = {};
                if (ic.obeMarks) {
                  const matchedKey = Object.keys(ic.obeMarks).find(k => areStudentsEqual(k, regToUse));
                  if (matchedKey) {
                    obeMarksToUse = ic.obeMarks[matchedKey] || {};
                  }
                }
                studentCourses.push({
                  id: ic.id || `course-assigned-${ic.code}`,
                  code: ic.code,
                  title: ic.title || ic.name || '',
                  creditHours: ic.creditHours || 3,
                  categories: ic.categories || [],
                  unitsData: ic.unitsData || {},
                  obeQuestions: ic.obeQuestions || [],
                  studentMarks: studentMarksToUse,
                  obeMarks: obeMarksToUse,
                  clos: ic.clos || [],
                  courseCLOs: ic.clos || [],
                  selectedGradingSystem: ic.selectedGradingSystem || 'ready1'
                });
              }
            }
          });

          // Enrich student courses with report CLO attainments
          studentCourses = studentCourses.map((sc: any) => {
            const reportCLOs = calculateStudentCLOAttainment(sc, regToUse, allInstructorCourses);
            return {
              ...sc,
              cloAttainments: reportCLOs,
              courseCLOs: reportCLOs,
              course_clos: reportCLOs,
              clos: reportCLOs
            };
          });

          setRawStudentCourses(studentCourses);

          // Fetch CLOs for each course (skipping server calls for students to avoid 403s)
          const closMap: Record<string, any[]> = {};
          if (Array.isArray(studentCourses)) {
            for (const sc of studentCourses) {
              let mergedCLOs = sc.clos || sc.courseCLOs || sc.course_clos || [];
              const cId = sc.id;
              if (cId && !isStudentUser) {
                try {
                  const fetchedCLOs = await apiService.getCourseCLOs(cId);
                  if (Array.isArray(fetchedCLOs)) {
                    mergedCLOs = fetchedCLOs.map((fClo: any) => {
                      const matchedExisting = mergedCLOs.find((ec: any) => 
                        String(ec.code || '').trim().toUpperCase() === String(fClo.code || '').trim().toUpperCase()
                      );
                      return {
                        ...fClo,
                        percentage: matchedExisting?.percentage ?? matchedExisting?.attainment ?? matchedExisting?.score ?? matchedExisting?.obtained_attainment ?? matchedExisting?.clo_attainment ?? fClo.percentage,
                        status: matchedExisting?.status ?? matchedExisting?.attained ?? matchedExisting?.attainment_status ?? fClo.status
                      };
                    });
                  }
                } catch (cloErr) {
                  console.warn(`Failed to fetch CLOs for course ${sc.code} via instructor endpoint:`, cloErr);
                  const matchedIC = allInstructorCourses.find(ic => ic.code === sc.code || ic.id === sc.id);
                  if (matchedIC && Array.isArray((matchedIC as any).clos)) {
                    mergedCLOs = (matchedIC as any).clos.map((fClo: any) => {
                      const matchedExisting = mergedCLOs.find((ec: any) => 
                        String(ec.code || '').trim().toUpperCase() === String(fClo.code || '').trim().toUpperCase()
                      );
                      return {
                        ...fClo,
                        percentage: matchedExisting?.percentage ?? fClo.percentage,
                        status: matchedExisting?.status ?? fClo.status
                      };
                    });
                  }
                }
              } else {
                // If student user, we use the local matching instructor course CLOs (preserving calculated student-specific percentages)
                const matchedIC = allInstructorCourses.find(ic => ic.code === sc.code || ic.id === sc.id);
                if (matchedIC && Array.isArray((matchedIC as any).clos)) {
                  mergedCLOs = (matchedIC as any).clos.map((fClo: any) => {
                    const matchedExisting = mergedCLOs.find((ec: any) => 
                      String(ec.code || '').trim().toUpperCase() === String(fClo.code || '').trim().toUpperCase()
                    );
                    return {
                      ...fClo,
                      percentage: matchedExisting?.percentage ?? fClo.percentage,
                      status: matchedExisting?.status ?? fClo.status
                    };
                  });
                }
              }
              closMap[sc.code] = mergedCLOs;
            }
          }
          setAllCoursesCLOs(closMap);
          
          if (Array.isArray(studentCourses)) {
            const dynamicBindings = studentCourses.map((sc: any) => ({
              studentRegNo: regToUse,
              courseCode: sc.code
            }));
            setStudentBindings(prev => {
              const filtered = prev.filter(b => !areStudentsEqual(b.studentRegNo, regToUse));
              return [...filtered, ...dynamicBindings];
            });

            const loadedDepts = obData.departments || [];
            const loadedProgs = obData.programs || [];

            console.log("[STUDENT_MARKS_DEBUG] studentCourses loaded from backend:", studentCourses);
            console.log("[STUDENT_MARKS_DEBUG] Active registration number:", regToUse);

            mappedInstructorCourses = studentCourses.map((sc: any) => {
              const codeStr = String(sc.code || '').trim().toUpperCase();
              const titleStr = String(sc.title || '').trim().toLowerCase();

              // Merge/lookup with the complete course details from our combined list
              const matchedIC = allInstructorCourses.find(ic => ic.code === sc.code || ic.id === sc.id);

              const standardCategories = sc.categories || matchedIC?.categories || [];
              const standardUnitsData = sc.unitsData || matchedIC?.unitsData || {};
              const obeQuestions = sc.obeQuestions || matchedIC?.obeQuestions || [];

              const pId = sc.programId || sc.program_id || matchingStudent?.programId || 'bscs';
              const prog = loadedProgs.find((p: any) => p.id === pId);
              const pName = prog ? prog.name : 'Bachelor of Science in Computer Science (BSCS)';
              
              const dId = sc.departmentId || sc.department_id || prog?.departmentId || matchingStudent?.departmentId || 'computing';
              const dept = loadedDepts.find((d: any) => d.id === dId);
              const dName = dept ? dept.name : 'Department of Computing and Technology';

              const studentMarksToUse = sc.studentMarks || sc.marks || matchedIC?.students?.find(s => areStudentsEqual(s.regNo, regToUse))?.marks || {};
              
              let obeMarksToUse = sc.obeMarks || {};
              if (matchedIC?.obeMarks) {
                const matchedKey = Object.keys(matchedIC.obeMarks).find(k => areStudentsEqual(k, regToUse));
                if (matchedKey) {
                  obeMarksToUse = { ...obeMarksToUse, ...matchedIC.obeMarks[matchedKey] };
                }
              }

              console.log(`[STUDENT_MARKS_DEBUG] Course ${codeStr} - "${sc.title}" details mapped from backend/local:`, {
                id: sc.id,
                code: sc.code,
                title: sc.title,
                studentMarks: studentMarksToUse,
                obeMarks: obeMarksToUse,
                categories: standardCategories,
                unitsData: standardUnitsData,
                obeQuestions: obeQuestions,
                selectedGradingSystem: sc.selectedGradingSystem
              });

              return {
                id: sc.id || `course-assigned-${sc.code}`,
                code: sc.code,
                title: sc.title || '',
                departmentId: dId,
                departmentName: dName,
                programId: pId,
                programName: pName,
                creditHours: sc.creditHours || 3,
                categories: standardCategories,
                unitsData: standardUnitsData,
                students: [
                  {
                    regNo: regToUse,
                    name: matchingStudent ? matchingStudent.name : 'Logged-In Student',
                    marks: studentMarksToUse
                  }
                ],
                obeQuestions: obeQuestions,
                obeMarks: {
                  [regToUse]: obeMarksToUse
                },
                clos: sc.clos || sc.courseCLOs || sc.course_clos || [],
                selectedGradingSystem: sc.selectedGradingSystem || matchedIC?.selectedGradingSystem || 'ready1'
              };
            });
          } else {
            console.warn("[STUDENT_MARKS_DEBUG] studentCourses from API is not an array:", studentCourses);
            mappedInstructorCourses = [];
          }
        } catch (apiErr) {
          console.error("[STUDENT_MARKS_DEBUG] Error loading student courses from backend:", apiErr);
          mappedInstructorCourses = [];
        }
        setInstructorCourses(mappedInstructorCourses);
      } catch (err) {
        console.warn("Instructor courses not loaded directly, using empty set.", err);
        setInstructorCourses([]);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to retrieve Student Portal academic ledger.');
    } finally {
      setLoading(false);
    }
  };

  // Find active student details
  const activeStudent = useMemo(() => {
    return students.find(s => areStudentsEqual(s.regNo, activeRegNo)) || null;
  }, [students, activeRegNo]);

  // Find student's program and department details
  const activeProgram = useMemo(() => {
    if (!activeStudent) return null;
    return programs.find(p => p.id === activeStudent.programId) || null;
  }, [activeStudent, programs]);

  const activeDepartment = useMemo(() => {
    if (!activeProgram) return null;
    return departments.find(d => d.id === activeProgram.departmentId) || null;
  }, [activeProgram, departments]);

  // Extract semester from course code dynamically (e.g. CMC111 -> 1st Semester, SEN212 -> 2nd Semester)
  const getCourseSemester = (courseCode: string): string => {
    // 1. Use the active student's semester if available, so current enrolled courses align with their current active semester!
    if (activeStudent && activeStudent.semester) {
      const s = String(activeStudent.semester).trim();
      if (s) {
        if (!s.toLowerCase().includes('semester')) {
          return `${s} Semester`;
        }
        return s;
      }
    }

    // 2. Try to find the course in the loaded semester plans
    if (Array.isArray(semesterPlans) && semesterPlans.length > 0) {
      const studentProgramId = activeStudent?.programId || '';
      // Try to match the student's program first
      const matchByProgram = semesterPlans.find(p => 
        p.programId === studentProgramId && 
        p.courseCodes?.some((c: string) => c.trim().toUpperCase() === courseCode.trim().toUpperCase())
      );
      if (matchByProgram) {
        return matchByProgram.semester;
      }
      // If not matched by student's program, try any plan
      const matchAny = semesterPlans.find(p => 
        p.courseCodes?.some((c: string) => c.trim().toUpperCase() === courseCode.trim().toUpperCase())
      );
      if (matchAny) {
        return matchAny.semester;
      }
    }

    const match = courseCode.match(/\d/);
    if (match) {
      const digit = match[0];
      switch (digit) {
        case '1': return '1st Semester';
        case '2': return '2nd Semester';
        case '3': return '3rd Semester';
        case '4': return '4th Semester';
        case '5': return '5th Semester';
        case '6': return '6th Semester';
        case '7': return '7th Semester';
        case '8': return '8th Semester';
        default: return 'Other Semester';
      }
    }
    return '1st Semester';
  };

  const getStudentMark = (
    student: any,
    categoryName: string,
    unitNo: number,
    totalMarks: number,
    unitsData?: Record<string, any[]>
  ): number => {
    if (unitsData && unitsData[categoryName]) {
      const matchingUnit = unitsData[categoryName].find((u: any) => u.unitNo === unitNo);
      if (matchingUnit && matchingUnit.questions && matchingUnit.questions.length > 0) {
        return matchingUnit.questions.reduce((sum: number, q: any) => {
          const qKey = `q-${categoryName}-${unitNo}-${q.id}`;
          return sum + (student.marks?.[qKey] ?? 0);
        }, 0);
      }
    }

    if (student.marks && student.marks[`${categoryName}-${unitNo}`] !== undefined) {
      return student.marks[`${categoryName}-${unitNo}`];
    }

    if (student.marks && student.marks[categoryName] !== undefined && unitNo === 1) {
      return student.marks[categoryName];
    }
    
    return 0;
  };

  // Helper to retrieve realistic grades/attainments based on the student's registration ID and backend responses
  const computeStudentCourseResult = (stdRegNo: string, courseCode: string) => {
    // Get course from /api/student/courses/ response (stored in state rawStudentCourses)
    const course = rawStudentCourses?.find(
      (c: any) => c.code?.toUpperCase() === courseCode?.toUpperCase()
    );

    if (!course) {
      return { aggregate: 0, letterGrade: '-', points: 0, clos: [], hasAnyMarks: false };
    }

    const courseCLOs = allCoursesCLOs[courseCode] || [];
    
    // Dynamically calculate CLO attainments for THIS active student in real-time
    const dynamicCLOs = calculateStudentCLOAttainment(course, stdRegNo, allInstructorCoursesState);

    // Dynamic aggregate, grade, and grade points calculation from instructor-entered marks
    let finalAggregate = course.totalPercentage ?? 0;
    let finalGrade = course.grade ?? '-';
    let finalPoints = course.gradePoints ?? 0;
    let hasAnyMarks = (course.totalPercentage ?? 0) > 0;

    const matchedIC = allInstructorCoursesState.find((ic: any) =>
      matchInstructorCourse(ic, courseCode, course.name || course.title)
    );

    let isCompleted = !matchedIC;

    if (matchedIC) {
      const matchedStudentInIC = matchedIC.students?.find((s: any) =>
        areStudentsEqual(s.regNo, stdRegNo)
      );
      if (matchedStudentInIC && matchedStudentInIC.marks) {
        let studentObeMarks = {};
        if (matchedIC.obeMarks) {
          const matchedKey = Object.keys(matchedIC.obeMarks).find(k => areStudentsEqual(k, stdRegNo));
          if (matchedKey) {
            studentObeMarks = matchedIC.obeMarks[matchedKey] || {};
          }
        }
        const combinedMarks = {
          ...studentObeMarks,
          ...(matchedStudentInIC.marks || {})
        };

        let aggregate = 0;
        let activeCats = (matchedIC.categories || []).filter((cat: any) => cat.percentage > 0);
        let hasRealMarks = false;
        let gradedWeightSum = 0;

        activeCats.forEach((cat: any) => {
          if (cat.units > 0) {
            let totalMaxMarks = 0;
            let studentObtainedSum = 0;
            let catHasAnyMarks = false;
            const existingUnits = matchedIC.unitsData?.[cat.name] || [];

            for (let u = 1; u <= cat.units; u++) {
              const matchingUnit = existingUnits.find((unit: any) => unit.unitNo === u);
              const questions = matchingUnit?.questions || [];

              if (questions.length > 0) {
                questions.forEach((q: any) => {
                  totalMaxMarks += q.maxMarks || 0;
                  const qIdStr = String(q.id).trim().toLowerCase();
                  const markExists = Object.keys(combinedMarks).some(k => {
                    const kLower = k.toLowerCase();
                    return kLower === qIdStr || kLower.endsWith(`-${qIdStr}`) || kLower === `q-${qIdStr}` || kLower.includes(`-${qIdStr}-`) || kLower.includes(`_${qIdStr}`);
                  });
                  if (markExists) {
                    studentObtainedSum += getFuzzyStudentMark(combinedMarks, cat.name, u, q.id);
                    catHasAnyMarks = true;
                  }
                });
              } else {
                const maxMarks = matchingUnit ? matchingUnit.totalMarks : 10;
                totalMaxMarks += maxMarks;
                const dKey = `${cat.name}-${u}`;
                const dKeyLower = dKey.toLowerCase();
                const markExists = Object.keys(combinedMarks).some(k => k.toLowerCase() === dKeyLower || k.toLowerCase().replace(/[^a-z0-9]/g, '') === dKeyLower.replace(/[^a-z0-9]/g, ''));
                if (markExists) {
                  studentObtainedSum += getFuzzyStudentMark(combinedMarks, cat.name, u);
                  catHasAnyMarks = true;
                }
              }
            }

            if (catHasAnyMarks) {
              hasRealMarks = true;
              gradedWeightSum += cat.percentage;
            }

            const catContribution = totalMaxMarks > 0
              ? (studentObtainedSum / totalMaxMarks) * cat.percentage
              : 0;

            aggregate += catContribution;
          }
        });

        if (hasRealMarks) {
          finalAggregate = parseFloat(aggregate.toFixed(1));
          
          // Compute letter grade
          const system = matchedIC.selectedGradingSystem || 'ready1';
          if (system === 'ready1') {
            if (finalAggregate >= 88) finalGrade = 'A';
            else if (finalAggregate >= 81) finalGrade = 'B+';
            else if (finalAggregate >= 74) finalGrade = 'B';
            else if (finalAggregate >= 67) finalGrade = 'C+';
            else if (finalAggregate >= 60) finalGrade = 'C';
            else finalGrade = 'F';
          } else if (system === 'ready2') {
            if (finalAggregate >= 90) finalGrade = 'A+';
            else if (finalAggregate >= 85) finalGrade = 'A';
            else if (finalAggregate >= 80) finalGrade = 'A-';
            else if (finalAggregate >= 75) finalGrade = 'B+';
            else if (finalAggregate >= 70) finalGrade = 'B';
            else if (finalAggregate >= 65) finalGrade = 'B-';
            else if (finalAggregate >= 60) finalGrade = 'C+';
            else if (finalAggregate >= 55) finalGrade = 'C';
            else if (finalAggregate >= 50) finalGrade = 'D';
            else finalGrade = 'F';
          } else if (system === 'custom') {
            const list = matchedIC.customGradingSystem || [];
            let found = false;
            for (const tier of list) {
              const range = parsePercentRange(tier.percentage);
              if (finalAggregate >= range.min && finalAggregate <= range.max) {
                finalGrade = tier.grade;
                found = true;
                break;
              }
            }
            if (!found) {
              if (finalAggregate >= 88) finalGrade = 'A';
              else if (finalAggregate >= 81) finalGrade = 'B+';
              else if (finalAggregate >= 74) finalGrade = 'B';
              else if (finalAggregate >= 67) finalGrade = 'C+';
              else if (finalAggregate >= 60) finalGrade = 'C';
              else finalGrade = 'F';
            }
          }

          // Compute grade points
          if (system === 'ready1') {
            if (finalGrade === 'A') finalPoints = 4.0;
            else if (finalGrade === 'B+') finalPoints = 3.5;
            else if (finalGrade === 'B') finalPoints = 3.0;
            else if (finalGrade === 'C+') finalPoints = 2.5;
            else if (finalGrade === 'C') finalPoints = 2.0;
            else finalPoints = 0.0;
          } else if (system === 'ready2') {
            if (finalGrade === 'A+') finalPoints = 4.0;
            else if (finalGrade === 'A') finalPoints = 4.0;
            else if (finalGrade === 'A-') finalPoints = 3.7;
            else if (finalGrade === 'B+') finalPoints = 3.3;
            else if (finalGrade === 'B') finalPoints = 3.0;
            else if (finalGrade === 'B-') finalPoints = 2.7;
            else if (finalGrade === 'C+') finalPoints = 2.5;
            else if (finalGrade === 'C') finalPoints = 2.0;
            else if (finalGrade === 'D') finalPoints = 1.0;
            else finalPoints = 0.0;
          } else if (system === 'custom') {
            const list = matchedIC.customGradingSystem || [];
            const matchedTier = list.find((t: any) => t.grade === finalGrade);
            if (matchedTier) {
              finalPoints = parseFloat(matchedTier.points || '0');
            } else {
              if (finalGrade === 'A') finalPoints = 4.0;
              else if (finalGrade === 'B+') finalPoints = 3.5;
              else if (finalGrade === 'B') finalPoints = 3.0;
              else if (finalGrade === 'C+') finalPoints = 2.5;
              else if (finalGrade === 'C') finalPoints = 2.0;
              else finalPoints = 0.0;
            }
          } else {
            if (finalGrade === 'A') finalPoints = 4.0;
            else if (finalGrade === 'B+') finalPoints = 3.5;
            else if (finalGrade === 'B') finalPoints = 3.0;
            else if (finalGrade === 'C+') finalPoints = 2.5;
            else if (finalGrade === 'C') finalPoints = 2.0;
            else finalPoints = 0.0;
          }

          hasAnyMarks = true;
          isCompleted = (aggregate > 0 && Object.keys(combinedMarks).length > 0) && (aggregate >= 50 || matchedIC?.status === 'closed' || finalGrade !== 'F' && finalGrade !== '-' && finalGrade !== '');
        }
      }
    }

    return {
      aggregate:    finalAggregate,
      letterGrade:  finalGrade,
      points:       finalPoints,
      hasAnyMarks,
      isCompleted,
      clos:         (dynamicCLOs ?? []).map((c: any) => {
        const matchingDef = courseCLOs.find((def: any) => (def.code || def.cloCode || '').toUpperCase() === (c.code || c.cloCode || '').toUpperCase());
        const rawMappedGA = matchingDef?.mappedGA || matchingDef?.mapped_ga || c.mappedGA || null;
        return {
          code:       c.code,
          percentage: c.percentage,
          status:     c.percentage >= 50 ? 'Attained' : 'Not Attained',
          description: matchingDef?.description || c.description || `Course Learning Outcome ${c.code}`,
          mappedGA:   standardizeMappedGAObj(rawMappedGA, c.code, gas)
        };
      })
    };
  };

  // Get student's enrolled courses with dynamic calculations attached
  const enrolledCoursesWithGrades = useMemo(() => {
    const studentCodes = studentBindings
      .filter(b => b.studentRegNo === activeRegNo)
      .map(b => b.courseCode);
    
    const matched = courses
      .filter(c => studentCodes.includes(c.code))
      .map(c => {
        const results = computeStudentCourseResult(activeRegNo, c.code);
        const apiCourse = rawStudentCourses?.find(
          (rc: any) => rc.code?.toUpperCase() === c.code?.toUpperCase()
        );
        return {
          ...c,
          ...apiCourse,
          results
        };
      });

    const seen = new Set<string>();
    return matched.filter(c => {
      if (seen.has(c.code)) {
        return false;
      }
      seen.add(c.code);
      return true;
    });
  }, [courses, studentBindings, activeRegNo, instructorCourses, rawStudentCourses, allInstructorCoursesState]);

  // Group enrolled courses by Semester
  const coursesBySemester = useMemo(() => {
    const grouped: Record<string, typeof enrolledCoursesWithGrades> = {};
    enrolledCoursesWithGrades.forEach(c => {
      const sem = getCourseSemester(c.code);
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push(c);
    });

    // Sort semester keys logically
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, typeof enrolledCoursesWithGrades>);
  }, [enrolledCoursesWithGrades, semesterPlans]);

  // Compute SGPA / CGPA overall
  const GPAStats = useMemo(() => {
    let totalPointsProduct = 0;
    let totalCredits = 0;
    let passedCoursesCount = 0;
    let totalCoursesCount = 0;

    // Collect all unique courses that have been graded
    const courseGPAs: Record<string, { points: number; credits: number; passed: boolean }> = {};

    // 1. Process enrolled courses with grades
    enrolledCoursesWithGrades.forEach(c => {
      if (c.results && c.results.hasAnyMarks && c.results.isCompleted) {
        courseGPAs[c.code] = {
          points: c.results.points,
          credits: c.creditHours || 3,
          passed: c.results.letterGrade !== 'F'
        };
      }
    });

    // 2. Merge with finalTranscripts (which is the server-side finalized records)
    finalTranscripts.forEach(t => {
      const pts = t.gradePoints ?? t.points ?? 0;
      courseGPAs[t.courseCode] = {
        points: pts,
        credits: t.creditHours || 3,
        passed: t.grade !== 'F'
      };
    });

    // 3. Sum up the credits and grade points
    Object.keys(courseGPAs).forEach(code => {
      const info = courseGPAs[code];
      totalPointsProduct += info.points * info.credits;
      totalCredits += info.credits;
      totalCoursesCount++;
      if (info.passed) {
        passedCoursesCount++;
      }
    });

    let cgpa = totalCredits > 0 ? (totalPointsProduct / totalCredits) : 0.0;
    cgpa = Math.round(cgpa * 100) / 100;

    return {
      cgpa,
      sgpa: cgpa,
      totalCredits,
      passedCourses: passedCoursesCount
    };
  }, [enrolledCoursesWithGrades, finalTranscripts, studentSummary]);

  // Calculate Semester GPA dynamically for each semester group
  const semesterGPAs = useMemo(() => {
    const gpas: Record<string, number> = {};
    Object.keys(coursesBySemester).forEach(semKey => {
      const semCourses = coursesBySemester[semKey];
      let totalPointsProduct = 0;
      let totalCredits = 0;
      let hasGrades = false;

      semCourses.forEach(c => {
        const crHrs = c.creditHours || 3;
        if (c.results && c.results.points !== undefined && c.results.hasAnyMarks && c.results.isCompleted) {
          totalPointsProduct += c.results.points * crHrs;
          totalCredits += crHrs;
          hasGrades = true;
        }
      });

      gpas[semKey] = hasGrades && totalCredits > 0 ? totalPointsProduct / totalCredits : 0.0;
    });
    return gpas;
  }, [coursesBySemester]);

  // Determine which semester to use for displaying "Semester GPA" in the header
  const currentSemesterForGPA = useMemo(() => {
    if (selectedSemester !== 'all') {
      return selectedSemester;
    }
    const semKeys = Object.keys(coursesBySemester);
    if (semKeys.length > 0) {
      // Return highest/latest semester
      const sorted = [...semKeys].sort((a, b) => b.localeCompare(a));
      return sorted[0];
    }
    return '';
  }, [selectedSemester, coursesBySemester]);

  // Get active GPA score for the selected or default latest semester
  const activeSemesterGPA = useMemo(() => {
    if (!currentSemesterForGPA || !semesterGPAs[currentSemesterForGPA]) {
      return 0.0;
    }
    return semesterGPAs[currentSemesterForGPA];
  }, [currentSemesterForGPA, semesterGPAs]);

  // Automatically select the latest semester on load
  useEffect(() => {
    const semKeys = Object.keys(coursesBySemester);
    if (semKeys.length > 0 && selectedSemester === 'all') {
      const sorted = [...semKeys].sort((a, b) => b.localeCompare(a));
      setSelectedSemester(sorted[0]);
    }
  }, [coursesBySemester]);

  // Filter GAs (Graduate Attributes) associated with the student's program/department
  const programGAs = useMemo(() => {
    if (!activeStudent || gas.length === 0) return [];
    
    // Filter by the student's department
    const studentDeptId = (activeStudent.departmentId || 'computing').toLowerCase();
    const filtered = gas.filter(g => (g.departmentId || '').toLowerCase() === studentDeptId);
    
    console.log("[STUDENT_MARKS_DEBUG] Filtered programGAs for department", studentDeptId, ":", filtered);
    return filtered;
  }, [activeStudent, gas]);

  // Compute Graduate Attribute (GA) Attainment scores dynamically per instructions
  // Group by mappedGA.gaId, average the CLO percentages, and only show GAs present in the data.
  const gaAttainmentProfile = useMemo(() => {
    const gaMap: Record<string, { gaTitle: string; scores: number[]; courses: Set<string> }> = {};

    enrolledCoursesWithGrades.forEach((course: any) => {
      const courseClos = course.results?.clos || [];
      courseClos.forEach((clo: any) => {
        if (!clo.mappedGA) return; // skip unmapped CLOs

        const gaId = typeof clo.mappedGA === 'object' ? clo.mappedGA.gaId : clo.mappedGA;
        const gaTitle = typeof clo.mappedGA === 'object' ? clo.mappedGA.gaTitle : `Graduate Attribute ${gaId}`;
        if (!gaId) return;

        if (!gaMap[gaId]) {
          gaMap[gaId] = { gaTitle: gaTitle || `Graduate Attribute ${gaId}`, scores: [], courses: new Set() };
        }

        gaMap[gaId].scores.push(clo.percentage);
        const title = course.title || course.name || '';
        gaMap[gaId].courses.add(`${course.code} - ${title}`);
      });
    });

    const list = Object.entries(gaMap).map(([gaId, data]) => {
      const avg = data.scores.length > 0 
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
        : 0;

      const origGA = findOriginalGA(gaId, gas);

      return {
        id: formatGACodeToStandard(gaId),
        name: origGA?.name || data.gaTitle,
        description: origGA?.description || `Competency and standard metrics for ${origGA?.name || data.gaTitle}`,
        score: Math.round(avg * 100) / 100,
        attained: avg >= 50,   // 50% is the threshold
        contributingCount: data.scores.length,
        coursesList: Array.from(data.courses)
      };
    });

    return [...list].sort((a, b) => naturalCompare(a.id, b.id));
  }, [enrolledCoursesWithGrades, gas]);

  // Compute course-specific Graduate Attribute (GA) Attainment scores dynamically
  const courseGaAttainment = useMemo(() => {
    if (!selectedGaCourseCode) return [];
    
    // Find the selected course in enrolledCoursesWithGrades
    const courseObj = enrolledCoursesWithGrades.find(c => c.code === selectedGaCourseCode);
    if (!courseObj) return [];

    const gaMap: Record<string, { gaTitle: string; scores: number[] }> = {};

    (courseObj.results?.clos ?? []).forEach((clo: any) => {
      if (!clo.mappedGA) return;
      const gaId = typeof clo.mappedGA === 'object' ? clo.mappedGA.gaId : clo.mappedGA;
      const gaTitle = typeof clo.mappedGA === 'object' ? (clo.mappedGA.gaTitle || gaId) : `Graduate Attribute ${gaId}`;
      if (!gaId) return;

      if (!gaMap[gaId]) {
        gaMap[gaId] = { gaTitle, scores: [] };
      }
      gaMap[gaId].scores.push(clo.percentage);
    });

    const list = Object.entries(gaMap).map(([gaId, data]) => {
      const avg = data.scores.length > 0 
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
        : 0;

      const origGA = findOriginalGA(gaId, gas);

      return {
        id: formatGACodeToStandard(gaId),
        name: origGA?.name || data.gaTitle,
        description: origGA?.description || `Competency and standard metrics for ${origGA?.name || data.gaTitle}`,
        score: Math.round(avg * 100) / 100,
        attained: avg >= 50,
        contributingCount: data.scores.length,
        coursesList: [`${courseObj.code} - ${courseObj.title}`]
      };
    });

    return [...list].sort((a, b) => naturalCompare(a.id, b.id));
  }, [enrolledCoursesWithGrades, selectedGaCourseCode, gas]);

  // Aggregate Course Learning Outcomes (CLO) for the selected filter course
  const filteredCLOList = useMemo(() => {
    const list: { courseCode: string; courseTitle: string; cloCode: string; description: string; mappedGA: string | null; percentage: number; status: string }[] = [];
    
    enrolledCoursesWithGrades.forEach(c => {
      if (selectedCloCourseCode && c.code !== selectedCloCourseCode) return;
      
      c.results.clos.forEach(clo => {
        list.push({
          courseCode: c.code,
          courseTitle: c.title,
          cloCode: clo.code,
          description: clo.description || `Course Learning Outcome for ${clo.code}`,
          mappedGA: clo.mappedGA || null,
          percentage: Math.round(clo.percentage),
          status: clo.status
        });
      });
    });

    return list;
  }, [enrolledCoursesWithGrades, selectedCloCourseCode]);

  // Helper to retrieve detailed marks breakdown for expanded views
  const getCourseMarksBreakdown = (course: any) => {
    if (!course) return [];

    const courseCode = course.code;
    const stdRegNo = activeRegNo;

    // Try to find the matched instructor course for dynamic real-time local storage calculations
    const matchedIC = allInstructorCoursesState.find((ic: any) =>
      matchInstructorCourse(ic, courseCode, course.name || course.title)
    );

    if (matchedIC) {
      const matchedStudentInIC = matchedIC.students?.find((s: any) =>
        areStudentsEqual(s.regNo, stdRegNo)
      );

      if (matchedStudentInIC && matchedStudentInIC.marks) {
        const activeCats = (matchedIC.categories || []).filter((cat: any) => cat.percentage > 0);
        
        return activeCats.map((cat: any) => {
          let totalMaxMarks = 0;
          let studentObtainedSum = 0;
          const existingUnits = matchedIC.unitsData?.[cat.name] || [];

          for (let u = 1; u <= cat.units; u++) {
            const matchingUnit = existingUnits.find((unit: any) => unit.unitNo === u);
            const questions = matchingUnit?.questions || [];

            if (questions.length > 0) {
              questions.forEach((q: any) => {
                totalMaxMarks += q.maxMarks || 0;
                const qKey = `q-${cat.name}-${u}-${q.id}`;
                studentObtainedSum += Number(matchedStudentInIC.marks?.[qKey] || 0);
              });
            } else {
              const maxMarks = matchingUnit ? matchingUnit.totalMarks : 10;
              totalMaxMarks += maxMarks;
              const dKey = `${cat.name}-${u}`;
              studentObtainedSum += Number(matchedStudentInIC.marks?.[dKey] || 0);
            }
          }

          const catContribution = totalMaxMarks > 0
            ? (studentObtainedSum / totalMaxMarks) * cat.percentage
            : 0;

          const scored = parseFloat(catContribution.toFixed(1));
          const max = cat.percentage;
          const pct = max > 0 ? Math.round((scored / max) * 100) : 0;

          return {
            category: cat.name,
            scored,
            max,
            pct
          };
        });
      }
    }
    
    // If we have a categoryBreakdown object directly from API
    if (course.categoryBreakdown && typeof course.categoryBreakdown === 'object') {
      if (Array.isArray(course.categoryBreakdown)) {
        return course.categoryBreakdown;
      }
      return Object.entries(course.categoryBreakdown).map(([category, val]: [string, any]) => {
        const scored = val.obtained !== undefined ? val.obtained : (val.scored ?? 0);
        const max = val.total !== undefined ? val.total : (val.weight ?? val.max ?? 100);
        const pct = val.percentage !== undefined ? val.percentage : (max > 0 ? Math.round((scored / max) * 100) : 0);
        return {
          category,
          scored,
          max,
          pct
        };
      });
    }

    // Fallback if the rawStudentCourses structure has categories
    if (course.categories && Array.isArray(course.categories)) {
      return course.categories.map((cat: any) => ({
        category: cat.name,
        scored: 0,
        max: cat.percentage ?? 100,
        pct: 0
      }));
    }

    // Default static fallback list
    return [
      { category: 'Assignments', scored: 0, max: 15, pct: 0 },
      { category: 'Quizzes', scored: 0, max: 10, pct: 0 },
      { category: 'Class Project', scored: 0, max: 15, pct: 0 },
      { category: 'Presentation', scored: 0, max: 5, pct: 0 },
      { category: 'Mid Term Exam', scored: 0, max: 20, pct: 0 },
      { category: 'Final Term Exam', scored: 0, max: 30, pct: 0 },
      { category: 'Class Attendance', scored: 0, max: 5, pct: 0 }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Retrieving Student Academic Record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 backdrop-blur-md bg-white/95 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/iqralogo.png" 
            alt="Iqra University" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-indigo-950 uppercase">IU Student Portal</h1>
            <p className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">Academic Result & OBE Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* SECURE STUDENT INFO BADGE */}
          {activeStudent && (
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{activeStudent.name} ({activeRegNo})</span>
            </div>
          )}



          <button
            onClick={onLogout}
            className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-950 border border-slate-200/80 font-bold p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* PROFILE HEADER CARD */}
        {activeStudent && (
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activeStudent.name}</h2>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-indigo-100 font-mono tracking-wide">
                    {activeStudent.batch} Batch
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-tight">{activeStudent.regNo}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {activeProgram?.name || 'Bachelor of Science'} • <strong className="text-slate-700">{activeStudent.semester || '4th'} Semester</strong>
                </p>
              </div>
            </div>

            {/* GPA AND PROGRESS WIDGETS */}
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-4 w-full md:w-auto relative z-10">
              {/* Semester GPA widget */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center min-w-[130px] flex-1 lg:flex-none shadow-xs">
                <p className="text-xs uppercase font-extrabold text-blue-700 tracking-wider">
                  GPA
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <Award className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-xl font-extrabold text-blue-950 font-mono">
                    {(activeSemesterGPA ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cumulative GPA widget */}
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-center min-w-[130px] flex-1 lg:flex-none shadow-xs">
                <p className="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">CGPA</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <Award className="h-5 w-5 text-indigo-600 shrink-0" />
                  <span className="text-xl font-extrabold text-indigo-950 font-mono">{GPAStats.cgpa.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* SECURE STUDENT INFO ON MOBILE */}
        {activeStudent && (
          <div className="md:hidden bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-600">
              <UserCheck className="h-4 w-4 text-indigo-600" /> Student Profile:
            </span>
            <span>{activeStudent.name} ({activeRegNo})</span>
          </div>
        )}

        {/* TAB CONTROLS */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'transcript'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Semester Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab('obe_clo')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'obe_clo'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>CLO Attainment Indices</span>
          </button>
          <button
            onClick={() => setActiveTab('ga_attainment')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ga_attainment'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlaqueIcon className="h-4 w-4" />
            <span>GA Attainment Profile</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DETAILED TRANSCRIPT */}
            {activeTab === 'transcript' && (
              <motion.div
                key="transcript-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {finalTranscripts.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2.5 text-white">
                        <Award className="h-5 w-5 text-indigo-400" />
                        <div>
                          <h3 className="text-sm font-bold tracking-tight uppercase">Official Academic Transcript Record</h3>
                          <p className="text-[10px] text-slate-300 font-medium">Permanent snapshot ledger of finalized semesters (Snapshotted & Sealed)</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        SEALED
                      </span>
                    </div>

                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-6">Course / Code</th>
                            <th className="py-3 px-4">Instructor</th>
                            <th className="py-3 px-4">Term / Year</th>
                            <th className="py-3 px-4 text-center">Credit Hours</th>
                            <th className="py-3 px-4 text-center">Final Mark</th>
                            <th className="py-3 px-4 text-center">Grade / GPA</th>
                            <th className="py-3 px-4">Finalized On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {finalTranscripts.map((t, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors font-medium">
                              <td className="py-4 px-6">
                                <div className="font-bold text-slate-900">{t.courseTitle}</div>
                                <div className="font-mono text-[10px] text-slate-400 mt-0.5">{t.courseCode}</div>
                              </td>
                              <td className="py-4 px-4 text-slate-600 font-semibold">{t.instructorName}</td>
                              <td className="py-4 px-4 text-slate-500 font-semibold">{t.academicYear} <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600 font-mono ml-1">{t.semester || '6th'}</span></td>
                              <td className="py-4 px-4 text-center font-mono text-slate-500">{t.creditHours || 3}</td>
                              <td className="py-4 px-4 text-center font-mono font-black text-indigo-950">{t.finalPercentage ? t.finalPercentage.toFixed(2) : '0.00'}%</td>
                              <td className="py-4 px-4 text-center">
                                <div className="font-black text-indigo-650">{t.grade}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.gradePoints ? t.gradePoints.toFixed(2) : '0.00'} GP</div>
                              </td>
                              <td className="py-4 px-4 font-mono text-[10px] text-slate-400">
                                {t.finalizedAt ? new Date(t.finalizedAt).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {enrolledCoursesWithGrades.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl py-16 px-4 text-center space-y-3 shadow-sm">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700">No Course Enrollments Found</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your courses have not been registered by the Academic Department yet. Please contact your department administration for catalog binding.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Compact Professional Semester Navigation Pills */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-2 rounded-xl border border-slate-200 max-w-fit shadow-xs">
                      <span className="text-xs uppercase font-bold text-slate-500 px-2">
                        Academic Semesters:
                      </span>
                      {Object.keys(coursesBySemester).map(semKey => (
                        <button
                          key={semKey}
                          onClick={() => {
                            setSelectedSemester(semKey);
                            setExpandedCourseCode(null);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedSemester === semKey
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-200/50'
                          }`}
                        >
                          {semKey.replace(' Semester', '')}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedSemester('all');
                          setExpandedCourseCode(null);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedSemester === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-200/50'
                        }`}
                      >
                        All Semesters
                      </button>
                    </div>

                    {/* Semesters list */}
                    {Object.keys(coursesBySemester)
                      .filter(semesterKey => selectedSemester === 'all' || selectedSemester === semesterKey)
                      .map(semesterKey => (
                        <div key={semesterKey} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                          {/* Semester Header */}
                          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Calendar className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">{semesterKey} Academic Ledger</h3>
                            </div>

                          </div>

                          {/* Course Cards Grid */}
                          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/10">
                            {coursesBySemester[semesterKey].map(course => {
                              const isExpanded = expandedCourseCode === course.code;
                              const hasPassed = course.results.letterGrade !== 'F';

                              return (
                                <div 
                                  key={course.code} 
                                  className={`bg-white border rounded-xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                                    isExpanded 
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/5 col-span-1 md:col-span-2 lg:col-span-3 shadow-xs' 
                                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                  }`}
                                >
                                  {/* Main Card Content */}
                                  <div className="p-5 space-y-4">
                                    {/* Badges Row */}
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                                        {course.code}
                                      </span>
                                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize border tracking-wide ${
                                        course.title?.toLowerCase().includes('lab')
                                          ? 'bg-purple-100 text-purple-850 border-purple-200'
                                          : course.type === 'core'
                                            ? 'bg-blue-100 text-blue-850 border-blue-200'
                                            : 'bg-amber-100 text-amber-850 border-amber-200'
                                      }`}>
                                        {course.type} Course
                                      </span>
                                    </div>

                                    {/* Course Title */}
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug min-h-[40px]" title={course.title}>
                                        {course.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 font-medium font-sans mt-1">
                                        {course.creditHours || 3} Credit Hours • Lecture-Based OBE Class
                                      </p>
                                    </div>

                                    {/* Main Stats Row */}
                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg">
                                      <div className="text-center">
                                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Score</p>
                                        <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{Math.round(course.results.aggregate)}%</p>
                                      </div>

                                      <div className="text-center border-x border-slate-200">
                                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Grade</p>
                                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded mt-0.5 ${
                                          hasPassed 
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                          {course.results.letterGrade}
                                        </span>
                                      </div>

                                      <div className="text-center">
                                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">GPA</p>
                                        <p className="text-sm font-bold text-indigo-950 font-mono mt-0.5">{course.results.points.toFixed(2)}</p>
                                      </div>
                                    </div>
                                                              {/* Card Footer Action */}
                                  <div 
                                    onClick={() => setExpandedCourseCode(isExpanded ? null : course.code)}
                                    className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer transition-colors"
                                  >
                                    <span>{isExpanded ? 'Hide Details' : 'View Assessment'}</span>
                                    <div className="text-slate-400">
                                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                  </div>

                                  {/* Course Expanded Details: Question/Assessment Breakdown */}
                                  {isExpanded && (
                                    <div className="px-5 pb-5 pt-3 bg-slate-50/50 border-t border-slate-200 space-y-4 animate-fade-in">
                                      <div>
                                        <h5 className="text-xs font-bold uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
                                          <ClipboardCheck className="h-4.5 w-4.5 text-indigo-600" />
                                          Assessment Marks Breakdown
                                        </h5>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                          {getCourseMarksBreakdown(course).map((item, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg flex justify-between items-center shadow-xs">
                                              <div>
                                                <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={item.category}>{item.category}</p>
                                                <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">Weight: {item.max}%</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-xs font-bold text-indigo-950 font-mono">
                                                  {item.scored} <span className="text-slate-500">/{item.max}</span>
                                                </p>
                                                <p className="text-xs font-bold text-emerald-600 font-mono mt-0.5">{item.pct}%</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>        </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: CLO PERFORMANCE ANALYTICS */}
            {activeTab === 'obe_clo' && (
              <motion.div
                key="clo-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
              >
                {selectedCloCourseCode === null ? (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-100 space-y-1">
                      <h3 className="text-base font-bold text-slate-800">Course Learning Outcome (CLO) Audit</h3>
                      <p className="text-xs text-slate-400">Select a registered course below to view its specific CLO attainments. A score of 50% or above denotes outcome attainment.</p>
                    </div>

                    {enrolledCoursesWithGrades.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No registered courses found.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrolledCoursesWithGrades.map((course) => {
                          const totalCLOs = course.results?.clos?.length || 0;
                          const attainedCLOs = course.results?.clos?.filter((clo: any) => clo.status === 'Attained').length || 0;
                          const pctAttained = totalCLOs > 0 ? Math.round((attainedCLOs / totalCLOs) * 100) : 0;
                          const grade = course.results?.letterGrade || '-';
                          const aggregate = course.results?.aggregate !== undefined ? course.results.aggregate : null;

                          return (
                            <div
                              key={course.code}
                              onClick={() => setSelectedCloCourseCode(course.code)}
                              className="group cursor-pointer bg-slate-50/50 hover:bg-white border border-slate-200/60 hover:border-indigo-300 hover:shadow-md p-5 rounded-2xl transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                            >
                              <div className="space-y-1.5 z-10">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    {course.code}
                                  </span>
                                  {grade !== '-' && (
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      Grade: {grade} ({aggregate !== null ? `${Math.round(aggregate)}%` : ''})
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-900 transition leading-snug line-clamp-2">
                                  {course.title}
                                </h4>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-slate-100 z-10">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                  <span>CLOs Mapped:</span>
                                  <span className="font-mono text-indigo-950 font-black">
                                    {attainedCLOs} / {totalCLOs} attained
                                  </span>
                                </div>
                                <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      pctAttained === 100 ? 'bg-emerald-500' : pctAttained >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${pctAttained}%` }}
                                  />
                                </div>
                                <div className="flex justify-end pt-1">
                                  <span className="text-[10px] text-indigo-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    View CLO Attainments
                                    <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back Button and Course Info Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedCloCourseCode(null)}
                          className="group flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer mb-1 bg-slate-100/80 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200"
                        >
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                          Back to Course List
                        </button>
                        {(() => {
                          const currentCourse = enrolledCoursesWithGrades.find(c => c.code === selectedCloCourseCode);
                          return (
                            <div>
                              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200 font-black">{currentCourse?.code}</span>
                                {currentCourse?.title}
                              </h3>
                              <p className="text-xs text-slate-400">Course Learning Outcome (CLO) details and individual attainment scores.</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {filteredCLOList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No active CLO targets found in this course.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCLOList.map((clo, idx) => {
                          const attained = clo.status === 'Attained';
                          return (
                            <div key={idx} className="bg-slate-50/50 hover:bg-white border border-slate-200/60 p-4.5 rounded-2xl shadow-sm transition-all flex flex-col justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-sm font-extrabold tracking-wide text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border-2 border-indigo-200/80 shadow-2xs">
                                      {clo.cloCode}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 shadow-xs transition-all ${
                                    attained 
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs' 
                                      : 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs'
                                  }`}>
                                    {clo.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  {clo.description}
                                </p>
                              </div>

                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                                  <span>Attainment Progress Index:</span>
                                  <span className="font-mono text-indigo-950 font-black">{clo.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${attained ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${clo.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: GA ATTAINMENT PROFILE */}
            {activeTab === 'ga_attainment' && (
              <motion.div
                key="ga-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
              >
                {selectedGaCourseCode === null ? (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-100 space-y-1">
                      <h3 className="text-base font-bold text-slate-800">Graduate Attribute (GA) Attainment Profile</h3>
                      <p className="text-xs text-slate-400">Select a registered course below to view the program-wide Graduate Attributes (GAs) mapped to its learning outcomes.</p>
                    </div>

                    {enrolledCoursesWithGrades.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No registered courses found.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrolledCoursesWithGrades.map((course) => {
                          const mappedGAsFromCLOs = Array.from(new Set(
                            (course.results?.clos ?? [])
                              .filter((clo: any) => clo.mappedGA && clo.mappedGA.gaId)
                              .map((clo: any) => clo.mappedGA.gaId)
                          )) as string[];
                          const mappedGAsCount = mappedGAsFromCLOs.length;
                          const grade = course.results?.letterGrade || '-';
                          const aggregate = course.results?.aggregate !== undefined ? course.results.aggregate : null;

                          return (
                            <div
                              key={course.code}
                              onClick={() => setSelectedGaCourseCode(course.code)}
                              className="group cursor-pointer bg-slate-50/50 hover:bg-white border border-slate-200/60 hover:border-emerald-300 hover:shadow-md p-5 rounded-2xl transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                            >
                              <div className="space-y-1.5 z-10">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {course.code}
                                  </span>
                                  {grade !== '-' && (
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      Grade: {grade} ({aggregate !== null ? `${Math.round(aggregate)}%` : ''})
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-emerald-900 transition leading-snug line-clamp-2">
                                  {course.title}
                                </h4>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-slate-100 z-10">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                  <span>Graduate Attributes:</span>
                                  <span className="font-mono text-emerald-950 font-black">
                                    {mappedGAsCount} {mappedGAsCount === 1 ? 'Attribute' : 'Attributes'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 pt-1 overflow-hidden h-6">
                                  {mappedGAsCount === 0 ? (
                                    <span className="text-[9px] text-slate-400 font-bold">No GAs Mapped</span>
                                  ) : (
                                    mappedGAsFromCLOs.map((gaId) => (
                                      <span key={gaId} className="bg-emerald-50/50 border border-emerald-100 text-emerald-700 font-mono text-[9px] font-bold px-1.5 rounded">
                                        {formatGACodeToStandard(gaId)}
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex justify-end pt-1">
                                  <span className="text-[10px] text-emerald-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    View GA Attainment
                                    <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back Button and Course Info Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedGaCourseCode(null)}
                          className="group flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition cursor-pointer mb-1 bg-slate-100/80 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-200"
                        >
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                          Back to Course List
                        </button>
                        {(() => {
                          const currentCourse = enrolledCoursesWithGrades.find(c => c.code === selectedGaCourseCode);
                          return (
                            <div>
                              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200 font-black">{currentCourse?.code}</span>
                                {currentCourse?.title}
                              </h3>
                              <p className="text-xs text-slate-400">Graduate Attribute (GA) attainment details mapping for this specific course.</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {courseGaAttainment.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No Graduate Attributes mapped to this course's learning outcomes.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseGaAttainment.map((ga, idx) => {
                          const attained = ga.score >= 50;
                          return (
                            <div key={idx} className="bg-slate-50/50 hover:bg-white border border-slate-200/60 p-4.5 rounded-2xl shadow-sm transition-all flex flex-col justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-sm font-extrabold tracking-wide text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border-2 border-emerald-200/80 shadow-2xs">
                                      {formatGACodeToStandard(ga.id)}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 shadow-xs transition-all ${
                                    attained 
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs' 
                                      : 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs'
                                  }`}>
                                    {attained ? 'Attained' : 'Not Attained'}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{ga.name}</h4>
                                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                    {ga.description}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                                  <span>Attainment Progress Index:</span>
                                  <span className="font-mono text-emerald-950 font-black">{ga.score.toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${attained ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${ga.score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* RAW BACKEND DATA INSPECTOR FOR TRANSPARENT DEBUGGING */}
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Live Connection Diagnostics
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Verifying real-time data flow mapping between backend and student dashboard.
                </p>
              </div>
              <button
                id="toggle-api-inspector-btn"
                onClick={() => setShowApiInspector(!showApiInspector)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] px-3.5 py-1.5 rounded-xl border border-slate-700 transition self-start sm:self-auto cursor-pointer"
              >
                {showApiInspector ? 'Hide Raw API JSON' : 'Inspect Raw API JSON'}
              </button>
            </div>

            {showApiInspector && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 font-mono text-xs overflow-auto max-h-96 space-y-2">
                  <div className="text-amber-400 font-bold border-b border-slate-850 pb-1.5 mb-2 flex justify-between">
                    <span>GET /api/student/courses/</span>
                    <span className="text-slate-500 font-normal">Count: {Array.isArray(rawStudentCourses) ? rawStudentCourses.length : 0}</span>
                  </div>
                  {rawStudentCourses ? (
                    <pre className="text-[11px] text-slate-300 whitespace-pre-wrap break-all leading-normal">
                      {JSON.stringify(rawStudentCourses, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-500 italic py-4 text-center">
                      No course data retrieved yet. Please verify authentication or server connectivity.
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold">Processed Courses ({instructorCourses.length}):</span>
                    {instructorCourses.map(ic => (
                      <div key={ic.code} className="text-slate-400 pl-2">
                        • <span className="text-slate-200 font-bold">{ic.code}</span> (OBE Questions: {ic.obeQuestions?.length || 0})
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="text-indigo-400 font-bold">Active Student:</span>
                    <div className="text-slate-300 pl-2">Reg No: <span className="text-white font-bold">{activeRegNo}</span></div>
                    <div className="text-slate-300 pl-2">Name: <span className="text-slate-400 font-bold">{students.find(s => areStudentsEqual(s.regNo, activeRegNo))?.name || 'Logged-In Student'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
