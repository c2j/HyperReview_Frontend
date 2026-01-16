
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ReviewSeverity } from '../api/types';
import type { DiffLine, ReviewTemplate } from '../api/types';
import { getFileDiff, getReviewTemplates } from '../api/client';
import { AlertTriangle, XCircle, ChevronDown, Maximize2, Minimize2, Search, X, ArrowUp, ArrowDown, Check, Eye, Package, Box, MoreHorizontal, WrapText, Loader2, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n';

// Access Prism from window as it's loaded via script tag in index.html
const Prism = (window as any).Prism;

interface DiffViewProps {
  isMaximized: boolean;
  toggleMaximize: () => void;
  onAction?: (msg: string) => void;
  diffContext?: { base: string; head: string };
  activeFilePath?: string;
}

type ViewMode = 'diff' | 'old' | 'new';

const extensionMap: Record<string, string> = {
  '.java': 'java',
  '.py': 'python',
  '.go': 'go',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.sql': 'sql',
  '.xml': 'markup',
  '.html': 'markup',
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.md': 'markdown',
};

const DiffView: React.FC<DiffViewProps> = ({ isMaximized, toggleMaximize, onAction, diffContext, activeFilePath = 'src/main/OrderService.java' }) => {
  const { t } = useTranslation();
  
  // Data State
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [loading, setLoading] = useState(true);

  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('diff');
  const [isLineWrap, setIsLineWrap] = useState(false);
  
  // Folding State
  const [foldImports, setFoldImports] = useState(false);
  const [foldLombok, setFoldLombok] = useState(false);

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<{lineIndex: number, start: number, end: number}[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; lineIndex: number | null }>({
    x: 0,
    y: 0,
    visible: false,
    lineIndex: null,
  });

  // Language Calculation
  const activeFileExtension = useMemo(() => {
    const parts = activeFilePath.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }, [activeFilePath]);

  const prismLanguage = useMemo(() => extensionMap[activeFileExtension] || 'clike', [activeFileExtension]);

  // Load data when file changes
  useEffect(() => {
    setLoading(true);
    getFileDiff(activeFilePath)
    .then((diffData) => {
        setDiffLines(diffData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [activeFilePath]);

  const displayLines = useMemo(() => {
    const lines: DiffLine[] = [];
    let skippingImports = false;
    let skippingLombok = false;

    for (let i = 0; i < diffLines.length; i++) {
        const line = diffLines[i];
        const content = line.content.trim();
        
        const isImport = content.startsWith('import ') || (skippingImports && content === '');
        const isLombokAnnotation = content.startsWith('@') || (skippingLombok && content === '');

        if (foldImports && isImport) {
            if (!skippingImports) {
                skippingImports = true;
                lines.push({ 
                    ...line, 
                    type: 'header', 
                    content: `import ... (${diffLines.filter(l => l.content.trim().startsWith('import ')).length} lines hidden)`,
                    isFoldPlaceholder: true,
                    onClick: () => setFoldImports(false)
                } as any);
            }
            continue;
        } else {
            skippingImports = false;
        }

        if (foldLombok && isLombokAnnotation) {
            if (!skippingLombok) {
                skippingLombok = true;
                 lines.push({ 
                    ...line, 
                    type: 'header', 
                    content: `@Annotations ...`,
                    isFoldPlaceholder: true,
                    onClick: () => setFoldLombok(false)
                } as any);
            }
            continue;
        } else {
            skippingLombok = false;
        }

        lines.push(line);
    }
    return lines;
  }, [foldImports, foldLombok, diffLines]);

  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) {
        setSearchTerm('');
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, lineIndex: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, lineIndex });
  };

  // Search Logic
  useEffect(() => {
    if (!searchTerm) {
        setMatches([]);
        setCurrentMatchIdx(0);
        return;
    }

    const newMatches: typeof matches = [];
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    displayLines.forEach((line: any, displayIndex) => {
        if (line.isFoldPlaceholder) return;
        if (viewMode === 'old' && line.type === 'added') return;
        if (viewMode === 'new' && line.type === 'removed') return;
        if (!line.content) return;
        
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line.content)) !== null) {
            newMatches.push({
                lineIndex: displayIndex,
                start: match.index,
                end: match.index + searchTerm.length
            });
        }
    });

    setMatches(newMatches);
    setCurrentMatchIdx(0);
  }, [searchTerm, viewMode, displayLines]);

  // Highlighting Logic
  const renderLineContent = (content: string, displayIndex: number) => {
    if (!Prism) return content;
    const grammar = Prism.languages[prismLanguage] || Prism.languages.clike;
    const tokens = Prism.tokenize(content, grammar);
    const lineMatches = matches.filter(m => m.lineIndex === displayIndex);

    // Track offset using an object so it's shared across recursion
    const tracker = { charOffset: 0 };

    const highlightTextWithSearch = (text: string, currentTracker: { charOffset: number }) => {
        if (!searchTerm || lineMatches.length === 0) {
            currentTracker.charOffset += text.length;
            return text;
        }

        let lastIdx = 0;
        const result = [];
        const textLength = text.length;
        const baseOffset = currentTracker.charOffset;

        for (const match of lineMatches) {
            const matchInChunkStart = Math.max(0, match.start - baseOffset);
            const matchInChunkEnd = Math.min(textLength, match.end - baseOffset);

            if (matchInChunkStart < textLength && matchInChunkEnd > 0 && matchInChunkStart < matchInChunkEnd) {
                if (matchInChunkStart > lastIdx) {
                    result.push(text.substring(lastIdx, matchInChunkStart));
                }
                
                const isCurrent = matches[currentMatchIdx] === match;
                const matchText = text.substring(matchInChunkStart, matchInChunkEnd);
                
                result.push(
                    <span 
                        key={`${baseOffset}-${matchInChunkStart}`}
                        className={`${isCurrent ? 'bg-orange-500 text-white outline outline-1 outline-white/50 z-10 rounded-[1px]' : 'bg-yellow-500/40 text-white rounded-[1px]'}`}
                    >
                        {matchText}
                    </span>
                );
                lastIdx = matchInChunkEnd;
            }
        }

        if (lastIdx < textLength) {
            result.push(text.substring(lastIdx));
        }

        currentTracker.charOffset += text.length;
        return result.length > 0 ? result : text;
    };

    const renderToken = (token: any, key: any): React.ReactNode => {
        if (typeof token === 'string') {
            return highlightTextWithSearch(token, tracker);
        }

        const tokenContent = Array.isArray(token.content) 
            ? token.content.map((t: any, i: any) => renderToken(t, i)) 
            : highlightTextWithSearch(token.content, tracker);

        return (
            <span key={key} className={`token ${token.type}`}>
                {tokenContent}
            </span>
        );
    };

    return (
        <code className={`language-${prismLanguage} block w-full`}>
            {tokens.map((t: any, i: number) => renderToken(t, i))}
        </code>
    );
  };

  return (
    <div id="tour-diff-view" className="h-full bg-editor-bg flex flex-col min-w-0 relative">
      
      <div className="h-[36px] bg-editor-bg border-b border-editor-line flex items-center px-4 justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-2 text-xs truncate mr-4">
            <span className="text-gray-500 hidden sm:inline">{t('diffview.file')}:</span>
            <span className="text-editor-fg font-medium truncate font-mono">{activeFilePath}</span>
            {diffLines.length > 0 && (
                <>
                    <span className="text-editor-success ml-2 hidden sm:inline">+{diffLines.filter(l=>l.type==='added').length}</span>
                    <span className="text-editor-error hidden sm:inline">-{diffLines.filter(l=>l.type==='removed').length}</span>
                </>
            )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
             <div className="relative group mr-1">
                <button className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-editor-line text-xs text-gray-400 hover:text-white transition-colors">
                    <Eye size={14} />
                    <span className="hidden lg:inline">
                        {viewMode === 'diff' ? t('diffview.view.diff') : 
                         viewMode === 'old' ? t('diffview.view.old') : t('diffview.view.new')}
                    </span>
                    <ChevronDown size={10} />
                </button>
                <div className="absolute right-0 top-full w-32 pt-2 hidden group-hover:block z-50">
                    <div className="bg-editor-sidebar border border-editor-line rounded shadow-xl py-1">
                        <div onClick={() => setViewMode('diff')} className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-editor-line ${viewMode === 'diff' ? 'text-white' : 'text-gray-400'}`}>{t('diffview.view.diff')}</div>
                        <div onClick={() => setViewMode('old')} className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-editor-line ${viewMode === 'old' ? 'text-white' : 'text-gray-400'}`}>{t('diffview.view.old')}</div>
                        <div onClick={() => setViewMode('new')} className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-editor-line ${viewMode === 'new' ? 'text-white' : 'text-gray-400'}`}>{t('diffview.view.new')}</div>
                    </div>
                </div>
             </div>

             <div className="w-[1px] h-3 bg-editor-line mr-1 hidden sm:block"></div>

             <button onClick={toggleSearch} className={`p-1 rounded transition-colors mr-1 ${searchOpen ? 'bg-editor-line text-white' : 'text-gray-400 hover:bg-editor-line hover:text-white'}`}>
                <Search size={14} />
             </button>

             <button onClick={toggleMaximize} className="p-1 hover:bg-editor-line rounded text-gray-400 hover:text-white transition-colors mr-1">
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
             </button>

             <button onClick={() => setIsLineWrap(!isLineWrap)} className={`p-1 rounded transition-colors mr-1 ${isLineWrap ? 'bg-editor-line text-white' : 'text-gray-400 hover:bg-editor-line hover:text-white'}`}>
                <WrapText size={14} />
             </button>
             
             {prismLanguage === 'java' && (
                 <>
                    <button onClick={() => setFoldImports(!foldImports)} className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded transition-colors ${foldImports ? 'bg-editor-accent text-white' : 'bg-editor-line text-gray-400 hover:text-white'}`}>
                        <Package size={12} />
                        <span className="hidden lg:inline">{t('diffview.fold_imports')}</span>
                    </button>
                    
                    <button onClick={() => setFoldLombok(!foldLombok)} className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded transition-colors ${foldLombok ? 'bg-editor-accent text-white' : 'bg-editor-line text-gray-400 hover:text-white'}`}>
                        <Box size={12} />
                        <span className="hidden lg:inline">{t('diffview.fold_lombok')}</span>
                    </button>
                 </>
             )}

             <span className="text-[10px] text-editor-accent uppercase font-bold ml-1 hidden xl:inline">{prismLanguage}</span>
        </div>
      </div>

      {searchOpen && (
          <div className="absolute top-[40px] right-6 z-50 bg-editor-sidebar border border-editor-line shadow-xl rounded flex items-center p-1 gap-1 animate-fade-in-down">
              <input ref={searchInputRef} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('diffview.search.placeholder')} className="bg-editor-bg border border-editor-line rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-editor-accent w-[180px]" onKeyDown={e => { if(e.key === 'Enter') { if (e.shiftKey) setCurrentMatchIdx(prev => (prev - 1 + matches.length) % matches.length); else setCurrentMatchIdx(prev => (prev + 1) % matches.length); } if(e.key === 'Escape') toggleSearch(); }} />
              <div className="text-[10px] text-gray-500 min-w-[50px] text-center font-mono">{matches.length > 0 ? `${currentMatchIdx + 1}/${matches.length}` : t('diffview.search.no_results')}</div>
              <button onClick={() => setCurrentMatchIdx(prev => (prev - 1 + matches.length) % matches.length)} disabled={matches.length === 0} className="p-1 hover:bg-editor-line rounded text-gray-400 hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
              <button onClick={() => setCurrentMatchIdx(prev => (prev + 1) % matches.length)} disabled={matches.length === 0} className="p-1 hover:bg-editor-line rounded text-gray-400 hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
              <button onClick={toggleSearch} className="p-1 hover:bg-editor-line rounded text-gray-400 hover:text-white ml-1"><X size={14} /></button>
          </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
            className="fixed z-[100] bg-editor-sidebar border border-editor-line shadow-2xl rounded py-1 w-[220px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()} 
        >
            <div onClick={() => { onAction?.('Request Changes'); setContextMenu(prev => ({...prev, visible: false})); }} className="flex items-center gap-3 px-3 py-1.5 text-xs text-editor-fg hover:bg-editor-line cursor-pointer"><XCircle size={14} className="text-editor-error" /><span>{t('contextmenu.must_change')}</span></div>
            <div onClick={() => { onAction?.('Mark Concern'); setContextMenu(prev => ({...prev, visible: false})); }} className="flex items-center gap-3 px-3 py-1.5 text-xs text-editor-fg hover:bg-editor-line cursor-pointer"><AlertTriangle size={14} className="text-editor-warning" /><span>{t('contextmenu.concern')}</span></div>
            <div className="h-[1px] bg-editor-line my-1"></div>
            <div onClick={() => { onAction?.('Approve Hunk'); setContextMenu(prev => ({...prev, visible: false})); }} className="flex items-center gap-3 px-3 py-1.5 text-xs text-editor-fg hover:bg-editor-line cursor-pointer"><Check size={14} className="text-editor-success" /><span>{t('contextmenu.approve_hunk')}</span></div>
        </div>
      )}

      <div className="flex items-center bg-editor-sidebar border-b border-editor-line text-[10px] text-gray-500 font-bold uppercase tracking-wider select-none shrink-0 z-10 sticky top-0">
         {(viewMode === 'diff' || viewMode === 'old') && <div className="w-[60px] text-right pr-3 py-1 border-r border-editor-line/30 bg-editor-bg/50 text-red-400/70 truncate">{t('diffview.header.old')}</div>}
         {viewMode === 'diff' && <div className="w-[12px] flex justify-center py-1 bg-editor-bg/50"><div className="w-[2px] h-3 bg-gray-600/50"></div></div>}
         {(viewMode === 'diff' || viewMode === 'new') && <div className="w-[60px] text-right pr-3 py-1 border-r border-editor-line/30 bg-editor-bg/50 text-green-400/70 truncate">{t('diffview.header.new')}</div>}
         <div className="flex-1 px-4 py-1 bg-editor-bg/50">{t('diffview.header.main')}</div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto font-mono text-[14px] leading-[22px] relative" onClick={() => setContextMenu(prev => ({...prev, visible: false}))}>
        {loading && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-editor-bg/80 z-30">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-editor-accent" />
              <span className="text-xs text-gray-400">Loading diff...</span>
            </div>
          </div>
        )}

        {displayLines.map((line: any, displayIndex: number) => {
             if (viewMode === 'old' && line.type === 'added' && !line.isFoldPlaceholder) return null;
             if (viewMode === 'new' && line.type === 'removed' && !line.isFoldPlaceholder) return null;

             const isFoldedPlaceholder = line.isFoldPlaceholder;
             let bgClass = '';
             if (viewMode === 'diff' && !isFoldedPlaceholder) {
                 if (line.type === 'added') bgClass = 'bg-editor-success/10';
                 if (line.type === 'removed') bgClass = 'bg-editor-error/10';
             }
             if (isFoldedPlaceholder) bgClass = 'bg-editor-line/30 hover:bg-editor-line/50 cursor-pointer';

             return (
                <div key={displayIndex} id={`diff-line-${displayIndex}`} className={`flex w-full hover:bg-editor-line/50 group relative ${bgClass} ${isLineWrap ? '' : 'min-w-fit'}`} onContextMenu={(e) => handleContextMenu(e, displayIndex)} onClick={line.onClick}>
                    {(viewMode === 'diff' || viewMode === 'old') && (
                        <div className="w-[60px] text-right pr-3 select-none bg-editor-bg border-r border-red-900/30 shrink-0 sticky left-0 z-10 text-red-500/50">
                            {isFoldedPlaceholder ? <MoreHorizontal size={12} className="inline opacity-50" /> : (line.oldLineNumber || '')}
                        </div>
                    )}
                    {viewMode === 'diff' && (
                        <div className="w-[12px] flex items-center justify-center bg-editor-bg shrink-0 sticky left-[60px] z-10">
                            {!isFoldedPlaceholder && line.type === 'added' && <div className="w-1 h-full bg-editor-success opacity-40"></div>}
                            {!isFoldedPlaceholder && line.type === 'removed' && <div className="w-1 h-full bg-editor-error opacity-40"></div>}
                        </div>
                    )}
                    {(viewMode === 'diff' || viewMode === 'new') && (
                        <div className={`w-[60px] text-right pr-3 select-none bg-editor-bg border-r border-green-900/30 shrink-0 sticky z-10 text-green-500/50 ${viewMode === 'diff' ? 'left-[72px]' : 'left-0'}`}>
                            {isFoldedPlaceholder ? <MoreHorizontal size={12} className="inline opacity-50" /> : (line.newLineNumber || '')}
                        </div>
                    )}
                    <div className={`flex-1 px-4 relative min-w-0 ${isLineWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
                        {isFoldedPlaceholder ? (
                            <span className="text-gray-500 italic select-none flex items-center gap-2 text-xs py-1"><ChevronRight size={12} /> {line.content}</span>
                        ) : (
                            <div className={`inline-block w-full ${(viewMode === 'diff' && line.type === 'removed') ? 'line-through text-gray-500 opacity-70' : ''}`}>
                                {renderLineContent(line.content, displayIndex)}
                            </div>
                        )}
                        {(viewMode === 'diff' || viewMode === 'new') && line.severity === ReviewSeverity.WARNING && <div className="absolute left-0 bottom-0 w-full h-[2px] bg-orange-500/30"></div>}
                        {(viewMode === 'diff' || viewMode === 'new') && line.severity === ReviewSeverity.ERROR && <div className="absolute top-0 right-0 bottom-0 left-0 border border-editor-error/30 bg-editor-error/5 pointer-events-none"></div>}
                    </div>
                    {line.severity && !isFoldedPlaceholder && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <div className={`flex items-center gap-1 bg-editor-bg border ${line.severity === ReviewSeverity.WARNING ? 'border-editor-warning text-editor-warning' : 'border-editor-error text-editor-error'} text-[10px] px-2 py-0.5 rounded shadow-lg z-10`}>
                                {line.severity === ReviewSeverity.WARNING ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                                <span>{line.message}</span>
                             </div>
                        </div>
                    )}
                </div>
             );
        })}
        <div className="flex-1 bg-editor-bg min-h-[100px]"></div>
      </div>
    </div>
  );
};

export default DiffView;
