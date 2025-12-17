
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertCircle, GitPullRequest, List, FolderTree, FileCode, Folder, Loader2, ArrowUpDown, Filter, File } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getTasks, getLocalTasks, getFileTree } from '../api/client';
import type { Task, FileNode } from '../api/types';

interface TaskTreeProps {
  activeTaskId: string;
  onSelectTask: (id: string) => void;
  onAction: (msg: string) => void;
}

enum LeftTab {
    GIT = 'git',
    LOCAL = 'local',
    FILES = 'files'
}

type LocalSortOption = 'status' | 'type' | 'name' | 'path';

// Recursive File Tree Item Component
const FileTreeItem: React.FC<{ node: FileNode; depth?: number; onSelect: (path: string) => void }> = ({ node, depth = 0, onSelect }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    
    // Status colors
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'modified': return 'text-editor-warning';
            case 'added': return 'text-editor-success';
            case 'deleted': return 'text-editor-error';
            default: return 'text-gray-500';
        }
    };

    return (
        <div>
            <div 
                className="flex items-center gap-1.5 py-1 hover:bg-editor-line/50 cursor-pointer select-none transition-colors"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => {
                    if (hasChildren) setExpanded(!expanded);
                    else onSelect(node.path);
                }}
            >
                {hasChildren && (
                    <span className="text-gray-500">
                        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                )}
                {!hasChildren && <span className="w-3"></span>}
                
                {node.type === 'folder' ? (
                    <Folder size={14} className="text-editor-accent shrink-0" />
                ) : (
                    <FileCode size={14} className={`${getStatusColor(node.status)} shrink-0`} />
                )}
                
                <span className={`text-xs truncate ${node.type === 'folder' ? 'text-editor-fg font-medium' : 'text-gray-400'}`}>
                    {node.name}
                </span>

                {node.stats && (
                    <span className="ml-auto mr-2 text-[10px] text-gray-600 flex gap-1">
                        {node.stats.added > 0 && <span className="text-editor-success">+{node.stats.added}</span>}
                        {node.stats.removed > 0 && <span className="text-editor-error">-{node.stats.removed}</span>}
                    </span>
                )}
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children!.map(child => (
                        <FileTreeItem key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskTree: React.FC<TaskTreeProps> = ({ activeTaskId, onSelectTask, onAction }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LeftTab>(LeftTab.GIT);
  
  // Tab 1 Data (Git)
  const [sections, setSections] = useState({
    pending: true,
    watched: true,
    history: false
  });
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [watchedTasks, setWatchedTasks] = useState<Task[]>([]);

  // Tab 2 Data (Local)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [localSort, setLocalSort] = useState<LocalSortOption>('status');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Tab 3 Data (Files)
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p1 = getTasks('pending').then(setPendingTasks);
    const p2 = getTasks('watched').then(setWatchedTasks);
    const p3 = getLocalTasks().then(setLocalTasks);
    const p4 = getFileTree().then(setFileTree);
    
    Promise.all([p1, p2, p3, p4])
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTaskExpansion = (taskId: string) => {
      const newSet = new Set(expandedTaskIds);
      if (newSet.has(taskId)) {
          newSet.delete(taskId);
      } else {
          newSet.add(taskId);
      }
      setExpandedTaskIds(newSet);
  };

  // Sort Logic for Local Tasks
  const sortedLocalTasks = useMemo(() => {
      const tasks = [...localTasks];
      tasks.sort((a, b) => {
          switch(localSort) {
              case 'status':
                  return a.status.localeCompare(b.status);
              case 'type':
                  return (a.type || '').localeCompare(b.type || '');
              case 'name':
                  return a.title.localeCompare(b.title);
              case 'path':
                  // Sort by first file path if available, else title
                  const pathA = a.files?.[0]?.path || a.title;
                  const pathB = b.files?.[0]?.path || b.title;
                  return pathA.localeCompare(pathB);
              default:
                  return 0;
          }
      });
      return tasks;
  }, [localTasks, localSort]);

  const getTypeBadgeColor = (type?: string) => {
      switch(type) {
          case 'sql': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          case 'security': return 'bg-red-500/20 text-red-400 border-red-500/30';
          case 'code': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
  };

  return (
    <div id="tour-task-tree" className="h-full bg-editor-sidebar border-r border-editor-line flex flex-col">
      
      {/* Tabs */}
      <div className="flex border-b border-editor-line bg-editor-bg shrink-0">
        <button 
            onClick={() => setActiveTab(LeftTab.GIT)}
            className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === LeftTab.GIT ? 'border-editor-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            title="Git Tasks (PRs)"
        >
            <GitPullRequest size={16} />
        </button>
        <button 
            onClick={() => setActiveTab(LeftTab.LOCAL)}
            className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === LeftTab.LOCAL ? 'border-editor-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            title="Local Tasks"
        >
            <List size={16} />
        </button>
        <button 
            onClick={() => setActiveTab(LeftTab.FILES)}
            className={`flex-1 py-2 flex justify-center items-center border-b-2 transition-colors ${activeTab === LeftTab.FILES ? 'border-editor-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            title="File Explorer"
        >
            <FolderTree size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <Loader2 size={24} className="animate-spin text-editor-accent" />
                <span className="text-xs">Loading...</span>
             </div>
        ) : (
        <>
            {/* Panel 1: Git Tasks */}
            {activeTab === LeftTab.GIT && (
                <>
                <div className="mb-4">
                <div 
                    className="flex items-center gap-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSection('pending')}
                >
                    {sections.pending ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {t('tasktree.review_pending')} ({pendingTasks.length})
                </div>
                {sections.pending && (
                    <div className="flex flex-col">
                    {pendingTasks.map(task => (
                        <div 
                        key={task.id} 
                        onClick={() => onSelectTask(task.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer text-xs transition-colors ${task.id === activeTaskId ? 'bg-editor-selection text-white' : 'text-gray-400 hover:bg-editor-line'}`}
                        >
                        {task.id === activeTaskId ? (
                            <Circle size={10} className="text-white fill-white shrink-0" />
                        ) : task.unreadCount ? (
                            <Circle size={10} className="text-editor-error fill-editor-error shrink-0" />
                        ) : (
                            <Circle size={10} className="text-gray-600 shrink-0" />
                        )}
                        <span className="truncate">{task.title}</span>
                        </div>
                    ))}
                    </div>
                )}
                </div>

                <div className="mb-4">
                <div 
                    className="flex items-center gap-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSection('watched')}
                >
                    {sections.watched ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {t('tasktree.watching')} ({watchedTasks.length})
                </div>
                {sections.watched && (
                    <div className="flex flex-col">
                    {watchedTasks.map(task => (
                        <div 
                        key={task.id} 
                        onClick={() => onSelectTask(task.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer text-xs transition-colors ${task.id === activeTaskId ? 'bg-editor-selection text-white' : 'text-gray-400 hover:bg-editor-line'}`}
                        >
                        <AlertCircle size={10} className="text-editor-warning shrink-0" />
                        <span className="truncate">{task.title}</span>
                        {task.unreadCount && (
                            <span className="ml-auto text-[10px] bg-editor-error text-white px-1 rounded-full">{task.unreadCount}</span>
                        )}
                        </div>
                    ))}
                    </div>
                )}
                </div>

                <div className="mb-4">
                <div 
                    className="flex items-center gap-1 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSection('history')}
                >
                    {sections.history ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {t('tasktree.history')} (Today 127)
                </div>
                {sections.history && (
                    <div className="px-4 py-2 text-xs text-gray-500 italic">{t('tasktree.no_history')}</div>
                )}
                </div>
                </>
            )}

            {/* Panel 2: Local Tasks (Renamed & Enhanced) */}
            {activeTab === LeftTab.LOCAL && (
                 <div className="flex flex-col h-full">
                     {/* Local Toolbar */}
                     <div className="px-2 py-1 mb-2 flex items-center justify-between border-b border-editor-line/50 bg-editor-bg/30">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('tasktree.tab.local')}</span>
                        <div className="flex items-center gap-1">
                             <button onClick={() => setLocalSort('status')} title={t('tasktree.sort.status')} className={`p-1 rounded hover:bg-editor-line ${localSort === 'status' ? 'text-editor-accent' : 'text-gray-500'}`}>
                                 <ArrowUpDown size={12} />
                             </button>
                             <button onClick={() => setLocalSort('type')} title={t('tasktree.sort.type')} className={`p-1 rounded hover:bg-editor-line ${localSort === 'type' ? 'text-editor-accent' : 'text-gray-500'}`}>
                                 <Filter size={12} />
                             </button>
                             <button onClick={() => setLocalSort('name')} title={t('tasktree.sort.name')} className={`p-1 rounded hover:bg-editor-line ${localSort === 'name' ? 'text-editor-accent' : 'text-gray-500'}`}>
                                 <FileCode size={12} />
                             </button>
                              <button onClick={() => setLocalSort('path')} title={t('tasktree.sort.path')} className={`p-1 rounded hover:bg-editor-line ${localSort === 'path' ? 'text-editor-accent' : 'text-gray-500'}`}>
                                 <FolderTree size={12} />
                             </button>
                        </div>
                     </div>

                     {/* Task List */}
                     <div className="flex-1 overflow-y-auto">
                     {sortedLocalTasks.length === 0 ? (
                         <div className="px-4 py-2 text-xs text-gray-500 italic">No local tasks. Create one above.</div>
                     ) : (
                         sortedLocalTasks.map(task => {
                            const isExpanded = expandedTaskIds.has(task.id);
                            return (
                                <div key={task.id} className="flex flex-col">
                                    {/* Task Header */}
                                    <div 
                                        onClick={() => {
                                            onSelectTask(task.id);
                                            toggleTaskExpansion(task.id);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-xs transition-colors border-l-2 group
                                            ${task.id === activeTaskId ? 'bg-editor-selection/50 border-editor-accent' : 'border-transparent hover:bg-editor-line'}
                                        `}
                                    >
                                        <div className="text-gray-500 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toggleTaskExpansion(task.id); }}>
                                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        </div>

                                        {task.status === 'completed' ? (
                                            <CheckCircle2 size={12} className="text-editor-success shrink-0" />
                                        ) : task.status === 'active' ? (
                                            <Circle size={12} className="text-editor-accent fill-editor-accent/20 shrink-0" />
                                        ) : (
                                            <Circle size={12} className="text-gray-600 shrink-0" />
                                        )}
                                        
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <span className={`truncate font-medium ${task.id === activeTaskId ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{task.title}</span>
                                            {task.type && (
                                                <span className={`text-[9px] px-1.5 py-0 rounded border w-fit uppercase font-bold ${getTypeBadgeColor(task.type)}`}>
                                                    {task.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Task Files (Expanded) */}
                                    {isExpanded && task.files && (
                                        <div className="flex flex-col bg-black/10 pb-1">
                                            {task.files.map(file => (
                                                <div 
                                                    key={file.id} 
                                                    onClick={() => onAction(`Opening Diff: ${file.path}`)}
                                                    className="flex items-center gap-2 pl-9 pr-2 py-1 cursor-pointer hover:bg-editor-line/30 group/file"
                                                >
                                                    <File size={12} className="text-gray-500 group-hover/file:text-editor-accent" />
                                                    <span className={`text-xs truncate text-gray-500 group-hover/file:text-gray-300 ${file.status === 'modified' ? 'text-editor-warning' : file.status === 'added' ? 'text-editor-success' : ''}`}>
                                                        {file.name}
                                                    </span>
                                                    <span className="ml-auto text-[9px] text-gray-600">{file.status.substring(0,1).toUpperCase()}</span>
                                                </div>
                                            ))}
                                            {task.files.length === 0 && <div className="pl-9 text-[10px] text-gray-600 italic py-1">No files attached</div>}
                                        </div>
                                    )}
                                </div>
                            );
                         })
                     )}
                     </div>
                 </div>
            )}

            {/* Panel 3: File Tree */}
            {activeTab === LeftTab.FILES && (
                 <div className="flex flex-col">
                    <div className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-1 flex justify-between items-center">
                        <span>Explorer</span>
                        <span className="text-[10px] font-normal opacity-50">feature/retry</span>
                    </div>
                    {fileTree.map(node => (
                        <FileTreeItem key={node.id} node={node} onSelect={(path) => onAction(`File selected: ${path}`)} />
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
