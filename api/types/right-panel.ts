
export interface HeatmapItem {
  id: string;
  name: string;
  path: string;
  impact: 'high' | 'medium' | 'low';
  score: number; // 0-100 impact factor
  isChanged?: boolean; // 新增：标记是否在当前 Patch Set 中修改过
  riskLevel?: 'critical' | 'high' | 'medium' | 'low'; // 新增：风险等级分析
}

export interface BlameInfo {
  author: string;
  avatar: string; // Initial or URL
  time: string;
  prName: string;
  reviewer: string;
  reviewerStatus: string;
  comment: string;
  patchSet?: number; // 新增：溯源到特定的补丁集
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

export interface ReviewGuideItem {
  id: string;
  category: 'security' | 'performance' | 'style' | 'logic';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  referenceUrl?: string;
  applicableExtensions: string[]; // 新增：适用的文件后缀，如 ['.java', '.xml']
}
