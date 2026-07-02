import { useState, useEffect } from 'react';
import { UserType } from './types';
import Login from './components/Login';
import QADashboard from './components/QADashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AdmissionDashboard from './components/AdmissionDashboard';
import DeptAdminDashboard from './components/DeptAdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import ComingSoon from './components/ComingSoon';
import Toast from './components/Toast';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ type: UserType; name: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleLogin = (type: UserType, name: string) => {
    setCurrentUser({ type, name });
  };

  const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('backend_offline') === 'true');

  useEffect(() => {
    const handleOfflineDetected = () => {
      setIsOfflineMode(true);
    };
    const handleOnlineDetected = () => {
      setIsOfflineMode(false);
    };
    window.addEventListener('backend-offline-detected', handleOfflineDetected);
    window.addEventListener('backend-online-detected', handleOnlineDetected);
    return () => {
      window.removeEventListener('backend-offline-detected', handleOfflineDetected);
      window.removeEventListener('backend-online-detected', handleOnlineDetected);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('backend_offline');
    localStorage.removeItem('IQRA_OBE_LOGGED_IN_USER');
    localStorage.removeItem('IQRA_OBE_USER_DEPT_ID');
    localStorage.removeItem('IQRA_OBE_USER_DEPT_NAME');
    setIsOfflineMode(false);
    setCurrentUser(null);
  };

  useEffect(() => {
    // Session restoration on mount
    const savedUserStr = localStorage.getItem('IQRA_OBE_LOGGED_IN_USER');
    const token = localStorage.getItem('access');
    if (savedUserStr && token) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.mustChangePassword) {
          handleLogout();
        } else if (savedUser && savedUser.user_type) {
          const identifier = savedUser.regNo || savedUser.reg_no || savedUser.employeeId || savedUser.employee_id || savedUser.name || savedUser.email;
          setCurrentUser({ type: savedUser.user_type, name: identifier });
        }
      } catch (e) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToastMsg("Your session has expired. Please log in again to preserve real-time sync with the server.");
      handleLogout();
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white selection:bg-gray-900 selection:text-white">
      {currentUser && isOfflineMode && (
        <div className="bg-amber-600 text-white text-center text-[11px] sm:text-xs py-2 px-4 flex items-center justify-center gap-2 font-sans font-semibold sticky top-0 z-50 shadow-md">
          <span className="animate-pulse">⚠️</span>
          <span>Offline Sandbox Mode: Connection to backend server is currently unavailable. Edits are being saved locally in browser storage and will not sync to the central database.</span>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (currentUser.type === 'QA' || currentUser.type === 'admin' || currentUser.type === 'qa') ? (
          <motion.div
            key="qa-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <QADashboard onLogout={handleLogout} />
          </motion.div>
        ) : (currentUser.type === 'instructor') ? (
          <motion.div
            key="instructor-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <InstructorDashboard onLogout={handleLogout} instructorName={currentUser.name || undefined} />
          </motion.div>
        ) : (currentUser.type === 'admission') ? (
          <motion.div
            key="admission-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <AdmissionDashboard onLogout={handleLogout} admissionName={currentUser.name || undefined} />
          </motion.div>
        ) : (currentUser.type === 'dept_admin') ? (
          <motion.div
            key="dept-admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <DeptAdminDashboard onLogout={handleLogout} adminName={currentUser.name || undefined} />
          </motion.div>
        ) : (currentUser.type === 'student') ? (
          <motion.div
            key="student-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <StudentDashboard onLogout={handleLogout} studentRegNo={currentUser.name} />
          </motion.div>
        ) : (
          <motion.div
            key="coming-soon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <ComingSoon userType={currentUser.type} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <Toast message={toastMsg} type="error" onClose={() => setToastMsg(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
