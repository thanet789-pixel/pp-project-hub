'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Folder, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Camera, 
  Plus, 
  Clipboard, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  FileImage,
  Sparkles,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';
import { mockProjects, mockUsers, mockTimelineEvents } from '@/lib/mockData';
import { Project, ProjectStatus } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Modal form states
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjAddress, setNewProjAddress] = useState('');

  // Status helper mapping
  const getStatusDetails = (status: ProjectStatus) => {
    switch (status) {
      case 'design':
        return { label: 'ออกแบบ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'manufacturing':
        return { label: 'ผลิต', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'installation':
        return { label: 'ติดตั้ง', color: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/20' };
      case 'completion':
        return { label: 'เก็บงาน', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'material_pending':
        return { label: 'รอวัสดุ', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'delay':
        return { label: 'ล่าช้า', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default:
        return { label: 'ทั่วไป', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName) return;

    const newProject: Project = {
      id: `p${projects.length + 1}`,
      name: newProjName,
      description: newProjDesc,
      address: newProjAddress,
      coverUrl: '/images/kitchen.png',
      status: 'design',
      progress: 5,
      budget: Number(newProjBudget) || 500000,
      actualSpent: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pmId: 'u2',
      clientId: 'u7'
    };

    setProjects([newProject, ...projects]);
    setIsCreateModalOpen(false);
    // Reset fields
    setNewProjName('');
    setNewProjDesc('');
    setNewProjBudget('');
    setNewProjAddress('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Upper Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card: Total Projects */}
        <Link 
          href="/projects" 
          className="p-5 rounded-2xl glass-card glass-card-hover group cursor-pointer block relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(212,175,55,0.15)] hover:border-[#d4af37]/40"
        >
          {/* Subtle grid and ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#d4af37]/10 transition-colors" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d4af37]/15 to-[#c5a880]/5 text-[#d4af37] border border-[#d4af37]/25 shadow-[0_0_12px_rgba(212,175,55,0.15)] group-hover:scale-110 transition-transform duration-300">
              <Folder className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>↑ 2 สัปดาห์นี้</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[9px] text-[#c5a880] font-extrabold uppercase tracking-wider">โปรเจกต์ทั้งหมด</p>
            <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-baseline gap-1.5">
              18 <span className="text-xs font-medium text-gray-500">โครงการ</span>
            </h3>
          </div>
        </Link>

        {/* Card: Active Tasks */}
        <Link 
          href="/tasks" 
          className="p-5 rounded-2xl glass-card glass-card-hover group cursor-pointer block relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(59,130,246,0.15)] hover:border-blue-500/40"
        >
          {/* Subtle grid and ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-blue-500/10 transition-colors" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/5 text-blue-400 border border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>↑ 5 งานใหม่</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-wider">งานกำลังทำ</p>
            <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-baseline gap-1.5">
              24 <span className="text-xs font-medium text-gray-500">งาน</span>
            </h3>
          </div>
        </Link>

        {/* Card: Delayed Tasks */}
        <Link 
          href="/tasks" 
          className="p-5 rounded-2xl glass-card glass-card-hover group cursor-pointer block relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(244,63,94,0.15)] hover:border-rose-500/40"
        >
          {/* Subtle grid and ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-rose-500/10 transition-colors" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/5 text-rose-400 border border-rose-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)] group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold">
              <ArrowDownRight className="w-3 h-3" />
              <span>↓ 1 งานค้าง</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[9px] text-rose-400 font-extrabold uppercase tracking-wider">งานล่าช้า</p>
            <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-baseline gap-1.5">
              3 <span className="text-xs font-medium text-gray-500">งาน</span>
            </h3>
          </div>
        </Link>

        {/* Card: Completed Tasks */}
        <Link 
          href="/tasks" 
          className="p-5 rounded-2xl glass-card glass-card-hover group cursor-pointer block relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(16,185,129,0.15)] hover:border-emerald-500/40"
        >
          {/* Subtle grid and ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>↑ 12 สำเร็จ</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">เสร็จสมบูรณ์</p>
            <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-baseline gap-1.5">
              56 <span className="text-xs font-medium text-gray-500">งาน</span>
            </h3>
          </div>
        </Link>

      </div>

      {/* 2. Main content area: Projects & Sidebar Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Projects List (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl glass-card border border-[#1a1c26]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">โปรเจกต์ล่าสุด</h2>
                <p className="text-xs text-gray-400 mt-1">รายการความคืบหน้าของโครงการ built-in ที่กำลังดำเนินงาน</p>
              </div>
              <Link href="/projects" className="text-xs text-[#c5a880] hover:text-[#d4af37] flex items-center gap-1 font-bold group">
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {projects.slice(0, 4).map((proj) => {
                const status = getStatusDetails(proj.status);
                // Custom colors for progress bar indicator
                const getProgressColor = (val: number) => {
                  if (val < 20) return 'bg-purple-500';
                  if (val < 50) return 'bg-blue-500';
                  return 'bg-[#d4af37]';
                };

                return (
                  <div 
                    key={proj.id} 
                    onClick={() => router.push(`/projects/${proj.id}`)}
                    className="p-4 rounded-xl bg-[#12131a]/40 border border-[#1a1c26] hover:border-[#c5a880]/30 hover:bg-[#12131a]/85 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >

                    <div className="flex items-center gap-4">
                      {/* Project image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shrink-0 relative">
                        {/* Fallback pattern if cover is not loaded */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#12131a] to-gray-700/50 flex items-center justify-center">
                          <Folder className="w-6 h-6 text-gray-500" />
                        </div>
                        {proj.coverUrl && (
                          <img 
                            src={proj.coverUrl} 
                            alt={proj.name} 
                            className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>

                      {/* Project Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{proj.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{proj.description}</p>
                        
                        {/* Fake member avatars */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-[#12131a] bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-300">
                                {String.fromCharCode(64 + n)}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">+3</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Due date */}
                    <div className="w-full sm:w-48 flex flex-col sm:items-end justify-center shrink-0">
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full text-xs font-semibold text-gray-400">
                        <span className="sm:hidden text-gray-500">ครบกำหนด:</span>
                        <span>ครบกำหนด 18 มิ.ย. 2567</span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="mt-2 w-full">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-gray-500">ความคืบหน้า</span>
                          <span className="font-bold text-white">{proj.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(proj.progress)}`} 
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts Widget */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d]">
            <h3 className="text-sm font-bold text-white mb-4 tracking-wide">ทางลัด</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              
              <button 
                onClick={() => alert('จำลองการอัปโหลดรูปภาพ')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-200 group text-center"
              >
                <div className="p-3 rounded-lg bg-[#090a0f] text-[#c5a880] group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs text-white font-bold mt-3">อัปโหลดรูป</span>
                <span className="text-[9px] text-gray-500 mt-1">ถ่ายหรืออัปโหลด</span>
              </button>

              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-200 group text-center"
              >
                <div className="p-3 rounded-lg bg-[#090a0f] text-[#c5a880] group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs text-white font-bold mt-3">สร้างโปรเจกต์</span>
                <span className="text-[9px] text-gray-500 mt-1">เริ่มโปรเจกต์ใหม่</span>
              </button>

              <button 
                onClick={() => router.push('/tasks')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-200 group text-center"
              >
                <div className="p-3 rounded-lg bg-[#090a0f] text-[#c5a880] group-hover:scale-105 transition-transform">
                  <Clipboard className="w-5 h-5" />
                </div>
                <span className="text-xs text-white font-bold mt-3">สร้างงาน</span>
                <span className="text-[9px] text-gray-500 mt-1">เพิ่มงานใหม่</span>
              </button>

              <button 
                onClick={() => router.push('/messages')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-200 group text-center"
              >
                <div className="p-3 rounded-lg bg-[#090a0f] text-[#c5a880] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs text-white font-bold mt-3">ข้อความ</span>
                <span className="text-[9px] text-gray-500 mt-1">ส่งข้อความในทีม</span>
              </button>

              <button 
                onClick={() => router.push('/calendar')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-200 group text-center col-span-2 sm:col-span-1"
              >
                <div className="p-3 rounded-lg bg-[#090a0f] text-[#c5a880] group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs text-white font-bold mt-3">ปฏิทิน</span>
                <span className="text-[9px] text-gray-500 mt-1">ดูตารางงาน</span>
              </button>

            </div>
          </div>

        </div>

        {/* Right Column: Activities & AI Summaries (Span 1) */}
        <div className="space-y-6">
          
          {/* Recent Activities */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">กิจกรรมล่าสุด</h3>
                <p className="text-[10px] text-gray-400">ฟีดความเคลื่อนไหวจากไซท์งาน</p>
              </div>
              <Link href="/projects/p1" className="text-xs text-[#c5a880] hover:underline">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="relative border-l border-[#1f212d] pl-4 ml-2 space-y-6">
              
              {/* Activity 1 */}
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-[#d4af37] border-2 border-[#12131a]" />
                <div className="text-[10px] text-gray-500">09:15</div>
                <div className="text-xs font-semibold text-white mt-1">ช่างต้น อัปโหลดรูป 6 รูป</div>
                <p className="text-[10px] text-gray-400 mt-0.5">โปรเจกต์ บ้านคุณเอก รามอินทรา</p>
                <div className="mt-2 w-14 h-10 rounded overflow-hidden bg-gray-800 border border-gray-700">
                  <img src="/images/kitchen.png" className="w-full h-full object-cover" alt="site work" />
                </div>
              </div>

              {/* Activity 2 */}
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#12131a]" />
                <div className="text-[10px] text-gray-500">10:42</div>
                <div className="text-xs font-semibold text-white mt-1">ลูกค้าแก้ไขงาน</div>
                <p className="text-[10px] text-gray-400 mt-0.5">เปลี่ยนหน้าบานเป็น Oak Light (คอนโด A12)</p>
              </div>

              {/* Activity 3 */}
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#12131a]" />
                <div className="text-[10px] text-gray-500">11:20</div>
                <div className="text-xs font-semibold text-white mt-1 flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>AI แจ้งเตือน</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">งานครัวอาจล่าช้ากว่ากำหนด 2 วัน (บ้านคุณเอก)</p>
              </div>

              {/* Activity 4 */}
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#12131a]" />
                <div className="text-[10px] text-gray-500">13:05</div>
                <div className="text-xs font-semibold text-white mt-1">ช่างไฟ เข้าหน้างาน</div>
                <p className="text-[10px] text-gray-400 mt-0.5">โปรเจกต์ บ้านคุณนัท บางนา</p>
              </div>

              {/* Activity 5 */}
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-[#12131a]" />
                <div className="text-[10px] text-gray-500">15:30</div>
                <div className="text-xs font-semibold text-white mt-1 text-emerald-400">อนุมัติแบบ</div>
                <p className="text-[10px] text-gray-400 mt-0.5">ลูกค้าอนุมัติแบบแล้ว (ร้านกาแฟ The Wood)</p>
              </div>

            </div>
          </div>

          {/* AI Today's Summary Box */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] bg-gradient-to-b from-[#12131a] via-[#12131a] to-[#d4af37]/5 relative overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-300">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl group-hover:bg-[#d4af37]/10 transition-all duration-300" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#c5a880]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">สรุปจาก AI วันนี้</h3>
              </div>
              <span className="text-[9px] text-gray-500">อัปเดต 16:00 น.</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-0.5">•</span>
                <span>มี 3 งานที่กำลังล่าช้า ต้องเร่งติดตาม</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-0.5">•</span>
                <span>ลูกค้าแก้ไขงาน 2 โปรเจกต์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-0.5">•</span>
                <span>รอวัสดุ 1 โปรเจกต์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-0.5">•</span>
                <span>งานที่ใกล้เสร็จภายใน 7 วัน: 2 โปรเจกต์</span>
              </li>
            </ul>

            <Link 
              href="/ai-assistant"
              className="mt-5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/30 hover:bg-[#c5a880] text-[#c5a880] hover:text-black font-semibold text-xs transition-all duration-200"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>ถาม AI เพิ่มเติม</span>
            </Link>
          </div>

        </div>

      </div>

      {/* CREATE PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12131a] border border-[#1f212d] rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">สร้างโปรเจกต์ใหม่</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">ชื่อโครงการ *</label>
                <input 
                  type="text" 
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="เช่น บ้านคุณเอก รามอินทรา"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">ประเภท / รายละเอียด</label>
                <input 
                  type="text" 
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="เช่น บ้านพักอาศัย 3 ชั้น"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">งบประมาณ (บาท)</label>
                <input 
                  type="number" 
                  value={newProjBudget}
                  onChange={(e) => setNewProjBudget(e.target.value)}
                  placeholder="เช่น 2650000"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">สถานที่ก่อสร้าง / ที่อยู่</label>
                <textarea 
                  value={newProjAddress}
                  onChange={(e) => setNewProjAddress(e.target.value)}
                  placeholder="ที่อยู่ของไซท์งาน..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-xs text-black font-semibold"
                >
                  สร้างโปรเจกต์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
