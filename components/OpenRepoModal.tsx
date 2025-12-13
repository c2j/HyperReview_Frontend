import React, { useState } from 'react';
import { Search, Folder, GitBranch, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';

interface OpenRepoModalProps {
  onClose: () => void;
  onOpen: (path: string) => void;
}

const REPOS = [
  { path: '~/work/payment-service', branch: 'feature/payment-retry', lastOpened: '2 mins ago' },
  { path: '~/work/auth-center', branch: 'master', lastOpened: '1 hour ago' },
  { path: '~/work/legacy-monolith', branch: 'hotfix/npe-fix', lastOpened: '2 days ago' },
  { path: '~/personal/dotfiles', branch: 'main', lastOpened: '1 week ago' },
  { path: '~/infrastructure/k8s-configs', branch: 'staging', lastOpened: '2 weeks ago' },
];

const OpenRepoModal: React.FC<OpenRepoModalProps> = ({ onClose, onOpen }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredRepos = REPOS.filter(r => r.path.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-gray-400 font-bold mb-1">
          {t('modal.open_repo.step1')}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('modal.open_repo.search')}
          className="w-full bg-editor-line/50 border border-editor-line rounded pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-editor-accent transition-colors"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
        <span className="text-[10px] uppercase text-gray-500 font-bold mb-1 sticky top-0 bg-editor-bg z-10 py-1">{t('modal.open_repo.recent')}</span>
        {filteredRepos.map((repo) => (
          <div 
            key={repo.path}
            onClick={() => setSelected(repo.path)}
            onDoubleClick={() => onOpen(repo.path)}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer border border-transparent transition-all ${selected === repo.path ? 'bg-editor-selection text-white border-editor-accent/50' : 'hover:bg-editor-line text-gray-300'}`}
          >
            <Folder size={16} className={selected === repo.path ? 'text-white' : 'text-editor-accent'} />
            <div className="flex flex-col flex-1 min-w-0">
               <span className="text-xs font-medium truncate font-mono">{repo.path}</span>
               <div className="flex items-center gap-2 text-[10px] opacity-70">
                 <span className="flex items-center gap-1"><Clock size={10} /> {repo.lastOpened}</span>
               </div>
            </div>
            {selected === repo.path && <ArrowRight size={14} className="text-editor-accent" />}
          </div>
        ))}
        {filteredRepos.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-500 italic">No repositories found</div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-editor-line mt-1">
        <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-300 transition-colors">{t('modal.open_repo.cancel')}</button>
        <button 
          onClick={() => selected && onOpen(selected)}
          disabled={!selected}
          className="px-4 py-1.5 rounded text-xs bg-editor-accent text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center gap-1"
        >
          {t('modal.open_repo.next')} <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default OpenRepoModal;