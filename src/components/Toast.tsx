import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'error' 
    ? 'bg-red-50 border-red-200 text-red-900' 
    : type === 'info' 
      ? 'bg-blue-50 border-blue-200 text-blue-900' 
      : 'bg-emerald-50 border-emerald-200 text-emerald-900';

  const Icon = type === 'error' ? AlertTriangle : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg max-w-md ${bgColor}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium pr-4">{message}</span>
      <button 
        onClick={onClose}
        className="ml-auto p-1 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
