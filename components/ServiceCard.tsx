
import React, { useState, useEffect } from 'react';
import { ServiceProduct, ViewMode } from '../types';
import { StorageService } from '../services/storageService';
import { getTagColor, formatServicePrice } from '../constants';

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

  const formattedPrice = formatServicePrice(service.pricingModel, service.price);

  if (mode === 'list') {
    return (
      <div 
        onClick={onClick}
        className="group flex items-center gap-6 p-6 rounded-[32px] bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-apple-blue/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          {iconUrl ? (
            <img src={iconUrl} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-apple-gray font-bold text-3xl">
              {service.title.substring(0, 1)}
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-2xl truncate group-hover:text-apple-blue transition-colors mb-2">{service.title}</h3>
          <p className="text-lg text-apple-gray line-clamp-1 mb-3">{service.description}</p>
          <div className="flex flex-row flex-wrap gap-2">
            {service.featureTags.slice(0, 4).map(tagName => {
              const colors = getTagColor(tagName);
              return (
                <span key={tagName} style={{ backgroundColor: colors.bg, color: colors.color }} className="text-[12px] px-3 py-1 rounded-full font-bold uppercase tracking-tight">
                  {tagName}
                </span>
              );
            })}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
           <span className="block font-bold text-2xl text-apple-blue mb-2">{formattedPrice}</span>
           <button className="bg-gray-100 dark:bg-gray-700 text-apple-blue px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider group-hover:bg-apple-blue group-hover:text-white transition-all shadow-sm">
             获取
           </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center text-center space-y-5 transition-all duration-500 hover:-translate-y-3"
    >
      <div className="relative w-full aspect-square max-w-[200px] rounded-[48px] bg-white dark:bg-gray-800 shadow-lg group-hover:shadow-2xl group-active:scale-95 transition-all duration-500 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        {iconUrl ? (
          <img src={iconUrl} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-apple-gray font-bold text-5xl">
            {service.title.substring(0, 1)}
          </div>
        )}
      </div>
      <div className="w-full px-2">
        <h3 className="font-bold text-xl leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-apple-blue transition-colors mb-2 px-1">
          {service.title}
        </h3>
        <p className="text-base text-apple-gray line-clamp-1 mb-4 opacity-70">
          {service.serviceType}
        </p>
        <div className="flex flex-col items-center gap-4">
          <button className="bg-[#f2f2f7] dark:bg-gray-700 text-apple-blue px-9 py-2.5 rounded-full text-base font-bold group-hover:bg-apple-blue group-hover:text-white transition-all shadow-sm min-w-[120px]">
            {formattedPrice}
          </button>
          <div className="flex flex-row flex-wrap justify-center gap-2 max-w-full">
             {service.featureTags.slice(0, 3).map(tagName => {
                const colors = getTagColor(tagName);
                return (
                  <span key={tagName} style={{ backgroundColor: colors.bg, color: colors.color }} className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap tracking-tighter">
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
