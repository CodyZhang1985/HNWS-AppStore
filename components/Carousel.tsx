
import React, { useState, useEffect, useRef } from 'react';
import { FeaturedContent } from '../types';
import { StorageService } from '../services/storageService';

interface CarouselProps {
  items: FeaturedContent[];
  onExplore: (item: FeaturedContent) => void;
}

const Carousel: React.FC<CarouselProps> = ({ items, onExplore }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    items.forEach(item => {
      StorageService.getImage(item.image).then(url => {
        setImageUrls(prev => ({ ...prev, [item.id]: url }));
      });
    });
  }, [items]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(prev => (prev + 1) % items.length);
    startTimer();
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(prev => (prev + items.length - 1) % items.length);
    startTimer();
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] aspect-[21/9] sm:aspect-[24/9] shadow-2xl group">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-all duration-700 ease-out flex items-center p-8 lg:p-16 ${
            idx === activeIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-20'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {imageUrls[item.id] ? (
               <img src={imageUrls[item.id]} className="w-full h-full object-cover" alt="" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-apple-blue to-indigo-800" />
            )}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-white max-w-xl">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80 mb-2">热门专题</h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">{item.title}</h2>
            <div 
              className="text-base sm:text-lg text-white/90 font-medium mb-8 line-clamp-2 prose prose-invert prose-sm" 
              dangerouslySetInnerHTML={{ __html: item.description || '' }} 
            />
            <button 
              onClick={() => onExplore(item)}
              className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              立即探索
            </button>
          </div>
        </div>
      ))}

      {/* Manual Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all active:scale-90"
      >
        <span className="text-xl">←</span>
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all active:scale-90"
      >
        <span className="text-xl">→</span>
      </button>

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIndex(idx); startTimer(); }}
            className={`h-1.5 rounded-full transition-all ${
              idx === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
