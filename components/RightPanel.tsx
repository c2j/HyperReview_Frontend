
import React, { useState, useEffect, useMemo } from 'react';
import { Layers, History, PieChart, ListChecks, GripVertical, CheckSquare, Square, Trash2, Loader2, BookOpen, ExternalLink, Shield, Zap, Palette, Code, Filter, Globe, MessageCircle, Info, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getHeatmap, getBlame, getReviewStats, getChecklist, getReviewGuide, getGerritChanges } from '../api/client';
import type { HeatmapItem, BlameInfo, ReviewStats, ChecklistItem, ReviewGuideItem } from '../api/types';
import type { GerritChange } from '../api/types/gerrit';

enum Tab {
  GERRIT = 'gerrit', 
  IMPACT = 'impact', 
  HISTORY = 'history', 
  GUIDE = 'guide'   
}

interface RightPanelProps {
  onAction: (msg: string) => void;
  activeFileExtension?: string;
  mode?: 'local' | 'remote';
}

const RightPanel: React.FC<RightPanelProps> = ({ onAction, activeFileExtension = '', mode = 'local' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GERRIT);
  const [loading, setLoading] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(true);

  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
  const [blameData, setBlameData] = useState<BlameInfo | null>(null);
  const [statsData, setStatsData] = useState<ReviewStats | null>(null);
  const [listItems, setListItems] = useState<ChecklistItem[]>([]);
  const [guideItems, setGuideItems] = useState<ReviewGuideItem[]>([]);
  const [gerritInfo, setGerritInfo] = useState<GerritChange | null>(null);

  useEffect(() => {
    setLoading(true);
    let promise: Promise<any>;
    switch (activeTab) {
        case Tab.IMPACT: promise = getHeatmap().then(setHeatmapData); break;
        case Tab.HISTORY: promise = getBlame('current-file').then(setBlameData); break;
        case Tab.GERRIT: 
            promise = Promise.all([
                getGerritChanges().then(data => setGerritInfo(data[0])),
                getReviewStats().then(setStatsData),
                getChecklist().then(setListItems)
            ]);
            break;
        case Tab.GUIDE: promise = getReviewGuide().then(setGuideItems); break;
        default: promise = Promise.resolve();
    }
    promise.catch(console.error).finally(() => setLoading(false));
  }, [activeTab, mode]);

  useEffect(() => {
    if (mode === 'remote') setActiveTab(Tab.GERRIT);
  }, [mode]);

  const filteredHeatmap = useMemo(() => {
    if (mode !== 'remote') return heatmapData;
    return heatmapData.filter(item => item.isChanged);
  }, [heatmapData, mode]);

  return (
    <div id="tour-right-panel" className="h-full bg-editor-sidebar border-l border-editor-line flex flex-col">
        <div className="flex border-b border-editor-line bg-editor-bg shrink-0">
            {[Tab.GERRIT, Tab.IMPACT, Tab.HISTORY, Tab.GUIDE].map((tab) => {
                const isRemote = mode === 'remote';
                return (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === tab ? (isRemote ? 'border-purple-500 text-white' : 'border-editor-accent text-white') : 'border-transparent text-gray-500 hover:text-gray-300'}`} 
                        title={t(`rightpanel.tab.${tab}`)}
                    >
                        {tab === Tab.GERRIT && <Globe size={16} />}
                        {tab === Tab.IMPACT && <Layers size={16} />}
                        {tab === Tab.HISTORY && <History size={16} />}
                        {tab === Tab.GUIDE && <BookOpen size={16} />}
                    </button>
                );
            })}
        </div>

        <div className="flex-1 overflow-y-auto">
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                    <Loader2 size={24} className="animate-spin text-purple-500" />
                    <span className="text-xs">{t('rightpanel.aggregating')}</span>
                 </div>
            ) : (
            <div className="p-4">
            {activeTab === Tab.GERRIT && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    {statsData && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('rightpanel.gerrit.progress')}</h3>
                                <span className="text-[10px] font-mono text-purple-400 font-bold">{Math.round((statsData.reviewedCount/statsData.totalCount)*100)}%</span>
                            </div>
                            <div className="bg-editor-line/30 border border-editor-line rounded-lg p-3">
                                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-editor-bg mb-3">
                                    <div className="bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" style={{ width: `${(statsData.reviewedCount/statsData.totalCount)*100}%` }}></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-white leading-none">{statsData.severeCount}</div>
                                        <div className="text-[9px] text-red-500 font-bold uppercase mt-1">{t('modal.submit.blockers')}</div>
                                    </div>
                                    <div className="text-center border-x border-editor-line">
                                        <div className="text-lg font-bold text-white leading-none">{statsData.warningCount}</div>
                                        <div className="text-[9px] text-orange-500 font-bold uppercase mt-1">{t('modal.review_action.concern')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-white leading-none">{statsData.pendingCount}</div>
                                        <div className="text-[9px] text-blue-500 font-bold uppercase mt-1">{t('rightpanel.gerrit.open')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {gerritInfo && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Zap size={14} className="text-purple-400" />
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('rightpanel.gerrit.votes')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {gerritInfo.labels?.map(l => (
                                    <div key={l.name} className="flex items-center justify-between p-2 bg-editor-line/20 rounded border border-editor-line/50">
                                        <span className="text-[10px] text-gray-400 truncate mr-2">{l.name}</span>
                                        <div className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-[10px] ${l.value > 0 ? 'bg-green-600 text-white' : l.value < 0 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                            {l.value > 0 ? `+${l.value}` : l.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <button 
                            onClick={() => setChecklistExpanded(!checklistExpanded)}
                            className="w-full flex items-center justify-between mb-3 group"
                        >
                            <div className="flex items-center gap-2">
                                <ListChecks size={14} className="text-purple-400" />
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('rightpanel.gerrit.checklist')}</h3>
                            </div>
                            {checklistExpanded ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-600" />}
                        </button>
                        {checklistExpanded && (
                            <div className="space-y-1.5">
                                {listItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 p-2 bg-editor-line/10 hover:bg-editor-line/20 rounded group transition-colors">
                                        {item.checked ? <CheckCircle2 size={12} className="text-editor-success shrink-0" /> : <div className="w-3 h-3 border border-gray-600 rounded-sm shrink-0" />}
                                        <span className={`text-[11px] ${item.checked ? 'text-gray-600 line-through' : 'text-gray-400'}`}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {gerritInfo?.messages && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <MessageCircle size={14} className="text-purple-400" />
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('rightpanel.gerrit.timeline')}</h3>
                            </div>
                            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-editor-line">
                                {gerritInfo.messages.map(m => (
                                    <div key={m.id} className="relative pl-6">
                                        <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-editor-line border-2 border-editor-sidebar"></div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-gray-400">{m.author}</span>
                                            <span className="text-[9px] text-gray-600">{m.date}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-normal">{m.message}</p>
                                    </div>
                                )).reverse()}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === Tab.IMPACT && (
                 <div className="flex flex-col h-full animate-fade-in">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 shrink-0">{t('rightpanel.risk_map')}</h3>
                    <div className="space-y-2">
                        {filteredHeatmap.map(item => (
                            <div key={item.id} onClick={() => onAction(`Opening Diff: ${item.path}`)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer bg-editor-line/20 hover:bg-editor-line/40 group border border-transparent hover:border-editor-line transition-all">
                                <div className={`w-1 h-10 rounded-full shrink-0 ${item.riskLevel === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : item.riskLevel === 'high' ? 'bg-orange-500' : 'bg-blue-500/50'}`}></div>
                                <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">{item.name}</span>
                                         {item.riskLevel && (
                                             <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${item.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                                                 {item.riskLevel}
                                             </span>
                                         )}
                                     </div>
                                     <div className="text-[10px] text-gray-600 truncate font-mono">{item.path}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === Tab.HISTORY && blameData && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('rightpanel.line_provenance')}</h3>
                    <div className="bg-editor-line/30 rounded-xl p-4 border border-editor-line">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-editor-accent/20 flex items-center justify-center text-editor-accent font-bold text-lg border border-editor-accent/30 uppercase">{blameData.avatar}</div>
                            <div>
                                <div className="text-sm font-bold text-white leading-tight">{blameData.author}</div>
                                <div className="text-[10px] text-gray-500">{blameData.time}</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">{t('rightpanel.source_context')}</span>
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono">PS{blameData.patchSet || 3}</span>
                             </div>
                             <div className="p-2 bg-editor-bg rounded border border-editor-line text-[11px] text-gray-400 font-mono italic">
                                "{blameData.comment}"
                             </div>
                             <div className="flex items-center gap-2 pt-2 text-[10px]">
                                <span className="text-gray-500">{t('rightpanel.history.task')}:</span>
                                <span className="text-editor-accent hover:underline cursor-pointer flex items-center gap-1">{blameData.prName} <ExternalLink size={10} /></span>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === Tab.GUIDE && (
                <div className="animate-fade-in">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('rightpanel.guidelines')}</h3>
                    <div className="space-y-4">
                        {guideItems.map(item => (
                            <div key={item.id} className="p-3 bg-editor-line/10 border border-editor-line rounded-lg hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={12} className={item.severity === 'high' ? 'text-red-500' : 'text-orange-500'} />
                                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">{item.title}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
            )}
        </div>
    </div>
  );
};

export default RightPanel;
