
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { ServiceProduct } from '../types';
import { AVAILABLE_CATEGORIES, SERVICE_TYPES, PRICING_MODELS, FEATURE_TAGS } from '../constants';

const AdminServiceForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<ServiceProduct>>({
    title: '',
    description: '',
    serviceType: SERVICE_TYPES[0],
    category: AVAILABLE_CATEGORIES[0],
    pricingModel: PRICING_MODELS[0],
    price: '',
    featureTags: [],
    highlights: [],
    caseImages: [],
    isPublished: false,
    author: '中海官方',
    icon: ''
  });
  
  const [iconPreview, setIconPreview] = useState('');
  const [casePreviews, setCasePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [manualCasePaths, setManualCasePaths] = useState('');

  useEffect(() => {
    if (id) {
      const all = StorageService.getServices();
      const existing = all.find(s => s.id === parseInt(id));
      if (existing) {
        setForm(existing);
        updatePreviews(existing);
        setManualCasePaths(existing.caseImages.filter(p => p.includes('pic/')).join('\n'));
      }
    }
  }, [id]);

  const updatePreviews = async (data: Partial<ServiceProduct>) => {
    if (data.icon) {
      const url = await StorageService.getImage(data.icon);
      setIconPreview(url);
    }
    if (data.caseImages) {
      const urls = await Promise.all(data.caseImages.map(img => StorageService.getImage(img)));
      setCasePreviews(urls);
    }
  };

  const handleIconPathChange = async (val: string) => {
    setForm(p => ({ ...p, icon: val }));
    const url = await StorageService.getImage(val);
    setIconPreview(url);
  };

  const handleManualPathsChange = async (text: string) => {
    setManualCasePaths(text);
    const paths = text.split('\n').map(p => p.trim()).filter(p => p);
    const existingUploads = form.caseImages?.filter(p => !p.includes('pic/')) || [];
    const newCaseImages = [...existingUploads, ...paths];
    setForm(p => ({ ...p, caseImages: newCaseImages }));
    const urls = await Promise.all(newCaseImages.map(img => StorageService.getImage(img)));
    setCasePreviews(urls);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'icon' | 'cases') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      if (field === 'icon') {
        const imageId = await StorageService.saveImage(files[0]);
        handleIconPathChange(imageId);
      } else {
        const newIds = [];
        for (const file of Array.from(files)) {
          const imageId = await StorageService.saveImage(file);
          newIds.push(imageId);
        }
        const updatedCases = [...(form.caseImages || []), ...newIds];
        setForm(p => ({ ...p, caseImages: updatedCases }));
        updatePreviews({ ...form, caseImages: updatedCases });
      }
    } catch (err) {
      alert('资源上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.title?.trim()) return alert('请输入服务名称');
    if (!form.icon) return alert('请设置产品图标');

    const all = StorageService.getServices();
    const now = new Date().toISOString();
    
    let updated: ServiceProduct[];
    if (id) {
      updated = all.map(s => s.id === parseInt(id) ? { ...s, ...form, updatedAt: now } as ServiceProduct : s);
    } else {
      const newService = { ...form, id: Date.now(), createdAt: now, updatedAt: now, sortOrder: all.length } as ServiceProduct;
      updated = [...all, newService];
    }
    
    StorageService.saveServices(updated);
    onSave();
    navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-bold">{id ? '修改服务产品' : '发布新服务'}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 基本信息部分 */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h2 className="text-xs font-bold text-apple-gray uppercase tracking-widest">文字信息描述</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold mb-1 block">产品标题 *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-apple-blue outline-none" placeholder="输入服务名称" />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">详细功能介绍</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-apple-blue outline-none" placeholder="描述核心优势..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-bold mb-1 block">服务分类</label>
                 <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none">
                    {AVAILABLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold mb-1 block">计费模式</label>
                 <select value={form.pricingModel} onChange={e => setForm(p => ({...p, pricingModel: e.target.value}))} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none">
                    {PRICING_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
               </div>
            </div>
          </div>
        </section>

        {/* 媒体上传部分 */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h2 className="text-xs font-bold text-apple-blue uppercase tracking-widest">产品展示资源</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold mb-2 block">产品图标</label>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden ring-1 ring-black/5 flex items-center justify-center border-2 border-dashed border-gray-300">
                  {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" alt="Preview" /> : <span className="text-2xl opacity-20">?</span>}
                </div>
                <div className="flex-grow space-y-2">
                   <div className="relative">
                    <button className="w-full py-2 text-xs font-bold bg-apple-blue text-white rounded-lg shadow-sm">上传图片文件</button>
                    <input type="file" onChange={e => handleFileUpload(e, 'icon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <input type="text" value={form.icon} onChange={e => handleIconPathChange(e.target.value)} className="w-full px-3 py-1.5 text-[10px] font-mono rounded-lg bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none" placeholder="或填写路径: pic/logo.png" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold mb-2 block">展示截图列表</label>
              <div className="relative mb-3">
                <button className="w-full py-3 text-xs font-bold border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-apple-gray hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">上传新截图</button>
                <input type="file" multiple onChange={e => handleFileUpload(e, 'cases')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-[10px] text-apple-gray mb-1 uppercase font-bold">引用预置路径 (每行一个):</p>
              <textarea 
                rows={3} 
                value={manualCasePaths} 
                onChange={e => handleManualPathsChange(e.target.value)}
                className="w-full px-3 py-2 text-[10px] font-mono rounded-xl bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 outline-none" 
                placeholder="pic/sc1.png&#10;pic/sc2.png"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xs font-bold text-apple-gray uppercase tracking-widest mb-6">资源渲染预览 (确认路径是否正确)</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {casePreviews.map((url, i) => (
             <div key={i} className="w-64 aspect-video rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden ring-1 ring-black/5 flex-shrink-0 shadow-sm border border-gray-200">
               <img src={url} className="w-full h-full object-cover" />
             </div>
           ))}
           {casePreviews.length === 0 && <div className="py-10 w-full text-center text-xs text-apple-gray italic">暂未设置截图预览</div>}
        </div>
        
        <div className="mt-10 flex gap-4">
          <button onClick={handleSave} className="flex-grow bg-apple-blue text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all">确认保存并生效</button>
          <button onClick={() => navigate('/admin')} className="px-12 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors">取消</button>
        </div>
      </section>
    </div>
  );
};

export default AdminServiceForm;
