'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign, 
  User as UserIcon,
  Paperclip,
  Camera,
  Mic,
  Send,
  ThumbsUp,
  CornerDownRight,
  CheckCircle,
  FileText,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  Users,
  Eye,
  Settings,
  Info,
  Clock,
  X
} from 'lucide-react';
import { mockProjects, mockTasks, mockTimelineEvents, mockUsers } from '@/lib/mockData';
import { Project, Task, TimelineEvent, ProjectStatus } from '@/lib/types';

export default function ProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string || 'p1';

  // Find project
  const project = mockProjects.find(p => p.id === projectId) || mockProjects[0];

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'photos' | 'files' | 'team' | 'budget' | 'ai' | 'reports'>('timeline');

  // Interactive timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(
    mockTimelineEvents.filter(e => e.projectId === project.id)
  );
  const [postText, setPostText] = useState('');

  // Interactive tasks state
  const [tasks, setTasks] = useState<Task[]>(
    mockTasks.filter(t => t.projectId === project.id)
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Dynamic progress calculated from tasks
  const [projectProgress, setProjectProgress] = useState(project.progress);

  useEffect(() => {
    // Recalculate progress based on checked tasks for demo completeness
    const total = tasks.length;
    if (total === 0) return;
    const completed = tasks.filter(t => t.status === 'done').length;
    const computed = Math.round((completed / total) * 100);
    // Mix it slightly with default project progress to make it realistic
    setProjectProgress(computed > 0 ? computed : project.progress);
  }, [tasks]);

  const handlePostTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newEvent: TimelineEvent = {
      id: `tl-new-${Date.now()}`,
      projectId: project.id,
      userId: 'u2',
      userName: 'กฤษดา (คุณ)',
      userRole: 'pm',
      eventType: 'comment',
      content: postText,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setTimelineEvents([newEvent, ...timelineEvents]);
    setPostText('');

    // Simulated AI response triggering on certain keywords
    const lowerText = postText.toLowerCase();
    if (lowerText.includes('เปลี่ยน') || lowerText.includes('แก้') || lowerText.includes('สเปก') || lowerText.includes('ช้า')) {
      setTimeout(() => {
        const aiEvent: TimelineEvent = {
          id: `tl-ai-${Date.now()}`,
          projectId: project.id,
          eventType: 'ai_summary',
          content: `AI สรุป : ตรวจพบการแก้ไขความต้องการหน้างาน (${postText.substring(0, 30)}...) กำลังวิเคราะห์ผลกระทบต่อกำหนดส่งมอบ`,
          createdAt: new Date().toISOString()
        };
        setTimelineEvents(prev => [aiEvent, ...prev]);
      }, 1500);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `t-new-${Date.now()}`,
      projectId: project.id,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: 'u5'
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
        }
        return t;
      })
    );
  };

  // Status mapping
  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'design': return 'ออกแบบ';
      case 'manufacturing': return 'ผลิต';
      case 'installation': return 'ติดตั้ง';
      case 'completion': return 'เก็บงาน';
      case 'material_pending': return 'รอวัสดุ';
      case 'delay': return 'ล่าช้า';
      default: return 'ทั่วไป';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 rounded-lg bg-[#14161e] border border-[#1f212d] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="cursor-pointer hover:text-white" onClick={() => router.push('/')}>หน้าหลัก</span>
              <span>/</span>
              <span className="text-gray-300">โปรเจกต์</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <h2 className="text-lg font-bold text-white tracking-wide">{project.name}</h2>
              <button className="text-amber-500 hover:text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button 
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#c5a880] hover:bg-[#b0936b] text-black font-semibold text-xs transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มงาน</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto border-b border-[#1f212d] pb-px scrollbar-none gap-2">
        {[
          { key: 'overview', label: 'ภาพรวม' },
          { key: 'timeline', label: 'ไทม์ไลน์' },
          { key: 'tasks', label: 'งาน' },
          { key: 'photos', label: 'รูปภาพ' },
          { key: 'files', label: 'แบบและไฟล์' },
          { key: 'team', label: 'ทีมงาน' },
          { key: 'budget', label: 'งบประมาณ' },
          { key: 'ai', label: 'AI สรุป' },
          { key: 'reports', label: 'รายงาน' }
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

      {/* Main Grid: Left content, Right detail sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Cover & Quick Stats Details */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-56 h-36 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 relative shrink-0">
              <img 
                src={project.coverUrl} 
                className="w-full h-full object-cover" 
                alt="project mockup" 
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">{project.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 font-semibold">
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span className="text-gray-500">📍</span> {project.address}
                </p>
              </div>

              {/* Specs detail table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1f212d]">
                <div>
                  <span className="text-[10px] text-gray-500 block">กำหนดเสร็จ</span>
                  <span className="text-xs font-bold text-gray-200 mt-0.5 block">18 มิ.ย. 2567</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">ความคืบหน้า</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#d4af37]">{projectProgress}%</span>
                    <div className="h-1.5 w-16 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4af37]" style={{ width: `${projectProgress}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">งบประมาณ</span>
                  <span className="text-xs font-bold text-gray-200 mt-0.5 block">2,650,000 บาท</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">ผู้จัดการโปรเจกต์</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-[#c5a880] text-[8px] font-bold text-black flex items-center justify-center">ก</div>
                    <span className="text-xs text-gray-200 font-medium">กฤษดา พ.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Message Composer Box */}
              <form onSubmit={handlePostTimeline} className="p-4 rounded-xl bg-[#12131a] border border-[#1f212d]">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="พิมพ์ข้อความ / @เพื่อแท็กคน หรือระบุความคืบหน้า..."
                  rows={3}
                  className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder-gray-500 resize-none"
                />
                
                <div className="flex items-center justify-between pt-3 border-t border-[#1f212d] mt-2">
                  <div className="flex items-center gap-1 text-gray-400">
                    <button type="button" onClick={() => alert('แนบไฟล์')} className="p-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => alert('อัปโหลดรูปภาพ')} className="p-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => alert('บันทึกเสียง')} className="p-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-black font-semibold text-xs transition-colors"
                  >
                    <span>ส่ง</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Timeline feed list */}
              <div className="space-y-6">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">12 มิ.ย. 2567</div>
                
                <div className="space-y-4">
                  {timelineEvents.map((evt) => {
                    if (evt.eventType === 'ai_summary') {
                      return (
                        <div key={evt.id} className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent border border-[#d4af37]/20 flex items-start gap-3 animate-in fade-in duration-300">
                          <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-[#d4af37]">AI สรุปสเปก</div>
                            <p className="text-xs text-gray-200 mt-1">{evt.content}</p>
                            <button className="text-[10px] text-[#c5a880] hover:underline mt-2 font-semibold">ดูรายละเอียดเพิ่มเติม</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={evt.id} className="p-4 rounded-xl bg-[#12131a] border border-[#1f212d] space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                              {evt.userName ? evt.userName.substring(0, 2) : 'ช'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{evt.userName}</div>
                              <div className="text-[9px] text-[#c5a880] font-medium capitalize">{evt.userRole}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500">12 มิ.ย. • 13:45 น.</span>
                        </div>

                        <p className="text-xs text-gray-200 leading-relaxed pl-1">{evt.content}</p>

                        {/* Event uploaded images */}
                        {evt.images && evt.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {evt.images.map((img, idx) => (
                              <div key={idx} className="h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 relative">
                                <img src={img} className="w-full h-full object-cover" alt="site upload" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Likes & replies */}
                        <div className="flex items-center gap-4 pt-2 border-t border-[#1f212d] text-gray-400 text-xs">
                          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{evt.likes || 0} ถูกใจ</span>
                          </button>
                          <button className="hover:text-white transition-colors">
                            ตอบกลับ {evt.replies?.length ? `(${evt.replies.length})` : ''}
                          </button>
                        </div>

                        {/* Nested Replies list */}
                        {evt.replies && evt.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l border-[#1f212d] space-y-3 pt-3">
                            {evt.replies.map((rep) => (
                              <div key={rep.id} className="flex items-start gap-2 text-xs">
                                <CornerDownRight className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                                <div className="flex-1 bg-[#161822]/60 p-2.5 rounded-lg border border-[#1f212d]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white">{rep.userName}</span>
                                    <span className="text-[9px] text-gray-500">{rep.createdAt.split('T')[1].substring(0, 5)} น.</span>
                                  </div>
                                  <p className="text-gray-300">{rep.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">รายการงานที่มอบหมาย</h3>
                <span className="text-xs text-gray-400">งานทั้งหมด {tasks.length} รายการ</span>
              </div>
              <div className="space-y-2">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#181a24] border border-[#1f212d] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={t.status === 'done'}
                        onChange={() => toggleTaskStatus(t.id)}
                        className="w-4 h-4 rounded border-[#1f212d] text-[#d4af37] focus:ring-[#d4af37] bg-transparent cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-semibold block ${t.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                          {t.title}
                        </span>
                        <span className="text-[10px] text-gray-500">ครบกำหนด: {t.dueDate}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${
                      t.priority === 'high' || t.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                      t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPEC & FILES TAB */}
          {activeTab === 'files' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">แบบแปลนและเอกสาร BOQ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'แบบเฟอร์นิเจอร์_ล่าสุด.pdf', size: '2.4 MB', date: '10 มิ.ย. 2567', type: 'pdf' },
                  { name: 'BOQ_บ้านคุณเอก.xlsx', size: '1.1 MB', date: '9 มิ.ย. 2567', type: 'excel' },
                  { name: 'แบบ 3D ห้องครัว.skp', size: '45 MB', date: '8 มิ.ย. 2567', type: 'sketchup' },
                  { name: 'รายงานความคืบหน้า_สัปดาห์ที่2.pdf', size: '1.8 MB', date: '8 มิ.ย. 2567', type: 'pdf' }
                ].map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#181a24] border border-[#1f212d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-red-500/10 text-red-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[150px]">{f.name}</span>
                        <span className="text-[10px] text-gray-500 block">{f.size} • อัปโหลด {f.date}</span>
                      </div>
                    </div>
                    <button className="text-[10px] text-[#c5a880] hover:underline font-semibold">ดาวน์โหลด</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
              <h3 className="text-sm font-bold text-white">อัลบั้มรูปถ่ายหน้างาน (Vision AI Analyzed)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-xl overflow-hidden bg-gray-800 border border-gray-700 relative group">
                    <img src="/images/kitchen.png" className="w-full h-40 object-cover" alt="site render" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/85 p-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-[9px] font-bold text-white">ห้อง: Built-in ครัว</div>
                      <div className="text-[8px] text-emerald-400 mt-0.5">ผลวิเคราะห์: ติดตั้งแล้ว 85% (ไม่พบจุดบกพร่อง)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI SUMMARY TAB */}
          {activeTab === 'ai' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-6">
              <div className="flex items-center gap-2 text-[#c5a880]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold">AI ประเมินความเสี่ยงและวิเคราะห์โปรเจกต์</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>ความเสี่ยงเรื่องการจัดส่งวัสดุ</span>
                  </div>
                  <p className="text-[11px] text-gray-300">ไม้ HMR จากโรงงานเริ่มมีสต็อกต่ำ ชิ้นงานบานตู้อาจเลื่อนติดตั้งได้</p>
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>แนวโน้มการล่าช้า</span>
                  </div>
                  <p className="text-[11px] text-gray-300">จากการเปลี่ยนสเปกหน้าบาน ล่าช้าสะสม 2 วัน คาดว่าจะส่งมอบล่าช้ากว่ากำหนดเดิมเล็กน้อย</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#181b26] to-[#0c0d12] border border-[#1f212d] space-y-3">
                <h4 className="text-xs font-bold text-white">สรุปคำแนะนำจาก AI:</h4>
                <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                  <li>อนุมัติการผลิตชิ้นงานสีโอ๊คอ่อนโดยเร็วเพื่อรักษากำหนดติดตั้งรอบถัดไป</li>
                  <li>ยืนยันกำหนดนำส่งของที่หน้างานกับช่างไฟเพื่อไม่ให้กระทบช่วงเก็บสีบัว</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Statistics & Widgets */}
        <div className="space-y-6">
          
          {/* Project Progress Circle widget */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] flex flex-col items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 self-start">ความคืบหน้าโปรเจกต์</h3>
            
            {/* Custom SVG Circle Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#1f212d" strokeWidth="8" fill="transparent" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#d4af37" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * projectProgress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white">{projectProgress}%</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">เสร็จสิ้น</span>
              </div>
            </div>

            {/* Checklist of phases */}
            <div className="w-full mt-6 space-y-3">
              {[
                { label: 'ออกแบบ', val: 100, color: 'bg-emerald-500' },
                { label: 'ผลิต', val: 100, color: 'bg-blue-500' },
                { label: 'ติดตั้ง', val: projectProgress, color: 'bg-[#d4af37]' },
                { label: 'เก็บงาน', val: projectProgress > 80 ? 80 : 20, color: 'bg-teal-500' }
              ].map((ph, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ph.color}`} />
                    <span className="text-gray-300">{ph.label}</span>
                  </div>
                  <span className="font-bold text-white">{ph.val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Checklist sidebar */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">งานที่ต้องทำ</h3>
              <button onClick={() => setIsAddingTask(true)} className="text-[10px] text-[#c5a880] hover:underline font-bold">
                + เพิ่มงาน
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-2.5">
                  <input 
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => toggleTaskStatus(task.id)}
                    className="w-4 h-4 mt-0.5 rounded border-[#1f212d] text-[#d4af37] focus:ring-[#d4af37] bg-transparent cursor-pointer shrink-0"
                  />
                  <div className="flex-1">
                    <span className={`text-xs font-semibold block leading-tight ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {task.title}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 block">ครบกำหนด {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Team Members sidebar */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ทีมงานในโปรเจกต์</h3>
            <div className="flex flex-wrap gap-3">
              {mockUsers.slice(1, 6).map((usr) => (
                <div key={usr.id} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-xs font-bold text-[#c5a880] select-none hover:border-[#c5a880] transition-colors cursor-help" title={usr.fullName}>
                    {usr.fullName.substring(0, 2)}
                  </div>
                  <span className="text-[9px] text-gray-500 font-semibold">{usr.role.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* QUICK TASK MODAL */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#12131a] border border-[#1f212d] rounded-2xl shadow-2xl p-5 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingTask(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3">มอบหมายงานใหม่</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">ชื่องาน *</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="เช่น ติดตั้งหน้าบานบิวท์อิน"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTask(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b]"
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
