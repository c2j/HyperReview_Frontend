
import React, { useState } from 'react';
import { Upload, GitPullRequest, FileText, Database, Shield, Plus, List } from 'lucide-react';
import { useTranslation } from '../i18n';

interface NewTaskModalProps {
  onClose: () => void;
  onImport: (id: string) => void;
  onCreate: (task: { title: string; type: string }) => void;
  initialTab?: 'import' | 'create';
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onImport, onCreate, initialTab = 'import' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'import' | 'create'>(initialTab);

  // Import State
  const [importValue, setImportValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Create State
  const [createTitle, setCreateTitle] = useState('');
  const [createType, setCreateType] = useState('code');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setImportValue("patch-from-file-v2.diff");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Header */}
      <div className="flex border-b border-editor-line mb-2">
          <button 
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-colors border-b-2 ${activeTab === 'import' ? 'border-editor-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {t('modal.new_task.tab_import')}
          </button>
          <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-colors border-b-2 ${activeTab === 'create' ? 'border-editor-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {t('modal.new_task.tab_create')}
          </button>
      </div>

      {activeTab === 'import' && (
        <div className="flex flex-col gap-4 animate-fade-in">
             <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">{t('modal.import_task.label')}</label>
                <div className="relative">
                    <GitPullRequest className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                    type="text" 
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    placeholder="e.g. PR#2899, GH-123, or https://gitlab.com/..." 
                    className="w-full bg-editor-line/50 border border-editor-line rounded pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-editor-accent transition-colors"
                    autoFocus
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 my-1">
                <div className="h-[1px] bg-editor-line flex-1"></div>
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t('modal.import_task.or')}</span>
                <div className="h-[1px] bg-editor-line flex-1"></div>
            </div>

            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group
                    ${isDragging ? 'border-editor-accent bg-editor-accent/10' : 'border-editor-line hover:border-editor-accent/50 hover:bg-editor-line/30'}`}
            >
                <div className={`p-3 rounded-full ${isDragging ? 'bg-editor-accent text-white' : 'bg-editor-line text-gray-400 group-hover:text-editor-accent'}`}>
                    <Upload size={20} />
                </div>
                <div className="text-center">
                    <span className="text-xs text-editor-fg block font-medium">{t('modal.import_task.drag')}</span>
                    <span className="text-[10px] text-gray-500 block mt-1">{t('modal.import_task.supports')}</span>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-editor-line mt-1">
                <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-300 transition-colors">{t('modal.import_task.cancel')}</button>
                <button 
                onClick={() => importValue && onImport(importValue)}
                disabled={!importValue}
                className="px-4 py-1.5 rounded text-xs bg-editor-accent text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                >
                {t('modal.import_task.import')}
                </button>
            </div>
        </div>
      )}

      {activeTab === 'create' && (
         <div className="flex flex-col gap-4 animate-fade-in">
            <div>
                <label className="text-xs text-gray-400 mb-1 block font-medium">{t('modal.create_task.label_title')}</label>
                <input 
                type="text" 
                value={createTitle}
                onChange={e => setCreateTitle(e.target.value)}
                placeholder="e.g. Q3 Performance Review"
                className="w-full bg-editor-line/50 border border-editor-line rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-editor-accent transition-colors placeholder-gray-600"
                autoFocus
                />
            </div>

            <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">{t('modal.create_task.label_type')}</label>
                <div className="grid grid-cols-3 gap-3">
                    <div 
                        onClick={() => setCreateType('code')}
                        className={`cursor-pointer p-3 rounded border flex flex-col items-center gap-2 transition-all ${createType === 'code' ? 'bg-editor-accent/20 border-editor-accent text-white shadow-[0_0_10px_rgba(0,122,204,0.2)]' : 'bg-editor-line/30 border-transparent text-gray-500 hover:bg-editor-line/50 hover:text-gray-300'}`}>
                        <FileText size={20} />
                        <span className="text-xs font-medium">{t('modal.create_task.type_code')}</span>
                    </div>
                    <div 
                        onClick={() => setCreateType('sql')}
                        className={`cursor-pointer p-3 rounded border flex flex-col items-center gap-2 transition-all ${createType === 'sql' ? 'bg-editor-accent/20 border-editor-accent text-white shadow-[0_0_10px_rgba(0,122,204,0.2)]' : 'bg-editor-line/30 border-transparent text-gray-500 hover:bg-editor-line/50 hover:text-gray-300'}`}>
                        <Database size={20} />
                        <span className="text-xs font-medium">{t('modal.create_task.type_sql')}</span>
                    </div>
                    <div 
                        onClick={() => setCreateType('security')}
                        className={`cursor-pointer p-3 rounded border flex flex-col items-center gap-2 transition-all ${createType === 'security' ? 'bg-editor-accent/20 border-editor-accent text-white shadow-[0_0_10px_rgba(0,122,204,0.2)]' : 'bg-editor-line/30 border-transparent text-gray-500 hover:bg-editor-line/50 hover:text-gray-300'}`}>
                        <Shield size={20} />
                        <span className="text-xs font-medium">{t('modal.create_task.type_security')}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-editor-line mt-2">
                <button onClick={onClose} className="px-4 py-1.5 rounded text-xs hover:bg-editor-line text-gray-300 transition-colors">{t('modal.create_task.cancel')}</button>
                <button 
                    onClick={() => {
                        if (createTitle) onCreate({ title: createTitle, type: createType });
                    }}
                    disabled={!createTitle}
                    className="px-4 py-1.5 rounded text-xs bg-editor-accent text-white hover:bg-blue-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus size={14} /> {t('modal.create_task.create')}
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default NewTaskModal;
