
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { ServiceProduct, FeaturedContent } from '../types';
import { formatServicePrice } from '../constants';
import AdminServiceForm from './AdminServiceForm';
import AdminFeaturedForm from './AdminFeaturedForm';

const AdminView: React.FC = () => {
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [featured, setFeatured] = useState<FeaturedContent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof ServiceProduct; direction: 'asc' | 'desc' }>({ key: 'sortOrder', direction: 'asc' });
  const location = useLocation();

  const loadAllData = () => {
    setServices(StorageService.getServices());
    setFeatured(StorageService.getFeatured());
  };

  useEffect(() => { loadAllData(); }, []);

  const handleSort = (key: keyof ServiceProduct) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === undefined || valB === undefined) return 0;
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [services, sortConfig]);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === services.length && services.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(services.map(s => s.id)));
  };

  const handleBulkDelete = () => {
    if (!confirm(`确定要永久删除选中的 ${selectedIds.size} 个服务产品吗？`)) return;
    const updated = services.filter(s => !selectedIds.has(s.id));
    StorageService.saveServices(updated);
    setServices(updated);
    setSelectedIds(new Set());
  };

  const handleBulkStatus = (publish: boolean) => {
    const updated = services.map(s => selectedIds.has(s.id) ? { ...s, isPublished: publish } : s);
    StorageService.saveServices(updated);
    setServices(updated);
    setSelectedIds(new Set());
  };

  const Sidebar = () => (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-2">
      <Link to="/admin" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/admin' ? 'bg-apple-blue text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>服务产品管理</Link>
      <Link to="/admin/featured" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname.startsWith('/admin/featured') ? 'bg-apple-blue text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>专题管理</Link>
    </aside>
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <Sidebar />
      <div className="flex-grow p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">服务产品管理</h1>
                <div className="flex gap-3">
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 mr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-full px-5 animate-in slide-in-from-right-4">
                      <span className="text-xs font-bold text-apple-gray">已选 {selectedIds.size}</span>
                      <button onClick={() => handleBulkStatus(true)} className="text-[10px] uppercase font-bold text-apple-blue hover:opacity-70">一键上架</button>
                      <button onClick={() => handleBulkStatus(false)} className="text-[10px] uppercase font-bold text-apple-gray hover:opacity-70">一键下架</button>
                      <div className="w-px h-3 bg-gray-200" />
                      <button onClick={handleBulkDelete} className="text-[10px] uppercase font-bold text-red-500 hover:opacity-70">删除</button>
                    </div>
                  )}
                  <Link to="/admin/service/new" className="bg-apple-blue text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:scale-105 transition-all">+ 新增服务</Link>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 select-none">
                      <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={selectedIds.size === services.length && services.length > 0} onChange={toggleAll} /></th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray">图标</th>
                      <th onClick={() => handleSort('title')} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray cursor-pointer hover:text-apple-blue">
                        服务名称 {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('category')} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray cursor-pointer hover:text-apple-blue">
                        分类 {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('pricingModel')} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray cursor-pointer hover:text-apple-blue">
                        定价 {sortConfig.key === 'pricingModel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('isPublished')} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray cursor-pointer hover:text-apple-blue">
                        状态 {sortConfig.key === 'isPublished' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-apple-gray text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sortedServices.map(s => (
                      <tr key={s.id} className={`group transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}>
                        <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                        <td className="px-4 py-4"><div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden ring-1 ring-black/5"><AdminIcon id={s.icon} /></div></td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm block truncate max-w-[180px]">{s.title}</span>
                          <span className="text-[10px] text-apple-gray uppercase tracking-wider font-semibold">{s.author || '中海科技'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">{s.category}</td>
                        <td className="px-6 py-4 text-xs text-apple-gray">{formatServicePrice(s.pricingModel, s.price)}</td>
                        <td className="px-6 py-4">
                           <button 
                            onClick={() => { const updated = services.map(x => x.id === s.id ? {...x, isPublished: !x.isPublished} : x); StorageService.saveServices(updated); setServices(updated); }} 
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all ${s.isPublished ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-400 ring-1 ring-gray-200'}`}
                           >
                            {s.isPublished ? '已上架' : '已下架'}
                           </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Link to={`/admin/service/edit/${s.id}`} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-apple-blue transition-all">✏️</Link>
                             <button onClick={() => { if(confirm('确定永久删除此服务？')){ const updated = services.filter(x => x.id !== s.id); StorageService.saveServices(updated); setServices(updated); } }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-all">🗑️</button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-20 text-center text-apple-gray italic text-sm">暂无数据，请新增服务产品</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          } />
          <Route path="/service/new" element={<AdminServiceForm onSave={loadAllData} />} />
          <Route path="/service/edit/:id" element={<AdminServiceForm onSave={loadAllData} />} />
          <Route path="/featured" element={<FeaturedList items={featured} onRefresh={loadAllData} />} />
          <Route path="/featured/new" element={<AdminFeaturedForm onSave={loadAllData} />} />
          <Route path="/featured/edit/:id" element={<AdminFeaturedForm onSave={loadAllData} />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminIcon = ({ id }: { id: string }) => {
  const [url, setUrl] = useState('');
  useEffect(() => { 
    if (id) {
      StorageService.getImage(id).then(setUrl);
    } else {
      setUrl('');
    }
  }, [id]);
  return url ? <img src={url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gray-200" />;
};

const FeaturedList = ({ items, onRefresh }: { items: FeaturedContent[], onRefresh: () => void }) => {
  const handleDelete = (id: number) => {
    if (!confirm('确定删除此专题？')) return;
    const all = StorageService.getFeatured().filter(x => x.id !== id);
    StorageService.saveFeatured(all);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">专题管理</h1>
        <Link to="/admin/featured/new" className="bg-apple-blue text-white px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all">+ 新增专题</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(f => (
          <div key={f.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group">
            <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
              <AdminIcon id={f.image} />
            </div>
            <div className="p-6">
              <h3 className="font-bold mb-2 truncate">{f.title}</h3>
              <div className="text-[10px] text-apple-gray line-clamp-2 h-8 mb-4 overflow-hidden" dangerouslySetInnerHTML={{ __html: f.description }} />
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${f.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{f.isPublished ? '已上线' : '下线'}</span>
                <div className="flex gap-2">
                  <Link to={`/admin/featured/edit/${f.id}`} className="text-apple-blue text-xs font-bold uppercase">编辑</Link>
                  <button onClick={() => handleDelete(f.id)} className="text-red-500 text-xs font-bold uppercase">删除</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminView;
