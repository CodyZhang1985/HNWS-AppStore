
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import StoreView from './components/StoreView';
import AdminView from './components/AdminView';
import { Theme } from './types';
import { StorageService } from './services/storageService';

const Navigation = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 glass z-50 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
          <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center text-white text-xs">HN</div>
          <span className="hidden sm:inline">海纳万商 <span className="text-apple-blue">AppStore</span></span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to={isAdmin ? "/" : "/admin"} 
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            isAdmin 
            ? "bg-gray-200 dark:bg-gray-800 text-apple-darkGray dark:text-gray-300 hover:bg-gray-300" 
            : "bg-apple-blue text-white hover:bg-opacity-90"
          }`}
        >
          {isAdmin ? "返回商店" : "管理后台"}
        </Link>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // 初始化种子数据
    StorageService.seedInitialData();
    
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <HashRouter>
      <div className={`min-h-screen pt-14 flex flex-col transition-colors duration-300`}>
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<StoreView theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/admin/*" element={<AdminView />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
