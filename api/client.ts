
import type { 
  Repo, Branch, Task, DiffLine, HeatmapItem, BlameInfo, ReviewStats, 
  ChecklistItem, Tag, SearchResult, ReviewTemplate, QualityGate, FileNode,
  ReviewGuideItem
} from './types';
import { ReviewSeverity } from './types';

// 在当前演示环境中默认为 true，实际项目中使用 import.meta.env.VITE_MOCK === 'true'
const MOCK = true; 

// --- Exports ---

export const getRecentRepos = (): Promise<Repo[]> =>
  MOCK ? mockGetRecentRepos() : Promise.resolve([]);

export const getBranches = (): Promise<Branch[]> => 
  MOCK ? mockGetBranches() : Promise.resolve([]);

export const getTasks = (type: 'pending' | 'watched'): Promise<Task[]> => 
  MOCK ? mockGetTasks(type) : Promise.resolve([]);

export const getLocalTasks = (): Promise<Task[]> => 
  MOCK ? mockGetLocalTasks() : Promise.resolve([]);

export const getFileTree = (): Promise<FileNode[]> => 
  MOCK ? mockGetFileTree() : Promise.resolve([]);

export const getFileDiff = (fileId: string): Promise<DiffLine[]> => 
  MOCK ? mockGetFileDiff(fileId) : Promise.resolve([]);

export const getHeatmap = (): Promise<HeatmapItem[]> =>
  MOCK ? mockGetHeatmap() : Promise.resolve([]);

export const getBlame = (fileId: string): Promise<BlameInfo> =>
  MOCK ? mockGetBlame(fileId) : Promise.resolve({} as any);

export const getReviewStats = (): Promise<ReviewStats> =>
  MOCK ? mockGetReviewStats() : Promise.resolve({} as any);

export const getChecklist = (): Promise<ChecklistItem[]> =>
  MOCK ? mockGetChecklist() : Promise.resolve([]);

export const getReviewGuide = (): Promise<ReviewGuideItem[]> =>
  MOCK ? mockGetReviewGuide() : Promise.resolve([]);

export const getTags = (): Promise<Tag[]> =>
  MOCK ? mockGetTags() : Promise.resolve([]);

export const getCommands = (): Promise<SearchResult[]> =>
  MOCK ? mockGetCommands() : Promise.resolve([]);

export const getReviewTemplates = (): Promise<ReviewTemplate[]> =>
  MOCK ? mockGetReviewTemplates() : Promise.resolve([]);

export const getQualityGates = (): Promise<QualityGate[]> =>
  MOCK ? mockGetQualityGates() : Promise.resolve([]);

export const openLocalRepoDialog = (): Promise<string | null> =>
  MOCK ? mockOpenLocalRepoDialog() : Promise.resolve(null);


/* --------- Mock Implementations --------- */

async function mockGetRecentRepos(): Promise<Repo[]> {
  await new Promise(r => setTimeout(r, 200)); 
  return [
    { path: '~/work/payment-service', branch: 'feature/payment-retry', lastOpened: '2 mins ago' },
    { path: '~/work/auth-center', branch: 'master', lastOpened: '1 hour ago' },
    { path: '~/work/legacy-monolith', branch: 'hotfix/npe-fix', lastOpened: '2 days ago' },
  ];
}

async function mockGetBranches(): Promise<Branch[]> {
  return [
    { name: 'master' },
    { name: 'main' },
    { name: 'feature/payment-retry' },
  ];
}

async function mockGetTasks(type: 'pending' | 'watched'): Promise<Task[]> {
  if (type === 'pending') {
    return [
      { id: '1', title: 'PR#2877 Pay Retry Refactor', status: 'active' },
      { id: '2', title: 'PR#2871 Auth Center Update', status: 'pending', unreadCount: 1 },
    ];
  }
  return [];
}

async function mockGetLocalTasks(): Promise<Task[]> {
  return [];
}

async function mockGetFileTree(): Promise<FileNode[]> {
  return [
    {
      id: 'src',
      name: 'src',
      path: '/src',
      type: 'folder',
      status: 'none',
      children: [
        {
          id: 'service',
          name: 'RetryServiceImpl.java',
          path: '/src/.../RetryServiceImpl.java',
          type: 'file',
          status: 'modified',
          stats: { added: 342, removed: 108 }
        }
      ]
    }
  ];
}

async function mockGetFileDiff(fileId: string): Promise<DiffLine[]> {
  return [
    { oldLineNumber: 1, newLineNumber: 1, content: 'public class RetryServiceImpl {', type: 'context' },
  ];
}

async function mockGetHeatmap(): Promise<HeatmapItem[]> {
  return [
    { id: '1', name: 'RetryServiceImpl.java', path: '.../RetryServiceImpl.java', impact: 'high', score: 92 },
  ];
}

async function mockGetBlame(fileId: string): Promise<BlameInfo> {
  return {
    author: 'alice',
    avatar: 'A',
    time: '2025-11-20 18:33',
    prName: 'PR#2711',
    reviewer: 'ferris',
    reviewerStatus: 'LGTM',
    comment: 'Fixing deadlock.'
  };
}

async function mockGetReviewStats(): Promise<ReviewStats> {
  return {
    reviewedCount: 73,
    totalCount: 127,
    severeCount: 12,
    warningCount: 28,
    pendingCount: 7,
    estimatedTime: '11m'
  };
}

async function mockGetChecklist(): Promise<ChecklistItem[]> {
  return [
    { id: '1', text: 'Check SQL Injection', checked: false },
  ];
}

async function mockGetReviewGuide(): Promise<ReviewGuideItem[]> {
  await new Promise(r => setTimeout(r, 200));
  return [
    { id: 'g1', category: 'security', severity: 'high', title: 'SQL 注入风险 (SQLi)', description: '检查 XML Mapper 中是否使用了 ${} 而非 #{}。', applicableExtensions: ['.java', '.xml', '.sql'] },
    { id: 'g2', category: 'performance', severity: 'medium', title: '潜在 N+1 查询', description: '循环体内调用了 DB/RPC 接口，建议使用批量模式。', applicableExtensions: ['.java', '.ts', '.js'] },
    { id: 'g3', category: 'logic', severity: 'high', title: '事务边界缺失', description: '涉及多表更新的操作必须标注 @Transactional。', applicableExtensions: ['.java'] },
    { id: 'g4', category: 'style', severity: 'low', title: '魔法数字', description: '硬编码的超时时间或状态码建议提取为常量。', applicableExtensions: ['.java', '.ts', '.js', '.c', '.cpp'] },
    { id: 'g5', category: 'performance', severity: 'high', title: '连接未关闭', description: '检查 Stream 或 HttpClient 是否在 finally 块中关闭。', applicableExtensions: ['.java', '.py'] },
    { id: 'g6', category: 'security', severity: 'high', title: '敏感配置明文', description: '检查 .yml 或 .properties 是否存在明文密码。', applicableExtensions: ['.yml', '.yaml', '.properties', '.xml'] },
    { id: 'g7', category: 'logic', severity: 'medium', title: '前端金额计算风险', description: '涉及支付金额的计算应放在后端，前端仅作展示。', applicableExtensions: ['.js', '.ts', '.tsx', '.jsx'] },
  ];
}

async function mockGetTags(): Promise<Tag[]> {
  return [
    { id: 1, label: 'N+1', color: 'bg-editor-error' },
  ];
}

async function mockGetCommands(): Promise<SearchResult[]> {
  return [];
}

async function mockGetReviewTemplates(): Promise<ReviewTemplate[]> {
  return [];
}

async function mockGetQualityGates(): Promise<QualityGate[]> {
  return [];
}

async function mockOpenLocalRepoDialog(): Promise<string | null> {
  return "/home/user/repo";
}
