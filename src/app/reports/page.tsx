'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'financials' | 'tasks' | 'team'>('overview');
  const [selectedProject, setSelectedProject] = useState('all');

  // Stats Grid data
  const stats = [
    { label: 'โปรเจกต์ทั้งหมด', val: '12', unit: 'โปรเจกต์', change: '↑ 2 จากเดือนที่แล้ว', isGood: true },
    { label: 'ความคืบหน้าเฉลี่ย', val: '62%', unit: '', change: '↑ 8% จากเดือนที่แล้ว', isGood: true },
    { label: 'งานที่เสร็จสิ้น', val: '78', unit: 'งาน', change: '↑ 12 จากเดือนที่แล้ว', isGood: true },
    { label: 'งานที่ล่าช้า', val: '7', unit: 'งาน', change: '↑ 3 จากเดือนที่แล้ว', isGood: false },
    { label: 'งบประมาณรวม', val: '฿24.68M', unit: 'จาก 32.50M', change: 'ยอดจัดสรรสะสม', isGood: true },
    { label: 'ค่าใช้จ่ายจริง', val: '฿19.45M', unit: '59.85% ของงบ', change: 'ประหยัดงบได้ 15%', isGood: true }
  ];

  // Projects progress breakdown data (Thai Names)
  const projectsProgress = [
    { name: 'บ้านคุณเอก รามอินทรา', design: 100, mfg: 100, install: 75, clean: 20 },
    { name: 'คอนโด A12 สุขุมวิท', design: 100, mfg: 100, install: 30, clean: 0 },
    { name: 'ร้านกาแฟ The Wood', design: 100, mfg: 40, install: 0, clean: 0 },
    { name: 'บ้านคุณนัท บางนา', design: 100, mfg: 0, install: 0, clean: 0 },
    { name: 'โชว์รูมเฟอร์นิเจอร์', design: 100, mfg: 100, install: 90, clean: 30 },
    { name: 'บ้านคุณชัช แจ้งวัฒนะ', design: 100, mfg: 20, install: 0, clean: 0 },
    { name: 'ออฟฟิศ สำนักงานใหญ่', design: 50, mfg: 0, install: 0, clean: 0 }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">รายงานสรุป</h2>
          <p className="text-xs text-gray-400">ภาพรวมผลการดำเนินงานทางการเงิน ความก้าวหน้าโครงการ และประสิทธิภาพทีมงาน</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project selector dropdown */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-[#12131a] border border-[#1f212d] text-xs font-bold text-white px-4 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#c5a880] cursor-pointer"
            >
              <option value="all">โปรเจกต์ทั้งหมด</option>
              <option value="p1">บ้านคุณเอก รามอินทรา</option>
              <option value="p2">คอนโด A12 สุขุมวิท</option>
              <option value="p3">ร้านกาแฟ The Wood</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#c5a880] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#1f212d]">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-300">01 พ.ค. 2567 - 31 พ.ค. 2567</span>
          </div>

          {/* Export Action */}
          <button 
            onClick={() => alert('ส่งออกรายงาน (PDF/Excel)')}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#1f212d] pb-px scrollbar-none gap-2">
        {[
          { key: 'overview', label: 'ภาพรวม' },
          { key: 'progress', label: 'ความคืบหน้า' },
          { key: 'financials', label: 'การเงิน' },
          { key: 'tasks', label: 'งาน' },
          { key: 'team', label: 'ทีมงาน' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 relative -bottom-[1px] ${
              activeTab === tab.key
                ? 'border-[#d4af37] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#12131a] border border-[#1f212d]">
            <span className="text-[10px] text-gray-500 block font-medium">{item.label}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold text-white">{item.val}</span>
              {item.unit && <span className="text-[10px] text-gray-400">{item.unit}</span>}
            </div>
            <span className={`text-[9px] font-semibold mt-2 block ${
              item.isGood ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Progress Stacked Chart (Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">ความคืบหน้าของโปรเจกต์</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">แบ่งตามขั้นตอนการดำเนินงานหลัก: ออกแบบ (เขียว), ผลิต (เหลือง), ติดตั้ง (น้ำเงิน), เสร็จสิ้น (ฟ้า)</p>
          </div>

          <div className="space-y-4">
            {projectsProgress.map((proj, idx) => {
              const total = (proj.design + proj.mfg + proj.install + proj.clean) / 4;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">{proj.name}</span>
                    <span className="text-white">{Math.round(total)}%</span>
                  </div>
                  
                  {/* Stacked segment progress bar */}
                  <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${proj.design / 4}%` }} title={`ออกแบบ: ${proj.design}%`} />
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${proj.mfg / 4}%` }} title={`ผลิต: ${proj.mfg}%`} />
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${proj.install / 4}%` }} title={`ติดตั้ง: ${proj.install}%`} />
                    <div className="h-full bg-teal-500 transition-all" style={{ width: `${proj.clean / 4}%` }} title={`เก็บงาน: ${proj.clean}%`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Donut Chart (Span 1) */}
        <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">สัดส่วนงานตามสถานะ</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">วิเคราะห์จากงานมอบหมายทั้งหมด 156 งาน</p>
          </div>

          {/* SVG Donut */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#1f212d" strokeWidth="8" fill="transparent" />
              {/* Finished (40%) */}
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="0" />
              {/* In Progress (37%) */}
              <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="95.5" />
              {/* Delayed (4%) */}
              <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="183.8" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-extrabold text-white">156</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">งานทั้งหมด</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                เสร็จสิ้น
              </span>
              <span className="text-white font-bold">63 งาน (40%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                กำลังดำเนินการ
              </span>
              <span className="text-white font-bold">57 งาน (37%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                ล่าช้า
              </span>
              <span className="text-white font-bold">7 งาน (4%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                ยังไม่เริ่ม
              </span>
              <span className="text-white font-bold">29 งาน (19%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Financial Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Line Chart (Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">งบประมาณ VS ค่าใช้จ่ายจริง</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">ยอดการเงินสะสมตั้งแต่เดือน ม.ค. ถึง ธ.ค. 2567</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#d4af37]" />
                งบประมาณ (24.68M)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500" />
                ค่าใช้จ่ายจริง (19.45M)
              </span>
            </div>
          </div>

          {/* SVG Line chart wrapper */}
          <div className="h-48 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#1f212d" strokeDasharray="3 3" />
              <line x1="20" y1="60" x2="480" y2="60" stroke="#1f212d" strokeDasharray="3 3" />
              <line x1="20" y1="100" x2="480" y2="100" stroke="#1f212d" strokeDasharray="3 3" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="#1f212d" />

              {/* Budget Line (Gold) */}
              <path 
                d="M20,120 Q80,100 140,80 T260,60 T380,40 T480,25" 
                fill="none" stroke="#d4af37" strokeWidth="2.5" 
              />
              {/* Actual Line (Green) */}
              <path 
                d="M20,125 Q80,110 140,95 T260,82 T380,58 T480,48" 
                fill="none" stroke="#10b981" strokeWidth="2.5" 
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-4 text-[9px] text-gray-500 font-bold">
              <span>ม.ค.</span>
              <span>มี.ค.</span>
              <span>พ.ค.</span>
              <span>ก.ค.</span>
              <span>ก.ย.</span>
              <span>พ.ย.</span>
              <span>ธ.ค.</span>
            </div>
          </div>
        </div>

        {/* Expenses Category Donut (Span 1) */}
        <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">ค่าใช้จ่ายตามหมวดหมู่</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">ยอดรวม ฿19.45M แบ่งตามต้นทุนจัดซื้อ</p>
          </div>

          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#1f212d" strokeWidth="8" fill="transparent" />
              {/* Wood / Materials (43%) */}
              <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="0" />
              {/* Labour (22%) */}
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="102.6" />
              {/* Subcontractor (19%) */}
              <circle cx="50" cy="50" r="38" stroke="#8b5cf6" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="155.1" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-extrabold text-white">฿19.45M</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold">รวมค่าใช้จ่าย</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] text-gray-400">
            <div className="flex justify-between items-center">
              <span>🔵 วัสดุ</span>
              <span className="text-white font-bold">8.45M (43%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🟢 แรงงาน</span>
              <span className="text-white font-bold">4.32M (22%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🟣 ผู้รับเหมา</span>
              <span className="text-white font-bold">3.65M (19%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Near Completion List */}
        <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">โปรเจกต์ที่ใกล้เสร็จ</h3>
          <div className="space-y-3">
            {[
              { name: 'บ้านคุณเอก รามอินทรา', val: 75, date: '18 มิ.ย. 67', remain: '18 วัน' },
              { name: 'คอนโด A12 สุขุมวิท', val: 40, date: '5 ก.ค. 67', remain: '35 วัน' },
              { name: 'ร้านกาแฟ The Wood', val: 20, date: '20 ก.ค. 67', remain: '50 วัน' }
            ].map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{p.name}</span>
                  <span className="text-[9px] text-gray-500 block">กำหนดเสร็จ: {p.date} • เหลือ {p.remain}</span>
                </div>
                <span className="font-bold text-[#d4af37]">{p.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Delayed Tasks List */}
        <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">งานที่ล่าช้ามากที่สุด</h3>
          <div className="space-y-3">
            {[
              { name: 'ติดตั้งตู้เสื้อผ้า ห้องนอน 1', proj: 'บ้านคุณเอก', delay: 'ล่าช้า 5 วัน' },
              { name: 'ผลิตเคาน์เตอร์ครัว', proj: 'คอนโด A12', delay: 'ล่าช้า 4 วัน' },
              { name: 'ติดตั้งผนังตกแต่ง TV', proj: 'ร้านกาแฟ The Wood', delay: 'ล่าช้า 3 วัน' }
            ].map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{t.name}</span>
                  <span className="text-[9px] text-gray-500 block">โครงการ: {t.proj}</span>
                </div>
                <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[10px]">
                  {t.delay}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance List */}
        <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">ประสิทธิภาพทีมงาน</h3>
          <div className="space-y-3">
            {[
              { name: 'ช่างไม้', val: 85 },
              { name: 'ช่างติดตั้ง', val: 78 },
              { name: 'ช่างสี', val: 64 },
              { name: 'ช่างไฟ', val: 55 }
            ].map((tm, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-300">{tm.name}</span>
                  <span className="text-white">{tm.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${tm.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
