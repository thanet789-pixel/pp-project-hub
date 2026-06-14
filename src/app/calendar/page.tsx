'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  SlidersHorizontal,
  Clock,
  MapPin,
  Users,
  Check,
  X
} from 'lucide-react';
import { mockCalendarEvents } from '@/lib/mockData';
import { supabase } from '@/lib/supabaseClient';

type EventType = 'customer' | 'install' | 'manufacture' | 'delivery' | 'inspection' | 'other';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  time: string;
  details: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [loading, setLoading] = useState(true);

  // Calendar active month/year (starting on June 2026 to align with mock events)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June is index 5
  const [todayStr, setTodayStr] = useState('2026-06-14'); // Default mock today
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  // Modals and Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-06-14');
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState<EventType>('install');
  const [newDetails, setNewDetails] = useState('');

  // Checklist states
  const [teamFilters, setTeamFilters] = useState({
    all: true,
    customer: true,
    install: true,
    delivery: true,
    manufacture: true,
    inspection: true,
    other: true
  });

  // Dynamically set today's date and active month on component mount
  // Also fetch appointments from Supabase
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${y}-${m}-${d}`;
    setTodayStr(formattedDate);
    setNewDate(formattedDate);
    setCurrentYear(y);
    setCurrentMonth(today.getMonth());

    async function loadAppointments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });

        if (data && data.length > 0) {
          const mapped: CalendarEvent[] = data.map((item: any) => ({
            id: item.id,
            date: item.appointment_date,
            title: item.title,
            type: item.event_type,
            time: item.appointment_time,
            details: item.details || ''
          }));
          setEvents(mapped);
        } else {
          setEvents(mockCalendarEvents);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setEvents(mockCalendarEvents);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleToggleFilter = (key: keyof typeof teamFilters) => {
    if (key === 'all') {
      const nextVal = !teamFilters.all;
      setTeamFilters({
        all: nextVal,
        customer: nextVal,
        install: nextVal,
        delivery: nextVal,
        manufacture: nextVal,
        inspection: nextVal,
        other: nextVal
      });
    } else {
      const updated = { ...teamFilters, [key]: !teamFilters[key] };
      const allSelected = updated.customer && updated.install && updated.delivery && updated.manufacture && updated.inspection && updated.other;
      setTeamFilters({ ...updated, all: allSelected });
    }
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'customer':
        return { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'นัดลูกค้า', dot: 'bg-purple-400' };
      case 'install':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'ติดตั้งหน้างาน', dot: 'bg-emerald-400' };
      case 'delivery':
        return { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'ส่งของ', dot: 'bg-blue-400' };
      case 'manufacture':
        return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'ผลิต', dot: 'bg-amber-400' };
      case 'inspection':
        return { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'ตรวจงาน', dot: 'bg-red-400' };
      default:
        return { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: 'อื่นๆ', dot: 'bg-gray-400' };
    }
  };

  // Generate calendar days dynamically based on active month and year
  const generateGrid = (year: number, month: number) => {
    const gridDays = [];
    const firstDayVal = new Date(year, month, 1).getDay();
    const startDayOfWeek = (firstDayVal + 6) % 7;
    const prevMonthDate = new Date(year, month, 0);
    const lastDayOfPrevMonth = prevMonthDate.getDate();
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();
    
    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      gridDays.push({ dateStr, dayNum: day, isCurrentMonth: false });
    }
    
    // Current month days
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      gridDays.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }
    
    // Next month filler days (fill up to 42 days grid)
    const totalFilled = gridDays.length;
    const remainingDays = 42 - totalFilled;
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextMonth = nextMonthDate.getMonth();
    const nextYear = nextMonthDate.getFullYear();
    
    for (let d = 1; d <= remainingDays; d++) {
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      gridDays.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }
    
    return gridDays;
  };

  const calendarDays = generateGrid(currentYear, currentMonth);

  // Filter events based on active category checkboxes
  const filteredEvents = events.filter(evt => {
    if (!teamFilters.all) {
      if (evt.type === 'customer' && !teamFilters.customer) return false;
      if (evt.type === 'install' && !teamFilters.install) return false;
      if (evt.type === 'delivery' && !teamFilters.delivery) return false;
      if (evt.type === 'manufacture' && !teamFilters.manufacture) return false;
      if (evt.type === 'inspection' && !teamFilters.inspection) return false;
      if (evt.type === 'other' && !teamFilters.other) return false;
    }
    return true;
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let createdEvent: CalendarEvent | null = null;
    
    try {
      // Find matching project
      let resolvedProjectId: string | null = null;
      const { data: projs } = await supabase.from('projects').select('id, name');
      
      if (projs && projs.length > 0) {
        const matched = projs.find(p => newDetails.toLowerCase().includes(p.name.toLowerCase()));
        if (matched) {
          resolvedProjectId = matched.id;
        } else {
          resolvedProjectId = projs[0].id;
        }
      }

      if (resolvedProjectId) {
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            project_id: resolvedProjectId,
            title: newTitle,
            event_type: newType,
            appointment_date: newDate,
            appointment_time: newTime,
            details: newDetails
          })
          .select()
          .single();

        if (!error && data) {
          createdEvent = {
            id: data.id,
            date: data.appointment_date,
            title: data.title,
            type: data.event_type,
            time: data.appointment_time,
            details: data.details || ''
          };
        } else {
          console.error('Error inserting appointment into Supabase:', error);
        }
      }
    } catch (err) {
      console.error('Supabase appointment insertion failed:', err);
    }

    if (!createdEvent) {
      createdEvent = {
        id: `evt-${Date.now()}`,
        date: newDate,
        title: newTitle,
        type: newType,
        time: newTime,
        details: newDetails
      };
    }

    setEvents(prev => [...prev, createdEvent as CalendarEvent]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDetails('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">ปฏิทินงาน</h2>
          <p className="text-xs text-gray-400">ตารางนัดตรวจหน้างาน ตารางผลิตโรงงาน และตารางส่งของติดตั้ง</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#c5a880] hover:bg-[#b0936b] text-black font-semibold text-xs transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มนัดหมาย</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left main calendar (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Sub header controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131a] p-4 rounded-xl border border-[#1f212d]">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-lg bg-[#181a24] hover:bg-white/5 border border-[#1f212d] text-xs font-semibold text-white"
              >
                วันนี้
              </button>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded bg-[#181a24] hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded bg-[#181a24] hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">{thaiMonths[currentMonth]} {currentYear + 543}</h3>
            </div>

            {/* View switcher */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#090a0f] border border-[#1f212d]">
              {(['month', 'week', 'day', 'agenda'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-colors ${
                    activeView === view
                      ? 'bg-[#c5a880] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {view === 'month' ? 'เดือน' : view === 'week' ? 'สัปดาห์' : view === 'day' ? 'วัน' : 'รายการ'}
                </button>
              ))}
            </div>
          </div>

          {/* Event Quick Filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => handleToggleFilter('all')}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${
                teamFilters.all 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-transparent text-gray-500 border-gray-800'
              }`}
            >
              ทั้งหมด
            </button>
            {[
              { key: 'customer', label: 'นัดลูกค้า', color: 'border-purple-500/30 text-purple-300 bg-purple-500/10' },
              { key: 'install', label: 'ติดตั้งหน้างาน', color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' },
              { key: 'delivery', label: 'ส่งของ', color: 'border-blue-500/30 text-blue-300 bg-blue-500/10' },
              { key: 'manufacture', label: 'ผลิต', color: 'border-amber-500/30 text-amber-300 bg-amber-500/10' },
              { key: 'inspection', label: 'ตรวจงาน', color: 'border-red-500/30 text-red-300 bg-red-500/10' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => handleToggleFilter(filter.key as any)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${
                  teamFilters[filter.key as keyof typeof teamFilters]
                    ? filter.color
                    : 'bg-transparent text-gray-500 border-gray-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Month Calendar Grid */}
          <div className="bg-[#12131a] border border-[#1f212d] rounded-2xl overflow-hidden shadow-xl">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[#1f212d] bg-[#0c0d12]/50 text-center py-3">
              {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day, idx) => (
                <div key={idx} className="text-xs font-bold text-gray-400 select-none">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-xs text-gray-500">กำลังโหลดรายการนัดหมาย...</div>
            ) : (
              /* Days grid */
              <div className="grid grid-cols-7 auto-rows-[100px] border-[#1f212d]">
                {calendarDays.map((day, idx) => {
                  const dayEvents = filteredEvents.filter(e => e.date === day.dateStr);
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div 
                      key={idx}
                      className={`border-r border-b border-[#1f212d] p-1.5 transition-colors relative flex flex-col justify-between ${
                        day.isCurrentMonth ? 'bg-transparent' : 'bg-[#090a0f]/40 opacity-40'
                      } ${isToday ? 'bg-amber-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold p-1 rounded-full w-5 h-5 flex items-center justify-center ${
                          isToday ? 'bg-[#d4af37] text-black font-extrabold' : 'text-gray-400'
                        }`}>
                          {day.dayNum}
                        </span>
                      </div>

                      {/* Events for this day */}
                      <div className="flex-1 mt-1 space-y-1 overflow-y-auto scrollbar-none max-h-[70px]">
                        {dayEvents.map(evt => {
                          const style = getEventStyle(evt.type);
                          return (
                            <div 
                              key={evt.id}
                              className={`p-1 rounded text-[9px] font-bold border leading-none cursor-pointer hover:brightness-110 transition-all truncate ${style.color}`}
                              title={`${evt.time} - ${evt.title} (${evt.details})`}
                            >
                              <span className="opacity-70 mr-0.5">{evt.time}</span> {evt.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right sidebar details */}
        <div className="space-y-6">
          
          {/* Calendar Mini view wrapper */}
          <div className="p-4 rounded-2xl bg-[#12131a] border border-[#1f212d]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">ตารางนัดแนะนำ</h3>
            
            <div className="space-y-3">
              {filteredEvents.slice(0, 4).map((evt) => {
                const style = getEventStyle(evt.type);
                return (
                  <div key={evt.id} className="p-3 rounded-xl bg-[#181a24] border border-[#1f212d] space-y-2 hover:border-[#c5a880]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold capitalize ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-[9px] text-gray-500 font-medium">{evt.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">📍 {evt.details}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#c5a880]" /> {evt.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar checklist filter */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ปฏิทินของทีม</h3>
            <div className="space-y-3">
              {[
                { key: 'all', label: 'ทุกคน', color: 'border-white bg-white' },
                { key: 'customer', label: 'นัดลูกค้า', color: 'border-purple-500 bg-purple-500' },
                { key: 'install', label: 'ติดตั้งหน้างาน', color: 'border-emerald-500 bg-emerald-500' },
                { key: 'delivery', label: 'ส่งของ', color: 'border-blue-500 bg-blue-500' },
                { key: 'manufacture', label: 'ผลิต', color: 'border-amber-500 bg-amber-500' },
                { key: 'inspection', label: 'ตรวจงาน', color: 'border-red-500 bg-red-500' },
                { key: 'other', label: 'อื่นๆ', color: 'border-gray-500 bg-gray-500' }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer group text-xs text-gray-300 hover:text-white">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      checked={teamFilters[item.key as keyof typeof teamFilters]}
                      onChange={() => handleToggleFilter(item.key as any)}
                      className="sr-only"
                    />
                    <div className={`w-4.5 h-4.5 rounded border-2 transition-all ${
                      teamFilters[item.key as keyof typeof teamFilters]
                        ? 'bg-transparent border-[#c5a880]'
                        : 'bg-transparent border-[#1f212d]'
                    }`} />
                    {teamFilters[item.key as keyof typeof teamFilters] && (
                      <Check className="absolute w-3 h-3 text-[#c5a880]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.key === 'all' ? 'bg-[#d4af37]' : item.color.split(' ')[1]}`} />
                    <span>{item.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ADD APPOINTMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12131a] border border-[#1f212d] rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">เพิ่มกำหนดนัดหมาย</h3>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">หัวข้อนัดหมาย *</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ตรวจแบบตู้ทีวี"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">วันที่ *</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">เวลา *</label>
                  <input 
                    type="text" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="เช่น 10:00"
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">ประเภทนัดหมาย</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as EventType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="customer">นัดลูกค้า</option>
                  <option value="install">ติดตั้งหน้างาน</option>
                  <option value="delivery">ส่งของ</option>
                  <option value="manufacture">ผลิต</option>
                  <option value="inspection">ตรวจงาน</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">โปรเจกต์ / ไซท์งาน</label>
                <input 
                  type="text" 
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="เช่น บ้านคุณเอก รามอินทรา"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b]"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
