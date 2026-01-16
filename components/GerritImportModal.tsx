
import React, { useState } from 'react';
import { Plug, Search, Globe, Key, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';

interface GerritImportModalProps {
  onClose: () => void;
  onImport: (id: string) => void;
  onOpenSettings?: () => void;
}

const GerritImportModal: React.FC<GerritImportModalProps> = ({ onClose, onImport, onOpenSettings }) => {
  const { t } = useTranslation();
  const [changeId, setChangeId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleImport = () => {
      setIsSearching(true);
      setTimeout(() => {
          onImport(changeId || "12345");
          setIsSearching(false);
      }, 1000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
          <Globe className="text-purple-400 shrink-0" size={24} />
          <div>
              <h4 className="text-sm font-bold text-white">{t('gerrit.import.bridge')}</h4>
              <p className="text-[11px] text-gray-500">{t('gerrit.import.connected_to', { server: 'gerrit.internal.corp', version: 'v3.13.1' })}</p>
          </div>
      </div>

      <div>
          <label className="text-xs text-gray-400 font-bold mb-2 block uppercase tracking-tighter">{t('gerrit.import.label')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                    value={changeId}
                    onChange={e => setChangeId(e.target.value)}
                    placeholder={t('gerrit.import.placeholder')}
                    className="w-full bg-editor-bg border border-editor-line rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    autoFocus
                />
            </div>
            <button 
                onClick={handleImport}
                disabled={isSearching}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded text-xs font-bold transition-colors disabled:opacity-50"
            >
                {isSearching ? t('gerrit.import.fetching') : t('gerrit.import.btn')}
            </button>
          </div>
      </div>

      <div className="space-y-2">
          <div className="text-[10px] text-gray-500 font-bold">{t('gerrit.import.suggestions')}</div>
          <div className="flex flex-wrap gap-2">
              {['status:open owner:self', 'project:payment-service', 'is:starred'].map(q => (
                  <button key={q} onClick={() => setChangeId(q)} className="px-2 py-1 bg-editor-line hover:bg-editor-selection rounded text-[10px] text-gray-400 transition-colors border border-editor-line">
                      {q}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-editor-line">
          <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-400">{t('modal.open_repo.cancel')}</button>
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-purple-400 hover:text-white hover:bg-purple-600/20 border border-purple-500/30 transition-all"
          >
              <Key size={12} /> {t('gerrit.import.config_btn')}
          </button>
      </div>
    </div>
  );
};

export default GerritImportModal;
