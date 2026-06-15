'use client';

import React, { useState, useEffect } from 'react';
import { mockContractors } from '@/lib/mockData';
import { Contractor } from '@/lib/types';
import { Briefcase, Star, Phone, DollarSign, Award, CheckCircle, Plus, Edit2, Trash2, X, Loader2, Check, Mail, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>(mockContractors);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  // Form Fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [jobCategory, setJobCategory] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const [totalContractValue, setTotalContractValue] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(80);

  // Status indicators
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Fetch contractors from Supabase and merge with mock contractors
  const loadContractors = async () => {
    try {
      setLoading(true);

      // Load deleted list from localStorage
      let deletedList: string[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('deleted_contractors');
          if (saved) {
            deletedList = JSON.parse(saved).map((n: string) => n.toLowerCase());
          }
        } catch (e) {
          console.error('Error parsing deleted_contractors:', e);
        }
      }

      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      let merged = [...mockContractors.filter(c => !deletedList.includes(c.name.toLowerCase()))];
      if (data && data.length > 0) {
        const mapped: Contractor[] = data
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || '',
            email: c.email || '',
            rating: Number(c.rating || 0),
            jobCategory: c.job_category || '',
            contractUrl: c.contract_url || '',
            paymentStatus: c.payment_status || 'pending',
            totalContractValue: Number(c.total_contract_value || 0),
            performanceScore: Number(c.performance_score || 80)
          }))
          .filter(c => !deletedList.includes(c.name.toLowerCase()));

        // Merge DB with mock (deduplicate by name)
        const dbNames = mapped.map(c => c.name.toLowerCase());
        merged = [
          ...mapped,
          ...mockContractors.filter(mc => 
            !dbNames.includes(mc.name.toLowerCase()) && 
            !deletedList.includes(mc.name.toLowerCase())
          )
        ];
      } else {
        merged = mockContractors.filter(c => !deletedList.includes(c.name.toLowerCase()));
      }
      setContractors(merged);
    } catch (err) {
      console.error('Error loading contractors:', err);
      showToast('ไม่สามารถดึงข้อมูลผู้รับเหมาจากระบบได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, []);

  // Check if ID belongs to mock data
  const isMockContractor = (id: string) => {
    return id.startsWith('c') && id.length <= 3;
  };

  // Reset form inputs
  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRating(5);
    setJobCategory('');
    setContractUrl('');
    setPaymentStatus('pending');
    setTotalContractValue(0);
    setPerformanceScore(85);
    setSelectedContractor(null);
  };

  // Open Edit Modal
  const openEditModal = (c: Contractor) => {
    setSelectedContractor(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setRating(c.rating);
    setJobCategory(c.jobCategory);
    setContractUrl(c.contractUrl || '');
    setPaymentStatus(c.paymentStatus);
    setTotalContractValue(c.totalContractValue);
    setPerformanceScore(c.performanceScore);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (c: Contractor) => {
    setSelectedContractor(c);
    setIsDeleteModalOpen(true);
  };

  // Handle Add Contractor
  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !jobCategory) {
      showToast('กรุณากรอกข้อมูล ชื่อผู้รับเหมา และ ประเภทงาน', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('contractors')
        .insert([
          {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            rating: Number(rating),
            job_category: jobCategory.trim(),
            contract_url: contractUrl.trim() || null,
            payment_status: paymentStatus,
            total_contract_value: Number(totalContractValue),
            performance_score: Number(performanceScore)
          }
        ])
        .select();

      if (error) throw error;

      showToast('เพิ่มผู้รับเหมาช่วงรายใหม่สำเร็จแล้ว!', 'success');
      setIsAddModalOpen(false);
      resetForm();
      loadContractors();
    } catch (err: any) {
      console.error('Error adding contractor:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Contractor
  const handleEditContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractor) return;
    if (!name || !jobCategory) {
      showToast('กรุณากรอกข้อมูล ชื่อผู้รับเหมา และ ประเภทงาน', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isMockContractor(selectedContractor.id)) {
        // Mock edit locally
        const updated = contractors.map(c => 
          c.id === selectedContractor.id 
            ? { ...c, name, phone, email, rating, jobCategory, contractUrl, paymentStatus, totalContractValue, performanceScore }
            : c
        );
        setContractors(updated);
        showToast('แก้ไขข้อมูลผู้รับเหมาจำลองเรียบร้อยแล้ว', 'success');
      } else {
        // Update Supabase
        const { error } = await supabase
          .from('contractors')
          .update({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            rating: Number(rating),
            job_category: jobCategory.trim(),
            contract_url: contractUrl.trim() || null,
            payment_status: paymentStatus,
            total_contract_value: Number(totalContractValue),
            performance_score: Number(performanceScore)
          })
          .eq('id', selectedContractor.id);

        if (error) throw error;
        showToast('อัปเดตข้อมูลผู้รับเหมาเรียบร้อยแล้ว!', 'success');
        loadContractors();
      }
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error editing contractor:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Contractor
  const handleDeleteContractor = async () => {
    if (!selectedContractor) return;

    // Save to deleted list in localStorage
    const nameToDelete = selectedContractor.name.toLowerCase();
    let deletedList: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('deleted_contractors');
        if (saved) {
          deletedList = JSON.parse(saved);
        }
      } catch (e) {
        console.error(e);
      }
      if (!deletedList.includes(nameToDelete)) {
        deletedList.push(nameToDelete);
        localStorage.setItem('deleted_contractors', JSON.stringify(deletedList));
      }
    }

    setSubmitting(true);
    try {
      if (isMockContractor(selectedContractor.id)) {
        // Mock delete locally
        const updated = contractors.filter(c => c.id !== selectedContractor.id);
        setContractors(updated);
        showToast('ลบข้อมูลผู้รับเหมาจำลองเรียบร้อยแล้ว', 'success');
      } else {
        // Delete from Supabase
        const { error } = await supabase
          .from('contractors')
          .delete()
          .eq('id', selectedContractor.id);

        if (error) throw error;

        setContractors(prev => prev.filter(c => c.id !== selectedContractor.id));
        showToast('ลบผู้รับเหมาช่วงออกจากระบบแล้ว!', 'success');
      }
      setIsDeleteModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error deleting contractor:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredContractors = contractors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.jobCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.jobCategory.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filtering
  const categories = ['all', ...Array.from(new Set(contractors.map(c => c.jobCategory.split(' / ')[0].toLowerCase())))];

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
          <h2 className="text-lg font-bold text-white tracking-wide">ผู้รับเหมาช่วง (Subcontractors)</h2>
          <p className="text-xs text-gray-400 mt-1">รายการประเมินผลงาน ผู้รับเหมาโครงเหล็ก ระบบไฟฟ้า ประปา กระจก และหินงานติดตั้ง</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#d4af37] to-[#c5a880] rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md shadow-[#d4af37]/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้รับเหมาใหม่</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#12131a] p-4 rounded-2xl border border-[#1f212d]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อผู้รับเหมา หรือประเภทงาน..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-4 py-2.5 text-xs text-white capitalize focus:outline-none focus:border-[#c5a880] transition-colors min-w-[150px]"
        >
          <option value="all">ทุกประเภทงาน</option>
          {categories.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-24 text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
          <span>กำลังดึงข้อมูลผู้รับเหมาช่วง...</span>
        </div>
      ) : filteredContractors.length === 0 ? (
        <div className="text-center py-24 bg-[#12131a] border border-[#1f212d] rounded-2xl text-xs text-gray-500">
          ไม่พบข้อมูลผู้รับเหมาที่ตรงตามเงื่อนไขค้นหา
        </div>
      ) : (
        /* Contractors Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredContractors.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden">
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => openEditModal(c)}
                  title="แก้ไขข้อมูล"
                  className="p-1.5 rounded-lg bg-[#1f212d]/80 hover:bg-[#c5a880] text-gray-400 hover:text-black transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDeleteModal(c)}
                  title="ลบผู้รับเหมา"
                  className="p-1.5 rounded-lg bg-[#1f212d]/80 hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-[#c5a880]/10 text-[#c5a880] group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {/* Rating stars */}
                  <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{c.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{c.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold mt-1 block tracking-wider">{c.jobCategory}</span>
                </div>
              </div>

              {/* Performance KPI & payment status */}
              <div className="border-t border-[#1f212d] pt-4 space-y-2.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">🏆 คะแนนผลงาน</span>
                  <span className="text-white font-bold">{c.performanceScore}%</span>
                </div>
                {/* Progress bar for score */}
                <div className="w-full h-1 bg-[#1c1d24] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      c.performanceScore >= 90 ? 'bg-emerald-500' :
                      c.performanceScore >= 75 ? 'bg-[#d4af37]' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${c.performanceScore}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-gray-500">💰 มูลค่าสัญญา</span>
                  <span className="text-white font-bold">฿{c.totalContractValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">💳 สถานะชำระเงิน</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold capitalize ${
                    c.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    c.paymentStatus === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {c.paymentStatus === 'paid' ? 'ชำระครบแล้ว' : c.paymentStatus === 'partial' ? 'จ่ายบางส่วน' : 'รอชำระ'}
                  </span>
                </div>
                
                {/* Contact details */}
                <div className="flex flex-col gap-1 text-[10px] text-gray-500 pt-2 border-t border-[#1f212d]/50">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-600" />
                    <span>{c.phone || 'ไม่ระบุเบอร์โทร'}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-600" />
                      <span className="truncate" title={c.email}>{c.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  if (c.contractUrl) {
                    window.open(c.contractUrl, '_blank');
                  } else {
                    alert(`ข้อมูลผู้รับเหมา: ${c.name}\nเบอร์โทร: ${c.phone}\nประเภทงาน: ${c.jobCategory}`);
                  }
                }}
                className="w-full py-2 border border-[#1f212d] hover:border-[#c5a880]/30 hover:bg-[#c5a880]/5 rounded-xl text-xs text-gray-300 hover:text-white font-bold transition-all mt-1"
              >
                {c.contractUrl ? 'ดาวน์โหลดเอกสารสัญญา' : 'ดูรายละเอียดติดต่อ'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD CONTRACTOR MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">เพิ่มผู้รับเหมาช่วงรายใหม่</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContractor} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อผู้รับเหมา / ห้างหุ้นส่วน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หจก. แสงทอง เอ็นจิเนียริ่ง"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ประเภทงานติดตั้ง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น electrical / wiring"
                    value={jobCategory}
                    onChange={e => setJobCategory(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">คะแนนผลงาน (0-100)%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={performanceScore}
                    onChange={e => setPerformanceScore(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ระดับดาวเรตติ้ง (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">มูลค่าสัญญา (บาท)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={totalContractValue || ''}
                    onChange={e => setTotalContractValue(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">สถานะชำระเงิน</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  >
                    <option value="pending">รอชำระ (Pending)</option>
                    <option value="partial">จ่ายบางส่วน (Partial)</option>
                    <option value="paid">ชำระครบแล้ว (Paid)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">อีเมลติดต่อ (ไม่จำเป็น)</label>
                <input
                  type="email"
                  placeholder="contractor@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ลิงก์เอกสารสัญญา (ไม่จำเป็น)</label>
                <input
                  type="text"
                  placeholder="https://example.com/contract.pdf"
                  value={contractUrl}
                  onChange={e => setContractUrl(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

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
                  disabled={submitting}
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

      {/* ================= EDIT CONTRACTOR MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">แก้ไขข้อมูลผู้รับเหมา</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditContractor} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อผู้รับเหมา / ห้างหุ้นส่วน *</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อผู้รับเหมา"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ประเภทงานติดตั้ง *</label>
                  <input
                    type="text"
                    required
                    placeholder="ประเภทงาน"
                    value={jobCategory}
                    onChange={e => setJobCategory(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    placeholder="เบอร์โทรศัพท์"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">คะแนนผลงาน (0-100)%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={performanceScore}
                    onChange={e => setPerformanceScore(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ระดับดาวเรตติ้ง (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">มูลค่าสัญญา (บาท)</label>
                  <input
                    type="number"
                    value={totalContractValue || ''}
                    onChange={e => setTotalContractValue(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">สถานะชำระเงิน</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  >
                    <option value="pending">รอชำระ (Pending)</option>
                    <option value="partial">จ่ายบางส่วน (Partial)</option>
                    <option value="paid">ชำระครบแล้ว (Paid)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">อีเมลติดต่อ</label>
                <input
                  type="email"
                  placeholder="contractor@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ลิงก์เอกสารสัญญา</label>
                <input
                  type="text"
                  placeholder="https://example.com/contract.pdf"
                  value={contractUrl}
                  onChange={e => setContractUrl(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

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
                  disabled={submitting}
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
      {isDeleteModalOpen && selectedContractor && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-sm bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">ต้องการลบผู้รับเหมาช่วงใช่หรือไม่?</h3>
                <p className="text-xs text-gray-400">
                  คุณกำลังจะลบ <strong className="text-white">{selectedContractor.name}</strong> ({selectedContractor.jobCategory}) ออกจากระบบ การกระทำนี้ไม่สามารถย้อนคืนได้
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
                  onClick={handleDeleteContractor}
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
