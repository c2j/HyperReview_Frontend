
export interface HeatmapItem {
  id: string;
  name: string;
  path: string;
  impact: 'high' | 'medium' | 'low';
  score: number; // 0-100 impact factor
}

export interface BlameInfo {
  author: string;
  avatar: string; // Initial or URL
  time: string;
  prName: string;
  reviewer: string;
  reviewerStatus: string;
  comment: string;
}

export interface ReviewStats {
  reviewedCount: number;
  totalCount: number;
  severeCount: number;
  warningCount: number;
  pendingCount: number;
  estimatedTime: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
