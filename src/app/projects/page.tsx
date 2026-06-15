'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockProjects } from '@/lib/mockData';
import { Project, ProjectStatus } from '@/lib/types';
import { Folder, Plus, Search, MapPin, Calendar, Users, DollarSign, X } from 'lucide-react';

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjAddress, setNewProjAddress] = useState('');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('pp_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        setProjects(mockProjects);
      }
    } else {
      setProjects(mockProjects);
      localStorage.setItem('pp_projects', JSON.stringify(mockProjects));
    }
  }, []);

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

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('pp_projects', JSON.stringify(updated));
    setIsCreateModalOpen(false);
    
    // Reset fields
    setNewProjName('');
    setNewProjDesc('');
    setNewProjBudget('');
    setNewProjAddress('');
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'design': return { label: 'ออกแบบ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'manufacturing': return { label: 'ผลิต', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'installation': return { label: 'ติดตั้ง', color: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/20' };
      case 'completion': return { label: 'เก็บงาน', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'material_pending': return { label: 'รอวัสดุ', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'delay': return { label: 'ล่าช้า', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: return { label: 'ทั่วไป', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Search and Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">โปรเจกต์ทั้งหมด</h2>
          <p className="text-xs text-gray-400">รายการโครงการ built-in และตกแต่งภายในทั้งหมดในระบบ</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#1f212d] w-64">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="ค้นหาโปรเจกต์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างโปรเจกต์</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => {
          const status = getStatusLabel(proj.status);
          return (
            <div 
              key={proj.id}
              onClick={() => router.push(`/projects/${proj.id}`)}
              className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] hover:border-[#d4af37]/30 hover:bg-[#12131a]/80 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer group"
            >
              <div>
                {/* Cover visual representation */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 relative mb-4">
                  <img src={proj.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={proj.name} />
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold capitalize ${status.color} bg-[#12131a]/90`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{proj.name}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{proj.description}</p>
              </div>

              {/* Stats & Metadata footer */}
              <div className="border-t border-[#1f212d] pt-4 mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">📍 สถานที่</span>
                  <span className="text-gray-300 font-medium">{proj.address}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">💰 งบประมาณ</span>
                  <span className="text-gray-300 font-bold">฿{proj.budget.toLocaleString()}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">ความคืบหน้า</span>
                    <span className="text-[#d4af37] font-bold">{proj.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d4af37]" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= CREATE PROJECT MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 relative flex flex-col p-6">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white bg-[#1c1d24] p-1.5 rounded-lg border border-[#2d2f3d]"
            >
              <X className="w-4 h-4" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1d24] border border-[#2d2f3d] text-xs text-white focus:outline-none focus:border-[#c5a880]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1d24] border border-[#2d2f3d] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">งบประมาณ (บาท)</label>
                <input 
                  type="number" 
                  value={newProjBudget}
                  onChange={(e) => setNewProjBudget(e.target.value)}
                  placeholder="เช่น 2650000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1d24] border border-[#2d2f3d] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">สถานที่ก่อสร้าง / ที่อยู่</label>
                <textarea 
                  value={newProjAddress}
                  onChange={(e) => setNewProjAddress(e.target.value)}
                  placeholder="ที่อยู่ของไซท์งาน..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1d24] border border-[#2d2f3d] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#c5a880] hover:bg-[#b0936b] text-black font-bold py-2.5 rounded-xl text-xs transition-colors"
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
