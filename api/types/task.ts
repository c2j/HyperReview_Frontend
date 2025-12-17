
export interface TaskFile {
  id: string;
  path: string;
  name: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
}

export interface Task {
  id: string;
  title: string;
  type?: 'code' | 'sql' | 'security' | 'general';
  status: 'active' | 'pending' | 'completed' | 'blocked';
  unreadCount?: number;
  files?: TaskFile[];
  updatedAt?: string;
}
