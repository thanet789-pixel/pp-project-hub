'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  Users, 
  Briefcase, 
  Box, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { mockNotifications } from '@/lib/mockData';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    { href: '/', label: 'หน้าหลัก', icon: Home },
    { href: '/projects', label: 'โปรเจกต์', icon: FolderOpen },
    { href: '/tasks', label: 'งานของฉัน', icon: CheckSquare },
    { href: '/calendar', label: 'ปฏิทิน', icon: Calendar },
    { href: '/messages', label: 'ข้อความ', icon: MessageSquare },
    { href: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Beta' },
    { href: '/reports', label: 'รายงาน', icon: BarChart3 },
    { href: '/team', label: 'ทีมงาน', icon: Users },
    { href: '/contractors', label: 'ผู้รับเหมา', icon: Briefcase },
    { href: '/inventory', label: 'คลังวัสดุ', icon: Box },
    { href: '/settings', label: 'ตั้งค่า', icon: Settings },
  ];

  // Helper to determine page title
  const getPageTitle = () => {
    if (pathname === '/') return 'หน้าหลัก';
    if (pathname?.startsWith('/projects/')) return 'รายละเอียดโปรเจกต์';
    if (pathname === '/projects') return 'โปรเจกต์ทั้งหมด';
    const active = menuItems.find(item => item.href === pathname);
    return active ? active.label : 'ระบบจัดการโปรเจกต์';
  };

  return (
    <div className="flex h-screen bg-[#090a0f] overflow-hidden text-gray-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0c0d12] border-r border-[#1f212d] shrink-0">
        {/* Brand Logo */}
        <div className="p-6 border-b border-[#1f212d] flex flex-col items-center select-none">
          <div className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#c5a880] to-[#d4af37]">
            PP
          </div>
          <div className="text-sm uppercase tracking-[0.25em] text-[#c5a880] font-bold mt-1">
            Project Hub
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Interior & Built-in
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37]/15 to-transparent border-l-2 border-[#d4af37] text-white font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-[#d4af37]' : 'text-gray-400 group-hover:text-gray-200'
                  }`} />
                  <span className="text-sm md:text-base">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 font-bold scale-90">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* LINE Integration Widget */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-b from-[#181b26] to-[#0c0d12] border border-[#1f212d]">
          <div className="flex items-center gap-2 mb-2">
            {/* Custom LINE green logo */}
            <div className="w-6 h-6 rounded-full bg-[#06c755] flex items-center justify-center text-white font-extrabold text-xs select-none">
              L
            </div>
            <div className="text-sm font-bold text-white">เชื่อมต่อ LINE</div>
          </div>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            รับการแจ้งเตือนและอัปเดตสถานะงานส่งตรงผ่าน LINE Notify
          </p>
          <Link 
            href="/settings" 
            className="block w-full py-2 px-3 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-black font-bold text-xs text-center transition-colors duration-200 shadow-md"
          >
            เชื่อมต่อเลย
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1f212d] bg-[#0c0d12]/50 flex items-center justify-between group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0c0d12] flex items-center justify-center font-bold text-white text-sm">
                กพ
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">กฤษดา พรหมเมือง</div>
              <div className="text-xs text-[#c5a880] font-medium">เจ้าของบริษัท</div>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="text-gray-400 hover:text-white p-1"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Profile Quick Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-16 right-4 w-48 bg-[#12131a] border border-[#1f212d] rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-2 border-b border-[#1f212d] mb-1">
                <p className="text-xs text-gray-400">เข้าใช้งานโดย</p>
                <p className="text-xs font-bold text-[#c5a880]">owner@ppprojecthub.com</p>
              </div>
              <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="block px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg">
                ตั้งค่าบัญชี
              </Link>
              <button onClick={() => alert('Log out simulated')} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg">
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0c0d12] border-b border-[#1f212d] flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-wide">
              {getPageTitle()}
            </h1>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-4">
            {/* Search Input - Desktop */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#1f212d] w-64 group focus-within:border-[#c5a880]/50 transition-colors">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="ค้นหาโปรเจกต์, งาน..."
                className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-500"
              />
              <span className="text-xs text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded select-none">
                ⌘K
              </span>
            </div>

            {/* AI Search Shortcut Button - Hidden on Mobile to prevent clutter */}
            <Link 
              href="/ai-assistant"
              className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#c5a880]/30 hover:border-[#c5a880]/60 bg-gradient-to-r from-[#d4af37]/10 to-transparent text-[#c5a880] text-sm font-semibold hover:shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Search</span>
            </Link>

            {/* Notification Dropdown Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg bg-[#14161e] border border-[#1f212d] text-gray-400 hover:text-white relative hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-bold scale-90">
                  {mockNotifications.filter(n => !n.isRead).length}
                </span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#12131a] border border-[#1f212d] rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1f212d] mb-2">
                    <span className="text-sm font-bold text-white">แจ้งเตือนทั้งหมด</span>
                    <button className="text-xs text-[#c5a880] hover:underline">
                      อ่านทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                    {mockNotifications.map(item => (
                      <div 
                        key={item.id} 
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          item.isRead ? 'bg-[#12131a] border-transparent' : 'bg-[#181b26]/50 border-[#1f212d] hover:bg-[#181b26]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold capitalize text-xs px-1.5 py-0.5 rounded ${
                            item.type === 'warning' ? 'bg-red-500/10 text-red-400' :
                            item.type === 'alert' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-gray-500">10 นาทีที่แล้ว</span>
                        </div>
                        <p className="font-bold text-gray-200 mb-0.5">{item.title}</p>
                        <p className="text-gray-400 text-xs">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Header */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1px] cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="w-full h-full rounded-full bg-[#0c0d12] flex items-center justify-center font-bold text-[#c5a880] text-xs">
                ก
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - bottom padding added on mobile to prevent bottom nav overlay */}
        <main className="flex-1 overflow-y-auto bg-[#090a0f] relative scrollbar-thin pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c0d12]/95 backdrop-blur-md border-t border-[#1f212d] z-40 flex items-center justify-around px-4 pb-safe shadow-lg">
        {[
          { href: '/', label: 'หน้าหลัก', icon: Home },
          { href: '/projects', label: 'โปรเจกต์', icon: FolderOpen },
          { href: '/calendar', label: 'ปฏิทิน', icon: Calendar },
          { href: '/reports', label: 'รายงาน', icon: BarChart3 }
        ].map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-[#d4af37] font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5.5 h-5.5" />
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar - Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-64 bg-[#0c0d12] h-full flex flex-col border-r border-[#1f212d] animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-[#1f212d] flex items-center justify-between">
              <span className="text-lg font-bold text-[#c5a880] uppercase tracking-wider">PP Project Hub</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d4af37]/10 border-l-2 border-[#d4af37] text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#d4af37]' : 'text-gray-400'}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Profile */}
            <div className="p-4 border-t border-[#1f212d] flex items-center gap-3 bg-[#0c0d12]/50">
              <div className="w-8 h-8 rounded-full bg-[#c5a880] flex items-center justify-center font-bold text-black text-xs">
                ก
              </div>
              <div>
                <div className="text-xs font-bold text-white">กฤษดา พรหมเมือง</div>
                <div className="text-[10px] text-[#c5a880]">เจ้าของบริษัท</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
