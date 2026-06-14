'use client';

import React, { useState, useEffect } from 'react';
import { mockUsers } from '@/lib/mockData';
import { User } from '@/lib/types';
import { Users, Mail, Phone, Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);

  // Fetch users from Supabase and merge with mock users
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          const mapped: User[] = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role,
            phone: u.phone || '',
            avatarUrl: u.avatar_url || ''
          }));

          // Merge db users with mock users (deduplicate by email)
          const merged = [...mapped];
          mockUsers.forEach(mu => {
            if (!merged.some(u => u.email.toLowerCase() === mu.email.toLowerCase())) {
              merged.push(mu);
            }
          });
          setUsers(merged);
        }
      } catch (err) {
        console.error('Error loading team members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

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
      case 'factory': return 'หัวหน้าฝ่ายผลิต (Factory Manager)';
      case 'installer': return 'หัวหน้าช่างติดตั้ง (Installer)';
      case 'contractor': return 'ผู้รับเหมาช่วง (Subcontractor)';
      case 'customer': return 'ลูกค้า (Customer)';
      default: return role;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-[#1f212d] pb-4">
        <h2 className="text-lg font-bold text-white tracking-wide">ทีมงาน</h2>
        <p className="text-xs text-gray-400">รายชื่อพนักงาน ฝ่ายออกแบบ ฝ่ายผลิตโรงงาน และช่างผู้เชี่ยวชาญการติดตั้ง built-in</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">กำลังดึงข้อมูลและวิเคราะห์ทีมงาน...</div>
      ) : (
        /* Team Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(usr => (
            <div key={usr.id} className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col items-center text-center space-y-4 group">
              {/* Initials avatar wrapper */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1.5px] group-hover:scale-105 transition-transform duration-300 select-none">
                <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center font-bold text-[#c5a880] text-lg">
                  {usr.fullName.substring(0, 2)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{usr.fullName}</h3>
                <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border mt-2 ${getRoleBadge(usr.role)}`}>
                  {getRoleLabel(usr.role)}
                </span>
              </div>

              <div className="w-full pt-4 border-t border-[#1f212d] text-left space-y-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-600" />
                  <span className="truncate" title={usr.email}>{usr.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-600" />
                  <span>{usr.phone || '081-234-5678'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-500">สิทธิ์เข้าใช้งานระบบ: </span>
                  <span className="text-gray-300 font-semibold">{usr.role === 'owner' || usr.role === 'admin' ? 'เต็มระบบ' : 'ตามสิทธิ์งาน'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
