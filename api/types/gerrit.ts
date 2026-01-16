
export interface GerritFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  stats?: { added: number; removed: number };
  isReviewed?: boolean; 
  lastReviewedPatchSet?: number; 
}

export interface GerritChange {
  id: string;
  project: string;
  branch: string;
  subject: string;
  status: 'NEW' | 'MERGED' | 'ABANDONED';
  created: string;
  updated: string;
  owner: string;
  revision: string;
  patchSet: number;
  filesCount: number;
  reviewedCount: number;
  labels?: GerritLabel[];
  messages?: GerritMessage[];
  availablePatchSets?: number[];
  files?: GerritFile[];
}

export interface GerritLabel {
  name: string;
  value: number;
  status: 'positive' | 'negative' | 'neutral';
}

export interface GerritMessage {
  id: string;
  author: string;
  authorAvatar: string;
  message: string;
  date: string;
}

export interface GerritServerConfig {
  name: string;
  url: string;
  username: string;
  token: string;
  authType: 'http' | 'ssh';
  lastValidated?: string;
}
