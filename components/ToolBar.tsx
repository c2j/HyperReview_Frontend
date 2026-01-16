
import React, { useState, useEffect } from 'react';
import { FolderOpen, GitBranch, ChevronDown, Tag, PanelLeft, PanelRight, ArrowLeft, Loader2, Plus, Globe, Send, Plug, Cpu } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getTags } from '../api/client';
import type { Tag as TagType } from '../api/types';

interface ToolBarProps {
  onAction: (msg: string) => void;
  onOpenRepo?: () => void;
  onNewTask?: () => void;
  showLeft?: boolean;
  showRight?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  diffContext?: { base: string; head: string };
  mode: 'local' | 'remote';
}

const ToolBar: React.FC<ToolBarProps> = ({ 
  onAction, 
  onOpenRepo, 
  onNewTask,
  showLeft = true,
  showRight = true,
  onToggleLeft,
  onToggleRight,
  diffContext,
  mode
}) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<TagType[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    setLoadingTags(true);
    getTags().then(setTags).catch(console.error).finally(() => setLoadingTags(false));
  }, []);

  const getTagStyle = (bgClass: string) => {
      if (bgClass.includes('error')) return 'bg-editor-error/20 text-editor-error border-editor-error/30 hover:bg-editor-error/30';
      if (bgClass.includes('warning')) return 'bg-editor-warning/20 text-editor-warning border-editor-warning/30 hover:bg-editor-warning/30';
      if (bgClass.includes('info')) return 'bg-editor-info/20 text-editor-info border-editor-info/30 hover:bg-editor-info/30';
      if (bgClass.includes('success')) return 'bg-editor-success/20 text-editor-success border-editor-success/30 hover:bg-editor-success/30';
      return 'bg-editor-line/50 text-gray-300 border-editor-line hover:bg-editor-line';
  };

  return (
    <div id="tour-toolbar" className="h-[56px] bg-editor-bg border-b border-editor-line flex flex-col shrink-0 z-40">
      <div className="flex-1 flex items-center px-3 gap-4 text-xs">
        
        <button onClick={onToggleLeft} className={`p-1.5 rounded transition-all hover:scale-105 active:scale-95 ${showLeft ? 'bg-editor-line text-white shadow-inner' : 'text-gray-500 hover:bg-editor-line'}`}>
            <PanelLeft size={18} />
        </button>

        <div className="h-4 w-[1px] bg-editor-line"></div>

        {/* Dynamic Action Group Based on Mode */}
        <div className="flex items-center gap-2">
            {mode === 'local' ? (
                <>
                    <button onClick={onOpenRepo} className="flex items-center gap-1.5 px-4 h-8 bg-editor-accent text-white rounded-lg transition-all hover:bg-blue-600 active:scale-95 font-bold shadow-md shadow-editor-accent/20">
                        <FolderOpen size={14} /> {t('toolbar.open_repo')}
                    </button>
                    <button onClick={onNewTask} className="flex items-center gap-1.5 px-4 h-8 bg-editor-line hover:bg-editor-line/80 text-editor-fg rounded-lg transition-all active:scale-95 font-bold">
                        <Plus size={14} /> {t('toolbar.new_task')}
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => onAction("Gerrit Import Dialog")} className="flex items-center gap-1.5 px-4 h-8 bg-purple-600 text-white rounded-lg transition-all hover:bg-purple-500 active:scale-95 font-bold shadow-md shadow-purple-900/40">
                        <Plug size={14} /> {t('toolbar.gerrit_import')}
                    </button>
                    <button onClick={() => onAction("Gerrit Server Settings")} className="flex items-center gap-1.5 px-3 h-8 bg-editor-line hover:bg-editor-line/80 text-editor-fg rounded-lg transition-all active:scale-95">
                        <Globe size={14} />
                    </button>
                </>
            )}
        </div>

        <div className="h-4 w-[1px] bg-editor-line"></div>

        {/* Global Action Selector */}
        <div className="flex items-center gap-2">
            <span className="text-gray-500 hidden xl:inline font-medium uppercase text-[10px] tracking-widest">{t('toolbar.submit_to')}</span>
            <div className="flex rounded-lg overflow-hidden border border-editor-line">
                <button 
                    className={`flex items-center gap-1.5 px-3 h-8 text-white transition-all font-black text-[10px] ${mode === 'remote' ? 'bg-purple-900/50 hover:bg-purple-800' : 'bg-editor-line hover:bg-gray-700'}`}>
                    {mode === 'remote' ? 'GERRIT' : 'CODEARTS'}
                </button>
                <button className="bg-black/20 px-2 hover:bg-black/40 transition-colors border-l border-editor-line">
                    <ChevronDown size={12} className="text-gray-500" />
                </button>
            </div>
        </div>

        <div className="flex-1"></div>

        {/* Tags and AI */}
        <div className="flex items-center gap-3 overflow-hidden">
             <div className="flex items-center gap-2 bg-editor-success/5 px-2.5 py-1 rounded-full border border-editor-success/20 animate-pulse cursor-pointer hover:bg-editor-success/10" onClick={() => onAction("AI Insights")}>
                 <Cpu size={14} className="text-editor-success" />
                 <span className="text-[10px] font-black text-editor-success">AI ACTIVE</span>
             </div>
             <div className="h-4 w-[1px] bg-editor-line"></div>
             <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden mask-linear-fade pr-4">
                {tags.map(tag => (
                     <span key={tag.id} onClick={() => onAction(`Filter: ${tag.label}`)} className={`flex items-center gap-1.5 px-3 h-7 rounded-full border cursor-pointer text-[11px] font-bold transition-all whitespace-nowrap active:scale-90 ${getTagStyle(tag.color)}`}>
                        {tag.label}
                    </span>
                ))}
             </div>
             <button onClick={() => onAction("Opening Tag Manager...")} className="p-1.5 bg-editor-line text-gray-500 rounded-full hover:text-white transition-colors">
                <Plus size={14} />
             </button>
        </div>

        <div className="h-4 w-[1px] bg-editor-line"></div>

        <button onClick={onToggleRight} className={`p-1.5 rounded transition-all hover:scale-105 active:scale-95 ${showRight ? 'bg-editor-line text-white shadow-inner' : 'text-gray-500 hover:bg-editor-line'}`}>
            <PanelRight size={18} />
        </button>
      </div>

      {/* Mode-Specific Context Row */}
      <div className={`h-[24px] flex items-center px-4 gap-4 text-[10px] border-t border-editor-line transition-all duration-700 ${mode === 'remote' ? 'bg-purple-950/40 text-purple-300' : 'bg-editor-sidebar text-gray-500'}`}>
        <div className="flex items-center gap-2 group cursor-pointer">
            <span className="opacity-60 font-bold uppercase tracking-tighter">{mode === 'remote' ? 'Server:' : t('toolbar.current_repo')}</span>
            <span className="font-mono group-hover:text-white transition-colors">{mode === 'remote' ? 'gerrit.corp.internal' : '/home/lead/payment-service'}</span>
        </div>
        
        {diffContext && (
            <div className={`flex items-center gap-2 font-black px-2 py-0.5 rounded ${mode === 'remote' ? 'bg-purple-500/20 text-purple-200' : 'bg-editor-line/50 text-editor-accent'}`}>
                <GitBranch size={10} />
                <span className="truncate max-w-[120px]">{diffContext.base}</span>
                <ArrowLeft size={10} className="opacity-50" />
                <span className="truncate max-w-[120px]">{diffContext.head}</span>
            </div>
        )}

        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
             {mode === 'remote' && (
                 <div className="flex items-center gap-2">
                     <span className="text-[9px] bg-purple-600/40 px-2 rounded-full font-black text-white">#12345</span>
                     <span className="font-black text-purple-400">PS3</span>
                 </div>
             )}
             <div className="flex items-center gap-1 font-bold group cursor-pointer" onClick={() => onAction("Listing pending files")}>
                <span className={`transition-colors ${mode === 'remote' ? 'text-purple-400 group-hover:text-white' : 'text-editor-accent group-hover:text-white'}`}>127</span>
                <span className="opacity-60 uppercase tracking-widest text-[9px]">{t('toolbar.files_pending')}</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
