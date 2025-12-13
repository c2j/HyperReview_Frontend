import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';

interface SubmitReviewModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        onSubmit();
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-editor-line/30 p-4 rounded border border-editor-line flex items-start gap-3">
        <ShieldCheck className="text-editor-success shrink-0" size={20} />
        <div>
            <h3 className="text-sm font-bold text-white mb-1">{t('modal.submit.ready')}</h3>
            <p className="text-xs text-gray-400">You are approving <span className="text-white">PR#2877</span>. This will trigger the merge pipeline.</p>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.gates')}</h4>
        <div className="space-y-2">
             <div className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-editor-success" />
                    <span className="text-xs text-editor-fg">CI Pipeline</span>
                </div>
                <span className="text-xs text-editor-success font-mono">PASSED</span>
             </div>
             <div className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-editor-success" />
                    <span className="text-xs text-editor-fg">Unit Tests</span>
                </div>
                <span className="text-xs text-editor-success font-mono">100% (42/42)</span>
             </div>
              <div className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-editor-warning" />
                    <span className="text-xs text-editor-fg">Code Coverage</span>
                </div>
                <span className="text-xs text-editor-warning font-mono">82% (Target 85%)</span>
             </div>
        </div>
      </div>

      <div>
          <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.summary')}</h4>
          <div className="flex gap-2 text-xs">
              <span className="bg-editor-error/10 text-editor-error px-2 py-1 rounded border border-editor-error/20">0 Blockers</span>
              <span className="bg-editor-warning/10 text-editor-warning px-2 py-1 rounded border border-editor-warning/20">2 Concerns</span>
              <span className="bg-editor-info/10 text-editor-info px-2 py-1 rounded border border-editor-info/20">1 Question</span>
          </div>
      </div>

      <textarea 
        className="w-full h-20 bg-editor-bg border border-editor-line rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-editor-accent resize-none font-mono mt-2"
        placeholder="Optional: Add a final summary message..."
      />

      <div className="flex justify-end gap-2 pt-3 border-t border-editor-line mt-1">
        <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-300 transition-colors">{t('modal.submit.cancel')}</button>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-1.5 rounded text-xs bg-editor-success text-white hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2 min-w-[120px] justify-center"
        >
          {isSubmitting ? t('modal.submit.submitting') : (
             <>
               <CheckCircle2 size={14} /> {t('modal.submit.approve_merge')}
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubmitReviewModal;