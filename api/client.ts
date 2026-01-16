
import type { 
  Repo, Branch, Task, DiffLine, HeatmapItem, BlameInfo, ReviewStats, 
  ChecklistItem, Tag, SearchResult, ReviewTemplate, QualityGate, FileNode,
  ReviewGuideItem
} from './types';
import { ReviewSeverity } from './types';
import type { GerritChange, GerritServerConfig } from './types/gerrit';

const MOCK = true; 
const STORAGE_KEY = 'hr_gerrit_config';

// --- Gerrit Exports ---

export const getGerritChanges = (): Promise<GerritChange[]> =>
  MOCK ? mockGetGerritChanges() : Promise.resolve([]);

export const importGerritChange = (id: string): Promise<GerritChange> =>
  MOCK ? mockImportGerritChange(id) : Promise.resolve({} as any);

export const postGerritReview = (changeId: string, data: any): Promise<void> =>
  MOCK ? new Promise(r => setTimeout(r, 1000)) : Promise.resolve();

export const getGerritConfig = (): Promise<GerritServerConfig | null> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
      try {
          return Promise.resolve(JSON.parse(saved));
      } catch (e) {
          return Promise.resolve(null);
      }
  }
  return Promise.resolve(null);
};

export const saveGerritConfig = (config: GerritServerConfig): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  return new Promise(r => setTimeout(r, 800));
};

export const testGerritConnection = (config: GerritServerConfig): Promise<{ version: string }> =>
  new Promise((resolve, reject) => {
      setTimeout(() => {
          if (config.url && config.token && config.url.startsWith('http')) {
              resolve({ version: '3.13.1' });
          } else {
              reject(new Error("Connection Failed"));
          }
      }, 1200);
  });

// --- Existing Exports ---

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

async function mockGetGerritChanges(): Promise<GerritChange[]> {
  return [
    { 
      id: '12345', project: 'payment-service', branch: 'master', subject: '支付超时补偿逻辑重构', 
      status: 'NEW', created: '2023-11-20', updated: '10 min ago', owner: 'Alice',
      revision: 'rev3', patchSet: 3, filesCount: 3, reviewedCount: 1,
      availablePatchSets: [1, 2, 3],
      files: [
        { path: 'src/main/OrderService.java', status: 'modified', stats: { added: 42, removed: 12 } },
        { path: 'src/api/handler.go', status: 'added', stats: { added: 250, removed: 0 } },
        { path: 'docs/README.md', status: 'modified', stats: { added: 5, removed: 0 } }
      ],
      labels: [
        { name: 'Code-Review', value: 1, status: 'positive' },
        { name: 'Verified', value: 0, status: 'neutral' }
      ],
      messages: [
        { id: 'm1', author: 'Bob', authorAvatar: 'B', message: 'Uploaded patch set 1.', date: '2023-11-20 10:00' },
        { id: 'm2', author: 'System', authorAvatar: 'S', message: 'Patch Set 1: Code-Review+1', date: '2023-11-20 11:00' },
        { id: 'm3', author: 'Alice', authorAvatar: 'A', message: 'Patch Set 2: New logic implemented.', date: '2023-11-20 14:00' }
      ]
    }
  ];
}

async function mockGetRecentRepos(): Promise<Repo[]> {
  return [
    { path: '~/work/hyper-review-system', branch: 'main', lastOpened: '1 min ago' },
    { path: '~/work/payment-gateway', branch: 'feature/retry-logic', lastOpened: '10 mins ago' },
    { path: '~/work/auth-module', branch: 'master', lastOpened: '2 days ago' },
  ];
}

async function mockGetBranches(): Promise<Branch[]> {
  return [{ name: 'master' }, { name: 'main' }, { name: 'feature/full-stack-update' }];
}

async function mockGetTasks(type: 'pending' | 'watched'): Promise<Task[]> {
  if (type === 'pending') {
    return [
      { id: '1', title: 'PR#502 多语言内核升级', status: 'active' },
      { id: '2', title: 'PR#498 支付安全漏洞修复', status: 'pending', unreadCount: 2 },
    ];
  }
  return [];
}

async function mockGetLocalTasks(): Promise<Task[]> {
  return [
    { id: 'L1', title: '性能热点分析 (Python/Go)', status: 'active', type: 'code' },
    { id: 'L2', title: 'DB Schema 审计', status: 'pending', type: 'sql' }
  ];
}

async function mockGetFileTree(): Promise<FileNode[]> {
  return [
    {
      id: 'src', name: 'src', path: '/src', type: 'folder', status: 'none',
      children: [
        { id: 'java', name: 'OrderService.java', path: 'src/main/OrderService.java', type: 'file', status: 'modified', stats: { added: 42, removed: 12 } },
        { id: 'py', name: 'analyzer.py', path: 'src/scripts/analyzer.py', type: 'file', status: 'modified', stats: { added: 120, removed: 5 } },
        { id: 'go', name: 'handler.go', path: 'src/api/handler.go', type: 'file', status: 'added', stats: { added: 250, removed: 0 } },
      ]
    }
  ];
}

async function mockGetFileDiff(fileId: string): Promise<DiffLine[]> {
  return [
    { oldLineNumber: 1, newLineNumber: 1, content: 'package com.alipay.review;', type: 'context' },
    { newLineNumber: 2, content: 'import lombok.extern.slf4j.Slf4j;', type: 'added' },
    { newLineNumber: 3, content: '@Slf4j', type: 'added' },
    { oldLineNumber: 4, newLineNumber: 4, content: 'public class OrderService {', type: 'context' },
    { newLineNumber: 5, content: '    public void process() {', type: 'added' },
    { newLineNumber: 6, content: '        log.info("Process...");', type: 'added', severity: ReviewSeverity.INFO, message: 'Consider logging ID', isDraft: false },
    { newLineNumber: 7, content: '    }', type: 'added', severity: ReviewSeverity.WARNING, message: 'Optimization needed', isDraft: true },
    { oldLineNumber: 5, newLineNumber: 8, content: '}', type: 'context' },
  ];
}

async function mockGetHeatmap(): Promise<HeatmapItem[]> {
  return [
    { id: '1', name: 'OrderService.java', path: 'src/main/OrderService.java', impact: 'high', score: 92, isChanged: true, riskLevel: 'critical' },
    { id: '2', name: 'handler.go', path: 'src/api/handler.go', impact: 'medium', score: 65, isChanged: true, riskLevel: 'medium' },
    { id: '3', name: 'Config.java', path: 'src/main/Config.java', impact: 'low', score: 15, isChanged: false, riskLevel: 'low' },
  ];
}

async function mockGetBlame(fileId: string): Promise<BlameInfo> {
  return {
    author: 'alice', avatar: 'A', time: '2025-11-20 18:33', prName: 'PR#502', reviewer: 'ferris',
    reviewerStatus: 'LGTM', comment: 'Refactored for multi-language support.', patchSet: 2
  };
}

async function mockGetReviewStats(): Promise<ReviewStats> {
  return { reviewedCount: 73, totalCount: 127, severeCount: 2, warningCount: 5, pendingCount: 3, estimatedTime: '25m' };
}

async function mockGetChecklist(): Promise<ChecklistItem[]> {
  return [{ id: 'c1', text: 'Verify Error Handling', checked: false }, { id: 'c2', text: 'Check Resource Closure', checked: true }];
}

async function mockGetReviewGuide(): Promise<ReviewGuideItem[]> {
  return [
    { id: 'g1', category: 'security', severity: 'high', title: 'SQL Injection Risk', description: 'Avoid string concatenation in SQL queries.', applicableExtensions: ['.java', '.sql'] },
  ];
}

async function mockGetTags(): Promise<Tag[]> {
  return [{ id: 1, label: 'High Perf', color: 'bg-editor-success' }, { id: 2, label: 'Arch Risk', color: 'bg-editor-error' }];
}

async function mockGetCommands(): Promise<SearchResult[]> {
  return [{ type: 'file', label: 'OrderService.java', desc: 'src/main' }];
}

async function mockGetReviewTemplates(): Promise<ReviewTemplate[]> {
  return [{ id: 't1', label: 'Logic Opt', content: 'Suggest refactoring this logic.' }];
}

async function mockGetQualityGates(): Promise<QualityGate[]> {
  return [{ id: 'q1', name: 'SonarQube', status: 'passed', message: '0 Issues' }];
}

async function mockOpenLocalRepoDialog(): Promise<string | null> {
  return "/home/dev/project";
}

async function mockImportGerritChange(id: string): Promise<GerritChange> {
  await new Promise(r => setTimeout(r, 800));
  return { 
    id, project: 'imported-project', branch: 'master', subject: 'Gerrit 导入的任务示范', 
    status: 'NEW', created: '2023-11-21', updated: 'Just now', owner: 'Self',
    revision: 'rev1', patchSet: 1, filesCount: 1, reviewedCount: 0,
    availablePatchSets: [1],
    files: [{ path: 'README.md', status: 'modified' }]
  };
}
