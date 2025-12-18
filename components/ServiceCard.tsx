
import React, { useState, useEffect } from 'react';
import { ServiceProduct, ViewMode } from '../types';
import { StorageService } from '../services/storageService';
import { getTagColor } from '../constants';

interface ServiceCardProps {
  service: ServiceProduct;
  mode: ViewMode;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, mode, onClick }) => {
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    StorageService.getImage(service.icon).then(setIconUrl);
  }, [service.icon]);

  if (mode === 'list') {
    return (
      <div 
        onClick={onClick}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-apple-blue hover:shadow-md transition-all cursor-pointer"
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 overflow-hidden flex-shrink-0">
          {iconUrl ? (
            <img src={iconUrl} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-apple-gray font-bold text-lg">
              {service.title.substring(0, 1)}
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-lg truncate group-hover:text-apple-blue transition-colors">{service.title}</h3>
          <p className="text-sm text-apple-gray truncate">{service.description}</p>
          <div className="mt-1 flex gap-2">
            {service.featureTags.slice(0, 2).map(tagName => {
              const colors = getTagColor(tagName);
              return (
                <span key={tagName} style={{ backgroundColor: colors.bg, color: colors.color }} className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase">
                  {tagName}
                </span>
              );
            })}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
           <span className="block font-bold text-apple-blue">{service.price || '免费'}</span>
           <button className="mt-1 bg-gray-100 dark:bg-gray-700 text-apple-blue px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider group-hover:bg-apple-blue group-hover:text-white transition-all">
             获取
           </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center text-center space-y-3"
    >
      <div className="relative w-full aspect-square max-w-[160px] rounded-[32px] bg-white dark:bg-gray-800 shadow-lg group-hover:shadow-xl group-active:scale-95 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        {iconUrl ? (
          <img src={iconUrl} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-apple-gray font-bold text-3xl">
            {service.title.substring(0, 1)}
          </div>
        )}
      </div>
      <div className="w-full px-2">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-apple-blue transition-colors">
          {service.title}
        </h3>
        <p className="text-[11px] text-apple-gray line-clamp-1 mb-2">
          {service.serviceType}
        </p>
        <div className="flex flex-col items-center gap-1.5">
          <button className="bg-[#f2f2f7] dark:bg-gray-700 text-apple-blue px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide group-hover:bg-apple-blue group-hover:text-white transition-all">
            {service.pricingModel === '免费' ? '获取' : (service.price || '查看')}
          </button>
          <div className="flex gap-1 overflow-hidden h-4">
             {service.featureTags.slice(0, 1).map(tagName => {
                const colors = getTagColor(tagName);
                return (
                  <span key={tagName} style={{ backgroundColor: colors.bg, color: colors.color }} className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {tagName}
                  </span>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
