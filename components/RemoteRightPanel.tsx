
import React, { useState, useEffect } from 'react';
import { Globe, Zap, ListChecks, MessageCircle, Loader2, CheckCircle2, AlertTriangle, Clock, BookOpen } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getReviewStats, getGerritChanges, getChecklist } from '../api/client';
import type { ReviewStats, ChecklistItem } from '../api/types';
import type { GerritChange } from '../api/types/gerrit';
import KnowledgeBaseContent from './KnowledgeBaseContent';

interface RemoteRightPanelProps {
  onAction: (msg: string) => void;
}

enum RemoteTab {
  STATUS = 'status',
  KB = 'kb'
}

const RemoteRightPanel: React.FC<RemoteRightPanelProps> = ({ onAction }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RemoteTab>(RemoteTab.STATUS);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [gerrit, setGerrit] = useState<GerritChange | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    getReviewStats().then(setStats);
    getGerritChanges().then(data => setGerrit(data[0]));
    getChecklist().then(setChecklist);
  }, []);

  return (
    <div className="h-full bg-editor-sidebar border-l border-editor-line flex flex-col overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-editor-line bg-editor-bg shrink-0">
          <button 
              onClick={() => setActiveTab(RemoteTab.STATUS)}
              className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === RemoteTab.STATUS ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              title={t('rightpanel.tab.gerrit')}
          >
              <Globe size={16} />
          </button>
          <button 
              onClick={() => setActiveTab(RemoteTab.KB)}
              className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === RemoteTab.KB ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              title={t('rightpanel.tab.kb')}
          >
              <BookOpen size={16} />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === RemoteTab.STATUS && (
            <div className="flex flex-col gap-8">
              <section className="animate-fade-in">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock size={14} className="text-purple-400" />
                      {t('rightpanel.gerrit.progress')}
                  </h3>
                  {stats && (
                      <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
                          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-4">
                              <div className="h-full bg-purple-500 shadow-[0_0_8px_rgba(147,51,234,0.4)] transition-all duration-1000" style={{ width: `${(stats.reviewedCount/stats.totalCount)*100}%` }} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-editor-bg/40 p-2 rounded text-center border border-editor-line">
                                  <div className="text-xl font-black text-white">{stats.reviewedCount}</div>
                                  <div className="text-[9px] text-gray-500 uppercase">Files Read</div>
                              </div>
                              <div className="bg-editor-bg/40 p-2 rounded text-center border border-editor-line">
                                  <div className="text-xl font-black text-red-400">{stats.severeCount}</div>
                                  <div className="text-[9px] text-gray-500 uppercase">Blockers</div>
                              </div>
                          </div>
                      </div>
                  )}
              </section>

              <section className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap size={14} className="text-purple-400" />
                      {t('rightpanel.gerrit.votes')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                      {gerrit?.labels?.map(label => (
                          <div key={label.name} className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50 hover:bg-editor-line/40 transition-colors">
                              <span className="text-[10px] text-gray-400 font-bold">{label.name}</span>
                              <div className={`px-1.5 py-0.5 rounded text-[10px] font-black ${label.value > 0 ? 'bg-green-600 text-white' : label.value < 0 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                  {label.value > 0 ? `+${label.value}` : label.value}
                              </div>
                          </div>
                      ))}
                  </div>
              </section>

              <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ListChecks size={14} className="text-purple-400" />
                      {t('rightpanel.gerrit.checklist')}
                  </h3>
                  <div className="space-y-2">
                      {checklist.map(item => (
                          <div key={item.id} className="flex items-center gap-2.5 p-2 bg-editor-bg/40 border border-editor-line/60 rounded hover:border-purple-500/30 transition-colors group">
                              {item.checked ? <CheckCircle2 size={13} className="text-editor-success" /> : <div className="w-3.5 h-3.5 border-2 border-gray-700 rounded-sm group-hover:border-purple-500/50" />}
                              <span className={`text-[11px] font-medium leading-tight ${item.checked ? 'text-gray-600 line-through' : 'text-gray-400'}`}>{item.text}</span>
                          </div>
                      ))}
                  </div>
              </section>
            </div>
        )}

        {activeTab === RemoteTab.KB && (
            <KnowledgeBaseContent />
        )}
      </div>
    </div>
  );
};

export default RemoteRightPanel;
