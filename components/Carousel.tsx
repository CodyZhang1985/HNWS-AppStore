
import React, { useState, useEffect, useRef } from 'react';
import { FeaturedContent } from '../types';
import { StorageService } from '../services/storageService';

interface CarouselProps {
  items: FeaturedContent[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
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
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl aspect-[21/9] sm:aspect-[24/9] shadow-2xl group">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-all duration-700 ease-out flex items-center p-8 lg:p-16 ${
            idx === activeIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-10'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {imageUrls[item.id] ? (
               <img src={imageUrls[item.id]} className="w-full h-full object-cover" alt="" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-apple-blue to-indigo-800" />
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-white max-w-xl">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80 mb-2">热门专题</h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">{item.title}</h2>
            <div 
              className="text-base sm:text-lg text-white/90 font-medium mb-8 line-clamp-2 prose prose-invert prose-sm" 
              dangerouslySetInnerHTML={{ __html: item.description || '' }} 
            />
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
              立即探索
            </button>
          </div>
        </div>
      ))}

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
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
