import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor =
    toast.type === 'success'
      ? 'bg-[#FFFFFF] border-[#A4D9C1] text-[#23584E]'
      : toast.type === 'error'
      ? 'bg-[#FFFFFF] border-rose-200 text-rose-900'
      : 'bg-[#FFFFFF] border-[#DCE3EB] text-[#172B3A]';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-fade-in ${bgColor}`}
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#398879]" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-[#398879]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="text-xs text-[#758392] mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#758392] hover:text-[#172B3A] p-1 rounded-md transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
