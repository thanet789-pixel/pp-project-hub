'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mockUsers } from '@/lib/mockData';
import { User, UserRole } from '@/lib/types';
import { Users, Mail, Phone, ShieldCheck, Plus, Edit2, Trash2, X, Loader2, Check, Camera, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('pm');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action status (loading, success, error)
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch users from Supabase and merge with mock users
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load deleted emails from localStorage to exclude them
      let deletedList: string[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('deleted_emails');
          if (saved) {
            deletedList = JSON.parse(saved).map((e: string) => e.toLowerCase());
          }
        } catch (e) {
          console.error('Error parsing deleted_emails:', e);
        }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      let merged = [...mockUsers.filter(mu => !deletedList.includes(mu.email.toLowerCase()))];
      if (data && data.length > 0) {
        const mapped: User[] = data
          .map((u: any) => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role,
            phone: u.phone || '',
            avatarUrl: u.avatar_url || ''
          }))
          .filter(u => !deletedList.includes(u.email.toLowerCase()));

        // Merge db users with mock users (deduplicate by email)
        const dbEmails = mapped.map(u => u.email.toLowerCase());
        merged = [
          ...mapped,
          ...mockUsers.filter(mu => 
            !dbEmails.includes(mu.email.toLowerCase()) && 
            !deletedList.includes(mu.email.toLowerCase())
          )
        ];
      } else {
        merged = mockUsers.filter(mu => !deletedList.includes(mu.email.toLowerCase()));
      }
      setUsers(merged);
    } catch (err) {
      console.error('Error loading team members:', err);
      showToast('ไม่สามารถดึงข้อมูลทีมงานจากระบบได้', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Check if ID belongs to mock data
  const isMockUser = (id: string) => {
    return id.startsWith('u') && id.length <= 3;
  };

  // Reset Form
  const resetForm = () => {
    setFullName('');
    setEmail('');
    setRole('pm');
    setPhone('');
    setAvatarUrl('');
    setSelectedUser(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle Avatar Image Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalUrl = avatarUrl;
    // Show local preview instantly
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    setUploadingAvatar(true);
    try {
      const bucketName = 'project-files';
      
      // Upload file to avatars/ directory in the bucket
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `avatars/${Date.now()}_${cleanName}`;

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

      setAvatarUrl(publicUrl);
      showToast('อัปโหลดรูปภาพโปรไฟล์สำเร็จแล้ว!', 'success');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      // Revert preview on failure
      setAvatarUrl(originalUrl);
      
      if (err.message === 'Bucket not found') {
        showToast('ไม่พบ Bucket "project-files" ใน Supabase Storage กรุณาสร้าง Bucket นี้ก่อน', 'error');
      } else {
        showToast(err.message || 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาตรวจสอบสิทธิ์', 'error');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };


  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      showToast('กรุณากรอกข้อมูล ชื่อ-นามสกุล และ อีเมล', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            full_name: fullName,
            email: email.trim(),
            role: role,
            phone: phone.trim(),
            avatar_url: avatarUrl.trim() || null
          }
        ])
        .select();

      if (error) throw error;

      showToast('เพิ่มสมาชิกทีมงานใหม่เรียบร้อยแล้ว!', 'success');
      setIsAddModalOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      if (err.message?.includes('policy') || err.message?.includes('permission')) {
        showToast('กรุณารัน SQL Migration เพื่อปลดล็อกสิทธิ์ RLS สำหรับตาราง users', 'error');
      } else {
        showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Member
  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!fullName || !email) {
      showToast('กรุณากรอกข้อมูล ชื่อ-นามสกุล และ อีเมล', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isMockUser(selectedUser.id)) {
        // Just mock edit in state for mock users
        const updatedUsers = users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, fullName, email, role, phone, avatarUrl }
            : u
        );
        setUsers(updatedUsers);
        showToast('แก้ไขข้อมูลทีมงาน (Mockup) เรียบร้อยแล้ว (บันทึกเฉพาะชั่วคราว)', 'success');
      } else {
        // Edit in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            email: email.trim(),
            role: role,
            phone: phone.trim(),
            avatar_url: avatarUrl.trim() || null
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        showToast('แก้ไขข้อมูลทีมงานเรียบร้อยแล้ว!', 'success');
        loadUsers();
      }
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error editing user:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async () => {
    if (!selectedUser) return;

    // Save deleted email in localStorage to prevent mock fallback from showing it again
    const emailToDelete = selectedUser.email.toLowerCase();
    let deletedList: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('deleted_emails');
        if (saved) {
          deletedList = JSON.parse(saved);
        }
      } catch (e) {
        console.error(e);
      }
      if (!deletedList.includes(emailToDelete)) {
        deletedList.push(emailToDelete);
        localStorage.setItem('deleted_emails', JSON.stringify(deletedList));
      }
    }

    setSubmitting(true);
    try {
      if (isMockUser(selectedUser.id)) {
        // Just delete locally for mock users
        const updatedUsers = users.filter(u => u.id !== selectedUser.id);
        setUsers(updatedUsers);
        showToast('ลบสมาชิกทีมงาน (Mockup) เรียบร้อยแล้ว', 'success');
      } else {
        // Delete from Supabase
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', selectedUser.id);

        if (error) throw error;
        
        // Remove from local state immediately
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        showToast('ลบสมาชิกทีมงานออกจากระบบแล้ว!', 'success');
      }
      setIsDeleteModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };



  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-red-500/30';
      case 'admin': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pm': return 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/20';
      case 'designer': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'factory': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'installer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'เจ้าของกิจการ (Owner)';
      case 'admin': return 'ผู้ดูแลระบบ (Admin)';
      case 'pm': return 'ผู้จัดการโครงการ (Project Manager)';
      case 'designer': return 'ผู้ออกแบบ (Designer)';
      case 'factory': return 'หัวหน้าฝ่ายผลิต (Factory)';
      case 'installer': return 'หัวหน้าช่างติดตั้ง (Installer)';
      case 'contractor': return 'ผู้รับเหมาช่วง (Subcontractor)';
      case 'customer': return 'ลูกค้า (Customer)';
      default: return role;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg transition-all transform duration-300 translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950/90 border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1f212d] pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">ทีมงาน</h2>
          <p className="text-xs text-gray-400 mt-1">รายชื่อพนักงาน ฝ่ายออกแบบ ฝ่ายผลิตโรงงาน และช่างผู้เชี่ยวชาญการติดตั้ง built-in</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#d4af37] to-[#c5a880] rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md shadow-[#d4af37]/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
          <span>กำลังดึงข้อมูลและวิเคราะห์ทีมงาน...</span>
        </div>
      ) : (
        /* Team Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(usr => (
            <div key={usr.id} className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col items-center text-center space-y-4 group relative overflow-hidden">
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => openEditModal(usr)}
                  title="แก้ไขข้อมูล"
                  className="p-1.5 rounded-lg bg-[#1f212d]/80 hover:bg-[#c5a880] text-gray-400 hover:text-black transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDeleteModal(usr)}
                  title="ลบสมาชิก"
                  className="p-1.5 rounded-lg bg-[#1f212d]/80 hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Avatar picture wrapper */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1.5px] group-hover:scale-105 transition-transform duration-300 select-none overflow-hidden flex items-center justify-center">
                {usr.avatarUrl ? (
                  <img
                    src={usr.avatarUrl}
                    alt={usr.fullName}
                    onError={(e) => {
                      // Remove broken image source to show initials fallback
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover rounded-full bg-[#12131a]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center font-bold text-[#c5a880] text-lg">
                    {usr.fullName.substring(0, 2)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{usr.fullName}</h3>
                <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border mt-2 ${getRoleBadge(usr.role)}`}>
                  {getRoleLabel(usr.role)}
                </span>
              </div>

              <div className="w-full pt-4 border-t border-[#1f212d] text-left space-y-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="truncate" title={usr.email}>{usr.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span>{usr.phone || '081-234-5678'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="text-gray-500">สิทธิ์ระบบ: </span>
                  <span className="text-gray-300 font-semibold">
                    {usr.role === 'owner' || usr.role === 'admin' ? 'เต็มระบบ' : 'ตามสิทธิ์งาน'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD MEMBER MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">เพิ่มสมาชิกทีมงานใหม่</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddMember} className="p-5 space-y-4">
              
              {/* Profile Photo Uploader Section */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-[#2d2f3d] hover:border-[#c5a880] bg-[#1c1d24] flex flex-col items-center justify-center cursor-pointer overflow-hidden group/avatar relative transition-all"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
                  ) : avatarUrl ? (
                    <>
                      <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-gray-500 group-hover/avatar:text-[#c5a880] transition-colors" />
                      <span className="text-[8px] text-gray-500 group-hover/avatar:text-[#c5a880] mt-1 text-center font-bold">อัปโหลดรูป</span>
                    </>
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <span className="text-[9px] text-gray-500">แตะวงกลมเพื่ออัปโหลดจากมือถือหรือคอมพิวเตอร์</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อและนามสกุล"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">อีเมล *</label>
                <input
                  type="email"
                  required
                  placeholder="name@ppprojecthub.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">บทบาทหน้าที่ *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  >
                    <option value="owner">เจ้าของกิจการ (Owner)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                    <option value="pm">ผู้จัดการโครงการ (PM)</option>
                    <option value="designer">ดีไซเนอร์ (Designer)</option>
                    <option value="factory">หัวหน้าฝ่ายผลิต (Factory)</option>
                    <option value="installer">ช่างติดตั้ง (Installer)</option>
                    <option value="contractor">ผู้รับเหมาช่วง (Subcontractor)</option>
                    <option value="customer">ลูกค้า (Customer)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รูปภาพโปรไฟล์ (ลิงก์ URL)</label>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1"><Link2 className="w-3 h-3" /> หรือใส่ลิงก์ตรง</span>
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingAvatar}
                  className="w-1/2 bg-gradient-to-r from-[#d4af37] to-[#c5a880] hover:opacity-90 text-black font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึก</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MEMBER MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">แก้ไขข้อมูลสมาชิก</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditMember} className="p-5 space-y-4">
              
              {/* Profile Photo Uploader Section */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-[#2d2f3d] hover:border-[#c5a880] bg-[#1c1d24] flex flex-col items-center justify-center cursor-pointer overflow-hidden group/avatar relative transition-all"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
                  ) : avatarUrl ? (
                    <>
                      <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-gray-500 group-hover/avatar:text-[#c5a880] transition-colors" />
                      <span className="text-[8px] text-gray-500 group-hover/avatar:text-[#c5a880] mt-1 text-center font-bold">อัปโหลดรูป</span>
                    </>
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <span className="text-[9px] text-gray-500">แตะวงกลมเพื่ออัปโหลดจากมือถือหรือคอมพิวเตอร์</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อและนามสกุล"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">อีเมล *</label>
                <input
                  type="email"
                  required
                  placeholder="name@ppprojecthub.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">บทบาทหน้าที่ *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  >
                    <option value="owner">เจ้าของกิจการ (Owner)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                    <option value="pm">ผู้จัดการโครงการ (PM)</option>
                    <option value="designer">ดีไซเนอร์ (Designer)</option>
                    <option value="factory">หัวหน้าฝ่ายผลิต (Factory)</option>
                    <option value="installer">ช่างติดตั้ง (Installer)</option>
                    <option value="contractor">ผู้รับเหมาช่วง (Subcontractor)</option>
                    <option value="customer">ลูกค้า (Customer)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รูปภาพโปรไฟล์ (ลิงก์ URL)</label>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1"><Link2 className="w-3 h-3" /> หรือแก้ไขลิงก์ตรง</span>
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingAvatar}
                  className="w-1/2 bg-gradient-to-r from-[#d4af37] to-[#c5a880] hover:opacity-90 text-black font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังอัปเดต...</span>
                    </>
                  ) : (
                    <span>อัปเดต</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-sm bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">ต้องการลบสมาชิกทีมงานใช่หรือไม่?</h3>
                <p className="text-xs text-gray-400">
                  คุณกำลังจะลบ <strong className="text-white">{selectedUser.fullName}</strong> ({getRoleLabel(selectedUser.role)}) ออกจากระบบทีมงาน การกระทำนี้ไม่สามารถย้อนคืนได้
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMember}
                  disabled={submitting}
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังลบ...</span>
                    </>
                  ) : (
                    <span>ใช่, ต้องการลบ</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
