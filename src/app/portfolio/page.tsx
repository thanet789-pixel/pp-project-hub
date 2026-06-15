'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Search, 
  Filter, 
  Folder, 
  Calendar, 
  Check, 
  Info,
  Maximize2,
  Trash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockProjects } from '@/lib/mockData';
import { Project } from '@/lib/types';

interface PortfolioItem {
  id: string;
  projectId: string;
  projectName: string;
  area: string; // e.g. "Kitchen"
  category: string; // e.g. "งานครัว (Kitchen)"
  title: string;
  description: string;
  imageUrl: string; // base64 string <= 500KB
  uploadedAt: string;
}

const PORTFOLIO_CATEGORIES = [
  'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
  'งานห้องครัว & แพนทรี (Kitchen)',
  'งานผนังตกแต่ง & บุผนัง (Wall Decoration)',
  'งานตู้วางทีวี & คอนโซล (TV Cabinet & Console)',
  'งานตู้โชว์ & ตู้หนังสือ (Display & Bookshelf)',
  'งานเตียง & หัวเตียง (Bed & Headboard)',
  'งานตกแต่งภายในอื่นๆ (Other Built-in)'
];

const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    projectId: 'p1',
    projectName: 'บ้านคุณเอก รามอินทรา',
    area: 'ห้องครัว (Kitchen)',
    category: 'งานห้องครัว & แพนทรี (Kitchen)',
    title: 'ชุดครัว Luxury Kitchen หน้าบานกระจกเงาชาทอง',
    description: 'ตู้ครัวบิวต์อินโครง HMR กันชื้น ปิดผิว High Gloss สีเทาเข้ม หน้าบานกรอบอลูมิเนียมสีทองพร้อมกระจกเงาชาทอง ท็อปหินควอตซ์ Calacatta บานพับ Soft Close จาก Blum',
    imageUrl: '/images/kitchen.png',
    uploadedAt: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 'port-2',
    projectId: 'p2',
    projectName: 'คอนโด A12 สุขุมวิท',
    area: 'ห้องนอน (Bedroom)',
    category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
    title: 'ตู้เสื้อผ้า Walk-in Closet บานเลื่อนกรอบอลูมิเนียม',
    description: 'ตู้เสื้อผ้าโครงบอร์ดพาร์ทิเคิลเมลามีนลายไม้เข้ม หน้าบานเลื่อนกระจกใสนิรภัยและไฟ LED แถบเปิด-ปิดสวิตช์เซ็นเซอร์อัตโนมัติภายในตู้',
    imageUrl: '/images/luxury_walkin_closet.png',
    uploadedAt: '2026-06-05T14:30:00.000Z'
  },
  {
    id: 'port-3',
    projectId: 'p3',
    projectName: 'ร้านกาแฟ The Wood',
    area: 'ห้องโถงหลัก (Main Hall)',
    category: 'งานผนังตกแต่ง & บุผนัง (Wall Decoration)',
    title: 'ผนังตกแต่งทีวีคอนโซลและระแนงไม้ลอฟท์',
    description: 'ผนังบิวต์อินลายหินอ่อนสีดำสลับระแนงไม้จริงทำสีธรรมชาติ ชั้นวางทีวีโครง HMR พ่นสีพาวเดอร์โค้ทสีดำด้านพร้อมซ่อนไฟเส้น Warm LED เพิ่มความพรีเมียม',
    imageUrl: '/images/luxury_tv_console.png',
    uploadedAt: '2026-06-12T09:15:00.000Z'
  }
];

export default function BuiltInPortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [projects] = useState<Project[]>(mockProjects);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PortfolioItem | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formCategory, setFormCategory] = useState(PORTFOLIO_CATEGORIES[0]);
  const [formProjectId, setFormProjectId] = useState('other');
  const [formDescription, setFormDescription] = useState('');
  const [formImageBase64, setFormImageBase64] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Image Upload Stats
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('pp_built_in_portfolio');
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved));
      } catch (e) {
        setPortfolio(INITIAL_PORTFOLIO);
      }
    } else {
      setPortfolio(INITIAL_PORTFOLIO);
      localStorage.setItem('pp_built_in_portfolio', JSON.stringify(INITIAL_PORTFOLIO));
    }
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save Portfolio helper
  const savePortfolio = (updatedList: PortfolioItem[]) => {
    setPortfolio(updatedList);
    localStorage.setItem('pp_built_in_portfolio', JSON.stringify(updatedList));
  };

  // Image Compressor function using Canvas API (strictly under 500KB)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกเฉพาะไฟล์ภาพเท่านั้น', 'error');
      return;
    }

    setIsCompressing(true);
    setOriginalSize(file.size);

    try {
      const result = await compressImageFile(file);
      setFormImageBase64(result.base64);
      setCompressedSize(result.compressedSize);
      showToast('อัปโหลดและบีบอัดภาพเรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const compressImageFile = (file: File): Promise<{ base64: string; compressedSize: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit width/height to maximum 1200px to ease compression
          const MAX_DIM = 1200;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.85;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          const getByteSize = (str: string) => {
            const base64Str = str.split(',')[1] || '';
            return base64Str.length * 0.75;
          };

          // Iterative reduction in quality to force size under 500KB
          while (getByteSize(dataUrl) > 500 * 1024 && quality > 0.1) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve({
            base64: dataUrl,
            compressedSize: getByteSize(dataUrl)
          });
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Open Modal to Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormArea('');
    setFormCategory(PORTFOLIO_CATEGORIES[0]);
    setFormProjectId('other');
    setFormDescription('');
    setFormImageBase64('');
    setOriginalSize(null);
    setCompressedSize(null);
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (item: PortfolioItem, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent lightbox opening
    setEditingItem(item);
    setFormTitle(item.title);
    setFormArea(item.area);
    setFormCategory(item.category);
    setFormProjectId(item.projectId);
    setFormDescription(item.description);
    setFormImageBase64(item.imageUrl);
    setOriginalSize(null);
    setCompressedSize(null);
    setIsModalOpen(true);
  };

  // Handle Form Submission (Create or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle || !formArea || !formDescription || !formImageBase64) {
      showToast('กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน', 'error');
      return;
    }

    const selectedProj = projects.find(p => p.id === formProjectId);
    const projectName = selectedProj ? selectedProj.name : 'โครงการอิสระ / ผลงานทั่วไป';

    if (editingItem) {
      // Edit
      const updated = portfolio.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: formTitle,
            area: formArea,
            category: formCategory,
            projectId: formProjectId,
            projectName: projectName,
            description: formDescription,
            imageUrl: formImageBase64
          };
        }
        return item;
      });
      savePortfolio(updated);
      showToast('แก้ไขข้อมูลผลงานบิวต์อินเรียบร้อย', 'success');
    } else {
      // Create
      const newItem: PortfolioItem = {
        id: 'port-' + Date.now(),
        title: formTitle,
        area: formArea,
        category: formCategory,
        projectId: formProjectId,
        projectName: projectName,
        description: formDescription,
        imageUrl: formImageBase64,
        uploadedAt: new Date().toISOString()
      };
      savePortfolio([newItem, ...portfolio]);
      showToast('เพิ่มรูปผลงานบิวต์อินใหม่เข้าคลังสำเร็จ!', 'success');
    }

    setIsModalOpen(false);
  };

  // Delete Item
  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent lightbox opening
    if (confirm('คุณต้องการลบรูปภาพผลงานชิ้นนี้ออกจากคลังระบบหรือไม่?')) {
      const updated = portfolio.filter(item => item.id !== itemId);
      savePortfolio(updated);
      showToast('ลบรายการผลงานสำเร็จ', 'success');
      if (viewingItem?.id === itemId) {
        setViewingItem(null);
      }
    }
  };
  // Filters calculation
  const filteredPortfolio = portfolio.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProjectFilter === 'all' || item.projectId === selectedProjectFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesProject && matchesCategory;
  });
  const handlePrevPortfolioItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!viewingItem) return;
    const idx = filteredPortfolio.findIndex(item => item.id === viewingItem.id);
    if (idx > 0) {
      setViewingItem(filteredPortfolio[idx - 1]);
    } else {
      setViewingItem(filteredPortfolio[filteredPortfolio.length - 1]);
    }
  };

  const handleNextPortfolioItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!viewingItem) return;
    const idx = filteredPortfolio.findIndex(item => item.id === viewingItem.id);
    if (idx < filteredPortfolio.length - 1) {
      setViewingItem(filteredPortfolio[idx + 1]);
    } else {
      setViewingItem(filteredPortfolio[0]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">คลังผลงานบิวต์อิน (Built-in Portfolio)</h2>
          <p className="text-xs text-gray-400">จัดการข้อมูลประวัติผลงานบิวต์อินระดับพรีเมียม ถอดบทเรียนสเปก และอัปโหลดแบ่งตามโปรเจกต์</p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#d4af37]/10"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผลงานเข้าคลัง</span>
        </button>
      </div>

      {/* Database Schema Sync Advice Banner */}
      <div className="p-4 bg-[#12131a]/60 border border-[#1f212d] rounded-2xl flex gap-3 items-start text-[11px] text-gray-400">
        <Info className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block">สิทธิ์การเก็บข้อมูลและเชื่อมโยงฐานข้อมูล (Database Storage Schema)</strong>
          <p>ระบบจัดเก็บภาพแบบบีบอัดภายใต้ขีดจำกัด 500KB โดยใช้ Base64 ในเครื่อง และพร้อมเชื่อมโยงกับฐานข้อมูลจริงโดยเก็บ URL บนเทเบิล `built_in_portfolio` คู่กับโปรเจกต์ `projects` ของ Supabase / PostgreSQL</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#12131a] border border-[#1f212d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171821] border border-[#2d2f3d] flex-1">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผลงาน, รายละเอียด, หรือห้อง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-500 font-medium"
            />
          </div>

          {/* Project filter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171821] border border-[#2d2f3d] min-w-[180px]">
            <Folder className="w-4 h-4 text-gray-500" />
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-[#171821]">โครงการทั้งหมด</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#171821]">{p.name}</option>
              ))}
              <option value="other" className="bg-[#171821]">ผลงานอิสระ / อื่นๆ</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171821] border border-[#2d2f3d] min-w-[200px]">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-[#171821]">หมวดหมู่งานทั้งหมด</option>
              {PORTFOLIO_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#171821]">{cat.split(' (')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 font-semibold self-end md:self-center">
          พบผลงานทั้งหมด {filteredPortfolio.length} รายการ
        </div>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolio.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item) => (
            <div 
              key={item.id}
              onClick={() => setViewingItem(item)}
              className="group rounded-2xl bg-[#12131a] border border-[#1f212d] overflow-hidden hover:border-[#c5a880]/40 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-[#c5a880]/5 cursor-pointer relative"
            >
              {/* Photo Area */}
              <div className="relative aspect-video overflow-hidden bg-[#171821] shrink-0 border-b border-[#1f212d]/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(item, e)}
                      className="p-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-[#c5a880] text-gray-300 hover:text-white transition-colors"
                      title="แก้ไขข้อมูลผลงาน"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-red-500 text-gray-300 hover:text-red-400 transition-colors"
                      title="ลบผลงานชิ้นนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    คลิกเพื่อดูรูปภาพขนาดใหญ่
                  </span>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#d4af37]/80 backdrop-blur-sm text-black border border-[#d4af37]/20 shadow-md">
                    {item.area}
                  </span>
                </div>
              </div>

              {/* Detail Area */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[9px] text-[#c5a880] font-extrabold uppercase tracking-wider block">
                    {item.category.split(' (')[0]}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#c5a880] transition-colors leading-relaxed line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-[#1f212d]/60 flex items-center justify-between text-[9px] text-gray-500">
                  <div className="flex items-center gap-1 font-semibold truncate max-w-[140px]" title={item.projectName}>
                    <Folder className="w-3 h-3 text-[#c5a880]" />
                    <span className="truncate">{item.projectName.split(' ราม')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold shrink-0">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.uploadedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-[#12131a] border border-[#1f212d] rounded-2xl space-y-3">
          <Camera className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-xs font-bold text-white">ไม่พบข้อมูลผลงานบิวต์อิน</h3>
          <p className="text-[10px] text-gray-500 max-w-sm mx-auto">ลองเปลี่ยนคำค้นหา ปรับฟิลเตอร์การกรองโครงการ หรือเพิ่มรายการผลงานบิวต์อินชิ้นแรกของคุณเข้าสู่ระบบ</p>
        </div>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {editingItem ? 'แก้ไขข้อมูลภาพผลงานบิวต์อิน' : 'อัปโหลดเพิ่มผลงานบิวต์อิน'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  {editingItem ? 'ปรับเปลี่ยนรายละเอียดสเปก หรือเปลี่ยนภาพสเปกใหม่' : 'จัดเก็บภาพถ่าย รายละเอียด และเชื่อมโยงโปรเจกต์เข้าระบบ'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors bg-[#1c1d24] p-1.5 rounded-lg border border-[#2d2f3d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-5 space-y-4 flex-1">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อผลงาน / ชื่องานชิ้นนี้ *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ตู้เสื้อผ้าบิวต์อินลายหินขัดพรีเมียม"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  {/* Room/Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">พื้นที่ / ห้อง (Room/Area) *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ห้องครัวใหญ่, Living Room"
                      value={formArea}
                      onChange={e => setFormArea(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่ผลงานหลัก *</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    >
                      {PORTFOLIO_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">เชื่อมโยงกับโปรเจกต์งานสร้าง *</label>
                    <select
                      value={formProjectId}
                      onChange={e => setFormProjectId(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                      <option value="other">โครงการอิสระ / ผลงานทั่วไป</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รายละเอียดผลงาน & สเปกวัสดุ (Hardware/Materials used) *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="กรอกรายละเอียดสเปก เช่น โครงสร้างตู้ HMR, ปิดผิวลามิเนตยี่ห้อ X, บานพับ Soft close, รูปแบบมือจับและไฟซ่อน..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors leading-relaxed"
                  />
                </div>

                {/* Image Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">อัปโหลดภาพผลงานบิวต์อิน (บีบอัดภายใต้ขีดจำกัด 500KB) *</label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 relative flex flex-col items-center justify-center min-h-[140px] ${
                      formImageBase64 
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-[#2d2f3d] hover:border-[#c5a880]/60 bg-[#14151e]/80'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {isCompressing ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="w-7 h-7 rounded-full border-2 border-t-[#c5a880] border-gray-600 animate-spin mx-auto" />
                        <span className="text-[10px] text-gray-400 font-bold block">กำลังบีบอัดไฟล์ภาพให้ไม่เกิน 500KB...</span>
                      </div>
                    ) : formImageBase64 ? (
                      <div className="w-full flex items-center justify-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={formImageBase64} 
                          alt="preview" 
                          className="h-16 w-28 object-cover rounded-lg border border-[#1f212d] shadow"
                        />
                        <div className="text-left space-y-1">
                          <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                            อัปโหลดเรียบร้อย
                          </span>
                          {originalSize && compressedSize && (
                            <p className="text-[9px] text-gray-500 font-medium">
                              ขนาดไฟล์: <span className="line-through">{(originalSize / 1024 / 1024).toFixed(2)} MB</span> ➔ <span className="text-emerald-400 font-bold">{(compressedSize / 1024).toFixed(1)} KB</span> 
                              <span className="text-[#c5a880] font-bold ml-1">
                                (บีบอัดลง {(((originalSize - compressedSize) / originalSize) * 100).toFixed(0)}%)
                              </span>
                            </p>
                          )}
                          <span className="text-[9px] text-[#c5a880] hover:underline font-extrabold cursor-pointer block mt-1">คลิกเพื่ออัปโหลดใหม่</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 text-gray-500 mx-auto" />
                        <span className="text-xs font-bold text-gray-300 block">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</span>
                        <span className="text-[9px] text-gray-500 block leading-relaxed">รองรับไฟล์ภาพ JPEG, PNG, WEBP (จำกัดขนาดและบีบอัดไม่เกิน 500KB อัตโนมัติด้วยระบบประมวลผล Canvas)</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="p-4 border-t border-[#1f212d] bg-[#12131a] flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/10"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'บันทึกการแก้ไข' : 'บันทึกและเพิ่มเข้าคลัง'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PORTFOLIO LIGHTBOX VIEWER ================= */}
      {viewingItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setViewingItem(null)}
        >
          {/* Navigation Controls - Desktop Left */}
          <button 
            type="button"
            onClick={handlePrevPortfolioItem}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:border-white text-gray-400 hover:text-white transition-all hidden md:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Navigation Controls - Desktop Right */}
          <button 
            type="button"
            onClick={handleNextPortfolioItem}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:border-white text-gray-400 hover:text-white transition-all hidden md:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div 
            className="w-full max-w-4xl bg-[#0a0b10] border border-[#1f212d] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] cursor-default animate-scaleUp relative"
            onClick={(e) => e.stopPropagation()} // prevent closing
          >
            {/* Large Image side */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative min-h-[300px] md:min-h-[450px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={viewingItem.imageUrl} 
                alt={viewingItem.title}
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]"
              />
              
              {/* Mobile quick controls overlay */}
              <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 md:hidden">
                <button
                  type="button"
                  onClick={handlePrevPortfolioItem}
                  className="px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-bold"
                >
                  ◀ ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={handleNextPortfolioItem}
                  className="px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-bold"
                >
                  ถัดไป ▶
                </button>
              </div>

              {/* Top bar indicators */}
              <div className="absolute top-4 left-4 flex gap-1">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#d4af37] text-black border border-[#d4af37]/20 shadow-md">
                  {viewingItem.area}
                </span>
              </div>
            </div>

            {/* Info details side */}
            <div className="w-full md:w-80 bg-[#12131a] border-t md:border-t-0 md:border-l border-[#1f212d] p-5 flex flex-col justify-between max-h-[40vh] md:max-h-none overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-[#c5a880] font-extrabold uppercase tracking-wider block">
                      {viewingItem.category.split(' (')[0]}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-relaxed">
                      {viewingItem.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setViewingItem(null)}
                    className="text-gray-500 hover:text-white p-1 rounded-lg border border-[#1f212d] bg-[#1c1d24]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">รายละเอียดและสเปกวัสดุ:</span>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-[#171821] p-3 rounded-xl border border-[#1f212d]/50">
                    {viewingItem.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-[10px] text-gray-400">
                  <div className="flex items-center justify-between border-b border-[#1f212d] pb-2">
                    <span>โครงการที่ผูกไว้:</span>
                    <strong className="text-white truncate font-bold">{viewingItem.projectName}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#1f212d] pb-2">
                    <span>วันที่เผยแพร่:</span>
                    <strong className="text-white font-bold">{new Date(viewingItem.uploadedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons inside lightbox */}
              <div className="pt-4 border-t border-[#1f212d] flex gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    handleOpenEditModal(viewingItem, e);
                    setViewingItem(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#1f212d] text-gray-300 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไขสเปก</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(viewingItem.id, e)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold"
                  title="ลบผลงานชิ้นนี้"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
