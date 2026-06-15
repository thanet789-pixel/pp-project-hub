'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, Send, CheckCircle2, RefreshCw } from 'lucide-react';

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
                  บันทึกการตั้งค่า
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
