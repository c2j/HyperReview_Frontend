
import React, { useState, useEffect } from 'react';
import { Cloud, Radio, Loader2, PlugZap, Activity, CheckCircle } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getReviewStats } from '../api/client';
import type { ReviewStats } from '../api/types';

interface StatusBarProps {
    mode?: 'local' | 'remote';
}

const StatusBar: React.FC<StatusBarProps> = ({ mode = 'local' }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
      getReviewStats().then(setStats).catch(console.error);
  }, [mode]);

  return (
    <div className={`h-[28px] text-white flex items-center px-4 justify-between text-[11px] select-none shrink-0 z-50 overflow-hidden whitespace-nowrap shadow-2xl transition-all duration-1000 ${mode === 'remote' ? 'bg-purple-700/90 backdrop-blur-md' : 'bg-editor-accent/90 backdrop-blur-md'}`}>
      {/* Left Section: Live Status */}
      <div className="flex items-center gap-5 min-w-0 flex-1 mr-4">
        <div className="flex items-center gap-1.5 font-black uppercase tracking-widest shrink-0">
            {mode === 'remote' ? <PlugZap size={12} className="animate-pulse text-purple-200" /> : <Activity size={12} className="animate-pulse text-blue-200" />}
            {mode === 'remote' ? 'Gerrit Live' : 'Local Live'}
        </div>
        
        <div className="h-3 w-[1px] bg-white/20"></div>

        <span className="opacity-80 truncate font-mono text-[10px] max-w-[300px]">
            {mode === 'remote' ? '[#12345: payment-service/master]' : '[/payment-service/feature/retry-logic]'}
        </span>
        
        {stats ? (
            <div className="flex items-center gap-4 bg-black/10 px-3 py-0.5 rounded-full border border-white/5 shadow-inner">
                <span className="font-bold">{stats.totalCount} <span className="opacity-60 font-normal">{t('statusbar.files')}</span></span>
                <span className="opacity-30">|</span>
                <div className="flex items-center gap-3">
                    <span className="text-white font-black">{t('statusbar.marked')} {stats.reviewedCount}</span>
                    <div className="flex gap-2">
                        <span className="text-red-300 font-bold" title="Critical Issues">✗{stats.severeCount}</span>
                        <span className="text-orange-200 font-bold" title="Concerns">⚠{stats.warningCount}</span>
                        <span className="text-blue-200 font-bold" title="Questions">❓{stats.pendingCount}</span>
                    </div>
                </div>
            </div>
        ) : (
            <span className="shrink-0 opacity-50 flex items-center gap-2">
                <Loader2 size={10} className="animate-spin" /> {t('statusbar.loading_stats')}
            </span>
        )}
      </div>

      {/* Right Section: Sync & Clock */}
      <div className="flex items-center gap-6 shrink-0">
         <div className="hidden lg:flex items-center gap-2 px-3 py-0.5 rounded-md bg-white/10 text-white font-bold tracking-tighter italic">
             {mode === 'remote' ? t('statusbar.ready_remote', { count: 47 }) : t('statusbar.ready')}
         </div>
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 opacity-80 group cursor-pointer hover:opacity-100 transition-opacity">
                <Cloud size={14} className="text-white/70" /> 
                <span className="font-medium">{t('statusbar.saved')}</span>
             </div>
             <div className="bg-black/20 px-3 h-[28px] flex items-center font-black tracking-widest text-white/90">
                 18:42
             </div>
         </div>
      </div>
    </div>
  );
};

export default StatusBar;
