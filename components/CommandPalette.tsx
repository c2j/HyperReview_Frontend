import React, { useState, useEffect, useRef } from 'react';
import { Search, FileCode, Hash, Command, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (target: string) => void;
}

const COMMANDS = [
  { type: 'file', icon: FileCode, label: 'RetryServiceImpl.java', desc: 'src/main/java/.../impl' },
  { type: 'file', icon: FileCode, label: 'PaymentController.java', desc: 'src/main/java/.../web' },
  { type: 'symbol', icon: Hash, label: 'method: updateStatus', desc: 'RetryServiceImpl.java' },
  { type: 'symbol', icon: Hash, label: 'const: MAX_RETRY_COUNT', desc: 'RetryConfig.java' },
  { type: 'cmd', icon: Command, label: 'Toggle Vim Mode', desc: 'Settings' },
  { type: 'cmd', icon: Command, label: 'Fold All Regions', desc: 'View' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onNavigate }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      if (filtered[selectedIndex]) {
        onNavigate(filtered[selectedIndex].label);
      }
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center px-4 py-3 border-b border-editor-line">
        <Search className="text-editor-accent mr-3" size={18} />
        <input 
          ref={inputRef}
          className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 font-mono text-sm"
          placeholder={t('command.placeholder')}
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          onKeyDown={handleKeyDown}
        />
        <span className="text-[10px] text-gray-500 border border-editor-line px-1.5 rounded">{t('command.esc')}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.map((item, idx) => (
          <div 
            key={idx}
            className={`px-4 py-2 flex items-center gap-3 cursor-pointer ${idx === selectedIndex ? 'bg-editor-selection' : 'hover:bg-editor-line'}`}
            onClick={() => onNavigate(item.label)}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <item.icon size={14} className={idx === selectedIndex ? 'text-white' : 'text-gray-500'} />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-mono truncate ${idx === selectedIndex ? 'text-white' : 'text-editor-fg'}`}>
                {item.label}
              </div>
              <div className={`text-[10px] truncate ${idx === selectedIndex ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.desc}
              </div>
            </div>
            {idx === selectedIndex && <ArrowRight size={12} className="text-white" />}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">No results found</div>
        )}
      </div>
      <div className="bg-editor-line/30 px-4 py-1 border-t border-editor-line text-[10px] text-gray-500 flex justify-between">
        <span>{t('command.tips')}</span>
        <span>HyperReview Search Service</span>
      </div>
    </div>
  );
};

export default CommandPalette;