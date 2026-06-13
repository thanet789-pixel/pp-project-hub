'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp, 
  Image as ImageIcon,
  AlertTriangle,
  Send,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  Info,
  Calendar
} from 'lucide-react';
import { mockProjects } from '@/lib/mockData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  aiDetails?: {
    title: string;
    sections: {
      title: string;
      icon: string;
      bullets: string[];
    }[];
  };
}

export default function AiAssistant() {
  const [selectedProjectId, setSelectedProjectId] = useState('p1');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'สรุปงานวันนี้ของบ้านคุณเอกให้หน่อย',
      time: '10:30 น.'
    },
    {
      id: 'm2',
      sender: 'ai',
      text: '',
      time: '10:30 น.',
      aiDetails: {
        title: 'สรุปงานวันนี้ (18 มิ.ย. 2567) - บ้านคุณเอก รามอินทรา',
        sections: [
          {
            title: 'ความคืบหน้าโดยรวม',
            icon: '👤',
            bullets: [
              'ความคืบหน้าโปรเจกต์: 75% (เพิ่มขึ้น 5% จากเมื่อวาน)',
              'สถานะ: อยู่ในขั้นตอนการติดตั้งหน้างาน'
            ]
          },
          {
            title: 'งานที่ทำเสร็จวันนี้',
            icon: '👷‍♂️',
            bullets: [
              'ติดตั้งตู้ครัวเรียบร้อยแล้ว',
              'เดินสายไฟครัวพร้อมทดสอบไฟฟ้าเรียบร้อย'
            ]
          },
          {
            title: 'งานที่กำลังดำเนินการ',
            icon: '🕒',
            bullets: [
              'เก็บขอบบัวตู้ล่างห้องครัว',
              'ติดตั้งระบบไฟ LED ใต้ตู้แขวน'
            ]
          },
          {
            title: 'งานที่ต้องรอ / ค้าง',
            icon: '⚠️',
            bullets: [
              'รอวัสดุขอบหินเทียม 2 แผ่น (คาดว่าจะเข้าไซท์วันที่ 20 มิ.ย.)',
              'รอช่างไฟเก็บระบบสวิตช์เพิ่มตามความต้องการลูกค้า (นัดหมาย 20 มิ.ย.)'
            ]
          },
          {
            title: 'ลูกค้าแก้ไขล่าสุด',
            icon: '💬',
            bullets: [
              'ลูกค้าขอเปลี่ยนหน้าบานตู้เสื้อผ้าเป็นสีโอ๊คอ่อน แทนสีเข้มเดิม (อยู่ระหว่างส่งตัวอย่างให้เซ็นอนุมัติ)'
            ]
          }
        ]
      }
    }
  ]);

  const activeProject = mockProjects.find(p => p.id === selectedProjectId) || mockProjects[0];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Trigger AI simulated response
    setTimeout(() => {
      let response: ChatMessage;

      if (text.includes('ช้า') || text.includes('เสี่ยง')) {
        response = {
          id: `m-ai-${Date.now()}`,
          sender: 'ai',
          text: '',
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          aiDetails: {
            title: `รายงานวิเคราะห์ความเสี่ยง - ${activeProject.name}`,
            sections: [
              {
                title: 'จุดเสี่ยงสูงสุด (วิกฤต)',
                icon: '🚨',
                bullets: [
                  'การเปลี่ยนเฉดสีหน้าบานของตู้เสื้อผ้าหลัก อาจเลื่อนขั้นตอนผลิตออกไปอีก 3-5 วัน หากลูกค้าตอบรับช้า',
                  'การส่งมอบขอบหินเทียมตู้ล่างติดปัญหาขนส่ง คาดว่าเลื่อนจาก 18 เป็น 20 มิ.ย.'
                ]
              },
              {
                title: 'ข้อแนะนำแก้ปัญหา',
                icon: '💡',
                bullets: [
                  'ส่งแบบดิจิทัลผ่าน LINE ให้ลูกค้ากดอนุมัติก่อน 17:00 น. เพื่อเริ่มผลิตบานหน้าทันที',
                  'จัดตารางช่างติดตั้งให้เข้าทำงานบัวขอบส่วนอื่นก่อน เพื่อลดระยะเวลารอหน้างาน'
                ]
              }
            ]
          }
        };
      } else if (text.includes('ลูกค้า') || text.includes('แก้ไข')) {
        response = {
          id: `m-ai-${Date.now()}`,
          sender: 'ai',
          text: '',
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          aiDetails: {
            title: `ประวัติการแก้ไขและจุดเปลี่ยนแปลงความต้องการลูกค้า - ${activeProject.name}`,
            sections: [
              {
                title: 'การแก้ไขสเปกล่าสุด',
                icon: '✏️',
                bullets: [
                  '12 มิ.ย. - คุณเอกขอเปลี่ยนสีหน้าบาน built-in เป็น Oak Light (สีโอ๊คอ่อน) จากเดิมสีพ่น Charcoal',
                  '10 มิ.ย. - เพิ่มช่องเสียบปลั๊กไฟ 2 จุดบริเวณผนังหลังเคาน์เตอร์ครัว (ช่างไฟเตรียมบล็อกเรียบร้อยแล้ว)'
                ]
              },
              {
                title: 'สถานะการอนุมัติแบบ',
                icon: '📝',
                bullets: [
                  'งานครัว: อนุมัติแล้ว 100%',
                  'งานตู้เสื้อผ้าห้องนอนหลัก: รอเซ็นใบอนุมัติสีหน้าบานวัสดุใหม่'
                ]
              }
            ]
          }
        };
      } else {
        response = {
          id: `m-ai-${Date.now()}`,
          sender: 'ai',
          text: `ฉันได้รับคำถามของคุณเกี่ยวกับโปรเจกต์ "${activeProject.name}": "${text}" และกำลังนำข้อมูลจากกิจกรรมหน้างาน, รูปภาพ และไทม์ไลน์ ล่าสุดมาสรุปให้คุณสักครู่ครับ...`,
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
        };
      }

      setMessages(prev => [...prev, response]);
    }, 1200);
  };

  const handleShortcutClick = (shortcutType: string) => {
    let text = '';
    if (shortcutType === 'progress') text = 'สรุปความคืบหน้าของโปรเจกต์นี้';
    else if (shortcutType === 'delay') text = 'งานไหนมีความเสี่ยงล่าช้าสะสมบ้าง?';
    else if (shortcutType === 'customer') text = 'ลูกค้ามีการเปลี่ยนแปลงหรือแก้ไขงานส่วนไหนล่าสุด?';
    else if (shortcutType === 'issues') text = 'สรุปปัญหาและอุปสรรคสำคัญที่ต้องแก้ไขหน้างาน';
    else if (shortcutType === 'kitchen') text = 'ขอดูรายงานวิเคราะห์รูปภาพครัวล่าสุด';
    
    handleSendMessage(text);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">AI Assistant</h2>
          <p className="text-xs text-gray-400">ค้นหา วิเคราะห์รูปภาพ สรุปงาน และประเมินความเสี่ยงโปรเจกต์ด้วยปัญญาประดิษฐ์</p>
        </div>

        {/* Project Selector inside Assistant */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">โฟกัสโปรเจกต์:</span>
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none bg-[#12131a] border border-[#1f212d] text-xs font-bold text-white px-4 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#c5a880] cursor-pointer"
            >
              {mockProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#c5a880] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Chat Area (Span 2) */}
        <div className="lg:col-span-2 flex flex-col h-[650px] bg-[#12131a] border border-[#1f212d] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Quick prompt cards grid */}
          <div className="p-4 border-b border-[#1f212d] bg-[#0c0d12]/50 grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
            <button 
              onClick={() => handleShortcutClick('progress')}
              className="p-2.5 rounded-lg bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] text-left hover:border-[#c5a880]/30 transition-all text-xs"
            >
              <Clock className="w-4 h-4 text-[#c5a880] mb-1.5" />
              <div className="font-bold text-white text-[10px]">สรุปงาน</div>
              <div className="text-[8px] text-gray-500 mt-0.5 truncate">สรุปผลงานวันนี้</div>
            </button>
            <button 
              onClick={() => handleShortcutClick('delay')}
              className="p-2.5 rounded-lg bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] text-left hover:border-[#c5a880]/30 transition-all text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-[#c5a880] mb-1.5" />
              <div className="font-bold text-white text-[10px]">งานที่เสี่ยงช้า</div>
              <div className="text-[8px] text-gray-500 mt-0.5 truncate">ดูแนวโน้มล่าช้า</div>
            </button>
            <button 
              onClick={() => handleShortcutClick('customer')}
              className="p-2.5 rounded-lg bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] text-left hover:border-[#c5a880]/30 transition-all text-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#c5a880] mb-1.5" />
              <div className="font-bold text-white text-[10px]">ลูกค้าแก้แบบ</div>
              <div className="text-[8px] text-gray-500 mt-0.5 truncate">เช็คปรับปรุงแบบ</div>
            </button>
            <button 
              onClick={() => handleShortcutClick('issues')}
              className="p-2.5 rounded-lg bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] text-left hover:border-[#c5a880]/30 transition-all text-xs"
            >
              <HelpCircle className="w-4 h-4 text-[#c5a880] mb-1.5" />
              <div className="font-bold text-white text-[10px]">ปัญหาค้างคา</div>
              <div className="text-[8px] text-gray-500 mt-0.5 truncate">สรุปปัญหาหน้างาน</div>
            </button>
            <button 
              onClick={() => handleShortcutClick('kitchen')}
              className="p-2.5 rounded-lg bg-[#181a24] hover:bg-[#1f2231] border border-[#1f212d] text-left hover:border-[#c5a880]/30 transition-all text-xs col-span-2 sm:col-span-1"
            >
              <ImageIcon className="w-4 h-4 text-[#c5a880] mb-1.5" />
              <div className="font-bold text-white text-[10px]">รูปครัวล่าสุด</div>
              <div className="text-[8px] text-gray-500 mt-0.5 truncate">วิเคราะห์ภาพส่งงาน</div>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                
                {/* AI Profile Circle wrapper */}
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a880] flex items-center justify-center text-black mr-3 shrink-0 self-start mt-1 shadow-md">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                )}

                {/* Message Bubble content */}
                <div className={`max-w-[85%] p-4 rounded-2xl border text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#c5a880]/15 border-[#c5a880]/30 text-white rounded-tr-none'
                    : 'bg-[#181a24] border-[#1f212d] text-gray-200 rounded-tl-none'
                }`}>
                  
                  {/* Normal Text response */}
                  {msg.text && <p>{msg.text}</p>}

                  {/* Rich AI Details sections formatting */}
                  {msg.aiDetails && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-sm border-b border-[#1f212d] pb-2 text-[#c5a880]">
                        {msg.aiDetails.title}
                      </h4>
                      <div className="space-y-3">
                        {msg.aiDetails.sections.map((sec, sIdx) => (
                          <div key={sIdx} className="space-y-1.5">
                            <h5 className="font-bold text-white flex items-center gap-1.5">
                              <span>{sec.icon}</span>
                              <span>{sec.title}</span>
                            </h5>
                            <ul className="space-y-1 pl-5 list-disc text-gray-400 text-[11px]">
                              {sec.bullets.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action bar for AI bubble */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-3 mt-4 pt-2 border-t border-[#1f212d] text-gray-500 text-[10px] select-none">
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>ถูกใจ</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>ไม่ถูกใจ</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-white transition-colors ml-auto">
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกสรุป</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

          {/* Text input composer */}
          <div className="p-4 border-t border-[#1f212d] bg-[#0c0d12]/50 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14161e] border border-[#1f212d] focus-within:border-[#c5a880]/50 transition-colors">
              <button onClick={() => alert('แนบเอกสารวิเคราะห์')} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              <input 
                type="text" 
                placeholder="พิมพ์ถามข้อมูลเกี่ยวกับโปรเจกต์งานสร้าง ตารางเวลา หรือวัสดุที่นี่..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-600"
              />
              <button 
                onClick={() => handleSendMessage(inputText)}
                className="p-2 rounded-lg bg-[#c5a880] hover:bg-[#b0936b] text-black transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-gray-600 text-center mt-2 leading-none select-none">
              AI อาจมีข้อผิดพลาด ควรตรวจสอบข้อมูลสำคัญก่อนใช้งาน
            </p>
          </div>

        </div>

        {/* Right Column - AI Risk and Schedule summary */}
        <div className="space-y-6">
          
          {/* Circular project progress breakdown */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ภาพรวมโปรเจกต์ ({activeProject.name})</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1f212d" strokeWidth="8" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#d4af37" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * activeProject.progress) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-white">
                  {activeProject.progress}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-300 font-bold">สถานะ: {activeProject.status === 'installation' ? 'ติดตั้ง' : 'พัฒนา'}</div>
                <div className="text-[10px] text-gray-500">งบประมาณ: ฿{activeProject.budget.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* AI Risk Warnings items */}
          <div className="p-6 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ความเสี่ยงที่ต้องระวัง</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1 hover:bg-red-500/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                    ⚠️ งานติดตั้งไฟอาจล่าช้า
                  </span>
                  <span className="text-[8px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-extrabold uppercase">เสี่ยงสูง</span>
                </div>
                <p className="text-[10px] text-gray-400">ช่างไฟแจ้งอุปกรณ์ตกแต่งเลื่อนเข้าไซท์ไปนัดหมาย 20 มิ.ย.</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    ⚠️ วัสดุหินขอบหินเทียมส่งมอบช้า
                  </span>
                  <span className="text-[8px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-extrabold uppercase">เสี่ยงกลาง</span>
                </div>
                <p className="text-[10px] text-gray-400">ไม้ HMR โรงงานชำรุด 2 บอร์ด ต้องผลิตทดแทนนำเข้าใหม่</p>
              </div>

              <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 space-y-1 hover:bg-yellow-500/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                    ⚠️ สีหน้าบานตู้เสื้อผ้ารออนุมัติ
                  </span>
                  <span className="text-[8px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded font-extrabold uppercase">รอการตัดสินใจ</span>
                </div>
                <p className="text-[10px] text-gray-400">อยู่ระหว่างให้ลูกค้าพิจารณาตัวอย่างสีย้อมโอ๊คอ่อน</p>
              </div>
            </div>
          </div>

          {/* AI Log Activity updates */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">กิจกรรมอัพเดตล่าสุดจาก AI</h3>
            
            <div className="space-y-3 text-[11px] text-gray-400">
              <div className="flex gap-2">
                <span className="text-[#c5a880]">10:15</span>
                <span>AI วิเคราะห์รูปภาพใหม่ 12 รูป และระบุความถูกต้องของตำแหน่งบล็อกไฟฟ้า</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#c5a880]">09:45</span>
                <span>ตรวจสอบข้อมูลความคืบหน้า ไทม์ไลน์ และคำนวณแนวโน้มการส่งมอบใหม่</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#c5a880]">09:30</span>
                <span>วิเคราะห์การเปลี่ยนแปลงวัสดุและคำอธิบายความต้องการของลูกค้าในไลน์แชท</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
