
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { ServiceProduct, FeaturedContent, Theme, ViewMode } from '../types';
import { AVAILABLE_CATEGORIES } from '../constants';
import ServiceCard from './ServiceCard';
import Carousel from './Carousel';
import DetailModal from './DetailModal';

interface StoreViewProps {
  theme: Theme;
  toggleTheme: () => void;
}

const StoreView: React.FC<StoreViewProps> = ({ theme, toggleTheme }) => {
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [featured, setFeatured] = useState<FeaturedContent[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const lastLoadTime = useRef(0);

  const loadData = () => {
    const now = Date.now();
    // 防抖：避免在初始化种子数据时触发多次重载
    if (now - lastLoadTime.current < 500) return;
    lastLoadTime.current = now;
    
    console.log('Syncing Store Data...');
    const s = StorageService.getServices().filter(x => x.isPublished && !x.deletedAt);
    const f = StorageService.getFeatured().filter(x => x.isPublished && !x.deletedAt);
    setServices(s);
    setFeatured(f);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCategory = activeCategory === '全部' || s.category === activeCategory;
      const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 hidden md:block p-6">
        <h2 className="text-xs font-bold text-apple-gray uppercase mb-6">浏览分类</h2>
        <nav className="space-y-1">
          {['全部', ...AVAILABLE_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                activeCategory === cat ? 'bg-apple-blue text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="relative mb-12">
          <input
            type="text"
            placeholder="搜索服务产品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-apple-blue"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
        </div>

        {activeCategory === '全部' && featured.length > 0 && (
          <div className="mb-12"><Carousel items={featured} /></div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              mode={viewMode}
              onClick={() => setSelectedService(service)}
            />
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-20 text-center text-apple-gray italic">
              未找到匹配的服务产品
            </div>
          )}
        </div>
      </div>

      {selectedService && (
        <DetailModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default StoreView;
