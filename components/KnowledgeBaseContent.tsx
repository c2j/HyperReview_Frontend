
import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Zap, Code, Info, ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getReviewGuide } from '../api/client';
import type { ReviewGuideItem } from '../api/types';

const KnowledgeBaseContent: React.FC = () => {
  const { t } = useTranslation();
  const [guideItems, setGuideItems] = useState<ReviewGuideItem[]>([]);

  useEffect(() => {
    getReviewGuide().then(setGuideItems).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="bg-editor-accent/5 border border-editor-accent/20 rounded-lg p-3">
        <h4 className="text-[11px] font-black text-editor-accent uppercase mb-1 flex items-center gap-2">
            <Info size={14} /> {t('rightpanel.knowledge_base')}
        </h4>
        <p className="text-[10px] text-gray-500 leading-tight">
            {t('rightpanel.kb_desc')}
        </p>
      </div>

      <div className="space-y-4">
        {guideItems.map(item => (
            <div key={item.id} className="group p-3 bg-editor-line/10 border border-editor-line rounded-lg hover:border-gray-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {item.category === 'security' ? <Shield size={12} className="text-red-500" /> : 
                         item.category === 'performance' ? <Zap size={12} className="text-orange-500" /> : 
                         <Code size={12} className="text-blue-500" />}
                        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">{item.title}</span>
                    </div>
                    <span className={`text-[8px] px-1 rounded font-black uppercase ${item.severity === 'high' ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                        {item.severity}
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                    {item.description}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {item.applicableExtensions.map(ext => (
                            <span key={ext} className="text-[9px] font-mono text-gray-600 bg-black/20 px-1 rounded">{ext}</span>
                        ))}
                    </div>
                    <button className="text-editor-accent hover:text-white transition-colors">
                        <ExternalLink size={10} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-editor-line text-center">
          <button className="text-[10px] font-bold text-gray-600 hover:text-editor-accent uppercase tracking-widest transition-colors">
              查看全部手册 ->
          </button>
      </div>
    </div>
  );
};

export default KnowledgeBaseContent;
