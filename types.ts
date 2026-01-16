
export enum ReviewSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS'
}

export interface DiffLine {
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  type: 'added' | 'removed' | 'context' | 'header';
  severity?: ReviewSeverity;
  message?: string;
  // Added isDraft property for consistency across the application's diff line representations
  isDraft?: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  /* Updated status to include 'renamed' and 'none' to stay consistent with api/types/file-tree.ts */
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'none';
  children?: FileNode[];
  stats?: {
    added: number;
    removed: number;
  };
}

export interface Task {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'blocked';
  unreadCount?: number;
}
