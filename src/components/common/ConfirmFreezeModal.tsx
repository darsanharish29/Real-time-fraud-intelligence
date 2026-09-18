import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface ConfirmFreezeModalProps {
  accountNumber: string;
  repeatedCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function ConfirmFreezeModal({ accountNumber, repeatedCount, isOpen, onClose, onConfirm }: ConfirmFreezeModalProps) {
  const [reason, setReason] = useState('Repeated suspicious case associations & high-velocity proxy transfers');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-red-900/60 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Recommend Account Freeze Review
              </h3>
              <p className="text-xs text-zinc-400">
                Action Safety &amp; Audit Governance Protocol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-lg bg-[#181818] border border-zinc-800 text-xs space-y-2 text-zinc-300">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Target Account Identifier:</span>
            <span className="font-mono text-emerald-400 font-semibold">{accountNumber}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Current Status:</span>
            <span className="text-amber-400 font-medium">Under Surveillance</span>
          </div>
          <p className="text-zinc-400 text-[11px] pt-1 border-t border-zinc-800/80">
            Safety Warning: Automated engines do not unilaterally lock accounts. Recommending a freeze dispatches an escalated authorization order to Senior Investigators and is irrevocably logged in the System Audit Ledger.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">
            Investigator Justification &amp; Findings:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#161616] border border-zinc-700 rounded-md p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            placeholder="Document specific behavioral flags, mule indicators, or case references..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
            className="px-4 py-2 rounded-md bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? 'Recording Audit...' : 'Authorize Freeze Recommendation'}
          </button>
        </div>
      </div>
    </div>
  );
}
