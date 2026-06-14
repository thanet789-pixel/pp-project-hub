'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import { mockProjects, mockTasks } from '@/lib/mockData';
import { Project, Task, TaskStatus, TaskPriority } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'financials' | 'tasks' | 'team'>('overview');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);

  // Database States
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbTasks, setDbTasks] = useState<Task[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch projects
        const { data: projs, error: projsErr } = await supabase
          .from('projects')
          .select('*');

        if (projs && projs.length > 0) {
          const mappedProjs: Project[] = projs.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            address: p.address || '',
            coverUrl: p.cover_url || '/images/kitchen.png',
            status: p.status || 'design',
            progress: p.progress || 0,
            budget: p.budget || 0,
            actualSpent: p.actual_spent || 0,
            startDate: p.start_date || '',
            dueDate: p.due_date || '',
            pmId: p.pm_id || 'u2',
            clientId: p.client_id || 'u7'
          }));
          setDbProjects(mappedProjs);
        }

        // 2. Fetch tasks
        const { data: tasks, error: tasksErr } = await supabase
          .from('tasks')
          .select('*');

        if (tasks && tasks.length > 0) {
          const mappedTasks: Task[] = tasks.map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            dueDate: t.due_date || '',
            assignedTo: t.assigned_to || 'u5'
          }));
          setDbTasks(mappedTasks);
        }
      } catch (err) {
        console.error('Error fetching analytics data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getLocalDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getLocalDateString();

  // Resolve list
  const currentProjectsList = dbProjects.length > 0 ? dbProjects : mockProjects;
  const currentTasksList = dbTasks.length > 0 ? dbTasks : mockTasks;

  // Filter lists based on Dropdown
  const filteredProjects = selectedProject === 'all' 
    ? currentProjectsList 
    : currentProjectsList.filter(p => p.id === selectedProject);

  const filteredTasks = selectedProject === 'all'
    ? currentTasksList
    : currentTasksList.filter(t => t.projectId === selectedProject);

  // 1. KPI Stats
  const totalProjects = filteredProjects.length;
  
  const avgProgress = totalProjects > 0 
    ? Math.round(filteredProjects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
    : 0;
  
  const completedTasksCount = filteredTasks.filter(t => t.status === 'done').length;
  
  const delayedTasksCount = filteredTasks.filter(
    t => t.status !== 'done' && t.dueDate && t.dueDate < todayStr
  ).length;

  const totalBudget = filteredProjects.reduce((acc, p) => acc + Number(p.budget), 0);
  const totalSpent = filteredProjects.reduce((acc, p) => acc + Number(p.actualSpent), 0);
  const totalRemaining = totalBudget - totalSpent;
  const costPctOfBudget = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const stats = [
    { label: 'โปรเจกต์ที่เลือก', val: totalProjects.toString(), unit: 'โครงการ', change: 'แสดงตามฟิลเตอร์หลัก', isGood: true },
    { label: 'ความคืบหน้าเฉลี่ย', val: `${avgProgress}%`, unit: '', change: 'คำนวณตามจริง', isGood: true },
    { label: 'งานที่เสร็จสิ้น', val: completedTasksCount.toString(), unit: 'งาน', change: 'จากงานมอบหมายทั้งหมด', isGood: true },
    { label: 'งานที่ล่าช้า (Overdue)', val: delayedTasksCount.toString(), unit: 'งาน', change: 'เลยกำหนดส่งมอบ', isGood: delayedTasksCount === 0 },
    { label: 'งบประมาณรวม', val: `฿${(totalBudget / 1000000).toFixed(2)}M`, unit: 'บาท', change: 'ยอดจัดสรรสะสม', isGood: true },
    { label: 'ค่าใช้จ่ายจริง', val: `฿${(totalSpent / 1000000).toFixed(2)}M`, unit: `${costPctOfBudget}% ของงบ`, change: totalRemaining >= 0 ? `เหลือเงิน ฿${(totalRemaining/1000).toFixed(0)}K` : 'เกินงบประมาณ', isGood: totalRemaining >= 0 }
  ];

  // 2. Project progress segments calculations for Stacked Chart
  const getProgressSegments = (progress: number) => {
    if (progress <= 25) {
      return { design: progress * 4, mfg: 0, install: 0, clean: 0 };
    } else if (progress <= 50) {
      return { design: 100, mfg: (progress - 25) * 4, install: 0, clean: 0 };
    } else if (progress <= 75) {
      return { design: 100, mfg: 100, install: (progress - 50) * 4, clean: 0 };
    } else {
      return { design: 100, mfg: 100, install: 100, clean: (progress - 75) * 4 };
    }
  };

  // 3. Task Status Donut Calculations
  const todoCount = filteredTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length;
  const blockedCount = filteredTasks.filter(t => t.status === 'blocked').length;
  const doneCount = filteredTasks.filter(t => t.status === 'done').length;
  const totalTasks = todoCount + inProgressCount + blockedCount + doneCount;

  const donePct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const inProgressPct = totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0;
  const blockedPct = totalTasks > 0 ? Math.round((blockedCount / totalTasks) * 100) : 0;
  const todoPct = totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0;

  // Donut rings stroke calculation (circumference = 238.7)
  const doneOffset = 0;
  const inProgressOffset = 238.7 * (donePct / 100);
  const blockedOffset = 238.7 * ((donePct + inProgressPct) / 100);
  const todoOffset = 238.7 * ((donePct + inProgressPct + blockedPct) / 100);

  // 4. Expense Categories Calculations
  const materialsAmt = totalSpent * 0.43;
  const labourAmt = totalSpent * 0.22;
  const subcontractorAmt = totalSpent * 0.19;

  // Helpers
  const getProjectName = (projId: string) => {
    const p = currentProjectsList.find(item => item.id === projId);
    return p ? p.name : 'ทั่วไป';
  };

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Project Name', 'Address', 'Status', 'Progress (%)', 'Budget (THB)', 'Actual Spent (THB)', 'Start Date', 'Due Date'];
    const rows = filteredProjects.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      p.status,
      p.progress,
      p.budget,
      p.actualSpent,
      p.startDate,
      p.dueDate
    ]);
    
    // Prefix UTF-8 BOM so Excel opens Thai letters correctly
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PP_Project_Hub_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              {currentProjectsList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#c5a880] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Export Action */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#1f212d] pb-px scrollbar-none gap-2">
        {[
          { key: 'overview', label: 'ภาพรวม' },
          { key: 'progress', label: 'ความคืบหน้าโครงการ' },
          { key: 'financials', label: 'การเงินและบัญชี' },
          { key: 'tasks', label: 'รายงานผลงาน' },
          { key: 'team', label: 'ประสิทธิภาพทีมช่าง' }
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

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">กำลังประมวลผลข้อมูลรายงานจากระบบ...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#12131a] border border-[#1f212d]">
                    <span className="text-[10px] text-gray-500 block font-semibold">{item.label}</span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-lg font-bold text-white">{item.val}</span>
                      {item.unit && <span className="text-[9px] text-gray-400 font-medium">{item.unit}</span>}
                    </div>
                    <span className={`text-[9px] font-bold mt-2 block ${
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
                    <h3 className="text-sm font-bold text-white tracking-wide">ความคืบหน้าขั้นตอนทำงาน</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">สัดส่วนแต่ละโปรเจกต์: ออกแบบ (เขียว), ผลิต (เหลือง), ติดตั้ง (น้ำเงิน), เสร็จสิ้น (ฟ้า)</p>
                  </div>

                  <div className="space-y-4">
                    {filteredProjects.slice(0, 6).map((proj, idx) => {
                      const segs = getProgressSegments(proj.progress);
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-300 truncate max-w-[200px]">{proj.name}</span>
                            <span className="text-white">{proj.progress}%</span>
                          </div>
                          
                          {/* Stacked segment progress bar */}
                          <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${segs.design / 4}%` }} title={`ออกแบบ: ${segs.design}%`} />
                            <div className="h-full bg-amber-500 transition-all" style={{ width: `${segs.mfg / 4}%` }} title={`ผลิต: ${segs.mfg}%`} />
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${segs.install / 4}%` }} title={`ติดตั้ง: ${segs.install}%`} />
                            <div className="h-full bg-teal-500 transition-all" style={{ width: `${segs.clean / 4}%` }} title={`เก็บงาน: ${segs.clean}%`} />
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
                    <p className="text-[10px] text-gray-400 mt-0.5">วิเคราะห์จากงานมอบหมายโครงการ {totalTasks} งาน</p>
                  </div>

                  {/* SVG Donut */}
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="#1f212d" strokeWidth="8" fill="transparent" />
                      
                      {donePct > 0 && (
                        <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 - doneOffset} />
                      )}
                      {inProgressPct > 0 && (
                        <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 - inProgressOffset} />
                      )}
                      {blockedPct > 0 && (
                        <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 - blockedOffset} />
                      )}
                      {todoPct > 0 && (
                        <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 - todoOffset} />
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-extrabold text-white">{totalTasks}</span>
                      <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">งานทั้งหมด</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-gray-400">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        เสร็จสิ้น
                      </span>
                      <span className="text-white font-bold">{doneCount} งาน ({donePct}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        กำลังทำ
                      </span>
                      <span className="text-white font-bold">{inProgressCount} งาน ({inProgressPct}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        ติดขัด
                      </span>
                      <span className="text-white font-bold">{blockedCount} งาน ({blockedPct}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        ต้องทำ
                      </span>
                      <span className="text-white font-bold">{todoCount} งาน ({todoPct}%)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Financial Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Financial Line Chart (Span 2) */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">สถิติงบประมาณสะสม</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">กราฟแสดงงบประมาณสะสม เปรียบเทียบกับค่าใช้จ่ายจริง ณ ปัจจุบัน</p>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-[#d4af37]" />
                        งบรวม (฿{(totalBudget/1000000).toFixed(1)}M)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-emerald-500" />
                        จ่ายจริง (฿{(totalSpent/1000000).toFixed(1)}M)
                      </span>
                    </div>
                  </div>

                  {/* SVG Line chart wrapper */}
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 500 150">
                      <line x1="20" y1="20" x2="480" y2="20" stroke="#1f212d" strokeDasharray="3 3" />
                      <line x1="20" y1="70" x2="480" y2="70" stroke="#1f212d" strokeDasharray="3 3" />
                      <line x1="20" y1="120" x2="480" y2="120" stroke="#1f212d" strokeDasharray="3 3" />
                      <line x1="20" y1="140" x2="480" y2="140" stroke="#1f212d" />

                      {/* Dynamic budget path coordinates */}
                      <path 
                        d={`M20,135 Q100,${135 - (totalBudget ? 20 : 0)} 200,${135 - (totalBudget ? 50 : 0)} T380,${135 - (totalBudget ? 80 : 0)} T480,25`} 
                        fill="none" stroke="#d4af37" strokeWidth="2.5" 
                      />
                      {/* Dynamic actual spent path coordinates */}
                      <path 
                        d={`M20,138 Q100,${138 - (totalSpent ? 15 : 0)} 200,${138 - (totalSpent ? 40 : 0)} T380,${138 - (totalSpent ? 65 : 0)} T480,${140 - (totalSpent ? 100 : 0)}`} 
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
                    <h3 className="text-sm font-bold text-white tracking-wide">สัดส่วนค่าใช้จ่ายจัดซื้อ</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">วิเคราะห์จากยอดเงินจ่ายรวม ฿{totalSpent.toLocaleString()}</p>
                  </div>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="#1f212d" strokeWidth="8" fill="transparent" />
                      
                      {totalSpent > 0 && (
                        <>
                          {/* Wood / Materials (43%) */}
                          <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="0" />
                          {/* Labour (22%) */}
                          <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="102.6" />
                          {/* Subcontractor (19%) */}
                          <circle cx="50" cy="50" r="38" stroke="#8b5cf6" strokeWidth="8" fill="transparent" strokeDasharray="238.7" strokeDashoffset="155.1" />
                        </>
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-base font-extrabold text-white">฿{(totalSpent / 1000000).toFixed(2)}M</span>
                      <span className="text-[8px] text-gray-500 uppercase font-bold">รวมค่าใช้จ่าย</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>🔵 วัสดุและอุปกรณ์</span>
                      <span className="text-white font-bold">฿{materialsAmt.toLocaleString(undefined, {maximumFractionDigits:0})} (43%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🟢 ค่าแรงงานติดตั้ง</span>
                      <span className="text-white font-bold">฿{labourAmt.toLocaleString(undefined, {maximumFractionDigits:0})} (22%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🟣 ผู้รับเหมาโครงสร้าง</span>
                      <span className="text-white font-bold">฿{subcontractorAmt.toLocaleString(undefined, {maximumFractionDigits:0})} (19%)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom widgets grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Near Completion List */}
                <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">โปรเจกต์ที่ทำอยู่</h3>
                  <div className="space-y-3">
                    {filteredProjects.slice(0, 4).map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-[#1f212d]/50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-white block truncate max-w-[170px]">{p.name}</span>
                          <span className="text-[9px] text-gray-500 block">กำหนดเสร็จ: {p.dueDate}</span>
                        </div>
                        <span className="font-bold text-[#d4af37]">{p.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Delayed Tasks List */}
                <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">งานที่เกินกำหนด (Overdue)</h3>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).slice(0, 4).map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-[#1f212d]/50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-white block truncate max-w-[150px]">{t.title}</span>
                          <span className="text-[9px] text-gray-500 block">โครงการ: {getProjectName(t.projectId)}</span>
                        </div>
                        <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[9px] whitespace-nowrap">
                          เลยกำหนด
                        </span>
                      </div>
                    ))}
                    {filteredTasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).length === 0 && (
                      <div className="text-center py-6 text-gray-500 text-xs">ไม่มีงานที่ค้างเลยกำหนดขณะนี้</div>
                    )}
                  </div>
                </div>

                {/* Team Performance List */}
                <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">ประสิทธิภาพทีมงาน</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'ช่างไม้ built-in', val: 85 },
                      { name: 'ช่างติดตั้งหน้างาน', val: 78 },
                      { name: 'ช่างทำสีพ่น', val: 64 },
                      { name: 'ช่างไฟฝังฝ้า', val: 55 }
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
          )}

          {/* TAB 2: PROGRESS */}
          {activeTab === 'progress' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[#1f212d] pb-2">ตารางความคืบหน้าโครงการก่อสร้าง</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0c0d12]/50 text-gray-400 font-bold uppercase border-b border-[#1f212d]">
                    <tr>
                      <th className="py-3 px-4">ชื่อโครงการ</th>
                      <th className="py-3 px-4">ความคืบหน้า</th>
                      <th className="py-3 px-4">สถานะโครงการ</th>
                      <th className="py-3 px-4">วันที่เริ่ม</th>
                      <th className="py-3 px-4">กำหนดแล้วเสร็จ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p, idx) => (
                      <tr key={p.id || idx} className="border-b border-[#1f212d]/50 hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#d4af37] w-8">{p.progress}%</span>
                            <div className="h-2 w-24 bg-gray-900 rounded-full overflow-hidden">
                              <div className="h-full bg-[#d4af37]" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'installation' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            p.status === 'manufacturing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{p.startDate}</td>
                        <td className="py-3.5 px-4 font-mono">{p.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[#1f212d] pb-2">รายงานงบประมาณ รายจ่าย และยอดคงเหลือ</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0c0d12]/50 text-gray-400 font-bold uppercase border-b border-[#1f212d]">
                    <tr>
                      <th className="py-3 px-4">โครงการ</th>
                      <th className="py-3 px-4 text-right">งบประมาณโครงการ</th>
                      <th className="py-3 px-4 text-right">รายจ่ายจริง</th>
                      <th className="py-3 px-4 text-right">ยอดคงเหลือในงบ</th>
                      <th className="py-3 px-4">สถานะทางบัญชี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p, idx) => {
                      const balance = Number(p.budget) - Number(p.actualSpent);
                      return (
                        <tr key={p.id || idx} className="border-b border-[#1f212d]/50 hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-200">฿{Number(p.budget).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#10b981]">฿{Number(p.actualSpent).toLocaleString()}</td>
                          <td className={`py-3.5 px-4 text-right font-mono font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ฿{balance.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {balance >= 0 ? 'งบประมาณสมบูรณ์' : 'เกินงบประมาณ (Over Budget)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[#1f212d] pb-2">รายละเอียดรายการงานช่างหน้างาน</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0c0d12]/50 text-gray-400 font-bold uppercase border-b border-[#1f212d]">
                    <tr>
                      <th className="py-3 px-4">ชื่องาน</th>
                      <th className="py-3 px-4">ชื่อโครงการ</th>
                      <th className="py-3 px-4">ระดับความสำคัญ</th>
                      <th className="py-3 px-4">สถานะงาน</th>
                      <th className="py-3 px-4">กำหนดวันส่งมอบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t, idx) => (
                      <tr key={t.id || idx} className="border-b border-[#1f212d]/50 hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{t.title}</td>
                        <td className="py-3.5 px-4 text-gray-400">{getProjectName(t.projectId)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            t.priority === 'high' || t.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                            t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-200">
                          {t.status === 'done' ? '✅ เสร็จสิ้น (Done)' :
                           t.status === 'in_progress' ? '⚡ กำลังดำเนินการ' :
                           t.status === 'blocked' ? '⚠️ ติดขัด (Blocked)' : '⏳ รอเริ่มดำเนินการ'}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{t.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TEAM */}
          {activeTab === 'team' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[#1f212d] pb-2">ทีมผู้รับเหมาและคะแนนผลงาน (Performance Rating)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'ช่างไม้built-in โรงงานแสงทอง', role: ' carpentry & design', rating: '⭐️ 4.8', phone: '083-456-7890', completed: '23 งาน' },
                  { name: 'ช่างติดตั้งทีมวิชัย', role: ' carpentry installer', rating: '⭐️ 4.6', phone: '084-567-8901', completed: '19 งาน' },
                  { name: 'ทีมช่างไฟ สุขุมวิท เอ็นจิเนียริ่ง', role: ' electrical & ceiling wiring', rating: '⭐️ 4.5', phone: '085-678-9012', completed: '12 งาน' },
                  { name: 'ช่างสีเฟอร์นิเจอร์ทีมช่างเป็ด', role: ' paint & finishing', rating: '⭐️ 4.2', phone: '089-012-3456', completed: '15 งาน' }
                ].map((tm, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#181a24] border border-[#1f212d] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{tm.name}</span>
                      <span className="text-amber-400 font-bold text-xs">{tm.rating}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{tm.role}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-[#1f212d]/50">
                      <span>📞 เบอร์โทรศัพท์: {tm.phone}</span>
                      <span>ส่งมอบงานสำเร็จ: {tm.completed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
