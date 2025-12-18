
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
    const id = await StorageService.saveImage(file);
    handleImagePathChange(id);
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

  const filteredServices = useMemo(() => {
    return services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [services, searchTerm]);

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
        <button onClick={() => navigate('/admin/featured')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-bold">专题内容配置</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-apple-gray">专题大标题</label>
          <input 
            type="text" 
            value={form.title} 
            onChange={e => setForm(p => ({...p, title: e.target.value}))} 
            className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 outline-none focus:ring-2 ring-apple-blue" 
            placeholder="请输入吸引人的专题名称..." 
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-apple-gray">专题大图封面 (高清)</label>
          <div className="relative aspect-[21/9] rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden group hover:border-apple-blue transition-all flex items-center justify-center">
             {preview ? <img src={preview} className="w-full h-full object-cover" /> : (
               <div className="text-center opacity-40">
                 <span className="text-5xl block mb-2">🖼️</span>
                 <p className="text-xs font-bold uppercase">点击上传背景图片</p>
               </div>
             )}
             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-apple-gray uppercase shrink-0">手动路径引用:</span>
            <input 
              type="text" 
              value={form.image} 
              onChange={e => handleImagePathChange(e.target.value)} 
              className="flex-grow px-3 py-1.5 text-[10px] font-mono rounded-lg bg-gray-100 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none" 
              placeholder="例如: pic/featured_main.png" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-apple-gray">专题详细介绍 (支持富文本)</label>
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-inner">
             <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-1">
               <button onClick={() => execCmd('bold')} className="p-2 hover:bg-white rounded font-bold">B</button>
               <button onClick={() => execCmd('italic')} className="p-2 hover:bg-white rounded italic">I</button>
               <button onClick={() => execCmd('insertText', '★')} className="p-2 hover:bg-white rounded">★</button>
             </div>
             <div ref={editorRef} contentEditable className="min-h-[250px] p-6 outline-none bg-white dark:bg-[#1d1d1f]" />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex gap-4">
           <button onClick={handleSave} className="flex-grow bg-apple-blue text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:opacity-95 transition-all">保存专题内容</button>
           <button onClick={() => navigate('/admin/featured')} className="px-10 py-4 rounded-2xl font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">取消</button>
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturedForm;
