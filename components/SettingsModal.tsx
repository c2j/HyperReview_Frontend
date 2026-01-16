
import React, { useState } from 'react';
import { Type, Keyboard, Eye, Globe, Cpu, Zap, Command, Link2, Info, Check } from 'lucide-react';
import { useTranslation } from '../i18n';

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = 'general' | 'editor' | 'shortcuts' | 'ai';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { 
    language, setLanguage, 
    fontSize, setFontSize, 
    ligatures, setLigatures, 
    vimMode, setVimMode,
    aiModel, setAiModel,
    aiToken, setAiToken,
    aiBaseUrl, setAiBaseUrl,
    t 
  } = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => {
        setSavedFeedback(false);
        onClose();
    }, 600);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 border-b border-editor-line pb-1 tracking-widest">{t('modal.settings.appearance')}</h3>
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-editor-accent" />
                    <span className="text-sm text-editor-fg">{t('modal.settings.language')}</span>
                </div>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-editor-line border border-editor-line rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-editor-accent min-w-[120px] transition-all"
                >
                    <option value="zh">简体中文</option>
                    <option value="en">English (US)</option>
                </select>
                </div>
            </div>
            
            <div className="p-3 bg-editor-info/10 border border-editor-info/20 rounded-lg flex items-start gap-3">
               <Info size={16} className="text-editor-info shrink-0 mt-0.5" />
               <p className="text-[11px] text-editor-info/80 leading-relaxed">
                   {language === 'zh' ? '部分界面语言更改可能需要重新加载仓库以完全生效。' : 'Some language changes may require a repo reload to take full effect.'}
               </p>
            </div>
          </div>
        );
      case 'editor':
        return (
          <div className="animate-fade-in space-y-8">
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 border-b border-editor-line pb-1 tracking-widest">{t('modal.settings.editor')}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Type size={16} className="text-editor-accent" />
                            <div className="flex flex-col">
                                <span className="text-sm text-editor-fg">{t('modal.settings.font_size')}</span>
                                <span className="text-[10px] text-gray-500">{t('modal.settings.font_size_desc')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">{fontSize}px</span>
                            <input 
                                type="range" min="10" max="24" step="1" 
                                value={fontSize} 
                                onChange={e => setFontSize(parseInt(e.target.value))}
                                className="w-32 accent-editor-accent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Eye size={16} className="text-editor-accent" />
                            <div className="flex flex-col">
                                <span className="text-sm text-editor-fg">{t('modal.settings.ligatures')}</span>
                                <span className="text-[10px] text-gray-500">{t('modal.settings.ligatures_desc')}</span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={ligatures} onChange={e => setLigatures(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-editor-accent"></div>
                        </label>
                    </div>
                </div>
            </section>

             <section>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 border-b border-editor-line pb-1 tracking-widest">{t('modal.settings.behavior')}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Keyboard size={16} className="text-editor-accent" />
                        <div className="flex flex-col">
                            <span className="text-sm text-editor-fg">{t('modal.settings.vim')}</span>
                            <span className="text-[10px] text-gray-500">{t('modal.settings.vim_desc')}</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={vimMode} onChange={e => setVimMode(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-editor-accent"></div>
                    </label>
                </div>
            </section>
          </div>
        );
      case 'shortcuts':
        return (
          <div className="animate-fade-in space-y-4">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-editor-line pb-1 tracking-widest">{t('modal.settings.shortcuts')}</h3>
             <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'Ctrl+F', desc: language === 'zh' ? '全局搜索 / 符号定位' : 'Global Search / Symbols' },
                  { key: 'R', desc: language === 'zh' ? '标记当前文件已阅' : 'Mark current file reviewed' },
                  { key: 'Ctrl+Enter', desc: language === 'zh' ? '提交并跳转下一文件' : 'Save & Goto next file' },
                  { key: 'Shift+Enter', desc: language === 'zh' ? '呼出批量提交面板' : 'Open batch submit panel' },
                  { key: 'Esc', desc: language === 'zh' ? '关闭当前活动面板/模态框' : 'Close active panel/modal' },
                  { key: 'Tab', desc: language === 'zh' ? '在差异分块间快速跳转' : 'Jump between diff hunks' }
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between p-2.5 bg-editor-line/30 rounded border border-editor-line/50 hover:bg-editor-line/50 transition-colors">
                    <span className="text-xs text-gray-300">{s.desc}</span>
                    <kbd className="bg-editor-bg border border-gray-600 px-2 py-0.5 rounded text-[10px] text-editor-accent font-bold font-mono shadow-sm">{s.key}</kbd>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'ai':
        return (
          <div className="animate-fade-in space-y-5">
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 border-b border-editor-line pb-1 tracking-widest">{t('modal.settings.ai')}</h3>
              
              <div className="space-y-4">
                <div>
                    <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-tight">{t('modal.settings.ai_model')}</label>
                    <div className="relative">
                    <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    <select 
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full bg-editor-line border border-editor-line rounded pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                    >
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Internal)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Perf)</option>
                        <option value="deepseek-coder">DeepSeek Coder v2</option>
                        <option value="gpt-4o">GPT-4o (Public API)</option>
                        <option value="custom">Custom Endpoint</option>
                    </select>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-tight">{t('modal.settings.ai_base_url')}</label>
                    <div className="relative group">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={14} />
                    <input 
                        type="text"
                        value={aiBaseUrl}
                        onChange={(e) => setAiBaseUrl(e.target.value)}
                        placeholder="https://your-internal-ai.proxy/v1"
                        className="w-full bg-editor-line border border-editor-line rounded pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                    />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-tight">{t('modal.settings.ai_token')}</label>
                    <div className="relative group">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={14} />
                    <input 
                        type="password"
                        value={aiToken}
                        onChange={(e) => setAiToken(e.target.value)}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-editor-line border border-editor-line rounded pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                    />
                    </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-editor-line">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>{language === 'zh' ? 'AI 用于自动检测 N+1 问题、安全风险及逻辑漏洞。' : 'AI is used for detecting N+1 issues, security risks, and logic bugs.'}</span>
                      <button className="text-purple-400 hover:underline font-bold">测试连接</button>
                  </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-1 h-[480px]">
      <div className="grid grid-cols-[160px_1fr] gap-6 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="border-r border-editor-line py-2 flex flex-col gap-1.5 shrink-0">
          {[
            { id: 'general', icon: Zap, label: t('modal.settings.general') },
            { id: 'editor', icon: Type, label: t('modal.settings.editor') },
            { id: 'shortcuts', icon: Command, label: t('modal.settings.shortcuts') },
            { id: 'ai', icon: Cpu, label: t('modal.settings.ai') }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`px-4 py-2.5 flex items-center gap-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${activeTab === item.id ? 'bg-editor-accent text-white shadow-lg shadow-editor-accent/20' : 'text-gray-500 hover:text-white hover:bg-editor-line/40'}`}
            >
              <item.icon size={16} />
              {item.label}
            </div>
          ))}
          
          <div className="flex-1"></div>
          <div className="px-4 py-2 text-[10px] text-gray-600 border-t border-editor-line italic">
              HyperReview Enterprise v3.1.2
          </div>
        </div>

        {/* Content Area */}
        <div className="py-2 pr-4 overflow-y-auto custom-scrollbar">
           {renderContent()}
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-editor-line shrink-0">
         <button 
            onClick={handleSave} 
            className={`px-8 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shadow-lg
                ${savedFeedback ? 'bg-editor-success text-white' : 'bg-editor-accent text-white hover:bg-blue-600'}`}
         >
            {savedFeedback ? <><Check size={16} /> SAVED</> : t('modal.settings.done')}
         </button>
      </div>
    </div>
  );
};

export default SettingsModal;
