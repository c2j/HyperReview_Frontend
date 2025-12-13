import React from 'react';
import { FolderOpen, Upload, GitBranch, ChevronDown, AlertTriangle, XCircle, Tag, PanelLeft, PanelRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n';

interface ToolBarProps {
  onAction: (msg: string) => void;
  onOpenRepo?: () => void;
  onImportTask?: () => void;
  showLeft?: boolean;
  showRight?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  diffContext?: { base: string; head: string };
}

const ToolBar: React.FC<ToolBarProps> = ({ 
  onAction, 
  onOpenRepo, 
  onImportTask,
  showLeft = true,
  showRight = true,
  onToggleLeft,
  onToggleRight,
  diffContext
}) => {
  const { t } = useTranslation();
  return (
    <div id="tour-toolbar" className="h-[52px] bg-editor-bg border-b border-editor-line flex flex-col shrink-0 z-40">
      {/* Top Action Row */}
      <div className="flex-1 flex items-center px-2 gap-3 text-xs">
        
        {/* Left Toggle */}
        <button 
            onClick={onToggleLeft}
            className={`p-1.5 rounded transition-colors ${showLeft ? 'bg-editor-line text-white' : 'text-gray-500 hover:bg-editor-line hover:text-gray-300'}`}
            title="Toggle Left Panel"
        >
            <PanelLeft size={16} />
        </button>

        <div className="h-4 w-[1px] bg-editor-line"></div>

        <div className="flex items-center gap-2">
            <button 
                onClick={onOpenRepo ? onOpenRepo : () => onAction("Opening Repository Picker...")}
                className="flex items-center gap-1.5 px-3 py-1 bg-editor-accent/10 hover:bg-editor-accent/20 text-editor-accent rounded transition-colors active:scale-95">
                <FolderOpen size={14} /> {t('toolbar.open_repo')}
            </button>
            <button 
                onClick={onImportTask ? onImportTask : () => onAction("Importing Task...")}
                className="flex items-center gap-1.5 px-3 py-1 bg-editor-line hover:bg-editor-line/80 text-editor-fg rounded transition-colors active:scale-95">
                <Upload size={14} /> {t('toolbar.import_task')}
            </button>
        </div>

        <div className="h-4 w-[1px] bg-editor-line"></div>

        <div className="flex items-center gap-2">
            <span className="text-gray-500 hidden xl:inline">{t('toolbar.submit_to')}</span>
            <button 
                onClick={() => onAction("Selected Target: CodeArts")}
                className="flex items-center gap-1 px-2 py-0.5 bg-editor-line rounded text-white hover:bg-gray-700 transition-colors">
                CodeArts <ChevronDown size={12} />
            </button>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
             <span className="text-gray-500 hidden lg:inline">{t('toolbar.quick_tags')}</span>
             <span 
                onClick={() => onAction("Filter: Severe N+1")}
                className="flex items-center gap-1 px-2 py-0.5 bg-editor-error/20 text-editor-error rounded border border-editor-error/30 cursor-pointer text-[11px] hover:bg-editor-error/30 transition-colors">
                <XCircle size={10} /> <span className="hidden lg:inline">Severe</span> N+1
             </span>
             <span 
                onClick={() => onAction("Filter: No Tx")}
                className="flex items-center gap-1 px-2 py-0.5 bg-editor-error/20 text-editor-error rounded border border-editor-error/30 cursor-pointer text-[11px] hover:bg-editor-error/30 transition-colors">
                <XCircle size={10} /> No Tx
             </span>
             <span 
                onClick={() => onAction("Filter: Hardcoded")}
                className="flex items-center gap-1 px-2 py-0.5 bg-editor-warning/20 text-editor-warning rounded border border-editor-warning/30 cursor-pointer text-[11px] hover:bg-editor-warning/30 transition-colors">
                <AlertTriangle size={10} /> Hardcoded
             </span>
             <span 
                onClick={() => onAction("Opening Tag Manager...")}
                className="flex items-center gap-1 px-2 py-0.5 bg-editor-line text-gray-400 rounded cursor-pointer text-[11px] hover:text-white transition-colors">
                <Tag size={10} /> {t('toolbar.manage')}
             </span>
        </div>

        <div className="h-4 w-[1px] bg-editor-line ml-1"></div>

        {/* Right Toggle */}
        <button 
            onClick={onToggleRight}
            className={`p-1.5 rounded transition-colors ${showRight ? 'bg-editor-line text-white' : 'text-gray-500 hover:bg-editor-line hover:text-gray-300'}`}
            title="Toggle Right Panel"
        >
            <PanelRight size={16} />
        </button>

      </div>

      {/* Bottom Info Row */}
      <div className="h-[24px] bg-editor-sidebar flex items-center px-4 gap-4 text-[11px] text-gray-400 border-t border-editor-line">
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => onAction("Navigating to /home/lead/payment-service")}>
            <span className="text-gray-500">{t('toolbar.current_repo')}</span>
            <span className="text-editor-fg font-medium">/home/lead/payment-service</span>
        </div>
        
        {/* Dynamic Branch Display */}
        {diffContext && (
            <div className="flex items-center gap-1 text-editor-accent cursor-pointer hover:text-blue-300 transition-colors bg-editor-line/30 px-2 rounded" onClick={() => onAction("Switching Branch...")}>
                <GitBranch size={10} />
                <span className="text-editor-error/80 truncate max-w-[100px]">{diffContext.base}</span>
                <ArrowLeft size={10} className="text-gray-500" />
                <span className="text-editor-success/80 truncate max-w-[100px]">{diffContext.head}</span>
            </div>
        )}
        {!diffContext && (
            <div className="flex items-center gap-1 text-editor-accent cursor-pointer hover:text-blue-300 transition-colors" onClick={() => onAction("Switching Branch...")}>
                <GitBranch size={10} />
                <span>feature/payment-retry</span>
            </div>
        )}

        <div className="flex items-center gap-1 px-1.5 bg-editor-line rounded text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => onAction("Showing Diff Stats")}>
            <span>3c9fa1b</span>
            <span className="text-editor-error">▼12</span>
            <span className="text-editor-success">↑3</span>
        </div>
        <div className="flex-1"></div>
        <div className="cursor-pointer hover:text-white transition-colors" onClick={() => onAction("Listing 127 pending files")}>
            <span className="text-white font-bold">127</span> {t('toolbar.files_pending')}
        </div>
      </div>
    </div>
  );
};

export default ToolBar;