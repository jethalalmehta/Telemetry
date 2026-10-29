import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 border border-[#E2E8F0] shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#758392] hover:text-[#172B3A] p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#172B3A]">{title}</h3>
        </div>

        <p className="text-xs sm:text-sm text-[#758392] mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm !py-2 !px-4">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
