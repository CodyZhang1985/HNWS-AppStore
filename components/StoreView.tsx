
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { ServiceProduct, FeaturedContent, Theme, ViewMode } from '../types';
import { AVAILABLE_CATEGORIES } from '../constants';
import ServiceCard from './ServiceCard';
import Carousel from './Carousel';
import DetailModal from './DetailModal';
import FeaturedDetailModal from './FeaturedDetailModal';

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
  const [selectedFeatured, setSelectedFeatured] = useState<FeaturedContent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const lastLoadTime = useRef(0);

  const loadData = () => {
    const now = Date.now();
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
      <aside className="w-72 border-r border-gray-200 dark:border-gray-800 hidden md:block p-8">
        <h2 className="text-sm font-black text-apple-gray uppercase tracking-widest mb-8">浏览分类</h2>
        <nav className="space-y-2">
          {['全部', ...AVAILABLE_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-base transition-all duration-300 font-bold ${
                activeCategory === cat 
                ? 'bg-apple-blue text-white shadow-xl shadow-blue-500/30' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-grow p-8 lg:p-14 max-w-7xl mx-auto w-full">
        <div className="relative mb-14">
          <input
            type="text"
            placeholder="搜索服务产品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border-none ring-1 ring-gray-200 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-apple-blue transition-all text-xl font-medium"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 text-2xl">🔍</span>
        </div>

        {activeCategory === '全部' && featured.length > 0 && (
          <div className="mb-16">
            <Carousel 
              items={featured} 
              onExplore={(item) => setSelectedFeatured(item)} 
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              mode={viewMode}
              onClick={() => setSelectedService(service)}
            />
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-28 text-center text-apple-gray italic text-xl">
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

      {selectedFeatured && (
        <FeaturedDetailModal
          featured={selectedFeatured}
          onClose={() => setSelectedFeatured(null)}
          onServiceClick={(service) => {
            setSelectedFeatured(null);
            setSelectedService(service);
          }}
        />
      )}
    </div>
  );
};

export default StoreView;
