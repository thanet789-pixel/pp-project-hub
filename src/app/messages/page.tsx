'use client';

import React, { useState } from 'react';
import { mockProjects, mockUsers } from '@/lib/mockData';
import { Send, Phone, Video, Info, Hash, Mic, Paperclip, Smile } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
  isMe: boolean;
}

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState('บ้านคุณเอก รามอินทรา');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'ช่างต้น', senderRole: 'ช่างติดตั้ง', text: 'กำลังขนตู้ built-in ชุดล่างขึ้นชั้น 2 ครับ หน้างานกว้างพอดี ยกสะดวกครับ', time: '14:20', isMe: false },
    { id: '2', senderName: 'นิพัทธ์ เกียรติสกุล', senderRole: 'ดีไซเนอร์', text: 'ดีครับ ระวังขอบบัวทางเดินด้วยนะ ช่างวิชัยเตรียมกันกระแทกไว้ให้แล้ว', time: '14:23', isMe: false },
    { id: '3', senderName: 'กฤษดา พรหมเมือง', senderRole: 'PM (คุณ)', text: 'รับทราบครับ เดี๋ยวช่วงเย็นผมแวะเข้าไปดูหน้างานอีกที ฝากตรวจจุดวางสวิตช์ไฟด้วยนะครับ', time: '14:30', isMe: true }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: 'กฤษดา พรหมเมือง',
      senderRole: 'PM (คุณ)',
      text: inputText,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#090a0f] overflow-hidden">
      
      {/* Channels list sidebar */}
      <aside className="w-64 bg-[#0c0d12] border-r border-[#1f212d] hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1f212d] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">ช่องสื่อสารโครงการ</span>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {mockProjects.map(proj => (
            <button
              key={proj.id}
              onClick={() => setActiveChannel(proj.name)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                activeChannel === proj.name
                  ? 'bg-gradient-to-r from-[#d4af37]/15 to-transparent text-[#c5a880] border-l-2 border-[#d4af37]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="truncate">{proj.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0d0e14]/50">
        {/* Chat header */}
        <header className="h-14 border-b border-[#1f212d] flex items-center justify-between px-6 bg-[#0c0d12]/80 shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#c5a880]" />
            <span className="text-xs font-bold text-white">{activeChannel}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-white"><Phone className="w-4 h-4" /></button>
            <button className="hover:text-white"><Video className="w-4 h-4" /></button>
            <button className="hover:text-white"><Info className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Chat logs */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[80%] ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-[#c5a880] select-none shrink-0 self-start mt-0.5">
                {msg.senderName.substring(0, 2)}
              </div>
              <div className="space-y-1">
                <div className={`flex items-baseline gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-bold text-white">{msg.senderName}</span>
                  <span className="text-[9px] text-[#c5a880]">{msg.senderRole}</span>
                  <span className="text-[9px] text-gray-500">{msg.time}</span>
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  msg.isMe 
                    ? 'bg-[#c5a880]/15 border-[#c5a880]/30 text-white rounded-tr-none' 
                    : 'bg-[#181a24] border-[#1f212d] text-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat text input composer */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1f212d] bg-[#0c0d12]/50 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#14161e] border border-[#1f212d] focus-within:border-[#c5a880]/50 transition-colors">
            <button type="button" className="p-1 text-gray-500 hover:text-white transition-colors">
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`พิมพ์ส่งข้อความในช่อง #${activeChannel}...`}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-600"
            />
            <button type="button" className="p-1 text-gray-500 hover:text-white transition-colors">
              <Smile className="w-4.5 h-4.5" />
            </button>
            <button 
              type="submit" 
              className="p-1.5 rounded-lg bg-[#c5a880] text-black hover:bg-[#b0936b] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
