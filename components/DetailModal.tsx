
import React, { useState, useEffect } from 'react';
import { ServiceProduct } from '../types';
import { StorageService } from '../services/storageService';

interface DetailModalProps {
  service: ServiceProduct;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ service, onClose }) => {
  const [iconUrl, setIconUrl] = useState('');
  const [caseUrls, setCaseUrls] = useState<string[]>([]);

  useEffect(() => {
    StorageService.getImage(service.icon).then(setIconUrl);
    Promise.all(service.caseImages.map(id => StorageService.getImage(id))).then(setCaseUrls);
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [service]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white/10">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur flex items-center justify-center text-2xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors z-20"
        >
          &times;
        </button>

        <div className="overflow-y-auto p-8 sm:p-12 no-scrollbar">
          {/* Header */}
          <header className="flex flex-col sm:flex-row gap-8 mb-12">
            <div className="w-32 h-32 rounded-[32px] bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex-shrink-0 self-center sm:self-start ring-1 ring-black/5">
              {iconUrl ? (
                <img src={iconUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-apple-gray">
                   {service.title[0]}
                </div>
              )}
            </div>
            <div className="flex-grow text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                <h2 className="text-3xl font-extrabold tracking-tight">{service.title}</h2>
                {service.featureTags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-apple-blue/10 text-apple-blue px-3 py-1 rounded-full ring-1 ring-apple-blue/20">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xl text-apple-gray mb-6 leading-relaxed font-medium">
                {service.serviceType} • {service.author || '中海官方'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <button className="bg-apple-blue text-white px-10 py-2.5 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wide">
                  获取服务
                </button>
                <div className="text-xs text-apple-gray font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                  {service.pricingModel} {service.price && service.price !== '0' && `• ￥${service.price}`}
                </div>
              </div>
            </div>
          </header>

          {/* Screenshots Gallery */}
          {caseUrls.length > 0 && (
            <section className="mb-12">
              <h3 className="text-xl font-bold mb-6">应用预览</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                {caseUrls.map((url, i) => (
                  <div key={i} className="flex-shrink-0 w-72 aspect-[16/9] rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-md ring-1 ring-black/5">
                    <img src={url} className="w-full h-full object-cover" alt={`截图 ${i+1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">详细简介</h3>
            <div className="text-lg leading-relaxed text-apple-darkGray dark:text-gray-300 whitespace-pre-wrap">
              {service.description}
            </div>
          </section>

          {/* Highlights */}
          {service.highlights.length > 0 && (
            <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-full text-xl font-bold mb-2">服务核心亮点</h3>
              {service.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <span className="text-base font-semibold">{h}</span>
                </div>
              ))}
            </section>
          )}

          {/* Information */}
          <section className="border-t border-gray-200 dark:border-gray-800 pt-10 mb-6">
            <h3 className="text-xl font-bold mb-8 text-center sm:text-left">服务详细信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              {[
                { label: '版本', value: service.version || '1.0.0' },
                { label: '发布日期', value: new Date(service.createdAt).toLocaleDateString() },
                { label: '供应商', value: service.author || '海纳万商' },
                { label: '服务类别', value: service.category },
                { label: '定价方案', value: service.pricingModel },
                { label: '开发者', value: 'HNWS Tech' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3 group">
                  <span className="text-apple-gray font-medium">{item.label}</span>
                  <span className="font-bold text-apple-darkGray dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
