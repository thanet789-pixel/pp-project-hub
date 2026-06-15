'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { mockUsers } from '@/lib/mockData';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoadingSubmit(true);

    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      setIsLoadingSubmit(false);
      return;
    }

    // Simulate premium loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const matchedUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      await loginWithEmail(matchedUser.email);
    } else {
      setError('ไม่พบบัญชีผู้ใช้นี้ หรือข้อมูลอีเมล/รหัสผ่านไม่ถูกต้อง');
    }
    setIsLoadingSubmit(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError('');
    setIsLoadingSubmit(true);
    // Auto-fill values for premium visual feedback
    setEmail(userEmail);
    setPassword('••••••••');
    await new Promise((resolve) => setTimeout(resolve, 800));
    await loginWithEmail(userEmail);
    setIsLoadingSubmit(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'เจ้าของบริษัท';
      case 'pm':
        return 'ผู้จัดการโครงการ (PM)';
      case 'designer':
        return 'ดีไซน์เนอร์';
      case 'factory':
        return 'ช่างโรงงาน (ฝ่ายผลิต)';
      case 'installer':
        return 'ช่างติดตั้ง (หน้างาน)';
      case 'customer':
        return 'ลูกค้า (Client)';
      case 'admin':
        return 'ผู้ดูแลระบบ (Admin)';
      default:
        return role;
    }
  };

  // Filter only key roles to display in quick login to keep it tidy
  const displayQuickUsers = mockUsers.filter(u => 
    ['owner', 'pm', 'designer', 'factory', 'installer'].includes(u.role)
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#07090e] font-prompt overflow-x-hidden">
      {/* Background Layer with Dark Green and Gold Ambient Light */}
      <div className="absolute inset-0 bg-[#07090e]/95 z-0" />
      
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay z-0"
        style={{ backgroundImage: "url('/images/luxury_interior_bg.png')" }}
      />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#002B22]/60 blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#d4af37]/5 blur-[120px] z-0 pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 p-7 md:p-8">
        
        {/* Top Accent Gold Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

        {/* Company Logo Header */}
        <div className="flex flex-col items-center mb-6 text-center select-none">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-[#002b22] mb-3 p-[1px] hover:border-[#d4af37]/60 transition-colors duration-500">
            <img 
              src="/images/company_logo.jpg" 
              alt="PP Home Furniture & Design Logo" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">เข้าสู่ระบบ PP PROJECT HUB</h2>
          <p className="text-xs text-gray-400 mt-1">ระบบจัดการงานบิวต์อินและตกแต่งภายในระดับพรีเมียม</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 tracking-wide uppercase">
              อีเมลผู้ใช้งาน (Email Address)
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น owner@ppprojecthub.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#101115]/80 border border-[#1f212d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/50 focus:bg-[#101115] focus:shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all duration-300"
                required
                disabled={isLoadingSubmit}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 tracking-wide uppercase">
              รหัสผ่าน (Password)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#101115]/80 border border-[#1f212d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/50 focus:bg-[#101115] focus:shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all duration-300"
                required
                disabled={isLoadingSubmit}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                disabled={isLoadingSubmit}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-[#c5a880] hover:bg-[#b0936b] active:scale-[0.98] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(197,168,128,0.15)] hover:shadow-[0_4px_25px_rgba(197,168,128,0.3)]"
            disabled={isLoadingSubmit}
          >
            {isLoadingSubmit ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#1f212d] to-transparent" />
          <span className="relative px-3 bg-[#0a0c10] text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            สำหรับผู้ทดสอบระบบ (Demo Access)
          </span>
        </div>

        {/* Quick Login Section */}
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 font-semibold text-center mb-2">
            เลือกโปรไฟล์ด่วนเพื่อสลับมุมมองทดสอบ:
          </p>
          <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto scrollbar-thin pr-1">
            {displayQuickUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.email)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#101115]/50 border border-[#1f212d] hover:border-[#d4af37]/30 hover:bg-[#151722]/80 transition-all duration-200 group text-left"
                disabled={isLoadingSubmit}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1c26] flex items-center justify-center border border-white/5 shrink-0">
                    <User className="w-3.5 h-3.5 text-[#c5a880] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-200 truncate">{u.fullName}</p>
                    <p className="text-[9px] text-[#c5a880] font-medium">{getRoleLabel(u.role)}</p>
                  </div>
                </div>
                <span className="text-[8px] text-gray-500 font-bold bg-[#14151b] px-2 py-0.5 rounded border border-[#1f212d] group-hover:text-white group-hover:border-[#d4af37]/30 transition-all duration-300">
                  ล็อกอินด่วน
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-gray-600 font-medium tracking-wide">
            © 2026 PP HOME FURNITURE & DESIGN. All Rights Reserved.
          </p>
          <p className="text-[8px] text-gray-600 mt-0.5">
            ติดต่อผู้ดูแลระบบ โทร. 088-090-4970
          </p>
        </div>

      </div>
    </div>
  );
}
