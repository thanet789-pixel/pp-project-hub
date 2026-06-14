'use client';

import React, { useState, useEffect } from 'react';
import { mockTasks, mockProjects } from '@/lib/mockData';
import { Task, TaskStatus, TaskPriority, Project } from '@/lib/types';
import { Plus, CheckCircle, Clock, AlertTriangle, Layers, PlusCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states for new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'ต้องทำ (To Do)', color: 'border-t-2 border-blue-500' },
    { status: 'in_progress', label: 'กำลังทำ (In Progress)', color: 'border-t-2 border-amber-500' },
    { status: 'blocked', label: 'ติดขัด (Blocked)', color: 'border-t-2 border-red-500' },
    { status: 'done', label: 'เสร็จสิ้น (Done)', color: 'border-t-2 border-emerald-500' }
  ];

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch projects
        const { data: dbProjects, error: projErr } = await supabase
          .from('projects')
          .select('*');

        let resolvedProjects = mockProjects;
        if (dbProjects && dbProjects.length > 0) {
          resolvedProjects = dbProjects.map((p: any) => ({
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
          setProjects(resolvedProjects);
        }

        // Set default project selection
        if (resolvedProjects.length > 0) {
          setNewTaskProjectId(resolvedProjects[0].id);
        }

        // 2. Fetch tasks
        const { data: dbTasks, error: tasksErr } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: true });

        if (dbTasks && dbTasks.length > 0) {
          const mappedTasks: Task[] = dbTasks.map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            dueDate: t.due_date || '',
            assignedTo: t.assigned_to || 'u5'
          }));
          setTasks(mappedTasks);
        } else {
          // If no tasks in DB, fall back to mock tasks and map their project IDs
          setTasks(mockTasks);
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    // Check if task ID is UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId);

    // Optimistic state update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    if (isUuid) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task status in Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to update task status:', err);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskProjectId) return;

    // Determine if we should save to Supabase
    const isProjectUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newTaskProjectId);

    let createdTask: Task | null = null;

    if (isProjectUuid) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            project_id: newTaskProjectId,
            title: newTaskTitle,
            status: newTaskStatus,
            priority: newTaskPriority,
            due_date: newTaskDueDate,
            assigned_to: 'u5'
          })
          .select()
          .single();

        if (!error && data) {
          createdTask = {
            id: data.id,
            projectId: data.project_id,
            title: data.title,
            status: data.status as TaskStatus,
            priority: data.priority as TaskPriority,
            dueDate: data.due_date || '',
            assignedTo: data.assigned_to || 'u5'
          };
        } else {
          console.error('Error inserting task into Supabase:', error);
        }
      } catch (err) {
        console.error('Task creation failed:', err);
      }
    }

    // Fallback to local state if Supabase insertion didn't happen or failed
    if (!createdTask) {
      createdTask = {
        id: `t-new-${Date.now()}`,
        projectId: newTaskProjectId,
        title: newTaskTitle,
        status: newTaskStatus,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        assignedTo: 'u5'
      };
    }

    setTasks(prev => [...prev, createdTask as Task]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-500/10 text-red-400';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400';
      default:
        return 'bg-blue-500/10 text-blue-400';
    }
  };

  const getProjectName = (projId: string) => {
    const found = projects.find(p => p.id === projId);
    return found ? found.name : 'ทั่วไป / อื่นๆ';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">งานของฉัน</h2>
          <p className="text-xs text-gray-400">บอร์ดคุมงานติดตั้งbuilt-in ประเมินสถานะและแบ่งขอบเขตหน้าที่ความรับผิดชอบ</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#12131a] border border-[#1f212d] text-xs font-bold text-white px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกระดับความสำคัญ</option>
            <option value="high">สูง / Urgent</option>
            <option value="medium">ปานกลาง</option>
            <option value="low">ต่ำ</option>
          </select>
          <button 
            onClick={() => setIsAddingTask(true)} 
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างงานใหม่</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-xs">กำลังโหลดงานและโครงการ...</div>
      ) : (
        /* Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.status && (filterPriority === 'all' || t.priority === filterPriority));
            
            return (
              <div key={col.status} className={`p-4 rounded-2xl bg-[#12131a] border border-[#1f212d] min-h-[400px] flex flex-col ${col.color}`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1f212d]">
                  <span className="text-xs font-bold text-white">{col.label}</span>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] scrollbar-none">
                  {colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="p-4 rounded-xl bg-[#181a24] border border-[#1f212d] hover:border-[#c5a880]/30 transition-colors shadow space-y-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#c5a880] transition-colors leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-gray-500">
                        <span className="flex items-center gap-1 truncate max-w-[135px]" title={getProjectName(task.projectId)}>
                          📍 {getProjectName(task.projectId)}
                        </span>
                        <span>ครบกำหนด {task.dueDate}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1f212d]">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>

                        {/* Status quick mover controls */}
                        <select 
                          value={task.status} 
                          onChange={(e) => handleMoveTask(task.id, e.target.value as TaskStatus)}
                          className="bg-transparent border-none text-[9px] text-gray-400 font-bold focus:outline-none cursor-pointer hover:text-white"
                        >
                          <option value="todo" className="bg-[#12131a]">ย้ายไป To Do</option>
                          <option value="in_progress" className="bg-[#12131a]">ย้ายไป In Progress</option>
                          <option value="blocked" className="bg-[#12131a]">ย้ายไป Blocked</option>
                          <option value="done" className="bg-[#12131a]">ย้ายไป Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12131a] border border-[#1f212d] rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingTask(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-4">สร้างงานใหม่ (มอบหมายงาน)</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">ชื่องาน *</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="เช่น ติดตั้งตู้ลอยเคาน์เตอร์ครัว"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">โครงการ *</label>
                  <select
                    value={newTaskProjectId}
                    onChange={(e) => setNewTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">ความสำคัญ</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    <option value="low">ต่ำ (Low)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="high">สูง (High)</option>
                    <option value="urgent">เร่งด่วน (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">สถานะเริ่มต้น</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    <option value="todo">ต้องทำ (To Do)</option>
                    <option value="in_progress">กำลังทำ (In Progress)</option>
                    <option value="blocked">ติดขัด (Blocked)</option>
                    <option value="done">เสร็จสิ้น (Done)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">วันครบกำหนด</label>
                  <input 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#1f212d] mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#c5a880] text-black font-bold text-xs hover:bg-[#b0936b] transition-colors"
                >
                  สร้างงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
