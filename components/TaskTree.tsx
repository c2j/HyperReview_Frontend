
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Circle, GitPullRequest, FolderTree, FileCode, Folder, Loader2, Globe, PlugZap, Eye, List, LayoutGrid, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getTasks, getFileTree, getGerritChanges } from '../api/client';
import type { Task, FileNode } from '../api/types';
import type { GerritChange, GerritFile } from '../api/types/gerrit';

interface TaskTreeProps {
  activeTaskId: string;
  onSelectTask: (id: string) => void;
  onAction: (msg: string) => void;
  mode: 'local' | 'remote';
}

enum LeftTab { GIT = 'git', FILES = 'files' }
type FileViewMode = 'flat' | 'tree';

const FileTreeItem: React.FC<{ 
    node: FileNode; 
    depth?: number; 
    onSelect: (path: string) => void; 
    reviewedFiles: Set<string>;
    staleFiles: Set<string>; 
}> = ({ node, depth = 0, onSelect, reviewedFiles, staleFiles }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(true);
    const isReviewed = reviewedFiles.has(node.path);
    const isStale = staleFiles.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'modified': return 'text-editor-warning';
            case 'added': return 'text-editor-success';
            case 'deleted': return 'text-editor-error';
            case 'renamed': return 'text-editor-info';
            default: return 'text-gray-500';
        }
    };

    return (
        <div>
            <div className={`flex items-center gap-1.5 py-1 hover:bg-editor-line/50 cursor-pointer select-none transition-colors group ${isReviewed && !hasChildren ? 'opacity-50' : ''}`} 
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => { if (hasChildren) setExpanded(!expanded); else onSelect(node.path); }}>
                {hasChildren && <span className="text-gray-500">{expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>}
                {!hasChildren && <span className="w-3"></span>}
                {node.type === 'folder' ? <Folder size={14} className="text-editor-accent shrink-0" /> : <FileCode size={14} className={`${getStatusColor(node.status)} shrink-0`} />}
                
                <span className={`text-xs truncate flex-1 font-mono ${node.type === 'folder' ? 'text-editor-fg' : (isReviewed ? 'text-gray-500' : 'text-gray-300 font-bold')}`}>
                    {node.name}
                </span>

                {!hasChildren && (
                    <div className="flex items-center gap-1 mr-2">
                        {/* Fix: Lucide icons do not support 'title' prop directly; wrapped in span with title */}
                        {isStale && <span title={t('tasktree.ps_updated_tip')} className="flex items-center"><AlertCircle size={10} className="text-orange-500" /></span>}
                        {isReviewed && <CheckCircle2 size={10} className="text-editor-success" />}
                    </div>
                )}
            </div>
            {hasChildren && expanded && <div>{node.children!.map(child => <FileTreeItem key={child.id} node={child} depth={depth + 1} onSelect={onSelect} reviewedFiles={reviewedFiles} staleFiles={staleFiles} />)}</div>}
        </div>
    );
};

const TaskTree: React.FC<TaskTreeProps> = ({ activeTaskId, onSelectTask, onAction, mode }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LeftTab>(LeftTab.GIT);
  const [loading, setLoading] = useState(false);
  
  const [reviewedFiles, setReviewedFiles] = useState<Set<string>>(new Set());
  const [staleFiles, setStaleFiles] = useState<Set<string>>(new Set());

  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set(['12345']));
  const [fileViewMode, setFileViewMode] = useState<FileViewMode>('tree');

  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [gerritChanges, setGerritChanges] = useState<GerritChange[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
        getTasks('pending').then(setPendingTasks), 
        getGerritChanges().then(data => {
            setGerritChanges(data);
            setReviewedFiles(new Set([data[0].files![0].path]));
            setStaleFiles(new Set([data[0].files![0].path]));
        }), 
        getFileTree().then(setFileTree)
    ])
    .finally(() => setLoading(false));
  }, []);

  const handleFileSelect = (path: string) => {
      onAction(`File selected: ${path}`);
      setReviewedFiles(prev => new Set(prev).add(path));
      setStaleFiles(prev => {
          const next = new Set(prev);
          next.delete(path);
          return next;
      });
  };

  const buildChangeTree = (files: GerritFile[]): FileNode[] => {
    const root: FileNode[] = [];
    const map: Record<string, FileNode> = {};
    files.forEach(file => {
        const parts = file.path.split('/');
        let currentPath = '';
        let parentArr = root;
        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isLast = index === parts.length - 1;
            if (!map[currentPath]) {
                const node: FileNode = {
                    id: currentPath, name: part, path: currentPath,
                    type: isLast ? 'file' : 'folder',
                    status: isLast ? file.status : 'none',
                    children: isLast ? undefined : []
                };
                map[currentPath] = node;
                parentArr.push(node);
            }
            parentArr = map[currentPath].children || [];
        });
    });
    return root;
  };

  return (
    <div id="tour-task-tree" className="h-full bg-editor-sidebar border-r border-editor-line flex flex-col">
      <div className="flex border-b border-editor-line bg-editor-bg shrink-0">
        <button onClick={() => setActiveTab(LeftTab.GIT)} className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === LeftTab.GIT ? (mode === 'remote' ? 'border-purple-500 text-white' : 'border-editor-accent text-white') : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <GitPullRequest size={16} />
        </button>
        <button onClick={() => setActiveTab(LeftTab.FILES)} className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === LeftTab.FILES ? (mode === 'remote' ? 'border-purple-500 text-white' : 'border-editor-accent text-white') : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <FolderTree size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500"><Loader2 size={24} className="animate-spin text-purple-500" /><span className="text-xs">{t('tasktree.fetching')}</span></div>
        ) : (
            <>
            {activeTab === LeftTab.GIT && (
                <div className="mb-4">
                    <div className="px-3 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        <span>{mode === 'remote' ? t('tasktree.gerrit_changes') : t('tasktree.tab.local')}</span>
                        <PlugZap size={12} className={mode === 'remote' ? 'text-purple-400' : ''} />
                    </div>
                    {gerritChanges.map(change => {
                        const isExpanded = expandedChanges.has(change.id);
                        const isActive = activeTaskId === `gerrit-${change.id}`;
                        const reviewedCount = Array.from(reviewedFiles).filter(f => change.files?.some(cf => cf.path === f)).length;
                        const progress = (reviewedCount / change.filesCount) * 100;

                        return (
                            <div key={change.id} className="flex flex-col mb-1">
                                <div 
                                    onClick={() => onSelectTask(`gerrit-${change.id}`)} 
                                    className={`group px-4 py-2 cursor-pointer transition-all border-l-2 relative ${isActive ? 'bg-purple-900/10 border-purple-500' : 'hover:bg-editor-line border-transparent'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setExpandedChanges(prev => { const n = new Set(prev); isExpanded ? n.delete(change.id) : n.add(change.id); return n; }); }}
                                            className="p-0.5 hover:bg-white/10 rounded"
                                        >
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        <span className={`text-xs truncate flex-1 font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>#{change.id} {change.subject}</span>
                                        {staleFiles.size > 0 && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title={t('tasktree.ps_updated_tip')} />}
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono ml-5">
                                        <div className="flex items-center gap-2">
                                            <span className={reviewedCount === change.filesCount ? 'text-editor-success' : ''}>{t('tasktree.reviewed_status', { reviewed: reviewedCount, total: change.filesCount })}</span>
                                            <span>•</span>
                                            <span className="text-purple-400 font-bold">PS{change.patchSet}</span>
                                        </div>
                                        <span>{change.owner}</span>
                                    </div>

                                    <div className="absolute bottom-0 left-5 right-4 h-[1px] bg-gray-800">
                                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-black/10 pb-2 mt-1">
                                        <div className="flex items-center justify-end px-4 py-1 gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                            <button onClick={() => setFileViewMode('flat')} className={`p-1 rounded ${fileViewMode === 'flat' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}><List size={10} /></button>
                                            <button onClick={() => setFileViewMode('tree')} className={`p-1 rounded ${fileViewMode === 'tree' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}><LayoutGrid size={10} /></button>
                                        </div>

                                        <div className="overflow-hidden">
                                            {fileViewMode === 'flat' ? (
                                                <div className="space-y-0.5">
                                                    {change.files?.map(file => (
                                                        <div key={file.path} onClick={() => handleFileSelect(file.path)} className={`flex items-center gap-2 pl-10 pr-4 py-1 hover:bg-editor-line/30 cursor-pointer group ${reviewedFiles.has(file.path) ? 'opacity-50' : ''}`}>
                                                            <FileCode size={12} className="text-gray-500" />
                                                            <span className={`text-[11px] truncate flex-1 font-mono ${reviewedFiles.has(file.path) ? 'text-gray-500' : 'text-gray-300'}`}>{file.path}</span>
                                                            {reviewedFiles.has(file.path) && <Eye size={10} className="text-editor-success opacity-60" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="pl-4">
                                                    {buildChangeTree(change.files || []).map(node => (
                                                        <FileTreeItem 
                                                            key={node.id} 
                                                            node={node} 
                                                            onSelect={handleFileSelect} 
                                                            reviewedFiles={reviewedFiles}
                                                            staleFiles={staleFiles}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {activeTab === LeftTab.FILES && (
                <div className="flex flex-col">
                    <div className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tasktree.workspace_explorer')}</div>
                    {fileTree.map(node => (
                        <FileTreeItem 
                            key={node.id} 
                            node={node} 
                            onSelect={handleFileSelect} 
                            reviewedFiles={reviewedFiles}
                            staleFiles={staleFiles} 
                        />
                    ))}
                </div>
            )}
            </>
        )}
      </div>
    </div>
  );
};

export default TaskTree;
