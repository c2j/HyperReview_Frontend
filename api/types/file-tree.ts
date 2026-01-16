
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  /* Updated status to include 'renamed' to accommodate Gerrit changes and task files */
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'none';
  children?: FileNode[];
  stats?: {
    added: number;
    removed: number;
  };
}
