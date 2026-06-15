'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Printer, 
  Eye, 
  EyeOff, 
  Folder, 
  User, 
  MapPin, 
  TrendingUp,
  Percent,
  Calculator,
  Box
} from 'lucide-react';

// Interfaces
interface BOQItem {
  id: string;
  area: string; // e.g. "Master Bedroom"
  name: string; // e.g. "ตู้เสื้อผ้าบิวต์อิน"
  specs: string; // Specs description
  unit: string; // m, sq.m, job, pcs
  quantity: number;
  rate: number; // Client facing unit price
  costPerUnit: number; // Internal cost price
}

interface BOQ {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  location: string;
  status: 'draft' | 'approved' | 'rejected';
  date: string;
  creatorName: string;
  markupPercent: number; // internal profit margin %
  items: BOQItem[];
}

// Built-in furniture pre-defined templates for quick adding
const FURNITURE_TEMPLATES = [
  {
    name: 'ตู้เสื้อผ้าบิวต์อิน (โครง HMR + หน้าบานลามิเนต)',
    specs: 'โครงสร้างไม้ HMR หนา 18มม. กันชื้นเกรด A, หน้าบานกรุลามิเนตลายไม้/สีพื้นเกรดนำเข้า, ราวแขวนผ้าแสตนเลส, บานพับ Soft-close (Hafele)',
    unit: 'เมตรวิ่ง',
    rate: 22000,
    costPerUnit: 15400
  },
  {
    name: 'ตู้เสื้อผ้าบิวต์อินหน้าบานกระจกเงาชาทองกรอบอลูมิเนียม',
    specs: 'โครง HMR กันชื้นสีเทาชาร์โคล, หน้าบานกระจกเงาชาทองเจียรปริมกรอบอลูมิเนียมชุบสีทองอโนไดซ์, รางเลื่อนอลูมิเนียมแบรนด์เยอรมัน',
    unit: 'เมตรวิ่ง',
    rate: 26000,
    costPerUnit: 18200
  },
  {
    name: 'ผนังตกแต่งกรุกันเสียงหัวเตียง (Bedhead Wall Paneling)',
    specs: 'กรุไม้ MDF หุ้มด้วยฟองน้ำเกรดนุ่มพิเศษบุผ้าสังเคราะห์กันฝุ่นขลิบคิ้วสเตนเลสสีทองกระจกเงา สลับระแนงไม้เนื้อจริงสีวอลนัท',
    unit: 'ตร.ม.',
    rate: 4800,
    costPerUnit: 3200
  },
  {
    name: 'ตู้วางทีวีบิวต์อินพร้อมตู้โชว์กระจกสูงซ่อนไฟ LED',
    specs: 'โครงไม้อัดยางกรุวีเนียร์พ่นสีลายไม้ธรรมชาติ สลับหินอ่อนสังเคราะห์หน้าตู้วางทีวี, บานพับเปิดเปิดกระจกใสเทมเปอร์กรอบอลูมิเนียมบางเฉียบซ่อน LED แสงวอร์ม',
    unit: 'เมตรวิ่ง',
    rate: 19500,
    costPerUnit: 13500
  },
  {
    name: 'เคาน์เตอร์ครัวล่าง (Base Kitchen Cabinet - กันน้ำ 100%)',
    specs: 'โครงสร้างไม้อัดแท้เกรดพรีเมียม (Plywood) เคลือบฟิล์มกันน้ำ, หน้าบานลามิเนตทนรอยขีดข่วนและความร้อน, อุปกรณ์รางลิ้นชักรับใต้ระบบสองจังหวะดึงกลับอัตโนมัติ',
    unit: 'เมตรวิ่ง',
    rate: 16500,
    costPerUnit: 11000
  },
  {
    name: 'เคาน์เตอร์ครัวบน (Wall Kitchen Cabinet)',
    specs: 'โครงสร้างไม้ HMR, บานเปิดพ่นสีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด, บานพับ Soft-close พร้อมโช้คอัพบานยกไฮดรอลิก',
    unit: 'เมตรวิ่ง',
    rate: 13500,
    costPerUnit: 9000
  },
  {
    name: 'ท็อปหินควอตซ์เคาน์เตอร์ครัว (Quartz Stone Tabletop)',
    specs: 'หินควอตซ์สีขาวลายริ้วธรรมชาติ (Quartz Calacatta Marble Pattern) หนา 20มม. ทนรอยขีดข่วนทนคราบฝังแน่น เจาะช่องฝังอ่างล้างจานซ่อนใต้ท็อป',
    unit: 'เมตรวิ่ง',
    rate: 9000,
    costPerUnit: 6200
  },
  {
    name: 'ราวแขวนเสื้อผ้าอัจฉริยะพร้อมชุดไฟ LED Sensor',
    specs: 'ราวแขวนผ้าอลูมิเนียมซ่อนรางไฟ LED พร้อมเซนเซอร์เปิดอัตโนมัติเมื่อเปิดหน้าบาน แสงวอร์มไวท์ 3000K',
    unit: 'ชุด',
    rate: 3500,
    costPerUnit: 2100
  }
];

// Initial mock dataset showing 2 sample projects
const INITIAL_BOQS: BOQ[] = [
  {
    id: 'boq-1',
    projectId: 'p1',
    projectName: 'คอนโด Luxury Penthouse - คุณวรัญญา',
    clientName: 'คุณวรัญญา สิริโสภา',
    location: 'เดอะ โมนูเมนต์ ทองหล่อ (The Monument Thonglo) ชั้น 24',
    status: 'approved',
    date: '2026-06-10',
    creatorName: 'มัณฑนากร วีรพล (Designer)',
    markupPercent: 30,
    items: [
      {
        id: 'i1-1',
        area: 'Master Bedroom (ห้องนอนใหญ่)',
        name: 'ตู้เสื้อผ้าบิวต์อินหน้าบานกระจกเงาชาทองกรอบอลูมิเนียม',
        specs: 'โครง HMR กันชื้นสีเทาชาร์โคล, หน้าบานกระจกเงาชาทองเจียรปริมกรอบอลูมิเนียมชุบสีทองอโนไดซ์, รางเลื่อนอลูมิเนียมแบรนด์เยอรมัน',
        unit: 'เมตรวิ่ง',
        quantity: 3.5,
        rate: 26000,
        costPerUnit: 18200
      },
      {
        id: 'i1-2',
        area: 'Master Bedroom (ห้องนอนใหญ่)',
        name: 'ผนังตกแต่งกรุกันเสียงหัวเตียง (Bedhead Wall Paneling)',
        specs: 'กรุไม้ MDF หุ้มด้วยฟองน้ำเกรดนุ่มพิเศษบุผ้าสังเคราะห์กันฝุ่นขลิบคิ้วสเตนเลสสีทองกระจกเงา สลับระแนงไม้เนื้อจริงสีวอลนัท',
        unit: 'ตร.ม.',
        quantity: 12.0,
        rate: 4800,
        costPerUnit: 3200
      },
      {
        id: 'i1-3',
        area: 'Living Room (ห้องนั่งเล่น)',
        name: 'ตู้วางทีวีบิวต์อินพร้อมตู้โชว์กระจกสูงซ่อนไฟ LED',
        specs: 'โครงไม้อัดยางกรุวีเนียร์พ่นสีลายไม้ธรรมชาติ สลับหินอ่อนสังเคราะห์หน้าตู้วางทีวี, บานพับเปิดเปิดกระจกใสเทมเปอร์กรอบอลูมิเนียมบางเฉียบซ่อน LED แสงวอร์ม',
        unit: 'เมตรวิ่ง',
        quantity: 4.2,
        rate: 19500,
        costPerUnit: 13500
      },
      {
        id: 'i1-4',
        area: 'Kitchen Area (โซนครัวบิวต์อิน)',
        name: 'เคาน์เตอร์ครัวล่าง (Base Kitchen Cabinet - กันน้ำ 100%)',
        specs: 'โครงสร้างไม้อัดแท้เกรดพรีเมียม (Plywood) เคลือบฟิล์มกันน้ำ, หน้าบานลามิเนตทนรอยขีดข่วนและความร้อน, อุปกรณ์รางลิ้นชักรับใต้ระบบสองจังหวะดึงกลับอัตโนมัติ',
        unit: 'เมตรวิ่ง',
        quantity: 2.8,
        rate: 16500,
        costPerUnit: 11000
      },
      {
        id: 'i1-5',
        area: 'Kitchen Area (โซนครัวบิวต์อิน)',
        name: 'เคาน์เตอร์ครัวบน (Wall Kitchen Cabinet)',
        specs: 'โครงสร้างไม้ HMR, บานเปิดพ่นสีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด, บานพับ Soft-close พร้อมโช้คอัพบานยกไฮดรอลิก',
        unit: 'เมตรวิ่ง',
        quantity: 2.8,
        rate: 13500,
        costPerUnit: 9000
      },
      {
        id: 'i1-6',
        area: 'Kitchen Area (โซนครัวบิวต์อิน)',
        name: 'ท็อปหินควอตซ์เคาน์เตอร์ครัว (Quartz Stone Tabletop)',
        specs: 'หินควอตซ์สีขาวลายริ้วธรรมชาติ (Quartz Calacatta Marble Pattern) หนา 20มม. ทนรอยขีดข่วนทนคราบฝังแน่น เจาะช่องฝังอ่างล้างจานซ่อนใต้ท็อป',
        unit: 'เมตรวิ่ง',
        quantity: 2.8,
        rate: 9000,
        costPerUnit: 6200
      }
    ]
  },
  {
    id: 'boq-2',
    projectId: 'p2',
    projectName: 'บ้านเดี่ยว 2 ชั้น Centro บางนา - คุณอนันต์',
    clientName: 'คุณอนันต์ ชัยชนะ',
    location: 'Centro บางนา ซอย 12 แปลง A-15',
    status: 'draft',
    date: '2026-06-14',
    creatorName: 'PM ชาญชัย (Project Manager)',
    markupPercent: 25,
    items: [
      {
        id: 'i2-1',
        area: 'Living Room (ห้องรับแขกชั้น 1)',
        name: 'ตู้วางทีวีบิวต์อินพร้อมตู้โชว์กระจกสูงซ่อนไฟ LED',
        specs: 'โครงไม้อัดยางกรุวีเนียร์พ่นสีลายไม้ธรรมชาติ สลับหินอ่อนสังเคราะห์หน้าตู้วางทีวี, บานพับเปิดเปิดกระจกใสเทมเปอร์กรอบอลูมิเนียมบางเฉียบซ่อน LED แสงวอร์ม',
        unit: 'เมตรวิ่ง',
        quantity: 3.8,
        rate: 19500,
        costPerUnit: 14500
      },
      {
        id: 'i2-2',
        area: 'Master Bedroom (ห้องนอนใหญ่ชั้น 2)',
        name: 'ตู้เสื้อผ้าบิวต์อิน (โครง HMR + หน้าบานลามิเนต)',
        specs: 'โครงสร้างไม้ HMR หนา 18มม. กันชื้นเกรด A, หน้าบานกรุลามิเนตลายไม้/สีพื้นเกรดนำเข้า, ราวแขวนผ้าแสตนเลส, บานพับ Soft-close (Hafele)',
        unit: 'เมตรวิ่ง',
        quantity: 4.0,
        rate: 22000,
        costPerUnit: 16500
      }
    ]
  }
];

export default function BOQPage() {
  const [boqs, setBoqs] = useState<BOQ[]>(INITIAL_BOQS);
  const [selectedBOQId, setSelectedBOQId] = useState<string>('boq-1');
  const [viewMode, setViewMode] = useState<'client' | 'internal'>('client');

  // Modal State
  const [isAddBOQModalOpen, setIsAddBOQModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

  // Active BOQ Ref
  const activeBOQ = boqs.find(b => b.id === selectedBOQId) || boqs[0];

  // Forms Fields state
  // BOQ header Form
  const [projName, setProjName] = useState('');
  const [client, setClient] = useState('');
  const [loc, setLoc] = useState('');
  const [markup, setMarkup] = useState(25);

  // Item Form
  const [itemArea, setItemArea] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemSpecs, setItemSpecs] = useState('');
  const [itemUnit, setItemUnit] = useState('เมตรวิ่ง');
  const [itemQty, setItemQty] = useState(1);
  const [itemRate, setItemRate] = useState(0);
  const [itemCost, setItemCost] = useState(0);
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load from LocalStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBoqs = localStorage.getItem('company_boqs');
      if (savedBoqs) {
        try {
          setBoqs(JSON.parse(savedBoqs));
        } catch (e) {
          console.error('Error loading BOQ from localStorage:', e);
        }
      }
    }
  }, []);

  const saveToLocalStorage = (updatedBoqs: BOQ[]) => {
    setBoqs(updatedBoqs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_boqs', JSON.stringify(updatedBoqs));
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Calculations helper
  const getBOQCalculations = (boq: BOQ) => {
    const totalClientAmount = boq.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalCostAmount = boq.items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
    const profit = totalClientAmount - totalCostAmount;
    const marginPercent = totalClientAmount > 0 ? (profit / totalClientAmount) * 100 : 0;
    
    const vat = totalClientAmount * 0.07;
    const grandTotal = totalClientAmount + vat;

    return {
      subtotal: totalClientAmount,
      totalCost: totalCostAmount,
      profit: profit,
      marginPercent: marginPercent,
      vat: vat,
      grandTotal: grandTotal
    };
  };

  // Handle template selection
  const handleTemplateSelect = (index: number) => {
    const t = FURNITURE_TEMPLATES[index];
    setItemName(t.name);
    setItemSpecs(t.specs);
    setItemUnit(t.unit);
    setItemRate(t.rate);
    setItemCost(t.costPerUnit);
  };

  // Create new BOQ Sheet
  const handleCreateBOQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !client) {
      showToast('กรุณากรอกข้อมูล ชื่อโปรเจกต์ และ ลูกค้า', 'error');
      return;
    }

    const newBOQ: BOQ = {
      id: `boq-${Date.now()}`,
      projectId: `p-${Date.now()}`,
      projectName: projName,
      clientName: client,
      location: loc,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      creatorName: 'ผู้จัดการโครงการ (PM)',
      markupPercent: Number(markup) || 25,
      items: []
    };

    const updated = [newBOQ, ...boqs];
    saveToLocalStorage(updated);
    setSelectedBOQId(newBOQ.id);
    setIsAddBOQModalOpen(false);
    
    // reset fields
    setProjName('');
    setClient('');
    setLoc('');
    setMarkup(25);
    showToast('สร้างเอกสารประมาณราคา BOQ สำเร็จ!', 'success');
  };

  // Edit BOQ Markup
  const handleUpdateMarkup = (val: number) => {
    const updated = boqs.map(b => {
      if (b.id === activeBOQ.id) {
        return { ...b, markupPercent: val };
      }
      return b;
    });
    saveToLocalStorage(updated);
  };

  // Edit BOQ Status
  const handleUpdateStatus = (val: 'draft' | 'approved' | 'rejected') => {
    const updated = boqs.map(b => {
      if (b.id === activeBOQ.id) {
        return { ...b, status: val };
      }
      return b;
    });
    saveToLocalStorage(updated);
    showToast(`อัปเดตสถานะ BOQ เป็น: ${val === 'approved' ? 'อนุมัติผ่าน' : val === 'rejected' ? 'ปฏิเสธ' : 'ร่างแบบ'} เรียบร้อยแล้ว`, 'success');
  };

  // Add Item to active BOQ
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemArea || !itemName || itemQty <= 0) {
      showToast('กรุณากรอกห้อง/พื้นที่ ชื่อวัสดุ และจำนวน', 'error');
      return;
    }

    const newItem: BOQItem = {
      id: `i-${Date.now()}`,
      area: itemArea,
      name: itemName,
      specs: itemSpecs,
      unit: itemUnit,
      quantity: Number(itemQty),
      rate: Number(itemRate),
      costPerUnit: Number(itemCost)
    };

    const updated = boqs.map(b => {
      if (b.id === activeBOQ.id) {
        return { ...b, items: [...b.items, newItem] };
      }
      return b;
    });

    saveToLocalStorage(updated);
    setIsAddItemModalOpen(false);
    resetItemFields();
    showToast('เพิ่มรายการประเมินวัสดุเข้าตารางสำเร็จ!', 'success');
  };

  // Delete item from active BOQ
  const handleDeleteItem = (itemId: string) => {
    const updated = boqs.map(b => {
      if (b.id === activeBOQ.id) {
        return { ...b, items: b.items.filter(item => item.id !== itemId) };
      }
      return b;
    });
    saveToLocalStorage(updated);
    showToast('ลบรายการวัสดุออกแล้ว', 'success');
  };

  // Open edit item modal
  const openEditItemModal = (item: BOQItem) => {
    setEditingItem(item);
    setItemArea(item.area);
    setItemName(item.name);
    setItemSpecs(item.specs);
    setItemUnit(item.unit);
    setItemQty(item.quantity);
    setItemRate(item.rate);
    setItemCost(item.costPerUnit);
    setIsEditItemModalOpen(true);
  };

  // Save edited item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = boqs.map(b => {
      if (b.id === activeBOQ.id) {
        const updatedItems = b.items.map(item => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              area: itemArea,
              name: itemName,
              specs: itemSpecs,
              unit: itemUnit,
              quantity: Number(itemQty),
              rate: Number(itemRate),
              costPerUnit: Number(itemCost)
            };
          }
          return item;
        });
        return { ...b, items: updatedItems };
      }
      return b;
    });

    saveToLocalStorage(updated);
    setIsEditItemModalOpen(false);
    resetItemFields();
    setEditingItem(null);
    showToast('ปรับปรุงข้อมูลสเปก BOQ สำเร็จ!', 'success');
  };

  const resetItemFields = () => {
    setItemArea('');
    setItemName('');
    setItemSpecs('');
    setItemUnit('เมตรวิ่ง');
    setItemQty(1);
    setItemRate(0);
    setItemCost(0);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const cal = getBOQCalculations(activeBOQ);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative font-sans print:p-0 print:m-0 print:max-w-full">
      
      {/* Toast */}
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

      {/* Header controls - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-5.5 h-5.5 text-[#c5a880]" />
            <span>ประมาณราคา BOQ (Bill of Quantities)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">เครื่องมือคำนวณถอดแบบบิวต์อิน วิเคราะห์ราคาทุน คุมกำไร และทำใบเสนอราคาส่งลูกค้า</p>
        </div>

        <button 
          onClick={() => { setIsAddBOQModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#d4af37] to-[#c5a880] rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#d4af37]/10"
        >
          <Plus className="w-4 h-4" />
          <span>สร้าง BOQ โครงการใหม่</span>
        </button>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left column: BOQ list / Metadata selector - Hidden when printing */}
        <div className="space-y-4 lg:col-span-1 print:hidden">
          <div className="bg-[#12131a] border border-[#1f212d] rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ใบเสนอราคา BOQ ในระบบ</h3>
            
            <div className="space-y-2">
              {boqs.map(boq => {
                const calculations = getBOQCalculations(boq);
                const isActive = boq.id === activeBOQ.id;
                return (
                  <div 
                    key={boq.id}
                    onClick={() => setSelectedBOQId(boq.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#d4af37]/10 border-[#c5a880] shadow-[0_0_10px_rgba(197,168,128,0.05)]' 
                        : 'bg-[#1c1d24]/50 border-[#2d2f3d] hover:bg-[#1c1d24]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-[#c5a880]' : 'text-white'}`}>
                        {boq.projectName}
                      </h4>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                        boq.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        boq.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {boq.status === 'approved' ? 'อนุมัติ' : boq.status === 'rejected' ? 'ปฏิเสธ' : 'ร่างแบบ'}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 truncate mt-1">ผู้จ้าง: {boq.clientName}</p>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1f212d]/50 text-[10px] text-gray-400">
                      <span>ยอดสุทธิ:</span>
                      <strong className="text-white">฿{calculations.grandTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick controls widget */}
          {activeBOQ && (
            <div className="bg-[#12131a] border border-[#1f212d] rounded-2xl p-4 space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ตั้งค่าสำหรับฝ่ายบริหาร</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 block">อัปเดตเปอร์เซ็นต์กำไรเป้าหมาย (Internal Markup)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={activeBOQ.markupPercent}
                      onChange={e => handleUpdateMarkup(Number(e.target.value))}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl pl-3 pr-7 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                    <Percent className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 block">เปลี่ยนสถานะการเสนออนุมัติ</label>
                  <select 
                    value={activeBOQ.status}
                    onChange={e => handleUpdateStatus(e.target.value as any)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="draft">ร่างใบเสนอราคา (Draft)</option>
                    <option value="approved">ได้รับการอนุมัติ (Approved)</option>
                    <option value="rejected">ถูกปฏิเสธราคา (Rejected)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Active BOQ details / quotation layout */}
        {activeBOQ ? (
          <div className="lg:col-span-3 space-y-6">
            
            {/* View Mode controls & Actions bar - Hidden when printing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#12131a] border border-[#1f212d] p-3 rounded-2xl print:hidden">
              {/* Toggle views */}
              <div className="flex items-center gap-1.5 p-1 bg-[#1c1d24] rounded-xl border border-[#2d2f3d]">
                <button
                  onClick={() => setViewMode('client')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'client' 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black shadow-md shadow-[#d4af37]/5' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ใบเสนอราคา (Client View)</span>
                </button>
                <button
                  onClick={() => setViewMode('internal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'internal' 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black shadow-md shadow-[#d4af37]/5' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>วิเคราะห์ต้นทุน (Internal Cost View)</span>
                </button>
              </div>

              {/* Print and add buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => { resetItemFields(); setIsAddItemModalOpen(true); }}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#1f212d] hover:border-[#c5a880]/30 hover:bg-[#c5a880]/5 text-xs text-gray-300 hover:text-white font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>เพิ่มรายการถอดราคา</span>
                </button>
                
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์เอกสาร</span>
                </button>
              </div>
            </div>

            {/* Quotation Sheet Container */}
            <div className="bg-[#101118] border border-[#1f212d] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
              
              {/* Gold light reflection lines - Hidden when printing */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full print:hidden" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#c5a880]/5 blur-3xl rounded-full print:hidden" />

              {/* Sheet Header */}
              <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-[#1f212d] pb-6 print:border-gray-200">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#c5a880] p-[1.5px] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-md font-extrabold uppercase tracking-[0.2em] text-white print:text-black font-outfit">
                      Quotation / BOQ
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400 print:text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                      <span className="font-bold text-white print:text-black">{activeBOQ.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{activeBOQ.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-right text-xs text-gray-400 print:text-gray-600 md:self-end">
                  <div>เลขที่ BOQ: <span className="text-white print:text-black font-mono font-bold">{activeBOQ.id}</span></div>
                  <div>วันที่จัดเตรียม: <span className="text-white print:text-black font-mono">{activeBOQ.date}</span></div>
                  <div className="flex items-center gap-1 md:justify-end">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>ผู้เสนอราคา: {activeBOQ.creatorName}</span>
                  </div>
                </div>
              </div>

              {/* Client Billing Info Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#12131a]/60 border border-[#1f212d] p-4 rounded-2xl print:bg-gray-50 print:border-gray-200 print:text-black">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">เสนอต่อลูกค้า:</span>
                  <div className="text-xs font-bold text-white print:text-black">{activeBOQ.clientName}</div>
                  <div className="text-[10px] text-gray-400 print:text-gray-600">ที่อยู่: {activeBOQ.location}</div>
                </div>
                <div className="space-y-1 text-left md:text-right">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">บริษัทผู้ดำเนินงาน:</span>
                  <div className="text-xs font-bold text-[#c5a880] print:text-black">PP HOME FURNITURE & DESIGN</div>
                  <div className="text-[10px] text-gray-400 print:text-gray-600">เบอร์โทรศัพท์: 088-090-4970</div>
                </div>
              </div>

              {/* BOQ Items Area Groups */}
              {activeBOQ.items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#1f212d] rounded-2xl text-xs text-gray-500">
                  ยังไม่มีรายการถอดประมาณราคาสำหรับ BOQ แผ่นนี้ กรุณากดปุ่ม "เพิ่มรายการถอดราคา" ด้านบน
                </div>
              ) : (
                <div className="space-y-6 overflow-x-auto">
                  {/* Group items by area/room */}
                  {Array.from(new Set(activeBOQ.items.map(item => item.area))).map(roomName => {
                    const roomItems = activeBOQ.items.filter(item => item.area === roomName);
                    const roomSubtotal = roomItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
                    const roomCostSubtotal = roomItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
                    const roomProfit = roomSubtotal - roomCostSubtotal;
                    const roomMargin = roomSubtotal > 0 ? (roomProfit / roomSubtotal) * 100 : 0;

                    return (
                      <div key={roomName} className="space-y-3 min-w-[650px]">
                        {/* Area Title */}
                        <div className="flex justify-between items-center border-b border-[#1f212d] pb-2 print:border-gray-200">
                          <h4 className="text-xs font-bold text-[#c5a880] print:text-black flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                            <span>{roomName}</span>
                          </h4>
                          <span className="text-[10px] text-gray-400 print:text-black">
                            ยอดรวมพื้นที่: <strong className="text-white print:text-black">฿{roomSubtotal.toLocaleString()}</strong>
                            {viewMode === 'internal' && (
                              <span className="text-emerald-400 font-bold ml-1.5">
                                (กำไร: ฿{roomProfit.toLocaleString()} | {roomMargin.toFixed(0)}%)
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="text-gray-400 border-b border-[#1f212d]/60 text-[9px] font-bold uppercase tracking-wider print:text-gray-700">
                              <th className="py-2.5 pl-2 w-1/3">รายการเฟอร์นิเจอร์ / สเปกวัสดุ</th>
                              <th className="py-2.5 text-center w-12">หน่วย</th>
                              <th className="py-2.5 text-center w-12">จำนวน</th>
                              {viewMode === 'internal' && (
                                <>
                                  <th className="py-2.5 text-right w-20">ทุนต่อหน่วย</th>
                                  <th className="py-2.5 text-right w-20">ราคาทุนรวม</th>
                                </>
                              )}
                              <th className="py-2.5 text-right w-20">ราคาเสนอขาย</th>
                              <th className="py-2.5 text-right w-24">ราคารวมเสนอ</th>
                              <th className="py-2.5 text-right w-16 print:hidden">การจัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1f212d]/40 text-gray-300 print:divide-gray-200 print:text-black">
                            {roomItems.map(item => (
                              <tr key={item.id} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                                <td className="py-3 pl-2 pr-4">
                                  <div className="font-bold text-white print:text-black text-xs leading-tight">{item.name}</div>
                                  <div className="text-[9px] text-gray-500 print:text-gray-500 mt-1 leading-relaxed whitespace-pre-wrap">{item.specs}</div>
                                </td>
                                <td className="py-3 text-center text-gray-400 print:text-black">{item.unit}</td>
                                <td className="py-3 text-center text-white print:text-black font-semibold font-mono">{item.quantity}</td>
                                {viewMode === 'internal' && (
                                  <>
                                    <td className="py-3 text-right text-gray-400 font-mono">฿{item.costPerUnit.toLocaleString()}</td>
                                    <td className="py-3 text-right text-gray-400 font-mono">฿{(item.quantity * item.costPerUnit).toLocaleString()}</td>
                                  </>
                                )}
                                <td className="py-3 text-right text-gray-300 print:text-black font-mono">฿{item.rate.toLocaleString()}</td>
                                <td className="py-3 text-right text-white print:text-black font-bold font-mono">฿{(item.quantity * item.rate).toLocaleString()}</td>
                                <td className="py-3 text-right print:hidden">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => openEditItemModal(item)}
                                      className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1 rounded hover:bg-red-950/40 text-gray-400 hover:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BOQ Summary calculations */}
              <div className="border-t border-[#1f212d] pt-6 flex flex-col md:flex-row justify-between gap-6 print:border-gray-300 print:text-black">
                
                {/* Notes or signatures area */}
                <div className="text-[10px] text-gray-500 max-w-sm space-y-1.5 print:text-gray-600">
                  <span className="font-bold text-gray-400 uppercase tracking-wider block">ข้อกำหนดและเงื่อนไข:</span>
                  <p>1. ยืนยันราคาเสนอขายภายใน 30 วัน นับจากวันที่ออกเอกสาร</p>
                  <p>2. สเปกบานพับและรางลิ้นชักใช้ระบบ Soft-close คุณภาพสูงตลอดโครงการ</p>
                  <p>3. ระยะเวลาติดตั้งเข้าหน้างาน built-in คาดการณ์ 15-20 วันหลังรับงวดงานผลิตโรงงาน</p>
                  
                  {/* Signature space */}
                  <div className="pt-4 mt-4 border-t border-[#1f212d] print:border-gray-200">
                    <p className="text-[9px]">ลงนามยอมรับใบเสนอราคา:</p>
                    <div className="h-10 border-b border-[#1f212d] border-dashed w-48 mt-2 print:border-gray-300" />
                    <p className="text-[8px] text-gray-600 mt-1">ผู้ว่าจ้างโครงการ (คุณ {activeBOQ.clientName})</p>
                  </div>
                </div>

                {/* Totals Table */}
                <div className="w-full md:w-80 space-y-2 text-xs text-gray-400 print:text-black">
                  
                  {viewMode === 'internal' && (
                    <div className="flex justify-between items-center bg-[#131a18] border border-emerald-900/30 p-2.5 rounded-xl text-emerald-400 font-bold mb-3">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>วิเคราะห์อัตรากำไร (Margin)</span>
                      </span>
                      <span>{cal.marginPercent.toFixed(0)}% (฿{cal.profit.toLocaleString()})</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span>ราคางานบิวต์อินสุทธิ (Subtotal)</span>
                    <span className="text-white print:text-black font-bold font-mono">฿{cal.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {viewMode === 'internal' && (
                    <div className="flex justify-between py-1 text-gray-500 border-b border-[#1f212d] pb-2">
                      <span>ราคาทุนรวมสุทธิ (Cost)</span>
                      <span className="font-mono">฿{cal.totalCost.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                    <span className="text-white print:text-black font-semibold font-mono">฿{cal.vat.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-t border-[#1f212d] text-sm text-[#c5a880] print:border-gray-300 print:text-black font-bold">
                    <span>ราคารวมทั้งสิ้น (Grand Total)</span>
                    <span className="text-white print:text-black text-base font-extrabold font-mono">
                      ฿{cal.grandTotal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : null}

      </div>

      {/* ================= ADD NEW BOQ SHEET MODAL ================= */}
      {isAddBOQModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">สร้างเอกสารประมาณราคา BOQ ใหม่</h3>
              <button onClick={() => setIsAddBOQModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBOQ} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อโปรเจกต์บิวต์อิน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ห้องนอนใหญ่ โครงการ บ้านคุณนพพล"
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อลูกค้าโครงการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณนพพล ตันติเวช"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">สถานที่ก่อสร้าง / คอนโด</label>
                <input
                  type="text"
                  placeholder="เช่น คอนโด Ideo ลาดพร้าว ซอย 12 ชั้น 15"
                  value={loc}
                  onChange={e => setLoc(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">กำไรเป้าหมายเริ่มต้น (Markup %)</label>
                <input
                  type="number"
                  placeholder="25"
                  value={markup || ''}
                  onChange={e => setMarkup(Number(e.target.value))}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBOQModalOpen(false)}
                  className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-bold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center"
                >
                  สร้างแผ่น BOQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD ITEM TO BOQ MODAL ================= */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />

            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">เพิ่มรายการสเปกบิวต์อินลง BOQ</h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Template quick select section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">เลือกด่วนจากสเปกเฟอร์นิเจอร์มาตรฐาน:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-28 overflow-y-auto p-1.5 bg-[#1c1d24] border border-[#2d2f3d] rounded-xl scrollbar-thin">
                  {FURNITURE_TEMPLATES.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateSelect(idx)}
                      className="p-2 text-left rounded-lg bg-[#12131a] border border-[#1f212d] hover:border-[#c5a880]/40 text-[9px] text-gray-300 hover:text-white transition-all overflow-hidden truncate font-medium"
                      title={t.name}
                    >
                      {t.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">พื้นที่ / ห้อง (Area) *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น Master Bedroom, Kitchen"
                      value={itemArea}
                      onChange={e => setItemArea(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อรายการงาน *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ตู้เสื้อผ้าบิวต์อิน ความสูงชนฝ้า"
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รายละเอียดสเปกโครงสร้างและฟิตติ้ง</label>
                  <textarea
                    rows={3}
                    placeholder="กรอกสเปกวัสดุ โครงไม้ HMR หรือไม้อัดยาง, ลามิเนตยี่ห้อ สี, ระบบรางลิ้นชัก, มือจับหน้าบาน หรือไฟ LED"
                    value={itemSpecs}
                    onChange={e => setItemSpecs(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">จำนวน (Quantity) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="0.1"
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">หน่วยเรียก *</label>
                    <input
                      type="text"
                      required
                      placeholder="เมตรวิ่ง, ตร.ม., จุด"
                      value={itemUnit}
                      onChange={e => setItemUnit(e.target.value)}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ราคาเสนอชำระ / หน่วย *</label>
                    <input
                      type="number"
                      required
                      value={itemRate}
                      onChange={e => setItemRate(Number(e.target.value))}
                      className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#1c1d24] p-3.5 rounded-xl border border-[#2d2f3d]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#c5a880] uppercase">ราคาทุนวัสดุ+ค่าแรง / หน่วย</label>
                      <span className="text-[8px] text-gray-500 font-bold">เพื่อคำนวณกำไรช่าง</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={itemCost}
                      onChange={e => setItemCost(Number(e.target.value))}
                      className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  <div className="space-y-1 flex flex-col justify-end">
                    <div className="text-[10px] text-gray-400 flex items-center justify-between py-1 border-b border-[#2d2f3d]">
                      <span>ราคารวมเสนอขายรายการนี้:</span>
                      <strong className="text-white">฿{(itemQty * itemRate).toLocaleString()}</strong>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between py-1">
                      <span>ราคาทุนรวมช่าง:</span>
                      <strong>฿{(itemQty * itemCost).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(false)}
                    className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-bold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>คำนวณและเพิ่มรายการ</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT ITEM IN BOQ MODAL ================= */}
      {isEditItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />

            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">แก้ไขรายการสเปกบิวต์อิน</h3>
              <button onClick={() => setIsEditItemModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">พื้นที่ / ห้อง (Area) *</label>
                  <input
                    type="text"
                    required
                    value={itemArea}
                    onChange={e => setItemArea(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อรายการงาน *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">รายละเอียดสเปกโครงสร้างและฟิตติ้ง</label>
                <textarea
                  rows={3}
                  value={itemSpecs}
                  onChange={e => setItemSpecs(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">จำนวน (Quantity) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0.1"
                    value={itemQty}
                    onChange={e => setItemQty(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หน่วยเรียก *</label>
                  <input
                    type="text"
                    required
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ราคาเสนอชำระ / หน่วย *</label>
                  <input
                    type="number"
                    required
                    value={itemRate}
                    onChange={e => setItemRate(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#1c1d24] p-3.5 rounded-xl border border-[#2d2f3d]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#c5a880] uppercase">ราคาทุนวัสดุ+ค่าแรง / หน่วย</label>
                  <input
                    type="number"
                    value={itemCost}
                    onChange={e => setItemCost(Number(e.target.value))}
                    className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end text-[10px]">
                  <div className="text-gray-400 flex items-center justify-between py-1 border-b border-[#2d2f3d]">
                    <span>ราคารวมเสนอขายรายการนี้:</span>
                    <strong className="text-white">฿{(itemQty * itemRate).toLocaleString()}</strong>
                  </div>
                  <div className="text-gray-500 flex items-center justify-between py-1">
                    <span>ราคาทุนรวมช่าง:</span>
                    <strong>฿{(itemQty * itemCost).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditItemModalOpen(false)}
                  className="w-1/2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-bold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
