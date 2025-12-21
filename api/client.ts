
import type { 
  Repo, Branch, Task, DiffLine, HeatmapItem, BlameInfo, ReviewStats, 
  ChecklistItem, Tag, SearchResult, ReviewTemplate, QualityGate, FileNode,
  ReviewGuideItem
} from './types';
import { ReviewSeverity } from './types';

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
      { id: '1', title: 'PR#502 Multi-Lang Upgrade', status: 'active' },
      { id: '2', title: 'PR#498 Security Fix', status: 'pending', unreadCount: 2 },
    ];
  }
  return [];
}

async function mockGetLocalTasks(): Promise<Task[]> {
  return [
    { id: 'L1', title: 'Performance Analysis (Py/Go)', status: 'active', type: 'code' },
    { id: 'L2', title: 'DB Schema Audit', status: 'pending', type: 'sql' }
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
    },
    {
      id: 'db', name: 'db', path: '/db', type: 'folder', status: 'none',
      children: [
        { id: 'sql', name: 'V2_Add_Indexes.sql', path: 'db/migration/V2_Add_Indexes.sql', type: 'file', status: 'modified', stats: { added: 15, removed: 2 } },
      ]
    },
    {
      id: 'config', name: 'config', path: '/config', type: 'folder', status: 'none',
      children: [
        { id: 'yaml', name: 'app.yml', path: 'config/app.yml', type: 'file', status: 'modified', stats: { added: 10, removed: 1 } },
        { id: 'md', name: 'README.md', path: 'README.md', type: 'file', status: 'modified', stats: { added: 5, removed: 0 } },
        { id: 'ts', name: 'types.ts', path: 'src/types.ts', type: 'file', status: 'modified', stats: { added: 12, removed: 4 } },
      ]
    }
  ];
}

async function mockGetFileDiff(fileId: string): Promise<DiffLine[]> {
  await new Promise(r => setTimeout(r, 150));
  
  if (fileId.endsWith('.py')) {
    return [
      { oldLineNumber: 1, newLineNumber: 1, content: 'import os', type: 'context' },
      { oldLineNumber: 2, newLineNumber: 2, content: 'import sys', type: 'context' },
      { newLineNumber: 3, content: 'import pandas as pd', type: 'added' },
      { oldLineNumber: 10, newLineNumber: 11, content: 'def process_data(input_file):', type: 'context' },
      { oldLineNumber: 11, content: '    data = open(input_file).read()', type: 'removed' },
      { newLineNumber: 12, content: '    data = pd.read_csv(input_file)', type: 'added', severity: ReviewSeverity.INFO, message: 'Optimization: Used pandas for better performance' },
      { newLineNumber: 13, content: '    return data.groupby("category").sum()', type: 'added' },
    ];
  }

  if (fileId.endsWith('.go')) {
    return [
      { newLineNumber: 1, content: 'package main', type: 'added' },
      { newLineNumber: 2, content: '', type: 'added' },
      { newLineNumber: 3, content: 'import "fmt"', type: 'added' },
      { newLineNumber: 4, content: '', type: 'added' },
      { newLineNumber: 5, content: 'func main() {', type: 'added' },
      { newLineNumber: 6, content: '    fmt.Println("HyperReview Go Handler Active")', type: 'added' },
      { newLineNumber: 7, content: '}', type: 'added' },
    ];
  }

  if (fileId.endsWith('.sql')) {
    return [
      { oldLineNumber: 1, newLineNumber: 1, content: 'CREATE TABLE orders (', type: 'context' },
      { oldLineNumber: 2, newLineNumber: 2, content: '    id BIGINT PRIMARY KEY,', type: 'context' },
      { newLineNumber: 3, content: '    user_id BIGINT NOT NULL,', type: 'added' },
      { newLineNumber: 4, content: '    amount DECIMAL(18, 2),', type: 'added' },
      { oldLineNumber: 3, content: ');', type: 'removed' },
      { newLineNumber: 5, content: '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', type: 'added' },
      { newLineNumber: 6, content: ');', type: 'added' },
      { newLineNumber: 7, content: 'CREATE INDEX idx_user_id ON orders(user_id);', type: 'added', severity: ReviewSeverity.WARNING, message: 'Verify if redundant index exists' },
    ];
  }

  if (fileId.endsWith('.yml') || fileId.endsWith('.yaml')) {
    return [
      { oldLineNumber: 1, newLineNumber: 1, content: 'server:', type: 'context' },
      { oldLineNumber: 2, newLineNumber: 2, content: '  port: 8080', type: 'context' },
      { oldLineNumber: 3, content: '  timeout: 5000', type: 'removed' },
      { newLineNumber: 3, content: '  timeout: 15000', type: 'added', severity: ReviewSeverity.WARNING, message: 'Timeout increased significantly' },
      { newLineNumber: 4, content: 'security:', type: 'added' },
      { newLineNumber: 5, content: '  enable_cors: true', type: 'added' },
    ];
  }

  if (fileId.endsWith('.md')) {
    return [
      { oldLineNumber: 1, newLineNumber: 1, content: '# Project HyperReview', type: 'context' },
      { newLineNumber: 2, content: '', type: 'added' },
      { newLineNumber: 3, content: '## Core Features', type: 'added' },
      { newLineNumber: 4, content: '- **Syntax Highlighting**: Powered by PrismJS', type: 'added' },
      { newLineNumber: 5, content: '- **Smart Checklist**: Context-aware', type: 'added' },
    ];
  }

  if (fileId.endsWith('.ts') || fileId.endsWith('.tsx')) {
    return [
        { newLineNumber: 1, content: 'export interface User {', type: 'added' },
        { newLineNumber: 2, content: '  id: string;', type: 'added' },
        { newLineNumber: 3, content: '  name: string;', type: 'added' },
        { newLineNumber: 4, content: '  email?: string;', type: 'added' },
        { newLineNumber: 5, content: '}', type: 'added' },
    ];
  }

  // Default Java
  return [
    { oldLineNumber: 1, newLineNumber: 1, content: 'package com.alipay.review;', type: 'context' },
    { oldLineNumber: 2, newLineNumber: 2, content: '', type: 'context' },
    { oldLineNumber: 3, newLineNumber: 3, content: 'import lombok.extern.slf4j.Slf4j;', type: 'context' },
    { newLineNumber: 4, content: '@Slf4j', type: 'added' },
    { oldLineNumber: 4, newLineNumber: 5, content: 'public class OrderService {', type: 'context' },
    { newLineNumber: 6, content: '    public void process() {', type: 'added' },
    { newLineNumber: 7, content: '        log.info("Processing order...");', type: 'added' },
    { newLineNumber: 8, content: '    }', type: 'added' },
    { oldLineNumber: 5, newLineNumber: 9, content: '}', type: 'context' },
  ];
}

async function mockGetHeatmap(): Promise<HeatmapItem[]> {
  return [
    { id: '1', name: 'OrderService.java', path: 'src/main/OrderService.java', impact: 'high', score: 92 },
    { id: '2', name: 'handler.go', path: 'src/api/handler.go', impact: 'medium', score: 65 },
  ];
}

async function mockGetBlame(fileId: string): Promise<BlameInfo> {
  return {
    author: 'alice',
    avatar: 'A',
    time: '2025-11-20 18:33',
    prName: 'PR#502',
    reviewer: 'ferris',
    reviewerStatus: 'LGTM',
    comment: 'Refactored for multi-language support.'
  };
}

async function mockGetReviewStats(): Promise<ReviewStats> {
  return {
    reviewedCount: 5,
    totalCount: 12,
    severeCount: 1,
    warningCount: 3,
    pendingCount: 2,
    estimatedTime: '25m'
  };
}

async function mockGetChecklist(): Promise<ChecklistItem[]> {
  return [
    { id: 'c1', text: 'Verify Error Handling', checked: false },
    { id: 'c2', text: 'Check Resource Closure', checked: true },
  ];
}

async function mockGetReviewGuide(): Promise<ReviewGuideItem[]> {
  return [
    { id: 'g1', category: 'security', severity: 'high', title: 'SQL Injection Risk', description: 'Avoid string concatenation in SQL queries.', applicableExtensions: ['.java', '.xml', '.sql', '.py'] },
    { id: 'g2', category: 'performance', severity: 'medium', title: 'Large Object Allocation', description: 'Avoid creating objects inside loops during large data processing.', applicableExtensions: ['.java', '.go', '.ts'] },
    { id: 'g3', category: 'style', severity: 'low', title: 'Missing Documentation', description: 'Public APIs should have clear documentation comments.', applicableExtensions: ['.java', '.go', '.py', '.ts', '.md'] },
    { id: 'g4', category: 'logic', severity: 'high', title: 'Concurrent Race Condition', description: 'Shared resources accessed without locking.', applicableExtensions: ['.go', '.java'] },
    { id: 'g5', category: 'security', severity: 'high', title: 'Sensitive Info Leak', description: 'Do not store plain text passwords in config files.', applicableExtensions: ['.yml', '.yaml', '.properties', '.json'] },
  ];
}

async function mockGetTags(): Promise<Tag[]> {
  return [{ id: 1, label: 'High Perf', color: 'bg-editor-success' }, { id: 2, label: 'Arch Risk', color: 'bg-editor-error' }];
}

async function mockGetCommands(): Promise<SearchResult[]> {
  return [
    { type: 'file', label: 'OrderService.java', desc: 'src/main' },
    { type: 'file', label: 'handler.go', desc: 'src/api' },
    { type: 'cmd', label: 'Checkout Main', desc: 'Git Command' },
  ];
}

async function mockGetReviewTemplates(): Promise<ReviewTemplate[]> {
  return [{ id: 't1', label: 'Logic Opt', content: 'Suggest refactoring this logic using Strategy pattern.' }];
}

async function mockGetQualityGates(): Promise<QualityGate[]> {
  return [{ id: 'q1', name: 'SonarQube', status: 'passed', message: '0 Issues' }];
}

async function mockOpenLocalRepoDialog(): Promise<string | null> {
  return "/home/dev/project";
}
