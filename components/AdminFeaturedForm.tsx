
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { FeaturedContent, ServiceProduct } from '../types';

const AdminFeaturedForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<Partial<FeaturedContent>>({
    title: '',
    description: '',
    content: '',
    image: '',
    isPublished: true,
    sortOrder: 0,
    recommendedServices: []
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setServices(StorageService.getServices());
    if (id) {
      const all = StorageService.getFeatured();
      const existing = all.find(f => f.id === parseInt(id));
      if (existing) {
        setForm(existing);
        StorageService.getImage(existing.image).then(setPreview);
        if (editorRef.current) editorRef.current.innerHTML = existing.description || '';
      }
    }
  }, [id]);

  const handleImagePathChange = async (val: string) => {
    setForm(p => ({ ...p, image: val }));
    const url = await StorageService.getImage(val);
    setPreview(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageId = await StorageService.saveImage(file);
    handleImagePathChange(imageId);
  };

  const handleSave = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    if (!form.title || !htmlContent || !form.image) {
      alert('请完整填写标题、内容并设置封面图片');
      return;
    }

    const all = StorageService.getFeatured();
    const now = new Date().toISOString();
    
    const finalForm = { ...form, description: htmlContent };
    
    if (id) {
      const updated = all.map(f => f.id === parseInt(id) ? { ...f, ...finalForm, updatedAt: now } as FeaturedContent : f);
      StorageService.saveFeatured(updated);
    } else {
      const newItem: FeaturedContent = {
        ...finalForm,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
        sortOrder: all.length
      } as FeaturedContent;
      StorageService.saveFeatured([...all, newItem]);
    }
    
    onSave();
    navigate('/admin/featured');
  };

  const execCmd = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
  };

  // 过滤出未选中的服务供搜索选择
  const filteredAvailableServices = useMemo(() => {
    const currentRecommended = form.recommendedServices || [];
    return services.filter(s => 
      !currentRecommended.includes(s.id) && 
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm, form.recommendedServices]);

  // 获取已选中的服务详情用于显示
  const selectedServices = useMemo(() => {
    const currentRecommended = form.recommendedServices || [];
    return services.filter(s => currentRecommended.includes(s.id));
  }, [services, form.recommendedServices]);

  const toggleService = (sId: number) => {
    const current = form.recommendedServices || [];
    if (current.includes(sId)) {
      setForm(p => ({ ...p, recommendedServices: current.filter(x => x !== sId) }));
    } else if (current.length < 5) {
      setForm(p => ({ ...p, recommendedServices: [...current, sId] }));
    } else {
      alert('每个专题最多推荐 5 个服务产品');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/featured')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl">
          ←
        </button>
        <h1 className="text-2xl font-bold">专题内容配置</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        {/* 标题配置 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-apple-gray uppercase tracking-widest">专题主标题</label>
          <input 
            type="text" 
            value={form.title} 
            onChange={e => setForm(p => ({...p, title: e.target.value}))} 
            className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-apple-blue transition-all" 
            placeholder="请输入专题名称..." 
          />
        </div>

        {/* 封面图配置 */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-apple-gray uppercase tracking-widest">专题封面 (建议 21:9 高清大图)</label>
          <div className="relative aspect-[21/9] rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden group hover:border-apple-blue transition-all flex items-center justify-center shadow-inner">
             {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : (
               <div className="text-center opacity-40">
                 <span className="text-5xl block mb-2">🖼️</span>
                 <p className="text-xs font-bold uppercase">点击上传背景图片</p>
               </div>
             )}
             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-apple-gray uppercase shrink-0">手动引用 pic/ 路径:</span>
            <input 
              type="text" 
              value={form.image} 
              onChange={e => handleImagePathChange(e.target.value)} 
              className="flex-grow px-3 py-1.5 text-[10px] font-mono rounded-lg bg-gray-100 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none" 
              placeholder="例如: pic/featured_banner.png" 
            />
          </div>
        </div>

        {/* 富文本编辑 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-apple-gray uppercase tracking-widest">专题正文描述</label>
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-inner">
             <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-1">
               <button onClick={() => execCmd('bold')} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded font-bold w-8 h-8 flex items-center justify-center">B</button>
               <button onClick={() => execCmd('italic')} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded italic w-8 h-8 flex items-center justify-center">I</button>
               <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded w-8 h-8 flex items-center justify-center text-sm">List</button>
             </div>
             {/* Fix: Property 'placeholder' does not exist on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'. */}
             <div 
               ref={editorRef} 
               contentEditable 
               className="min-h-[200px] p-6 outline-none bg-white dark:bg-[#1d1d1f] prose dark:prose-invert max-w-none" 
             />
          </div>
        </div>

        {/* 关联服务选择器 */}
        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center">
             <label className="text-xs font-bold text-apple-blue uppercase tracking-widest">关联推荐服务产品 ({form.recommendedServices?.length || 0}/5)</label>
           </div>
           
           {/* 已选中列表 */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedServices.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 group animate-in slide-in-from-left-2">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 shrink-0 overflow-hidden ring-1 ring-black/5">
                    <ServiceMiniIcon icon={s.icon} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold truncate">{s.title}</h4>
                    <p className="text-[10px] text-apple-gray truncate">{s.category}</p>
                  </div>
                  <button onClick={() => toggleService(s.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                    &times;
                  </button>
                </div>
              ))}
              {selectedServices.length === 0 && (
                <div className="col-span-full py-4 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] text-apple-gray font-bold uppercase">
                  未选择推荐产品
                </div>
              )}
           </div>

           {/* 搜索添加区 */}
           <div className="space-y-3">
             <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="搜索并添加服务产品..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-apple-blue"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
             </div>
             
             <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 px-1">
                {filteredAvailableServices.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => toggleService(s.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 shrink-0 overflow-hidden">
                        <ServiceMiniIcon icon={s.icon} />
                      </div>
                      <span className="text-xs font-medium">{s.title}</span>
                    </div>
                    <button className="text-[10px] font-bold text-apple-blue uppercase hover:underline">添加</button>
                  </div>
                ))}
                {searchTerm && filteredAvailableServices.length === 0 && (
                  <div className="text-center py-4 text-[10px] text-apple-gray italic">无匹配的服务产品</div>
                )}
             </div>
           </div>
        </div>

        {/* 底部操作 */}
        <div className="pt-8 flex gap-4">
           <button onClick={handleSave} className="flex-grow bg-apple-blue text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">确认并保存专题</button>
           <button onClick={() => navigate('/admin/featured')} className="px-10 py-4 rounded-2xl font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">取消</button>
        </div>
      </div>
    </div>
  );
};

const ServiceMiniIcon = ({ icon }: { icon: string }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (icon) StorageService.getImage(icon).then(setUrl);
  }, [icon]);
  return url ? <img src={url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />;
}

export default AdminFeaturedForm;
