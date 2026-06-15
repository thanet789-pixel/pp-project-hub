'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Send, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { Project } from '@/lib/types';
import { mockProjects } from '@/lib/mockData';

interface CustomBg {
  id: string;
  name: string;
  dataUrl: string;
}

export default function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'theme' | 'notifications' | 'line'>('theme');
  const [lineConnected, setLineConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://pp-project-hub.vercel.app/api/webhooks/line');
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_sidebar_theme') || 'obsidian';
    }
    return 'obsidian';
  });

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    localStorage.setItem('app_sidebar_theme', themeName);
    // Notify same window instantly
    window.dispatchEvent(new Event('themeChange'));
  };

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pp_projects');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return mockProjects;
  });

  const [projLineGroupIds, setProjLineGroupIds] = useState<Record<string, string>>(() => {
    const initialIds: Record<string, string> = {};
    projects.forEach(p => {
      initialIds[p.id] = p.lineGroupId || '';
    });
    return initialIds;
  });

  const handleProjectLineIdChange = (projId: string, value: string) => {
    setProjLineGroupIds(prev => ({
      ...prev,
      [projId]: value
    }));
  };

  const handleSaveProjectLineId = (projId: string) => {
    const updatedLineGroupId = projLineGroupIds[projId] || '';
    
    // Update projects state
    const updatedProjects = projects.map(p => {
      if (p.id === projId) {
        return { ...p, lineGroupId: updatedLineGroupId };
      }
      return p;
    });

    setProjects(updatedProjects);
    localStorage.setItem('pp_projects', JSON.stringify(updatedProjects));
    alert('บันทึกการเชื่อมต่อ LINE Group สำเร็จ!');
  };

  // --- Background Image Management States & Handlers ---
  const [activeBgImage, setActiveBgImage] = useState<string>('');
  const [customBgList, setCustomBgList] = useState<CustomBg[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedActiveBg = localStorage.getItem('app_active_bg_image') || '';
    setActiveBgImage(savedActiveBg);

    const savedCustomBgs = localStorage.getItem('app_custom_bg_list');
    if (savedCustomBgs) {
      try {
        setCustomBgList(JSON.parse(savedCustomBgs));
      } catch (e) {
        setCustomBgList([]);
      }
    }
  }, []);

  const handleSelectBg = (bgUrl: string) => {
    setActiveBgImage(bgUrl);
    if (bgUrl) {
      localStorage.setItem('app_active_bg_image', bgUrl);
    } else {
      localStorage.removeItem('app_active_bg_image');
    }
    window.dispatchEvent(new Event('bgImageChange'));
  };

  const compressImage = (file: File): Promise<string> => {
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

          // Resize to max 1600px width/height to keep resolution clean but size small
          const MAX_SIZE = 1600;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
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

          // Start with quality 0.75 and compress to stay under 500KB
          let quality = 0.75;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Approximate size of dataurl base64 is length * 0.75
          while (dataUrl.length * 0.75 > 500000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedUrl = await compressImage(file);
      
      const newBg: CustomBg = {
        id: Date.now().toString(),
        name: file.name.split('.').slice(0, -1).join('.') || 'ภาพพื้นหลังใหม่',
        dataUrl: compressedUrl,
      };

      const updatedList = [...customBgList, newBg];
      setCustomBgList(updatedList);
      localStorage.setItem('app_custom_bg_list', JSON.stringify(updatedList));

      // Auto select the uploaded background
      handleSelectBg(compressedUrl);
      
      // Reset input value
      e.target.value = '';
    } catch (err) {
      console.error('Error uploading/compressing image:', err);
      alert('เกิดข้อผิดพลาดในการประมวลผลไฟล์รูปภาพ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleDeleteBg = (id: string, dataUrl: string) => {
    if (!confirm('คุณต้องการลบภาพพื้นหลังนี้ใช่หรือไม่?')) return;

    const updatedList = customBgList.filter(bg => bg.id !== id);
    setCustomBgList(updatedList);
    localStorage.setItem('app_custom_bg_list', JSON.stringify(updatedList));

    if (activeBgImage === dataUrl) {
      handleSelectBg('');
    }
  };

  const handleRenameBg = (id: string, currentName: string) => {
    const newName = prompt('ระบุชื่อภาพพื้นหลังใหม่:', currentName);
    if (newName === null || newName.trim() === '') return;

    const updatedList = customBgList.map(bg => {
      if (bg.id === id) {
        return { ...bg, name: newName.trim() };
      }
      return bg;
    });
    setCustomBgList(updatedList);
    localStorage.setItem('app_custom_bg_list', JSON.stringify(updatedList));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-[#1f212d] pb-4">
        <h2 className="text-lg font-bold text-white tracking-wide">ตั้งค่าระบบ</h2>
        <p className="text-xs text-gray-400">จัดการโปรไฟล์บริษัท ธีมสีระบบ การแจ้งเตือน และการเชื่อมต่อบริการภายนอก</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sub-navigation */}
        <div className="space-y-1">
          {[
            { key: 'profile', label: 'โปรไฟล์บริษัท' },
            { key: 'theme', label: 'ธีมสีระบบ & เมนูบาร์' },
            { key: 'notifications', label: 'การแจ้งเตือนระบบ' },
            { key: 'line', label: 'LINE Integration & API' }
          ].map(sub => (
            <button
              key={sub.key}
              onClick={() => setActiveSubTab(sub.key as any)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeSubTab === sub.key
                  ? 'bg-gradient-to-r from-[#d4af37]/15 to-transparent text-[#c5a880] border-l-2 border-[#d4af37]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Right Settings panel (Span 3) */}
        <div className="lg:col-span-3">
          
          {/* THEME & APPEARANCE SETTINGS */}
          {activeSubTab === 'theme' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">ตั้งค่าธีมระบบ & เมนูบาร์ (System Theme & Sidebar)</h3>
                <p className="text-xs text-gray-400 mt-1">เลือกเฉดสีของแถบเมนูบาร์ (Sidebar) และส่วนหัว (Header) ให้เหมาะกับสไตล์แบรนด์และความต้องการของคุณ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'obsidian',
                    label: 'Classic Obsidian (ดำมืดคลาสสิก)',
                    desc: 'ดีไซน์ดำหรูหราแบบดั้งเดิมของ PP Project Hub สะอาดและสงบตา',
                    previewClass: 'bg-[#0a0b10] border-[#1a1c26]',
                  },
                  {
                    key: 'navy',
                    label: 'Royal Navy & Gold (น้ำเงินกรมท่าทอง)',
                    desc: 'โทนสีน้ำเงินน้ำทะเลพรีเมียม ขับเน้นคู่สเปกสีทองคำและงานตกแต่งภายใน',
                    previewClass: 'bg-[#0f172a] border-[#1e293b]',
                  },
                  {
                    key: 'charcoal',
                    label: 'Regal Charcoal (เทาชาโคลโมเดิร์น)',
                    desc: 'โทนสีเทาดำเข้มสไตล์ลอฟท์/สถาปัตยกรรมโมเดิร์นคลาสสิก',
                    previewClass: 'bg-[#18181b] border-[#27272a]',
                  },
                  {
                    key: 'glass',
                    label: 'Glassmorphism Translucent (โปร่งใสลอยตัว)',
                    desc: 'พื้นหลังซีทรูแบบกระจกฝ้า แสดงภาพพื้นหลัง Parallax ลายพิมพ์เขียวของแอป',
                    previewClass: 'bg-black/40 backdrop-blur-md border-white/10',
                  },
                ].map(themeItem => (
                  <button
                    key={themeItem.key}
                    type="button"
                    onClick={() => handleThemeChange(themeItem.key)}
                    className={`p-4 rounded-xl text-left border transition-all duration-300 relative flex flex-col justify-between h-32 ${
                      selectedTheme === themeItem.key
                        ? 'border-[#c5a880] bg-[#c5a880]/5 shadow-lg shadow-[#c5a880]/5'
                        : 'border-[#1f212d] hover:border-gray-600 bg-[#171821]/30 hover:bg-[#171821]/50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{themeItem.label}</span>
                      <span className="text-[10px] text-gray-500 block mt-1 leading-relaxed">{themeItem.desc}</span>
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-[#1f212d]/50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-gray-400">ตัวอย่าง:</span>
                        <div className={`w-8 h-4 rounded border ${themeItem.previewClass}`} />
                      </div>
                      {selectedTheme === themeItem.key && (
                        <span className="text-[9px] font-extrabold text-[#c5a880] uppercase tracking-wider bg-[#c5a880]/15 px-2 py-0.5 rounded-md border border-[#c5a880]/30 animate-pulse">
                          ใช้งานอยู่
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <hr className="border-[#1f212d]" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">การจัดการภาพพื้นหลังระบบ (System Background Image)</h3>
                  <p className="text-xs text-gray-400 mt-1">อัปโหลด ลบ หรือสลับเปลี่ยนภาพพื้นหลังโครงการของคุณ โดยระบบจะบีบอัดรูปภาพให้เร็วและคมชัดโดยอัตโนมัติ</p>
                </div>

                {/* Upload Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#161720]/40 p-4 rounded-xl border border-[#1f212d]">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">อัปโหลดภาพพื้นหลังส่วนตัว</span>
                    <span className="text-[10px] text-gray-500 block">รองรับ JPG/PNG ระบบบีบอัดภาพไม่เกิน 500KB อัตโนมัติ</span>
                  </div>
                  <label className="cursor-pointer py-2 px-4 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-black font-bold text-xs transition-colors shrink-0">
                    เลือกไฟล์รูปภาพ...
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadBg} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Background Grid */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wide">ภาพพื้นหลังทั้งหมดในระบบ:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    
                    {/* Preset 1 (Default Obsidian) */}
                    <div 
                      onClick={() => handleSelectBg('')}
                      className={`p-2 rounded-xl border cursor-pointer hover:border-gray-500 transition-all flex flex-col justify-between h-36 ${
                        activeBgImage === '' 
                          ? 'border-[#c5a880] bg-[#c5a880]/5' 
                          : 'border-[#1f212d] bg-[#171821]/30'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <img src="/images/company_bg.jpg" className="w-full h-full object-cover" alt="Obsidian" />
                      </div>
                      <div className="pt-2 text-center">
                        <span className="text-[10px] font-bold text-white block">Classic Obsidian</span>
                        <span className="text-[8px] text-gray-500 block mt-0.5">ภาพตั้งต้นระบบ</span>
                      </div>
                    </div>

                    {/* Preset 2 (Concrete Blueprint) */}
                    <div 
                      onClick={() => handleSelectBg('/images/luxury_interior_bg.png')}
                      className={`p-2 rounded-xl border cursor-pointer hover:border-gray-500 transition-all flex flex-col justify-between h-36 ${
                        activeBgImage === '/images/luxury_interior_bg.png' 
                          ? 'border-[#c5a880] bg-[#c5a880]/5' 
                          : 'border-[#1f212d] bg-[#171821]/30'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <img src="/images/luxury_interior_bg.png" className="w-full h-full object-cover" alt="Blueprint" />
                      </div>
                      <div className="pt-2 text-center">
                        <span className="text-[10px] font-bold text-white block">Concrete Blueprint</span>
                        <span className="text-[8px] text-gray-500 block mt-0.5">พิมพ์เขียวสุดหรู</span>
                      </div>
                    </div>

                    {/* Preset 3 (Walk-in Closet) */}
                    <div 
                      onClick={() => handleSelectBg('/images/luxury_walkin_closet.png')}
                      className={`p-2 rounded-xl border cursor-pointer hover:border-gray-500 transition-all flex flex-col justify-between h-36 ${
                        activeBgImage === '/images/luxury_walkin_closet.png' 
                          ? 'border-[#c5a880] bg-[#c5a880]/5' 
                          : 'border-[#1f212d] bg-[#171821]/30'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <img src="/images/luxury_walkin_closet.png" className="w-full h-full object-cover" alt="Closet" />
                      </div>
                      <div className="pt-2 text-center">
                        <span className="text-[10px] font-bold text-white block">Walk-in Closet</span>
                        <span className="text-[8px] text-gray-500 block mt-0.5">ภาพห้องแต่งตัว</span>
                      </div>
                    </div>

                    {/* Preset 4 (TV Console) */}
                    <div 
                      onClick={() => handleSelectBg('/images/luxury_tv_console.png')}
                      className={`p-2 rounded-xl border cursor-pointer hover:border-gray-500 transition-all flex flex-col justify-between h-36 ${
                        activeBgImage === '/images/luxury_tv_console.png' 
                          ? 'border-[#c5a880] bg-[#c5a880]/5' 
                          : 'border-[#1f212d] bg-[#171821]/30'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <img src="/images/luxury_tv_console.png" className="w-full h-full object-cover" alt="Console" />
                      </div>
                      <div className="pt-2 text-center">
                        <span className="text-[10px] font-bold text-white block">TV Console Marble</span>
                        <span className="text-[8px] text-gray-500 block mt-0.5">ชั้นวางทีวีหินอ่อน</span>
                      </div>
                    </div>

                    {/* Custom Uploaded Backgrounds */}
                    {customBgList.map((bg) => (
                      <div 
                        key={bg.id}
                        className={`p-2 rounded-xl border relative group/bg flex flex-col justify-between h-36 ${
                          activeBgImage === bg.dataUrl 
                            ? 'border-[#c5a880] bg-[#c5a880]/5' 
                            : 'border-[#1f212d] bg-[#171821]/30'
                        }`}
                      >
                        <div 
                          onClick={() => handleSelectBg(bg.dataUrl)}
                          className="w-full h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 cursor-pointer"
                        >
                          <img src={bg.dataUrl} className="w-full h-full object-cover" alt={bg.name} />
                        </div>
                        <div className="pt-2 text-center relative">
                          <span className="text-[10px] font-bold text-white block truncate px-4">{bg.name}</span>
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-x-0 bottom-0 bg-[#090a10]/95 flex items-center justify-center gap-2 opacity-0 group-hover/bg:opacity-100 transition-opacity py-0.5">
                            <button 
                              type="button" 
                              onClick={() => handleRenameBg(bg.id, bg.name)}
                              className="text-[9px] text-[#c5a880] hover:underline font-bold"
                            >
                              แก้ไขชื่อ
                            </button>
                            <span className="text-gray-700 text-[9px]">•</span>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteBg(bg.id, bg.dataUrl)}
                              className="text-[9px] text-rose-400 hover:underline font-bold"
                            >
                              ลบภาพ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </div>
            </div>
          )}
          
          {/* PROFILE SETTINGS */}
          {activeSubTab === 'profile' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">โปรไฟล์บริษัท</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">ชื่อบริษัท *</label>
                  <input type="text" defaultValue="PP Interior & Built-in Studio" className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">เลขจดทะเบียนพาณิชย์</label>
                  <input type="text" defaultValue="0105561000000" className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white" />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeSubTab === 'notifications' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">การตั้งค่าแจ้งเตือน</h3>
              <div className="space-y-3">
                {[
                  { label: 'แจ้งเตือนเมื่อไซท์งานเกิดความล่าช้าสะสม', desc: 'ส่งการแจ้งเตือนด่วนหา PM และผู้บริหาร' },
                  { label: 'แจ้งเตือนการเปลี่ยนแปลงวัสดุและแบบของลูกค้า', desc: 'แจ้งทีมออกแบบและจัดซื้อทันที' },
                  { label: 'รับอีเมลรายงานทางการเงินสิ้นเดือน', desc: 'สรุปงบประมาณเปรียบเทียบค่าใช้จ่ายจริงรายเดือน' }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-[#1f212d] text-[#d4af37]" />
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* LINE INTEGRATION SETTINGS */}
          {activeSubTab === 'line' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6 animate-fadeIn">
              
              <div>
                <h3 className="text-sm font-bold text-white">เชื่อมต่อ LINE Group & LINE Notify</h3>
                <p className="text-xs text-gray-400 mt-1">ตั้งค่าเชื่อมต่อกลุ่ม LINE เพื่อส่งข้อความภาพความคืบหน้าหน้างาน รายการตรวจสอบ (Timeline) และรับรายงานความก้าวหน้าประจำวันโดยอัตโนมัติ</p>
              </div>

              {/* Status widget */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                lineConnected 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${lineConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      สถานะ: {lineConnected ? 'เชื่อมต่อ LINE Notify เรียบร้อย' : 'รอการกำหนดค่าการเชื่อมต่อ'}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {lineConnected ? 'สามารถกระจายแจ้งเตือนและแชทกับลูกค้าได้แล้ว' : 'กรุณาเปิดการใช้งานหรือเชื่อมต่อบัญชี'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLineConnected(!lineConnected)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-[10px] transition-colors ${
                    lineConnected 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-[#c5a880] text-black hover:bg-[#b0936b]'
                  }`}
                >
                  {lineConnected ? 'ยกเลิกการเชื่อมต่อ' : 'เชื่อมต่อตอนนี้'}
                </button>
              </div>

              {/* Configuration fields */}
              <div className="space-y-4 pt-4 border-t border-[#1f212d]">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">LINE Webhook URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white font-mono focus:outline-none" 
                    />
                    <button 
                      onClick={() => alert('รีเฟรช URL Webhook')}
                      className="p-2 bg-white/5 border border-[#1f212d] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">LINE Channel ID</label>
                    <input type="password" value="••••••••••••••" readOnly className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">LINE Channel Secret</label>
                    <input type="password" value="••••••••••••••••••••••••••••••••" readOnly className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#1f212d]">
                <button className="px-4 py-2 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b]">
                  บันทึกการตั้งค่าทั่วไป
                </button>
              </div>

              {/* Project LINE Connections */}
              <div className="pt-6 border-t border-[#1f212d] space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a880]">
                    เชื่อมต่อ LINE Group ID รายโครงการ (Project LINE Group Connections)
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    กำหนด LINE Group ID สำหรับแต่ละโครงการ เพื่อให้ระบบ LINE Bot ดึงภาพถ่ายความคืบหน้าหน้างานและรายงานเหตุการณ์ต่าง ๆ เข้ามายังไทม์ไลน์และแกลเลอรีของโครงการนั้น ๆ ได้อย่างถูกต้อง
                  </p>
                </div>

                <div className="space-y-2.5">
                  {projects.map((proj) => (
                    <div 
                      key={proj.id} 
                      className="p-4 rounded-xl bg-[#161720]/80 border border-[#2b2e3e] flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">{proj.name}</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5 truncate">📍 {proj.address}</span>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto">
                        <input 
                          type="text" 
                          value={projLineGroupIds[proj.id] || ''}
                          onChange={(e) => handleProjectLineIdChange(proj.id, e.target.value)}
                          placeholder="กรอกรหัสกลุ่ม LINE เช่น C87654..."
                          className="px-3 py-1.5 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white font-mono w-full md:w-64 focus:outline-none focus:border-[#c5a880] transition-colors" 
                        />
                        <button 
                          onClick={() => handleSaveProjectLineId(proj.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-black font-bold text-xs whitespace-nowrap transition-colors"
                        >
                          บันทึกเชื่อมต่อ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Helpful guides on how to get the Group ID */}
                <div className="p-4 rounded-xl bg-[#14161e] border border-[#1f212d] space-y-3">
                  <div className="flex items-center gap-2 text-[#c5a880] text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>💡 วิธีการดึงรหัส LINE Group ID เพื่อมาเชื่อมโยงโครงการ</span>
                  </div>
                  <ol className="text-[11px] text-gray-400 space-y-2 list-decimal pl-4 leading-relaxed">
                    <li>
                      <strong>ดึงบอทเข้ากลุ่ม</strong>: ตรวจสอบว่าได้เชิญ LINE Bot เข้าไปในกลุ่ม LINE ของช่างติดตั้งหน้างานแล้ว
                    </li>
                    <li>
                      <strong>พิมพ์ข้อความกระตุ้น</strong>: พิมพ์คำว่า <code className="text-white font-mono bg-[#1f212d] px-1 py-0.5 rounded">#ID</code> หรือ <code className="text-white font-mono bg-[#1f212d] px-1 py-0.5 rounded">@check</code> ส่งเข้าไปในห้องแชทกลุ่มนั้นๆ
                    </li>
                    <li>
                      <strong>คัดลอกรหัสกลุ่ม</strong>: บอทจะตอบกลับข้อความพร้อมรหัสกลุ่มขึ้นต้นด้วยตัว <code className="text-[#c5a880] font-mono bg-[#1f212d] px-1 py-0.5 rounded">C</code> (เช่น <code className="text-white font-mono bg-[#1f212d] px-1.5 py-0.5 rounded">C876543210abcdef...</code>) แล้วนำมาใส่และกดบันทึกในช่องด้านบนนี้
                    </li>
                  </ol>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
