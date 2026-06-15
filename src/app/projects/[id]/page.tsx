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
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { mockProjects, mockTasks, mockTimelineEvents, mockUsers } from '@/lib/mockData';
import { Project, Task, TimelineEvent, ProjectStatus } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export default function ProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string || 'p1';

  // Find project
  const project = mockProjects.find(p => p.id === projectId) || mockProjects[0];

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'photos' | 'files' | 'team' | 'budget' | 'ai' | 'reports'>('photos');

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

  // LINE Group ID configuration states
  const [lineGroupIdState, setLineGroupIdState] = useState(project.lineGroupId || '');
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Photos gallery lightbox states
  const [projectPhotos, setProjectPhotos] = useState<{ url: string; title: string; desc: string; area: string }[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; desc: string; area: string } | null>(null);

  // Load timeline events and photos from Supabase
  const [supabaseEvents, setSupabaseEvents] = useState<TimelineEvent[]>([]);
  const [supabasePhotos, setSupabasePhotos] = useState<string[]>([]);
  const [dbProjectId, setDbProjectId] = useState<string | null>(null);
  const [supabaseTasks, setSupabaseTasks] = useState<Task[]>([]);
  const [supabaseFiles, setSupabaseFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [debugInfo, setDebugInfo] = useState<{
    url: string;
    resolvedProjectId: string | null;
    matchedProjectName: string | null;
    eventsCount: number;
    photosCount: number;
    error: string | null;
    dbProjects: any[];
    networkCheck: string;
  }>({
    url: '',
    resolvedProjectId: null,
    matchedProjectName: null,
    eventsCount: 0,
    photosCount: 0,
    error: null,
    dbProjects: [],
    networkCheck: 'Checking network...'
  });

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxPhoto) return;
    const idx = projectPhotos.findIndex(p => p.url === lightboxPhoto.url);
    if (idx > 0) {
      setLightboxPhoto(projectPhotos[idx - 1]);
    } else {
      setLightboxPhoto(projectPhotos[projectPhotos.length - 1]);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxPhoto) return;
    const idx = projectPhotos.findIndex(p => p.url === lightboxPhoto.url);
    if (idx < projectPhotos.length - 1) {
      setLightboxPhoto(projectPhotos[idx + 1]);
    } else {
      setLightboxPhoto(projectPhotos[0]);
    }
  };

  // Populate project photos dynamically
  useEffect(() => {
    const saved = localStorage.getItem('pp_built_in_portfolio');
    let items = [];
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {}
    }
    
    const matchingPortfolio = items.filter((item: any) => item.projectId === project.id);
    const portfolioPhotos = matchingPortfolio.map((item: any) => ({
      url: item.imageUrl,
      title: item.title,
      desc: item.description,
      area: item.area || 'ผลงานบิวต์อิน'
    }));

    const defaultPhotos = [
      {
        url: project.coverUrl || '/images/kitchen.png',
        title: `ภาพหน้าปกโครงการ ${project.name}`,
        desc: `ภาพจำลอง/ภาพถ่ายจริงหน้าปกของโครงการ ${project.name}`,
        area: 'หน้าปกโครงการ'
      }
    ];

    if (project.id === 'p1') {
      defaultPhotos.push(
        {
          url: '/images/kitchen.png',
          title: 'ชุดครัวบิวต์อินหรูหรา',
          desc: 'งานติดตั้งโครงตู้ครัวกันชื้นพร้อมหน้าบานกระจกเงาชาทอง',
          area: 'ห้องครัว (Kitchen)'
        },
        {
          url: '/images/luxury_walkin_closet.png',
          title: 'ตู้เสื้อผ้า Walk-in Closet',
          desc: 'งานประกอบโครงตู้เสื้อผ้าไม้จริงสีเข้มและกระจกใสนิรภัย',
          area: 'ห้องนอน (Bedroom)'
        }
      );
    } else if (project.id === 'p2') {
      defaultPhotos.push(
        {
          url: '/images/luxury_walkin_closet.png',
          title: 'หน้าบานเลื่อนและบานพับตู้เสื้อผ้า',
          desc: 'บานเลื่อนอลูมิเนียมเกรดพรีเมียมสีทองแชมเปญพร้อมไฟ LED ซ่อน',
          area: 'ห้องนอน (Bedroom)'
        }
      );
    } else if (project.id === 'p3') {
      defaultPhotos.push(
        {
          url: '/images/luxury_tv_console.png',
          title: 'ผนังระแนงไม้จริงห้องโถง',
          desc: 'ระแนงไม้จริงสลับหินอ่อนสีดำ พร้อมงานซ่อนไฟแถบ LED ใต้ชั้นวาง',
          area: 'ห้องโถงหลัก (Main Hall)'
        }
      );
    }

    const combined = [...portfolioPhotos];
    defaultPhotos.forEach(dp => {
      if (!combined.some(c => c.url === dp.url)) {
        combined.push(dp);
      }
    });

    supabasePhotos.forEach(sp => {
      if (!combined.some(c => c.url === sp)) {
        combined.push({
          url: sp,
          title: 'รูปรายงานหน้างาน (LINE)',
          desc: 'รูปถ่ายรายงานความคืบหน้าส่งตรงจากกลุ่ม LINE ช่างติดตั้งหน้างาน',
          area: 'รายงานหน้างาน'
        });
      }
    });

    setProjectPhotos(combined);
  }, [project.id, project.coverUrl, project.name, supabasePhotos]);

  const handleSaveLineGroupId = (e: React.FormEvent) => {
    e.preventDefault();
    project.lineGroupId = lineGroupIdState;
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
    }, 3000);
  };


  useEffect(() => {
    let active = true;
    let channel: any = null;

    async function loadSupabaseData() {
      let netStatus = 'Testing outbound internet (GitHub)...';
      try {
        const testRes = await fetch('https://api.github.com/zen', { mode: 'cors' });
        if (testRes.ok) {
          netStatus = 'Outbound internet connected successfully (GitHub Zen API OK)';
        } else {
          netStatus = `Outbound internet returned status: HTTP ${testRes.status}`;
        }
      } catch (err: any) {
        netStatus = `Outbound internet BLOCKED/FAILED: ${err?.message || String(err)}`;
      }

      try {
        let dbProjectId = null;
        let matchedProjName = null;
        
        // Fetch all projects in DB for debugging info
        const { data: dbProjs, error: projsErr } = await supabase
          .from('projects')
          .select('id, name, line_group_id, is_line_active');

        const supabaseUrlConfig = 'https://cgswxfwxgojwhqqmlyol.supabase.co';

        if (projsErr) {
          setDebugInfo({
            url: supabaseUrlConfig,
            resolvedProjectId: null,
            matchedProjectName: null,
            eventsCount: 0,
            photosCount: 0,
            error: `Supabase API Error: ${projsErr.message} (${projsErr.code || 'No code'}). Please check if your NEXT_PUBLIC_SUPABASE_ANON_KEY is correct and complete.`,
            dbProjects: [],
            networkCheck: netStatus
          });
          return;
        }
        
        // 1. Try matching by project name (most robust since mock names match DB names)
        if (project.name) {
          const { data: nameMatched } = await supabase
            .from('projects')
            .select('id, name')
            .ilike('name', `%${project.name}%`)
            .limit(1);
          
          if (nameMatched && nameMatched.length > 0) {
            dbProjectId = nameMatched[0].id;
            matchedProjName = nameMatched[0].name;
          }
        }

        // 2. Fallback to matching by lineGroupId
        if (!dbProjectId && project.lineGroupId) {
          const { data: matched } = await supabase
            .from('projects')
            .select('id, name')
            .eq('line_group_id', project.lineGroupId)
            .limit(1);
          
          if (matched && matched.length > 0) {
            dbProjectId = matched[0].id;
            matchedProjName = matched[0].name;
          }
        }

        // 3. Ultimate fallback to the first project in the database
        if (!dbProjectId) {
          const { data: fallback } = await supabase
            .from('projects')
            .select('id, name')
            .limit(1);
          
          if (fallback && fallback.length > 0) {
            dbProjectId = fallback[0].id;
            matchedProjName = fallback[0].name;
          }
        }

        if (!dbProjectId) {
          setDebugInfo({
            url: supabaseUrlConfig,
            resolvedProjectId: null,
            matchedProjectName: null,
            eventsCount: 0,
            photosCount: 0,
            error: 'No projects found in Supabase database.',
            dbProjects: dbProjs || [],
            networkCheck: netStatus
          });
          return;
        }

        if (active) {
          setDbProjectId(dbProjectId);
        }

        // Fetch tasks from Supabase
        const { data: dbTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', dbProjectId)
          .order('created_at', { ascending: true });
        
        if (!tasksError && dbTasks && active) {
          const mappedTasks: Task[] = dbTasks.map((t: any) => ({
            id: t.id,
            projectId: project.id,
            title: t.title,
            status: t.status as any,
            priority: t.priority as any,
            dueDate: t.due_date,
            assignedTo: t.assigned_to || 'u5'
          }));
          setSupabaseTasks(mappedTasks);
        }

        // Fetch files from Supabase
        const { data: dbFiles, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('project_id', dbProjectId)
          .order('created_at', { ascending: false });
        
        if (!filesError && dbFiles && active) {
          setSupabaseFiles(dbFiles);
        }

        const { data: events, error: eventsError } = await supabase
          .from('timelines')
          .select('*, photos(*)')
          .eq('project_id', dbProjectId)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;

        let mappedCount = 0;
        if (events && active) {
          const mapped: TimelineEvent[] = events.map((evt: any) => ({
            id: evt.id,
            projectId: project.id,
            userName: evt.user_id ? 'ช่างหน้างาน' : 'ระบบ LINE Bot',
            userRole: 'installer',
            eventType: evt.event_type as any,
            content: evt.content,
            createdAt: evt.created_at,
            images: evt.photos?.map((p: any) => p.url) || []
          }));
          setSupabaseEvents(mapped);
          mappedCount = mapped.length;
        }

        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('url')
          .eq('project_id', dbProjectId)
          .order('created_at', { ascending: false });

        if (photosError) throw photosError;

        let photosCount = 0;
        if (photos && active) {
          setSupabasePhotos(photos.map((p: any) => p.url));
          photosCount = photos.length;
        }

        setDebugInfo({
          url: supabaseUrlConfig,
          resolvedProjectId: dbProjectId,
          matchedProjectName: matchedProjName,
          eventsCount: mappedCount,
          photosCount: photosCount,
          error: null,
          dbProjects: dbProjs || [],
          networkCheck: netStatus
        });

        if (active && dbProjectId) {
          const uniqueChannelName = `project-detail-realtime-${dbProjectId}-${Math.random().toString(36).substring(2, 9)}`;
          channel = supabase
            .channel(uniqueChannelName)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'timelines', filter: `project_id=eq.${dbProjectId}` },
              async (payload) => {
                const { data: newEvt } = await supabase
                  .from('timelines')
                  .select('*, photos(*)')
                  .eq('id', payload.new.id)
                  .single();

                if (newEvt && active) {
                  const mapped: TimelineEvent = {
                    id: newEvt.id,
                    projectId: project.id,
                    userName: 'ระบบ LINE Bot',
                    userRole: 'installer',
                    eventType: newEvt.event_type as any,
                    content: newEvt.content,
                    createdAt: newEvt.created_at,
                    images: newEvt.photos?.map((p: any) => p.url) || []
                  };
                  setSupabaseEvents(prev => [mapped, ...prev]);

                  if (newEvt.photos && newEvt.photos.length > 0) {
                    const urls = newEvt.photos.map((p: any) => p.url);
                    setSupabasePhotos(prev => [...urls, ...prev]);
                    setDebugInfo(prevInfo => ({
                      ...prevInfo,
                      eventsCount: prevInfo.eventsCount + 1,
                      photosCount: prevInfo.photosCount + urls.length
                    }));
                  } else {
                    setDebugInfo(prevInfo => ({
                      ...prevInfo,
                      eventsCount: prevInfo.eventsCount + 1
                    }));
                  }
                }
              }
            )
            .subscribe();
        }

      } catch (err: any) {
        console.error('Error loading data from Supabase:', err);
        setDebugInfo(prev => ({
          ...prev,
          url: 'https://cgswxfwxgojwhqqmlyol.supabase.co',
          error: err?.message || String(err),
          networkCheck: netStatus
        }));
      }
    }

    loadSupabaseData();

    return () => {
      active = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [project.id, project.lineGroupId, showSaveToast]);

  useEffect(() => {
    // Recalculate progress based on checked tasks for demo completeness
    const activeTasks = dbProjectId ? supabaseTasks : tasks;
    const total = activeTasks.length;
    if (total === 0) return;
    const completed = activeTasks.filter(t => t.status === 'done').length;
    const computed = Math.round((completed / total) * 100);
    // Mix it slightly with default project progress to make it realistic
    setProjectProgress(computed > 0 ? computed : project.progress);
  }, [tasks, supabaseTasks, dbProjectId]);

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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (dbProjectId) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            project_id: dbProjectId,
            title: newTaskTitle,
            status: 'todo',
            priority: 'medium',
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          .select()
          .single();

        if (!error && data) {
          const newTask: Task = {
            id: data.id,
            projectId: project.id,
            title: data.title,
            status: data.status as any,
            priority: data.priority as any,
            dueDate: data.due_date,
            assignedTo: data.assigned_to || 'u5'
          };
          setSupabaseTasks(prev => [...prev, newTask]);
        } else {
          console.error('Error adding task to Supabase:', error);
        }
      } catch (err) {
        console.error('Task insertion failed:', err);
      }
    }

    // Local mock fallback for local state compatibility
    const newTask: Task = {
      id: `t-new-${Date.now()}`,
      projectId: project.id,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: 'u5'
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const toggleTaskStatus = async (taskId: string) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId);

    if (isUuid && dbProjectId) {
      const task = supabaseTasks.find(t => t.id === taskId);
      if (task) {
        const nextStatus = task.status === 'done' ? 'todo' : 'done';
        
        // Optimistic update
        setSupabaseTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
        );

        const { error } = await supabase
          .from('tasks')
          .update({ status: nextStatus })
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task in Supabase:', error);
          // Rollback on error
          setSupabaseTasks(prev => 
            prev.map(t => t.id === taskId ? { ...t, status: task.status } : t)
          );
        }
      }
    } else {
      setTasks(prevTasks => 
        prevTasks.map(t => {
          if (t.id === taskId) {
            return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
          }
          return t;
        })
      );
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dbProjectId) return;

    setIsUploading(true);
    try {
      const bucketName = 'project-files';
      
      // 1. Ensure bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.some((b) => b.name === bucketName)) {
          await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800 // 50MB
          });
          console.log(`[Supabase Storage] Created bucket "${bucketName}"`);
        }
      } catch (err) {
        console.error('[Supabase Storage] Failed to list/create files bucket:', err);
      }

      // 2. Upload file
      const fileExt = file.name.split('.').pop() || 'file';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${dbProjectId}/${Date.now()}_${cleanName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // 4. Save metadata to DB
      const { data: dbFile, error: dbErr } = await supabase
        .from('files')
        .insert({
          project_id: dbProjectId,
          name: file.name,
          url: publicUrl,
          file_type: fileExt,
          size_bytes: file.size
        })
        .select()
        .single();

      if (dbErr) throw dbErr;

      if (dbFile) {
        setSupabaseFiles(prev => [dbFile, ...prev]);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      alert(`อัปโหลดล้มเหลว: ${err.message || String(err)}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
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

          {/* TAB 0: OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Save Success Banner */}
              {showSaveToast && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">บันทึกข้อมูลการเชื่อมต่อสำเร็จ!</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">เชื่อมต่อโปรเจกต์กับกลุ่ม LINE ID เรียบร้อยแล้ว ระบบพร้อมดึงภาพถ่ายเข้าไทม์ไลน์โดยอัตโนมัติ</span>
                  </div>
                </div>
              )}

              {/* Project Meta Details Card */}
              <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1f212d] pb-3">
                  <FolderOpen className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm font-bold text-white">รายละเอียดโครงการ</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block">ชื่อโครงการ</span>
                      <span className="text-white font-bold text-sm mt-0.5 block">{project.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">รายละเอียดงาน</span>
                      <p className="text-gray-300 mt-0.5 leading-relaxed">{project.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">สถานที่ก่อสร้าง</span>
                      <span className="text-gray-300 mt-0.5 block">📍 {project.address}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block">วันที่เริ่มโครงการ</span>
                        <span className="text-gray-300 font-semibold mt-0.5 block">{project.startDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">กำหนดแล้วเสร็จ</span>
                        <span className="text-gray-300 font-semibold mt-0.5 block">{project.dueDate}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block">งบประมาณโครงการ</span>
                        <span className="text-emerald-400 font-bold text-sm mt-0.5 block">฿{project.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">ยอดจ่ายจริงแล้ว</span>
                        <span className="text-gray-300 font-bold text-sm mt-0.5 block">฿{project.actualSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LINE Group Integration Configuration Card */}
              <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-5">
                <div className="flex items-center justify-between border-b border-[#1f212d] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#06c755] flex items-center justify-center text-white font-extrabold text-[10px] select-none">
                      L
                    </div>
                    <h3 className="text-sm font-bold text-white">เชื่อมต่อ LINE Group ID</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                    lineGroupIdState 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {lineGroupIdState ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  นำรหัสกลุ่ม LINE (Group ID) เช่น <code className="text-[#c5a880] font-mono bg-[#14161e] px-1.5 py-0.5 rounded">Cabcde123...</code> ที่ได้จากบอทหรือเซิร์ฟเวอร์ มากรอกในช่องด้านล่างนี้ เพื่อให้รูปรายงานหน้างานเชื่อมเข้าสู่แท็บรูปภาพและไทม์ไลน์ของโปรเจกต์นี้โดยตรง
                </p>

                <form onSubmit={handleSaveLineGroupId} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">LINE Group ID ของกลุ่มไลน์โครงการ *</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={lineGroupIdState}
                        onChange={(e) => setLineGroupIdState(e.target.value)}
                        placeholder="กรอกรหัสกลุ่ม LINE เช่น C876543210abcdef..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#1a1c25] border border-[#2b2e3e] text-xs text-white font-mono focus:outline-none focus:border-[#c5a880] transition-colors placeholder-gray-600" 
                        required
                      />
                      <button 
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-[#c5a880] hover:bg-[#b0936b] text-black font-bold text-xs whitespace-nowrap transition-colors"
                      >
                        บันทึกการเชื่อมต่อ
                      </button>
                    </div>
                  </div>
                </form>

                {/* Helpful guides on how to get the Group ID */}
                <div className="p-4 rounded-xl bg-[#14161e] border border-[#1f212d] space-y-3">
                  <div className="flex items-center gap-2 text-[#c5a880] text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>💡 วิธีการดึงรหัส LINE Group ID เพื่อมาเชื่อมโยงโครงการ</span>
                  </div>
                  <ol className="text-xs text-gray-400 space-y-2 list-decimal pl-4 leading-relaxed">
                    <li>
                      <strong>ดึงบอทเข้ากลุ่ม</strong>: ตรวจสอบว่าเชิญ LINE Bot เข้าไปใน LINE Group ของช่างหน้างานแล้ว
                    </li>
                    <li>
                      <strong>พิมพ์ข้อความกระตุ้น</strong>: พิมพ์คำว่า <code className="text-white font-mono bg-[#1f212d] px-1 py-0.5 rounded">#ID</code> หรือ <code className="text-white font-mono bg-[#1f212d] px-1 py-0.5 rounded">@check</code> ส่งเข้าไปในห้องแชทกลุ่มนั้นๆ
                    </li>
                    <li>
                      <strong>คัดลอกรหัสกลุ่ม</strong>: บอทจะตอบกลับข้อความพร้อมรหัสกลุ่มขึ้นต้นด้วยตัว <code className="text-[#c5a880] font-mono bg-[#1f212d] px-1 py-0.5 rounded">C</code> (เช่น <code className="text-white font-mono bg-[#1f212d] px-1.5 py-0.5 rounded">C876543210abcdef...</code>) หรือสามารถเปิดดูได้จาก Vercel Realtime Logs ของ Webhook API
                    </li>
                    <li>
                      <strong>บันทึกระบบ</strong>: คัดลอกรหัสนั้นมาใส่ในช่องด้านบนนี้แล้วกด <strong className="text-white">"บันทึกการเชื่อมต่อ"</strong> เพื่อเสร็จสิ้นขั้นตอน
                    </li>
                  </ol>
                </div>

              </div>

            </div>
          )}

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
                  {[...supabaseEvents, ...timelineEvents].map((evt) => {
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
                <span className="text-xs text-gray-400">งานทั้งหมด {(dbProjectId ? supabaseTasks : tasks).length} รายการ</span>
              </div>
              <div className="space-y-2">
                {(dbProjectId ? supabaseTasks : tasks).map(t => (
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
              <div className="flex items-center justify-between border-b border-[#1f212d] pb-3 mb-2">
                <h3 className="text-sm font-bold text-white">แบบแปลนและเอกสาร BOQ</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUploadFile} 
                    className="hidden" 
                    accept=".pdf,.xlsx,.xls,.skp,.png,.jpg,.jpeg,.zip"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !dbProjectId}
                    className="py-1.5 px-3.5 rounded-xl bg-[#c5a880] hover:bg-[#b0936b] text-black font-semibold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดไฟล์แบบ/BOQ'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(dbProjectId ? supabaseFiles : [
                  { id: '1', name: 'แบบเฟอร์นิเจอร์_ล่าสุด.pdf', size_bytes: 2516582, created_at: '2026-06-10T00:00:00Z', file_type: 'pdf', url: '#' },
                  { id: '2', name: 'BOQ_บ้านคุณเอก.xlsx', size_bytes: 1153433, created_at: '2026-06-09T00:00:00Z', file_type: 'xlsx', url: '#' },
                  { id: '3', name: 'แบบ 3D ห้องครัว.skp', size_bytes: 47185920, created_at: '2026-06-08T00:00:00Z', file_type: 'skp', url: '#' },
                  { id: '4', name: 'รายงานความคืบหน้า_สัปดาห์ที่2.pdf', size_bytes: 1887436, created_at: '2026-06-08T00:00:00Z', file_type: 'pdf', url: '#' }
                ]).map((f, idx) => (
                  <div key={f.id || idx} className="p-4 rounded-xl bg-[#181a24] border border-[#1f212d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-red-500/10 text-red-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[150px]">{f.name}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {formatFileSize(f.size_bytes)} • อัปโหลด {formatThaiDate(f.created_at)}
                        </span>
                      </div>
                    </div>
                    {f.url && f.url !== '#' ? (
                      <a 
                        href={f.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-[#c5a880] hover:underline font-semibold"
                      >
                        ดาวน์โหลด
                      </a>
                    ) : (
                      <button 
                        onClick={() => alert('ไฟล์จำลองไม่สามารถดาวน์โหลดได้')} 
                        className="text-[10px] text-gray-500 cursor-not-allowed font-semibold"
                      >
                        ดาวน์โหลด
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#1f212d] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">แกลเลอรีภาพถ่ายโครงการ</h3>
                  <p className="text-[10px] text-gray-400 mt-1">คลิกที่รูปภาพเพื่อเปิดโหมดขยายใหญ่และดูรายละเอียดชิ้นงานบิวต์อิน</p>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold">
                  ทั้งหมด {projectPhotos.length} รูป
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {projectPhotos.length > 0 ? (
                  projectPhotos.map((photo, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setLightboxPhoto(photo)}
                      className="rounded-xl overflow-hidden bg-[#171821] border border-[#1f212d] relative group aspect-video cursor-pointer hover:border-[#c5a880]/50 transition-all duration-300 shadow hover:shadow-[#c5a880]/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={photo.title} />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/80 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[9px] font-extrabold text-[#c5a880] uppercase tracking-wider block">
                          {photo.area}
                        </span>
                        <div>
                          <h4 className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</h4>
                          <span className="text-[9px] text-gray-400 flex items-center gap-1 mt-1">
                            <Maximize2 className="w-2.5 h-2.5" /> คลิกเพื่อขยายใหญ่
                          </span>
                        </div>
                      </div>

                      {/* Default Small Badge */}
                      <div className="absolute top-2 left-2 block group-hover:hidden transition-all duration-200">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-gray-300 border border-white/5">
                          {photo.area.split(' (')[0]}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                    ไม่พบภาพถ่ายในโครงการนี้
                  </div>
                )}
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
              {(dbProjectId ? supabaseTasks : tasks).slice(0, 3).map((task) => (
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

      {/* DB Connection Debug Panel */}
      <div className="mt-8 p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] text-xs space-y-3">
        <div className="flex items-center justify-between text-gray-400 font-bold border-b border-[#1f212d] pb-2">
          <span className="flex items-center gap-1.5 text-white">🛠️ Supabase Connection Debug Panel</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debugInfo.error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {debugInfo.error ? '⚠️ Error / Blocked' : '✅ Active & Connected'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-gray-300">
          <div className="space-y-1.5">
            <div><span className="text-gray-500">Supabase Endpoint URL:</span> <code className="text-[#c5a880] bg-[#14161e] px-1.5 py-0.5 rounded font-mono break-all">{debugInfo.url}</code></div>
            <div><span className="text-gray-500">Resolved Project ID:</span> <code className="text-[#c5a880] bg-[#14161e] px-1.5 py-0.5 rounded font-mono">{debugInfo.resolvedProjectId || 'None / Empty'}</code></div>
            <div><span className="text-gray-500">Matched Project Name:</span> <span className="font-semibold text-white">{debugInfo.matchedProjectName || 'None / Empty'}</span></div>
          </div>
          <div className="space-y-1.5">
            <div><span className="text-gray-500">Timeline Events Loaded:</span> <span className="font-bold text-white bg-[#14161e] px-2 py-0.5 rounded">{debugInfo.eventsCount}</span></div>
            <div><span className="text-gray-500">Photos (Real-time DB) Loaded:</span> <span className="font-bold text-[#d4af37] bg-[#14161e] px-2 py-0.5 rounded">{debugInfo.photosCount}</span></div>
            <div><span className="text-gray-500">Outbound Connection Test:</span> <span className={`font-semibold ${debugInfo.networkCheck.includes('BLOCKED') ? 'text-red-400' : 'text-emerald-400'}`}>{debugInfo.networkCheck}</span></div>
            {debugInfo.error && (
              <div className="text-red-400 font-semibold mt-1 p-2 rounded bg-red-500/5 border border-red-500/10">
                Error Log: {debugInfo.error}
              </div>
            )}
          </div>
        </div>

        {debugInfo.dbProjects && debugInfo.dbProjects.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#1f212d] text-[10px]">
            <div className="font-bold text-gray-400 mb-1.5">Projects in Database:</div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {debugInfo.dbProjects.map((p, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between font-mono bg-[#14161e] p-2 rounded border border-[#1f212d] gap-1">
                  <span className="text-white">Name: "{p.name}"</span>
                  <span className="text-gray-500">ID: {p.id}</span>
                  <span className="text-[#c5a880]">Line Group ID: "{p.line_group_id || 'null'}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= PHOTOS LIGHTBOX VIEWER ================= */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Navigation Controls - Desktop Left */}
          <button 
            type="button"
            onClick={handlePrevPhoto}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:border-white text-gray-400 hover:text-white transition-all hidden md:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Navigation Controls - Desktop Right */}
          <button 
            type="button"
            onClick={handleNextPhoto}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:border-white text-gray-400 hover:text-white transition-all hidden md:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div 
            className="w-full max-w-4xl bg-[#0a0b10] border border-[#1f212d] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] cursor-default animate-scaleUp animate-in"
            onClick={(e) => e.stopPropagation()} // prevent closing
          >
            {/* Image display side */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative min-h-[300px] md:min-h-[450px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={lightboxPhoto.url} 
                alt={lightboxPhoto.title}
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]"
              />
              
              {/* Mobile quick controls overlay */}
              <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 md:hidden">
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-bold"
                >
                  ◀ ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-bold"
                >
                  ถัดไป ▶
                </button>
              </div>

              {/* Area Badge */}
              <div className="absolute top-4 left-4">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#d4af37] text-black border border-[#d4af37]/20 shadow-md">
                  {lightboxPhoto.area}
                </span>
              </div>
            </div>

            {/* Photo details sidebar */}
            <div className="w-full md:w-80 bg-[#12131a] border-t md:border-t-0 md:border-l border-[#1f212d] p-5 flex flex-col justify-between max-h-[40vh] md:max-h-none overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-[#c5a880] font-extrabold uppercase tracking-wider block">
                      {lightboxPhoto.area}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-relaxed">
                      {lightboxPhoto.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setLightboxPhoto(null)}
                    className="text-gray-500 hover:text-white p-1 rounded-lg border border-[#1f212d] bg-[#1c1d24]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">รายละเอียดชิ้นงาน / บันทึกหน้างาน:</span>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-[#171821] p-3 rounded-xl border border-[#1f212d]/50">
                    {lightboxPhoto.desc}
                  </p>
                </div>
                
                <div className="text-[10px] text-gray-400 border-t border-[#1f212d]/50 pt-2.5 space-y-1">
                  <div>โครงการ: <span className="text-white font-semibold">{project.name}</span></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="w-full py-2.5 mt-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#1f212d] text-gray-300 hover:text-white transition-all text-xs font-bold"
              >
                ปิดหน้าต่างพรีวิว
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
