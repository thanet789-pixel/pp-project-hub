'use client';

import React, { useState } from 'react';
import { mockTasks } from '@/lib/mockData';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { Plus, CheckCircle, Clock, AlertTriangle, Layers, PlusCircle } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'ต้องทำ (To Do)', color: 'border-t-2 border-blue-500' },
    { status: 'in_progress', label: 'กำลังทำ (In Progress)', color: 'border-t-2 border-amber-500' },
    { status: 'blocked', label: 'ติดขัด (Blocked)', color: 'border-t-2 border-red-500' },
    { status: 'done', label: 'เสร็จสิ้น (Done)', color: 'border-t-2 border-emerald-500' }
  ];

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
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
          <button onClick={() => alert('สร้างงานใหม่')} className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors">
            <Plus className="w-4 h-4" />
            <span>สร้างงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
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
                      <span className="flex items-center gap-1">📍 บ้านคุณเอก</span>
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
                        <option value="todo">ย้ายไป To Do</option>
                        <option value="in_progress">ย้ายไป In Progress</option>
                        <option value="blocked">ย้ายไป Blocked</option>
                        <option value="done">ย้ายไป Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
