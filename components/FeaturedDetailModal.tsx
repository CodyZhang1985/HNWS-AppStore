
import React, { useState, useEffect } from 'react';
import { FeaturedContent, ServiceProduct } from '../types';
import { StorageService } from '../services/storageService';
import { formatServicePrice } from '../constants';

interface FeaturedDetailModalProps {
  featured: FeaturedContent;
  onClose: () => void;
  onServiceClick: (service: ServiceProduct) => void;
}

const FeaturedDetailModal: React.FC<FeaturedDetailModalProps> = ({ featured, onClose, onServiceClick }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [recommendedServices, setRecommendedServices] = useState<ServiceProduct[]>([]);

  useEffect(() => {
    StorageService.getImage(featured.image).then(setImageUrl);
    
    // Load recommended services
    const allServices = StorageService.getServices();
    const recommended = allServices.filter(s => featured.recommendedServices?.includes(s.id));
    setRecommendedServices(recommended);

    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [featured]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#1d1d1f] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center text-2xl hover:bg-black/40 transition-colors z-30"
        >
          &times;
        </button>

        <div className="overflow-y-auto no-scrollbar">
          {/* Hero Banner */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/7] overflow-hidden">
             {imageUrl ? (
               <img src={imageUrl} className="w-full h-full object-cover" alt="" />
             ) : (
               <div className="w-full h-full bg-apple-blue" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1d1d1f] to-transparent" />
             <div className="absolute bottom-8 left-8 sm:left-12 text-black dark:text-white">
               <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">精选专题内容</h3>
               <h2 className="text-3xl sm:text-5xl font-black tracking-tight">{featured.title}</h2>
             </div>
          </div>

          <div className="px-8 sm:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none text-apple-darkGray dark:text-gray-300 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: featured.description }}
                />
                {/* For real content, we might have multiple paragraphs here */}
                <div className="pt-8 opacity-60 text-sm">
                  发布于 {new Date(featured.createdAt).toLocaleDateString()} • {featured.author || '中海官方'}
                </div>
              </div>

              {/* Recommended Services Sidebar */}
              {recommendedServices.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold tracking-tight border-b border-gray-100 dark:border-gray-800 pb-4">专题关联推荐</h3>
                  <div className="space-y-4">
                    {recommendedServices.map(service => (
                      <ServiceMiniCard 
                        key={service.id} 
                        service={service} 
                        onClick={() => onServiceClick(service)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceMiniCard = ({ service, onClick }: { service: ServiceProduct, onClick: () => void }) => {
  const [icon, setIcon] = useState('');
  useEffect(() => { StorageService.getImage(service.icon).then(setIcon); }, [service.icon]);

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-apple-blue/20 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
        {icon ? <img src={icon} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-sm truncate group-hover:text-apple-blue">{service.title}</h4>
        <p className="text-[10px] text-apple-gray truncate">{service.category}</p>
      </div>
      <div className="text-apple-blue text-xs font-bold shrink-0">
        {formatServicePrice(service.pricingModel, service.price)}
      </div>
    </div>
  );
}

export default FeaturedDetailModal;
