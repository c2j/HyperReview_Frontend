
import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Loader2, Send, MessageSquare, Check, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getQualityGates } from '../api/client';
import type { QualityGate } from '../api/types';

interface SubmitReviewModalProps {
  onClose: () => void;
  onSubmit: (actionType: string) => void;
  mode?: 'local' | 'remote';
}

const QUICK_PHRASES = [
    "Looks good to me, but please check the performance.",
    "Architecture alignment required.",
    "Refactoring suggested for better readability.",
    "Verified the fix, logic holds."
];

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ onClose, onSubmit, mode = 'local' }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gates, setGates] = useState<QualityGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');

  useEffect(() => {
      setLoading(true);
      getQualityGates().then(setGates).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = (action: string) => {
    setIsSubmitting(true);
    setTimeout(() => { onSubmit(action); }, 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`p-4 rounded border flex items-start gap-3 transition-colors ${mode === 'remote' ? 'bg-purple-900/20 border-purple-500/30' : 'bg-editor-line/30 border-editor-line'}`}>
        <ShieldCheck className={mode === 'remote' ? 'text-purple-400' : 'text-editor-success'} size={20} />
        <div>
            <h3 className="text-sm font-bold text-white mb-1">{mode === 'remote' ? t('modal.submit.gerrit_title') : t('modal.submit.ready')}</h3>
            <p className="text-xs text-gray-400">{t('modal.submit.target')}: <span className="text-white">#{mode === 'remote' ? '12345' : 'PR#2877'}</span> - {mode === 'remote' ? t('modal.submit.gerrit_desc', { count: 47 }) : 'This will trigger the merge pipeline.'}</p>
        </div>
      </div>

      {mode === 'remote' ? (
          <div className="space-y-4">
            <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.decision')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleSubmit('PublishOnly')} className="flex flex-col items-center gap-1 p-2 rounded bg-editor-line hover:bg-editor-selection border border-editor-line transition-all">
                        <MessageSquare size={16} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-300">{t('modal.submit.just_drafts')}</span>
                    </button>
                    <button onClick={() => handleSubmit('Approve')} className="flex flex-col items-center gap-1 p-2 rounded bg-green-900/20 hover:bg-green-800/40 border border-green-500/30 transition-all group">
                        <Check size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-green-400">{t('modal.submit.publish_plus_2')}</span>
                    </button>
                    <button onClick={() => handleSubmit('Reject')} className="flex flex-col items-center gap-1 p-2 rounded bg-red-900/20 hover:bg-red-800/40 border border-red-500/30 transition-all group">
                        <X size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-red-400">{t('modal.submit.publish_minus_2')}</span>
                    </button>
                </div>
            </div>
            <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.quick_phrases')}</h4>
                <div className="flex flex-wrap gap-2">
                    {QUICK_PHRASES.map(p => (
                        <button key={p} onClick={() => setSummary(p)} className="px-2 py-1 bg-editor-line hover:bg-editor-selection rounded text-[9px] text-gray-400 transition-colors border border-editor-line truncate max-w-[200px]">{p}</button>
                    ))}
                </div>
            </div>
          </div>
      ) : (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.gates')}</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-4 text-gray-500 gap-2"><Loader2 size={16} className="animate-spin text-editor-accent" /><span className="text-xs">Checking gates...</span></div>
                 ) : (
                    gates.map(gate => (
                        <div key={gate.id} className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50">
                            <div className="flex items-center gap-2">
                                {gate.status === 'passed' && <CheckCircle2 size={14} className="text-editor-success" />}
                                {gate.status === 'warning' && <AlertTriangle size={14} className="text-editor-warning" />}
                                {gate.status === 'failed' && <XCircle size={14} className="text-editor-error" />}
                                <span className="text-xs text-editor-fg">{gate.name}</span>
                            </div>
                            <span className={`text-xs font-mono ${gate.status === 'passed' ? 'text-editor-success' : gate.status === 'warning' ? 'text-editor-warning' : 'text-editor-error'}`}>{gate.message}</span>
                        </div>
                    ))
                 )}
            </div>
          </div>
      )}

      <div>
          <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('modal.submit.stats_title')}</h4>
          <div className="flex gap-2 text-xs">
              <span className="bg-editor-error/10 text-editor-error px-2 py-1 rounded border border-editor-error/20">0 {t('modal.submit.blockers')}</span>
              <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded border border-purple-500/20 font-bold">47 {t('modal.submit.drafts_count')}</span>
              <span className="bg-editor-info/10 text-editor-info px-2 py-1 rounded border border-editor-info/20">1 {t('modal.submit.questions')}</span>
          </div>
      </div>

      <textarea 
        value={summary}
        onChange={e => setSummary(e.target.value)}
        className="w-full h-20 bg-editor-bg border border-editor-line rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none font-mono mt-2"
        placeholder={t('modal.submit.summary_placeholder')}
      />

      <div className="flex justify-end gap-2 pt-3 border-t border-editor-line mt-1">
        <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-400 transition-colors">{t('modal.submit.cancel')}</button>
        {mode === 'local' && (
            <button onClick={() => handleSubmit('LocalApprove')} disabled={isSubmitting || loading} className="px-4 py-1.5 rounded text-xs bg-editor-success text-white hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? t('modal.submit.submitting') : (<><CheckCircle2 size={14} /> {t('modal.submit.approve_merge')}</>)}
            </button>
        )}
      </div>
    </div>
  );
};

export default SubmitReviewModal;
