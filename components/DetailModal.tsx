
import React, { useState, useEffect } from 'react';
import { ServiceProduct } from '../types';
import { StorageService } from '../services/storageService';
import { formatServicePrice } from '../constants';

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

  const formattedPrice = formatServicePrice(service.pricingModel, service.price);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white/10">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-xl flex items-center justify-center text-3xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all z-20 shadow-lg active:scale-90"
        >
          &times;
        </button>

        <div className="overflow-y-auto p-10 sm:p-16 no-scrollbar">
          {/* Header */}
          <header className="flex flex-col sm:flex-row gap-10 mb-14">
            <div className="w-44 h-44 rounded-[44px] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex-shrink-0 self-center sm:self-start ring-1 ring-black/5 group hover:scale-105 transition-transform duration-500">
              {iconUrl ? (
                <img src={iconUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-apple-gray">
                   {service.title[0]}
                </div>
              )}
            </div>
            <div className="flex-grow text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-6">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">{service.title}</h2>
                <div className="flex flex-row flex-wrap gap-2">
                  {service.featureTags.map(tag => (
                    <span key={tag} className="text-[12px] font-black uppercase tracking-widest bg-apple-blue/10 text-apple-blue px-5 py-2 rounded-full ring-1 ring-apple-blue/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-2xl text-apple-gray mb-8 leading-relaxed font-semibold opacity-80">
                {service.serviceType} • {service.author || '中海官方'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
                <button className="bg-apple-blue text-white px-14 py-5 rounded-full font-bold shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest">
                  获取服务
                </button>
                <div className="text-base text-apple-blue font-black uppercase tracking-widest bg-white dark:bg-gray-800 px-8 py-4 rounded-full border border-apple-blue/20 shadow-sm">
                  {formattedPrice}
                </div>
              </div>
            </div>
          </header>

          {/* Screenshots Gallery */}
          {caseUrls.length > 0 && (
            <section className="mb-16">
              <h3 className="text-2xl font-black mb-8 tracking-tight">应用预览</h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
                {caseUrls.map((url, i) => (
                  <div key={i} className="flex-shrink-0 w-80 aspect-[16/9] rounded-3xl bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-xl ring-1 ring-black/5 hover:scale-[1.02] transition-transform">
                    <img src={url} className="w-full h-full object-cover" alt={`截图 ${i+1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="mb-16">
            <h3 className="text-2xl font-black mb-6 tracking-tight">详细简介</h3>
            <div className="text-xl leading-relaxed text-apple-darkGray dark:text-gray-300 whitespace-pre-wrap font-medium">
              {service.description}
            </div>
          </section>

          {/* Highlights */}
          {service.highlights.length > 0 && (
            <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              <h3 className="col-span-full text-2xl font-black mb-4 tracking-tight">服务核心亮点</h3>
              {service.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-5 p-7 rounded-[32px] bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <span className="text-lg font-bold tracking-tight">{h}</span>
                </div>
              ))}
            </section>
          )}

          {/* Information */}
          <section className="border-t border-gray-200 dark:border-gray-800 pt-14 mb-10">
            <h3 className="text-2xl font-black mb-10 text-center sm:text-left tracking-tight">服务详细信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16">
              {[
                { label: '版本', value: service.version || '1.0.0' },
                { label: '发布日期', value: new Date(service.createdAt).toLocaleDateString() },
                { label: '供应商', value: service.author || '海纳万商' },
                { label: '服务类别', value: service.category },
                { label: '定价方案', value: formattedPrice },
                { label: '开发者', value: 'HNWS Tech' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-5 group">
                  <span className="text-lg text-apple-gray font-bold uppercase tracking-wider text-[11px] opacity-70">{item.label}</span>
                  <span className="text-lg font-black text-apple-darkGray dark:text-white">{item.value}</span>
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
