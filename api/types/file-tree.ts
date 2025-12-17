
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  status: 'modified' | 'added' | 'deleted' | 'none';
  children?: FileNode[];
  stats?: {
    added: number;
    removed: number;
  };
}
