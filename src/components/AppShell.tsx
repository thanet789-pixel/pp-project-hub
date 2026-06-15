'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  FileSpreadsheet
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
  const [sidebarTheme, setSidebarTheme] = useState('obsidian');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_sidebar_theme') || 'obsidian';
    setSidebarTheme(savedTheme);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('app_sidebar_theme') || 'obsidian';
      setSidebarTheme(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);

  const getThemeClasses = () => {
    switch (sidebarTheme) {
      case 'navy':
        return {
          sidebar: 'bg-[#0f172a] border-r border-[#1e293b]',
          header: 'bg-[#0f172a]/85 backdrop-blur-md border-b border-[#1e293b]',
          mobileNav: 'bg-[#1e293b]/95 backdrop-blur-md border-t border-[#334155]',
          mobileSidebar: 'bg-[#0f172a] border-r border-[#1e293b]'
        };
      case 'charcoal':
        return {
          sidebar: 'bg-[#18181b] border-r border-[#27272a]',
          header: 'bg-[#18181b]/85 backdrop-blur-md border-b border-[#27272a]',
          mobileNav: 'bg-[#27272a]/95 backdrop-blur-md border-t border-[#3f3f46]',
          mobileSidebar: 'bg-[#18181b] border-r border-[#27272a]'
        };
      case 'glass':
        return {
          sidebar: 'bg-black/40 backdrop-blur-xl border-r border-white/10',
          header: 'bg-black/25 backdrop-blur-md border-b border-white/10',
          mobileNav: 'bg-black/60 backdrop-blur-xl border-t border-white/10',
          mobileSidebar: 'bg-[#0f111a]/90 backdrop-blur-xl border-r border-white/10'
        };
      case 'obsidian':
      default:
        return {
          sidebar: 'bg-[#0a0b10] border-r border-[#1a1c26]',
          header: 'bg-[#0a0b10]/85 backdrop-blur-md border-b border-[#1a1c26]',
          mobileNav: 'bg-[#0c0d12]/95 backdrop-blur-md border-t border-[#1f212d]',
          mobileSidebar: 'bg-[#0c0d12] border-r border-[#1f212d]'
        };
    }
  };

  const theme = getThemeClasses();

  const menuItems = [
    { href: '/', label: 'หน้าหลัก', icon: Home },
    { href: '/projects', label: 'โปรเจกต์', icon: FolderOpen },
    { href: '/boq', label: 'ประมาณราคา BOQ', icon: FileSpreadsheet },
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
    <div className="flex h-screen bg-transparent overflow-hidden text-gray-200">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col w-64 shrink-0 transition-all duration-300 ${theme.sidebar}`}>
        {/* Brand Logo */}
        <div className="p-6 border-b border-[#1a1c26] flex flex-col items-center select-none">
          <div className="text-3xl font-extrabold tracking-widest gold-text-gradient font-outfit">
            PP
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-bold mt-1.5">
            Project Hub
          </div>
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mt-0.5">
            Interior & Built-in
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-6 overflow-y-auto space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent border-l-2 border-[#d4af37] text-white font-semibold shadow-[inset_4px_0_12px_rgba(212,175,55,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-[#d4af37] scale-105 filter drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]' : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-105'
                  }`} />
                  <span className="text-xs font-medium tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 font-bold scale-90">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1a1c26] bg-[#090a0f]/40 flex items-center justify-between group relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0a0b10] flex items-center justify-center font-bold text-white text-xs">
                กพ
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-white">กฤษดา พรหมเมือง</div>
              <div className="text-[10px] text-[#c5a880] font-semibold mt-0.5">เจ้าของบริษัท</div>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="text-gray-400 hover:text-white p-1 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Profile Quick Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-16 left-4 w-48 glass-modal rounded-xl shadow-2xl p-2 z-50 animate-scaleUp">
              <div className="px-3 py-2 border-b border-[#1a1c26] mb-1">
                <p className="text-[9px] text-gray-500 font-bold uppercase">เข้าใช้งานโดย</p>
                <p className="text-[10px] font-extrabold text-[#c5a880] truncate">owner@ppprojecthub.com</p>
              </div>
              <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="block px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg font-medium transition-colors">
                ตั้งค่าบัญชี
              </Link>
              <button onClick={() => alert('Log out simulated')} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors">
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm transition-all duration-300 ${theme.header}`}>
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <h1 className="text-sm font-extrabold text-white tracking-wide uppercase font-outfit">
              {getPageTitle()}
            </h1>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-4">
            {/* Search Input - Desktop */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12131a] border border-[#1a1c26] w-64 group focus-within:border-[#c5a880]/50 transition-all duration-300">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="ค้นหาโปรเจกต์, งาน..."
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-500 font-medium"
              />
              <span className="text-[9px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded select-none font-bold">
                ⌘K
              </span>
            </div>

            {/* AI Search Shortcut Button */}
            <Link 
              href="/ai-assistant"
              className="hidden md:flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#c5a880]/20 hover:border-[#c5a880]/50 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent text-[#c5a880] text-xs font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Search</span>
            </Link>

            {/* Notification Dropdown Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl bg-[#12131a] border border-[#1a1c26] text-gray-400 hover:text-white relative hover:bg-white/5 transition-all duration-300"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-extrabold">
                  {mockNotifications.filter(n => !n.isRead).length}
                </span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 glass-modal rounded-xl shadow-2xl z-50 p-4 animate-scaleUp">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1a1c26] mb-2.5">
                    <span className="text-xs font-extrabold text-white">การแจ้งเตือนล่าสุด</span>
                    <button className="text-[10px] text-[#c5a880] hover:underline font-bold">
                      อ่านทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin">
                    {mockNotifications.map(item => (
                      <div 
                        key={item.id} 
                        className={`p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                          item.isRead ? 'bg-transparent border-transparent' : 'bg-[#181b26]/30 border-[#1a1c26] hover:bg-[#181b26]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-extrabold text-[8px] px-1.5 py-0.5 rounded border ${
                            item.type === 'warning' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            item.type === 'alert' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {item.type === 'warning' ? 'ด่วนที่สุด' : item.type === 'alert' ? 'เตือนภัย' : 'ทั่วไป'}
                          </span>
                          <span className="text-[9px] text-gray-500">10 นาทีที่แล้ว</span>
                        </div>
                        <p className="font-bold text-gray-200 mb-0.5">{item.title}</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Header */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1px] cursor-pointer active:scale-95 transition-transform" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="w-full h-full rounded-full bg-[#0a0b10] flex items-center justify-center font-bold text-[#c5a880] text-xs select-none">
                ก
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - bottom padding added on mobile to prevent bottom nav overlay */}
        <main className="flex-1 overflow-y-auto bg-transparent relative scrollbar-thin pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}

      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 z-40 flex items-center justify-around px-4 pb-safe shadow-lg transition-all duration-300 ${theme.mobileNav}`}>
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
          <div className={`w-64 h-full flex flex-col animate-in slide-in-from-left duration-300 transition-all duration-300 ${theme.mobileSidebar}`}>
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
