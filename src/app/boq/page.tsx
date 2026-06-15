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
  Box,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Coins,
  BarChart3,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

// Interfaces
interface BOQItem {
  id: string;
  area: string; // e.g. "Master Bedroom"
  category: string; // e.g. "งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)"
  subCategory: string; // e.g. "โครงตู้เสื้อผ้า (Wardrobe Carcass)"
  name: string; // e.g. "ตู้เสื้อผ้าบิวต์อิน"
  carcassMaterial?: string; // วัสดุโครงสร้าง
  surfaceMaterial?: string; // วัสดุปิดผิว
  fittingBrand?: string;    // อุปกรณ์ฟิตติ้ง/บานพับ
  accessories?: string;     // อุปกรณ์เสริม/ไฟตกแต่ง
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

// Pre-defined categories and subcategories mapping for dropdowns
const FURNITURE_CATEGORIES: Record<string, string[]> = {
  'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)': [
    'โครงตู้เสื้อผ้า (Wardrobe Carcass)',
    'หน้าบานทึบ (Solid Door Panel)',
    'หน้าบานกระจก/เฟรมอลูมิเนียม (Glass/Alu-Frame Door)',
    'ลิ้นชักและฟังก์ชันภายใน (Internal Drawer & Accessories)',
    'ราวแขวนและไฟ LED (Hanging Rails & LED Lights)',
    'อื่นๆ (Other)'
  ],
  'งานครัว & โซนอาหาร (Kitchen & Dining)': [
    'เคาน์เตอร์ตู้ล่าง (Base Cabinet - กันน้ำ/กันปลวก)',
    'ตู้แขวนบน (Wall/Upper Cabinet)',
    'ตู้สูงใส่อุปกรณ์ (Tall Cabinet / Larder)',
    'หน้าบานตู้ครัว (Kitchen Door Panel)',
    'ท็อปหินเคาน์เตอร์ครัว (Countertop Stone)',
    'งานตะแกรงและอุปกรณ์ครัว (Kitchen Accessories)',
    'อื่นๆ (Other)'
  ],
  'งานผนังตกแต่ง & บุหัวเตียง (Wall Paneling & Bedhead)': [
    'โครงสร้างผนังเบา/โครงไม้ระแนง (Wall Structure & Battens)',
    'ผนังกรุผิวลามิเนต/วีเนียร์ (Laminated/Veneer Paneling)',
    'ผนังบุผ้า/หนังนุ่ม (Padded Fabric/Leather Paneling)',
    'คิ้วสเตนเลส/กระจกเงาตกแต่ง (Stainless Trim & Mirror Accents)',
    'อื่นๆ (Other)'
  ],
  'งานตู้วางทีวี & ตู้โชว์ (TV Console & Display)': [
    'ตู้เตี้ยคอนโซลทีวี (TV Base Console)',
    'ผนังกรุหลังทีวี (TV Back Panel / Feature Wall)',
    'ตู้โชว์กระจกบานสูง (Tall Glass Display Cabinet)',
    'ชั้นหิ้งโปร่ง/หิ้งพระ (Floating Shelves)',
    'อื่นๆ (Other)'
  ],
  'งานโต๊ะเครื่องแป้ง & ตู้ห้องน้ำ (Vanity & Bathroom Cabinet)': [
    'เคาน์เตอร์อ่างล้างหน้า (Bathroom Vanity Counter)',
    'ตู้กระจกเงาเก็บของ (Mirror Cabinet)',
    'โต๊ะเครื่องแป้งบิวต์อิน (Built-in Dressing Table)',
    'อื่นๆ (Other)'
  ],
  'งานตกแต่งทางเข้า & ตู้รองเท้า (Foyer & Shoe Cabinet)': [
    'ตู้เก็บรองเท้าบิวต์อิน (Built-in Shoe Cabinet)',
    'โซนนั่งใส่รองเท้า/ผนังกรุกระจกเงา (Seat Bench & Foyer Mirror)',
    'อื่นๆ (Other)'
  ],
  'งานตกแต่งภายในอื่นๆ (Other Built-in Items)': [
    'โต๊ะทำงานบิวต์อิน (Built-in Desk)',
    'ตู้เก็บของทั่วไป (General Storage Cabinet)',
    'งานฝ้าและไฟแสงสว่าง (Ceiling & Lighting)',
    'งานรื้อถอนและเตรียมหน้างาน (Demolition & Prep)',
    'อื่นๆ (Other)'
  ]
};

// Default material catalog dictionary
const DEFAULT_MATERIAL_CATALOG: Record<string, string[]> = {
  carcass: [
    'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
    'ไม้อัดยางแท้เกรดพรีเมียม (Premium Plywood) เคลือบกันน้ำ',
    'แผ่นพลาสวูดความหนาแน่นสูง (High-Density Plaswood - กันน้ำ 100%)',
    'ไม้ปาติเกิลเคลือบเมลามีน (Melamine Particle Board)'
  ],
  surface: [
    'ลามิเนตนำเข้า ทนรอยขีดข่วน (Premium Laminate)',
    'สีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด 5 ชั้น',
    'วีเนียร์ไม้แท้ธรรมชาติ พ่นแลคเกอร์ด้าน (Natural Wood Veneer)',
    'กระจกเงาชาทอง/อลูมิเนียมกรอบทองอโนไดซ์ (Golden Mirror with Alu Frame)',
    'กระจกใสเทมเปอร์เจียรปริม (Tempered Clear Glass)'
  ],
  fittings: [
    'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
    'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Blum (ออสเตรีย)',
    'รางเลื่อนและบานพับ Soft-close แบรนด์ Hettich (เยอรมนี)',
    'บานพับทั่วไป ระบบสปริงดึงกลับธรรมดา'
  ],
  accessories: [
    'ราวแขวนผ้าแสตนเลสเกรด 304 + อุปกรณ์ยึด',
    'ราวแขวนผ้าอัจฉริยะซ่อนไฟ LED Sensor แสงวอร์มไวท์',
    'ตะแกรงสแตนเลสคว่ำจาน + ถาดรองน้ำในตู้ครัว',
    'ชั้นวางของภายในแบบปรับระดับได้'
  ]
};

// Built-in furniture pre-defined templates for quick adding
const FURNITURE_TEMPLATES = [
  {
    name: 'ตู้เสื้อผ้าบิวต์อิน (โครง HMR + หน้าบานลามิเนต)',
    category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
    subCategory: 'โครงตู้เสื้อผ้า (Wardrobe Carcass)',
    carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
    surfaceMaterial: 'ลามิเนตนำเข้า ทนรอยขีดข่วน (Premium Laminate)',
    fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
    accessories: 'ราวแขวนผ้าแสตนเลสเกรด 304 + อุปกรณ์ยึด',
    specs: 'โครงสร้างไม้ HMR หนา 18มม. กันชื้นเกรด A, หน้าบานกรุลามิเนตลายไม้/สีพื้นเกรดนำเข้า, ราวแขวนผ้าแสตนเลส, บานพับ Soft-close (Hafele)',
    unit: 'เมตรวิ่ง',
    rate: 22000,
    costPerUnit: 15400
  },
  {
    name: 'ตู้เสื้อผ้าบิวต์อินหน้าบานกระจกเงาชาทองกรอบอลูมิเนียม',
    category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
    subCategory: 'หน้าบานกระจก/เฟรมอลูมิเนียม (Glass/Alu-Frame Door)',
    carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
    surfaceMaterial: 'กระจกเงาชาทอง/อลูมิเนียมกรอบทองอโนไดซ์ (Golden Mirror with Alu Frame)',
    fittingBrand: 'รางเลื่อนและบานพับ Soft-close แบรนด์ Hettich (เยอรมนี)',
    accessories: 'ชั้นวางของภายในแบบปรับระดับได้',
    specs: 'โครง HMR กันชื้นสีเทาชาร์โคล, หน้าบานกระจกเงาชาทองเจียรปริมกรอบอลูมิเนียมชุบสีทองอโนไดซ์, รางเลื่อนอลูมิเนียมแบรนด์เยอรมัน',
    unit: 'เมตรวิ่ง',
    rate: 26000,
    costPerUnit: 18200
  },
  {
    name: 'ผนังตกแต่งกรุกันเสียงหัวเตียง (Bedhead Wall Paneling)',
    category: 'งานผนังตกแต่ง & บุหัวเตียง (Wall Paneling & Bedhead)',
    subCategory: 'ผนังกรุผิวลามิเนต/วีเนียร์ (Laminated/Veneer Paneling)',
    carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
    surfaceMaterial: 'วีเนียร์ไม้แท้ธรรมชาติ พ่นแลคเกอร์ด้าน (Natural Wood Veneer)',
    fittingBrand: 'บานพับทั่วไป ระบบสปริงดึงกลับธรรมดา',
    accessories: 'อื่นๆ (Other)',
    specs: 'กรุไม้ MDF หุ้มด้วยฟองน้ำเกรดนุ่มพิเศษบุผ้าสังเคราะห์กันฝุ่นขลิบคิ้วสเตนเลสสีทองกระจกเงา สลับระแนงไม้เนื้อจริงสีวอลนัท',
    unit: 'ตร.ม.',
    rate: 4800,
    costPerUnit: 3200
  },
  {
    name: 'ตู้วางทีวีบิวต์อินพร้อมตู้โชว์กระจกสูงซ่อนไฟ LED',
    category: 'งานตู้วางทีวี & ตู้โชว์ (TV Console & Display)',
    subCategory: 'ตู้โชว์กระจกบานสูง (Tall Glass Display Cabinet)',
    carcassMaterial: 'ไม้อัดยางแท้เกรดพรีเมียม (Premium Plywood) เคลือบกันน้ำ',
    surfaceMaterial: 'กระจกใสเทมเปอร์เจียรปริม (Tempered Clear Glass)',
    fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
    accessories: 'ราวแขวนผ้าอัจฉริยะซ่อนไฟ LED Sensor แสงวอร์มไวท์',
    specs: 'โครงไม้อัดยางกรุวีเนียร์พ่นสีลายไม้ธรรมชาติ สลับหินอ่อนสังเคราะห์หน้าตู้วางทีวี, บานพับเปิดเปิดกระจกใสเทมเปอร์กรอบอลูมิเนียมบางเฉียบซ่อน LED แสงวอร์ม',
    unit: 'เมตรวิ่ง',
    rate: 19500,
    costPerUnit: 13500
  },
  {
    name: 'เคาน์เตอร์ครัวล่าง (Base Kitchen Cabinet - กันน้ำ 100%)',
    category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
    subCategory: 'เคาน์เตอร์ตู้ล่าง (Base Cabinet - กันน้ำ/กันปลวก)',
    carcassMaterial: 'แผ่นพลาสวูดความหนาแน่นสูง (High-Density Plaswood - กันน้ำ 100%)',
    surfaceMaterial: 'ลามิเนตนำเข้า ทนรอยขีดข่วน (Premium Laminate)',
    fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Blum (ออสเตรีย)',
    accessories: 'ตะแกรงสแตนเลสคว่ำจาน + ถาดรองน้ำในตู้ครัว',
    specs: 'โครงสร้างไม้อัดแท้เกรดพรีเมียม (Plywood) เคลือบฟิล์มกันน้ำ, หน้าบานลามิเนตทนรอยขีดข่วนและความร้อน, อุปกรณ์รางลิ้นชักรับใต้ระบบสองจังหวะดึงกลับอัตโนมัติ',
    unit: 'เมตรวิ่ง',
    rate: 16500,
    costPerUnit: 11000
  },
  {
    name: 'เคาน์เตอร์ครัวบน (Wall Kitchen Cabinet)',
    category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
    subCategory: 'ตู้แขวนบน (Wall/Upper Cabinet)',
    carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
    surfaceMaterial: 'สีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด 5 ชั้น',
    fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
    accessories: 'ชั้นวางของภายในแบบปรับระดับได้',
    specs: 'โครงสร้างไม้ HMR, บานเปิดพ่นสีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด, บานพับ Soft-close พร้อมโช้คอัพบานยกไฮดรอลิก',
    unit: 'เมตรวิ่ง',
    rate: 13500,
    costPerUnit: 9000
  },
  {
    name: 'ท็อปหินควอตซ์เคาน์เตอร์ครัว (Quartz Stone Tabletop)',
    category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
    subCategory: 'ท็อปหินเคาน์เตอร์ครัว (Countertop Stone)',
    carcassMaterial: 'อื่นๆ (Other)',
    surfaceMaterial: 'อื่นๆ (Other)',
    fittingBrand: 'อื่นๆ (Other)',
    accessories: 'อื่นๆ (Other)',
    specs: 'หินควอตซ์สีขาวลายริ้วธรรมชาติ (Quartz Calacatta Marble Pattern) หนา 20มม. ทนรอยขีดข่วนทนคราบฝังแน่น เจาะช่องฝังอ่างล้างจานซ่อนใต้ท็อป',
    unit: 'เมตรวิ่ง',
    rate: 9000,
    costPerUnit: 6200
  },
  {
    name: 'ราวแขวนเสื้อผ้าอัจฉริยะพร้อมชุดไฟ LED Sensor',
    category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
    subCategory: 'ราวแขวนและไฟ LED (Hanging Rails & LED Lights)',
    carcassMaterial: 'อื่นๆ (Other)',
    surfaceMaterial: 'อื่นๆ (Other)',
    fittingBrand: 'อื่นๆ (Other)',
    accessories: 'ราวแขวนผ้าอัจฉริยะซ่อนไฟ LED Sensor แสงวอร์มไวท์',
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
        category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
        subCategory: 'หน้าบานกระจก/เฟรมอลูมิเนียม (Glass/Alu-Frame Door)',
        carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
        surfaceMaterial: 'กระจกเงาชาทอง/อลูมิเนียมกรอบทองอโนไดซ์ (Golden Mirror with Alu Frame)',
        fittingBrand: 'รางเลื่อนและบานพับ Soft-close แบรนด์ Hettich (เยอรมนี)',
        accessories: 'ชั้นวางของภายในแบบปรับระดับได้',
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
        category: 'งานผนังตกแต่ง & บุหัวเตียง (Wall Paneling & Bedhead)',
        subCategory: 'ผนังกรุผิวลามิเนต/วีเนียร์ (Laminated/Veneer Paneling)',
        carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
        surfaceMaterial: 'วีเนียร์ไม้แท้ธรรมชาติ พ่นแลคเกอร์ด้าน (Natural Wood Veneer)',
        fittingBrand: 'บานพับทั่วไป ระบบสปริงดึงกลับธรรมดา',
        accessories: 'อื่นๆ (Other)',
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
        category: 'งานตู้วางทีวี & ตู้โชว์ (TV Console & Display)',
        subCategory: 'ตู้โชว์กระจกบานสูง (Tall Glass Display Cabinet)',
        carcassMaterial: 'ไม้อัดยางแท้เกรดพรีเมียม (Premium Plywood) เคลือบกันน้ำ',
        surfaceMaterial: 'กระจกใสเทมเปอร์เจียรปริม (Tempered Clear Glass)',
        fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
        accessories: 'ราวแขวนผ้าอัจฉริยะซ่อนไฟ LED Sensor แสงวอร์มไวท์',
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
        category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
        subCategory: 'เคาน์เตอร์ตู้ล่าง (Base Cabinet - กันน้ำ/กันปลวก)',
        carcassMaterial: 'ไม้อัดยางแท้เกรดพรีเมียม (Premium Plywood) เคลือบกันน้ำ',
        surfaceMaterial: 'ลามิเนตนำเข้า ทนรอยขีดข่วน (Premium Laminate)',
        fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Blum (ออสเตรีย)',
        accessories: 'ตะแกรงสแตนเลสคว่ำจาน + ถาดรองน้ำในตู้ครัว',
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
        category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
        subCategory: 'ตู้แขวนบน (Wall/Upper Cabinet)',
        carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
        surfaceMaterial: 'สีพ่นพรีเมียมไฮกลอส (High-Gloss Paint) ขัดละเอียด 5 ชั้น',
        fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
        accessories: 'ชั้นวางของภายในแบบปรับระดับได้',
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
        category: 'งานครัว & โซนอาหาร (Kitchen & Dining)',
        subCategory: 'ท็อปหินเคาน์เตอร์ครัว (Countertop Stone)',
        carcassMaterial: 'อื่นๆ (Other)',
        surfaceMaterial: 'อื่นๆ (Other)',
        fittingBrand: 'อื่นๆ (Other)',
        accessories: 'อื่นๆ (Other)',
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
        category: 'งานตู้วางทีวี & ตู้โชว์ (TV Console & Display)',
        subCategory: 'ตู้โชว์กระจกบานสูง (Tall Glass Display Cabinet)',
        carcassMaterial: 'ไม้อัดยางแท้เกรดพรีเมียม (Premium Plywood) เคลือบกันน้ำ',
        surfaceMaterial: 'กระจกใสเทมเปอร์เจียรปริม (Tempered Clear Glass)',
        fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
        accessories: 'ราวแขวนผ้าอัจฉริยะซ่อนไฟ LED Sensor แสงวอร์มไวท์',
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
        category: 'งานตู้เสื้อผ้า & ห้องแต่งตัว (Wardrobe)',
        subCategory: 'โครงตู้เสื้อผ้า (Wardrobe Carcass)',
        carcassMaterial: 'ไม้ HMR กันชื้น หนา 18มม. เกรด A (High Moisture Resistant MDF)',
        surfaceMaterial: 'ลามิเนตนำเข้า ทนรอยขีดข่วน (Premium Laminate)',
        fittingBrand: 'บานพับ & รางลิ้นชัก Soft-close แบรนด์ Hafele (เยอรมนี)',
        accessories: 'ราวแขวนผ้าแสตนเลสเกรด 304 + อุปกรณ์ยึด',
        name: 'ตู้เสื้อผ้าบิวต์อิน (โครง HMR + หน้าบานลามิเนต)',
        specs: 'โครงสร้างไม้ HMR หนา 18มม. กันชื้นเกรด A, หน้าบานกรุลามิเนตลายไม้/สีพื้นเกดนำเข้า, ราวแขวนผ้าแสตนเลส, บานพับ Soft-close (Hafele)',
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
  const [itemCategory, setItemCategory] = useState('');
  const [itemSubCategory, setItemSubCategory] = useState('');
  const [itemCarcass, setItemCarcass] = useState('');
  const [itemSurface, setItemSurface] = useState('');
  const [itemFittings, setItemFittings] = useState('');
  const [itemAccessories, setItemAccessories] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemSpecs, setItemSpecs] = useState('');
  const [itemUnit, setItemUnit] = useState('เมตรวิ่ง');
  const [itemQty, setItemQty] = useState(1);
  const [itemRate, setItemRate] = useState(0);
  const [itemCost, setItemCost] = useState(0);
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);

  // Material Catalog State
  const [materialCatalog, setMaterialCatalog] = useState<Record<string, string[]>>(DEFAULT_MATERIAL_CATALOG);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'carcass' | 'surface' | 'fittings' | 'accessories'>('carcass');
  const [newCatalogItem, setNewCatalogItem] = useState('');
  const [editingCatalogIndex, setEditingCatalogIndex] = useState<number | null>(null);
  const [editingCatalogValue, setEditingCatalogValue] = useState('');
  // UX Overhaul States
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});
  const [formTab, setFormTab] = useState<'info' | 'specs' | 'pricing'>('info');

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
      
      const savedCatalog = localStorage.getItem('company_material_catalog');
      if (savedCatalog) {
        try {
          setMaterialCatalog(JSON.parse(savedCatalog));
        } catch (e) {
          console.error('Error loading Material Catalog from localStorage:', e);
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

  const saveCatalogToLocalStorage = (updatedCatalog: Record<string, string[]>) => {
    setMaterialCatalog(updatedCatalog);
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_material_catalog', JSON.stringify(updatedCatalog));
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
    setItemCategory(t.category);
    setItemSubCategory(t.subCategory);
    setItemCarcass(t.carcassMaterial || '');
    setItemSurface(t.surfaceMaterial || '');
    setItemFittings(t.fittingBrand || '');
    setItemAccessories(t.accessories || '');
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
      category: itemCategory || 'งานตกแต่งภายในอื่นๆ (Other Built-in Items)',
      subCategory: itemSubCategory || 'อื่นๆ (Other)',
      name: itemName,
      carcassMaterial: itemCarcass,
      surfaceMaterial: itemSurface,
      fittingBrand: itemFittings,
      accessories: itemAccessories,
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
    setItemCategory(item.category || '');
    setItemSubCategory(item.subCategory || '');
    setItemCarcass(item.carcassMaterial || '');
    setItemSurface(item.surfaceMaterial || '');
    setItemFittings(item.fittingBrand || '');
    setItemAccessories(item.accessories || '');
    setItemName(item.name);
    setItemSpecs(item.specs);
    setItemUnit(item.unit);
    setItemQty(item.quantity);
    setItemRate(item.rate);
    setItemCost(item.costPerUnit);
    setFormTab('info');
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
              category: itemCategory || 'งานตกแต่งภายในอื่นๆ (Other Built-in Items)',
              subCategory: itemSubCategory || 'อื่นๆ (Other)',
              name: itemName,
              carcassMaterial: itemCarcass,
              surfaceMaterial: itemSurface,
              fittingBrand: itemFittings,
              accessories: itemAccessories,
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

  // Catalog CRUD Operations
  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatalogItem.trim()) return;
    const updatedTabItems = [...materialCatalog[activeCatalogTab], newCatalogItem.trim()];
    const updatedCatalog = { ...materialCatalog, [activeCatalogTab]: updatedTabItems };
    saveCatalogToLocalStorage(updatedCatalog);
    setNewCatalogItem('');
    showToast('เพิ่มวัสดุใหม่ลงคลังสำเร็จ!', 'success');
  };

  const handleDeleteCatalogItem = (indexToDelete: number) => {
    const updatedTabItems = materialCatalog[activeCatalogTab].filter((_, idx) => idx !== indexToDelete);
    const updatedCatalog = { ...materialCatalog, [activeCatalogTab]: updatedTabItems };
    saveCatalogToLocalStorage(updatedCatalog);
    showToast('ลบรายการวัสดุออกจากคลังแล้ว', 'success');
  };

  const handleStartEditCatalogItem = (index: number, value: string) => {
    setEditingCatalogIndex(index);
    setEditingCatalogValue(value);
  };

  const handleSaveEditCatalogItem = (index: number) => {
    if (!editingCatalogValue.trim()) return;
    const updatedTabItems = materialCatalog[activeCatalogTab].map((item, idx) => 
      idx === index ? editingCatalogValue.trim() : item
    );
    const updatedCatalog = { ...materialCatalog, [activeCatalogTab]: updatedTabItems };
    saveCatalogToLocalStorage(updatedCatalog);
    setEditingCatalogIndex(null);
    setEditingCatalogValue('');
    showToast('แก้ไขข้อมูลวัสดุในคลังสำเร็จ!', 'success');
  };

  const resetItemFields = () => {
    setItemArea('');
    setItemCategory('');
    setItemSubCategory('');
    setItemCarcass('');
    setItemSurface('');
    setItemFittings('');
    setItemAccessories('');
    setItemName('');
    setItemSpecs('');
    setItemUnit('เมตรวิ่ง');
    setItemQty(1);
    setItemRate(0);
    setItemCost(0);
    setFormTab('info');
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
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาโครงการ / ชื่อลูกค้า..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin">
              {boqs
                .filter(boq => 
                  boq.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  boq.clientName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(boq => {
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

              {/* Executive Summary Dashboard Widget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                {/* Grand Total Card */}
                <div className="bg-[#12131a]/80 backdrop-blur-md border border-[#c5a880]/30 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#c5a880]/60 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a880]/5 blur-2xl rounded-full" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ยอดรวมเสนอขายสุทธิ</span>
                    <strong className="text-lg md:text-xl font-extrabold text-white font-mono block">
                      ฿{cal.grandTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </strong>
                    <span className="text-[8px] text-gray-500 font-bold block">(รวมภาษี VAT 7% เรียบร้อย)</span>
                  </div>
                  <div className="p-3 bg-[#c5a880]/10 rounded-xl text-[#c5a880] group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Cost Card */}
                {viewMode === 'internal' ? (
                  <div className="bg-[#12131a]/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ราคาทุนวัสดุ + ค่าแรง</span>
                      <strong className="text-lg md:text-xl font-extrabold text-white font-mono block">
                        ฿{cal.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </strong>
                      <div className="w-28 h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-red-500/80 rounded-full" 
                          style={{ width: `${(cal.totalCost / (cal.subtotal || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#12131a]/80 backdrop-blur-md border border-[#1f212d] rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#c5a880]/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">จำนวนรายการติดตั้ง</span>
                      <strong className="text-lg md:text-xl font-extrabold text-[#c5a880] font-mono block">
                        {activeBOQ.items.length} รายการ
                      </strong>
                      <span className="text-[8px] text-gray-500 font-bold block">กระจายตามพื้นที่ทั้งหมด</span>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {/* Profit Margin Card */}
                {viewMode === 'internal' ? (
                  <div className="bg-[#12131a]/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">กำไรขั้นต้น (GP Margin)</span>
                      <strong className="text-lg md:text-xl font-extrabold text-emerald-400 font-mono block">
                        ฿{cal.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </strong>
                      <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {cal.marginPercent.toFixed(1)}% อัตรากำไร
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#12131a]/80 backdrop-blur-md border border-[#1f212d] rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#c5a880]/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">มาตรฐานคุณภาพ</span>
                      <strong className="text-xs font-bold text-white block mt-1">
                        รับประกันงานติดตั้งโครงสร้าง 1 ปี
                      </strong>
                      <span className="text-[8px] text-gray-500 font-bold block">พร้อมทีมดูแลบำรุงรักษา</span>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                )}
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

                    // Get distinct categories in this room
                    const categoriesInRoom = Array.from(new Set(roomItems.map(item => item.category || 'งานตกแต่งภายในอื่นๆ (Other Built-in Items)')));
                    
                    const isAreaExpanded = expandedAreas[roomName] !== false;
                    const toggleArea = () => {
                      setExpandedAreas(prev => ({
                        ...prev,
                        [roomName]: !isAreaExpanded
                      }));
                    };

                    return (
                      <div key={roomName} className="space-y-3 min-w-[650px] bg-[#12131a]/25 border border-[#1f212d]/40 p-4 rounded-2xl print:border-gray-200 print:p-0">
                        {/* Area Title Accordion */}
                        <div 
                          onClick={toggleArea}
                          className="flex justify-between items-center border-b border-[#1f212d]/60 pb-2 cursor-pointer group select-none print:border-gray-200"
                        >
                          <h4 className="text-xs font-bold text-[#c5a880] print:text-black flex items-center gap-2">
                            <span className="print:hidden text-gray-500 group-hover:text-[#c5a880] transition-colors">
                              {isAreaExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] print:block" />
                            <span>{roomName}</span>
                          </h4>
                          <span className="text-[10px] text-gray-400 print:text-black flex items-center gap-2">
                            <span>รวมพื้นที่:</span>
                            <strong className="text-white print:text-black font-mono">฿{roomSubtotal.toLocaleString()}</strong>
                            {viewMode === 'internal' && (
                              <span className="text-emerald-400 font-bold ml-1.5">
                                (กำไร: ฿{roomProfit.toLocaleString()} | {roomMargin.toFixed(0)}%)
                              </span>
                            )}
                            <span className="text-[8px] bg-[#1c1d24] text-gray-400 px-1.5 py-0.5 rounded font-extrabold uppercase print:hidden group-hover:bg-[#c5a880] group-hover:text-black transition-colors">
                              {isAreaExpanded ? 'คลิกเพื่อหุบ' : 'คลิกเพื่อกาง'}
                            </span>
                          </span>
                        </div>

                        {/* Collapsible Area content */}
                        {isAreaExpanded && (
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
                            <tbody className="text-gray-300 print:text-black">
                              {categoriesInRoom.map(catName => {
                                const catItems = roomItems.filter(item => (item.category || 'งานตกแต่งภายในอื่นๆ (Other Built-in Items)') === catName);
                                const catSubtotal = catItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
                                const catCostSubtotal = catItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
                                const catProfit = catSubtotal - catCostSubtotal;
                                const catMargin = catSubtotal > 0 ? (catProfit / catSubtotal) * 100 : 0;

                                return (
                                  <React.Fragment key={catName}>
                                    {/* Category Subheader Row */}
                                    <tr className="bg-[#1c1d24]/50 border-b border-[#1f212d]/40 print:bg-gray-100/50 print:border-gray-200">
                                      <td colSpan={viewMode === 'internal' ? 6 : 4} className="py-2 pl-2.5 pr-4 font-extrabold text-[9px] text-[#c5a880] print:text-black uppercase tracking-wider">
                                        📁 {catName}
                                        {viewMode === 'internal' && (
                                          <span className="text-emerald-400 font-bold normal-case ml-2">
                                            (มาร์กอัปหมวด: {((catSubtotal - catCostSubtotal) / (catCostSubtotal || 1) * 100).toFixed(0)}% | กำไร: ฿{catProfit.toLocaleString()})
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 text-right font-bold text-[9px] text-[#c5a880] print:text-black font-mono">
                                        ฿{catSubtotal.toLocaleString()}
                                      </td>
                                      <td className="py-2 print:hidden"></td>
                                    </tr>

                                    {/* Items in this Category */}
                                    {catItems.map(item => {
                                      const hasSpecs = !!(item.carcassMaterial || item.surfaceMaterial || item.fittingBrand || item.accessories || item.specs);
                                      const isSpecExpanded = expandedSpecs[item.id] === true;
                                      const toggleSpec = () => {
                                        setExpandedSpecs(prev => ({
                                          ...prev,
                                          [item.id]: !isSpecExpanded
                                        }));
                                      };

                                      return (
                                        <tr key={item.id} className="hover:bg-white/5 border-b border-[#1f212d]/10 transition-colors print:hover:bg-transparent print:border-gray-100">
                                          <td className="py-3 pl-4 pr-4 border-l-2 border-[#1f212d] hover:border-[#c5a880]/30">
                                            <div className="font-bold text-white print:text-black text-xs leading-tight">{item.name}</div>
                                            
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                              {item.subCategory && (
                                                <span className="inline-block text-[8px] font-bold bg-[#1c1d24]/80 text-[#c5a880] px-1.5 py-0.5 rounded border border-[#2d2f3d]/50 print:bg-gray-100 print:text-gray-600 print:border-gray-300">
                                                  {item.subCategory}
                                                </span>
                                              )}
                                              
                                              {hasSpecs && (
                                                <button
                                                  type="button"
                                                  onClick={toggleSpec}
                                                  className="text-[8px] font-extrabold text-[#c5a880] bg-[#c5a880]/5 hover:bg-[#c5a880]/15 px-2 py-0.5 rounded border border-[#c5a880]/20 flex items-center gap-1 transition-all print:hidden"
                                                >
                                                  <span>{isSpecExpanded ? '▲ ซ่อนรายละเอียดสเปก' : '▼ ดูรายละเอียดสเปกวัสดุ'}</span>
                                                </button>
                                              )}
                                            </div>

                                            {/* Spec Grid details - Collapsible */}
                                            {hasSpecs && (
                                              <div className={`mt-2 ${isSpecExpanded ? 'block' : 'hidden print:block'}`}>
                                                {item.carcassMaterial || item.surfaceMaterial || item.fittingBrand || item.accessories ? (
                                                  <div className="space-y-1.5 bg-[#12131a]/80 border border-[#1f212d] p-3 rounded-xl text-[9px] print:bg-gray-50 print:border-gray-200 shadow-inner">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                                                      <div className="flex justify-between md:justify-start gap-2 border-b border-[#1f212d]/40 pb-1 md:border-none md:pb-0">
                                                        <span className="text-gray-500 font-semibold shrink-0">โครงสร้าง:</span>
                                                        <span className="text-gray-300 print:text-black font-medium">{item.carcassMaterial || '-'}</span>
                                                      </div>
                                                      <div className="flex justify-between md:justify-start gap-2 border-b border-[#1f212d]/40 pb-1 md:border-none md:pb-0">
                                                        <span className="text-gray-500 font-semibold shrink-0">การปิดผิว:</span>
                                                        <span className="text-gray-300 print:text-black font-medium">{item.surfaceMaterial || '-'}</span>
                                                      </div>
                                                      <div className="flex justify-between md:justify-start gap-2 border-b border-[#1f212d]/40 pb-1 md:border-none md:pb-0">
                                                        <span className="text-gray-500 font-semibold shrink-0">แบรนด์ฟิตติ้ง:</span>
                                                        <span className="text-gray-300 print:text-black font-medium">{item.fittingBrand || '-'}</span>
                                                      </div>
                                                      <div className="flex justify-between md:justify-start gap-2 border-b border-[#1f212d]/40 pb-1 md:border-none md:pb-0">
                                                        <span className="text-gray-500 font-semibold shrink-0">อุปกรณ์เสริม:</span>
                                                        <span className="text-gray-300 print:text-black font-medium">{item.accessories || '-'}</span>
                                                      </div>
                                                    </div>
                                                    {item.specs && (
                                                      <div className="border-t border-[#1f212d]/60 pt-1.5 mt-1.5 text-[8.5px] text-gray-400 italic">
                                                        <span className="text-gray-500 font-semibold">หมายเหตุเฉพาะรายการ:</span> {item.specs}
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="text-[9.5px] text-gray-400 bg-[#12131a]/80 border border-[#1f212d] p-3 rounded-xl print:text-black whitespace-pre-wrap shadow-inner leading-relaxed">
                                                    {item.specs}
                                                  </div>
                                                )}
                                              </div>
                                            )}
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
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
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
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] flex flex-col">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden shrink-0" />

            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">เพิ่มรายการสเปกบิวต์อินลง BOQ</h3>
                <p className="text-[10px] text-gray-400 mt-1">กำหนดประเภทงาน รายละเอียดสเปกวัสดุ และถอดราคาทีละขั้นตอน</p>
              </div>
              <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-[#1c1d24] p-1.5 rounded-lg border border-[#2d2f3d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Navigation tabs */}
            <div className="flex border-b border-[#1f212d]/60 bg-[#171821] px-4 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setFormTab('info')}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'info'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                1. ข้อมูลทั่วไป
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                    showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนสลับแท็บ', 'error');
                    return;
                  }
                  setFormTab('specs');
                }}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'specs'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                2. สเปกโครงสร้าง & ฟิตติ้ง
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                    showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนสลับแท็บ', 'error');
                    return;
                  }
                  setFormTab('pricing');
                }}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'pricing'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                3. ปริมาณ & ราคา
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-5 space-y-4 flex-1">
                
                {/* STEP 1: General Info */}
                {formTab === 'info' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่เฟอร์นิเจอร์หลัก *</label>
                        <select
                          required
                          value={itemCategory}
                          onChange={e => {
                            setItemCategory(e.target.value);
                            const subs = FURNITURE_CATEGORIES[e.target.value] || [];
                            setItemSubCategory(subs[0] || '');
                          }}
                          className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                        >
                          <option value="" disabled>เลือกหมวดหลัก</option>
                          {Object.keys(FURNITURE_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดย่อยของเฟอร์นิเจอร์ *</label>
                        <select
                          required
                          value={itemSubCategory}
                          onChange={e => setItemSubCategory(e.target.value)}
                          className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                        >
                          <option value="" disabled>เลือกหมวดย่อย</option>
                          {(FURNITURE_CATEGORIES[itemCategory] || []).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
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
                  </div>
                )}

                {/* STEP 2: Material Specs */}
                {formTab === 'specs' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Template quick select */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">เลือกด่วนจากเทมเพลตสเปกมาตรฐาน:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-28 overflow-y-auto p-2 bg-[#1c1d24] border border-[#2d2f3d] rounded-xl scrollbar-thin">
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

                    <div className="space-y-3 bg-[#1c1d24] p-4 rounded-xl border border-[#2d2f3d]">
                      <div className="flex justify-between items-center pb-2 border-b border-[#2d2f3d]/50">
                        <span className="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider">สเปกโครงสร้าง & ฟิตติ้ง (Structured Specs)</span>
                        <button
                          type="button"
                          onClick={() => setIsCatalogModalOpen(true)}
                          className="text-[9px] font-extrabold text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/20 px-2 py-0.5 rounded-md hover:bg-[#c5a880]/20 transition-all flex items-center gap-1"
                        >
                          <Box className="w-3 h-3" />
                          จัดการคลังวัสดุ
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">วัสดุโครงสร้าง (Carcass)</label>
                          <select
                            value={itemCarcass}
                            onChange={e => setItemCarcass(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกโครงสร้าง --</option>
                            {(materialCatalog.carcass || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">วัสดุปิดผิว (Surface)</label>
                          <select
                            value={itemSurface}
                            onChange={e => setItemSurface(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกการปิดผิว --</option>
                            {(materialCatalog.surface || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">ฟิตติ้ง/บานพับ (Fittings)</label>
                          <select
                            value={itemFittings}
                            onChange={e => setItemFittings(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกฟิตติ้ง --</option>
                            {(materialCatalog.fittings || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">อุปกรณ์เสริม (Accessories)</label>
                          <select
                            value={itemAccessories}
                            onChange={e => setItemAccessories(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกอุปกรณ์เสริม --</option>
                            {(materialCatalog.accessories || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">หมายเหตุสเปกเพิ่มเติม / สเปกแบบพิเศษ (Custom Specs)</label>
                      <textarea
                        rows={2}
                        placeholder="กรอกสเปกเพิ่มเติมในกรณีที่มีคุณสมบัติเฉพาะกิจนอกเหนือจากตัวเลือกคลัง..."
                        value={itemSpecs}
                        onChange={e => setItemSpecs(e.target.value)}
                        className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Pricing & Quantity */}
                {formTab === 'pricing' && (
                  <div className="space-y-4 animate-fadeIn">
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
                  </div>
                )}

              </div>

              {/* Wizard Footer buttons */}
              <div className="p-4 border-t border-[#1f212d] bg-[#12131a] flex gap-3 shrink-0">
                {formTab === 'info' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsAddItemModalOpen(false)}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                          showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนไปขั้นตอนถัดไป', 'error');
                          return;
                        }
                        setFormTab('specs');
                      }}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/10"
                    >
                      <span>ขั้นตอนถัดไป (สเปกวัสดุ)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {formTab === 'specs' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormTab('info')}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTab('pricing')}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/10"
                    >
                      <span>ขั้นตอนถัดไป (ปริมาณ & ราคา)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {formTab === 'pricing' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormTab('specs')}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/15"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>บันทึกและเพิ่มรายการ</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT ITEM IN BOQ MODAL ================= */}
      {isEditItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] flex flex-col">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden shrink-0" />

            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">แก้ไขรายการสเปกบิวต์อิน</h3>
                <p className="text-[10px] text-gray-400 mt-1">แก้ไขประเภทงาน สเปกวัสดุ หรือราคาและจำนวนตามต้องการ</p>
              </div>
              <button type="button" onClick={() => setIsEditItemModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-[#1c1d24] p-1.5 rounded-lg border border-[#2d2f3d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Navigation tabs */}
            <div className="flex border-b border-[#1f212d]/60 bg-[#171821] px-4 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setFormTab('info')}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'info'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                1. ข้อมูลทั่วไป
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                    showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนสลับแท็บ', 'error');
                    return;
                  }
                  setFormTab('specs');
                }}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'specs'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                2. สเปกโครงสร้าง & ฟิตติ้ง
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                    showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนสลับแท็บ', 'error');
                    return;
                  }
                  setFormTab('pricing');
                }}
                className={`px-4 py-2 text-[10px] font-bold transition-all border-b-2 uppercase tracking-wider ${
                  formTab === 'pricing'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                3. ปริมาณ & ราคา
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-5 space-y-4 flex-1">
                
                {/* STEP 1: General Info */}
                {formTab === 'info' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่เฟอร์นิเจอร์หลัก *</label>
                        <select
                          required
                          value={itemCategory}
                          onChange={e => {
                            setItemCategory(e.target.value);
                            const subs = FURNITURE_CATEGORIES[e.target.value] || [];
                            setItemSubCategory(subs[0] || '');
                          }}
                          className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                        >
                          <option value="" disabled>เลือกหมวดหลัก</option>
                          {Object.keys(FURNITURE_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดย่อยของเฟอร์นิเจอร์ *</label>
                        <select
                          required
                          value={itemSubCategory}
                          onChange={e => setItemSubCategory(e.target.value)}
                          className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                        >
                          <option value="" disabled>เลือกหมวดย่อย</option>
                          {(FURNITURE_CATEGORIES[itemCategory] || []).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
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
                  </div>
                )}

                {/* STEP 2: Material Specs */}
                {formTab === 'specs' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Template quick select */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">เลือกด่วนจากเทมเพลตสเปกมาตรฐาน:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-28 overflow-y-auto p-2 bg-[#1c1d24] border border-[#2d2f3d] rounded-xl scrollbar-thin">
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

                    <div className="space-y-3 bg-[#1c1d24] p-4 rounded-xl border border-[#2d2f3d]">
                      <div className="flex justify-between items-center pb-2 border-b border-[#2d2f3d]/50">
                        <span className="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider">สเปกโครงสร้าง & ฟิตติ้ง (Structured Specs)</span>
                        <button
                          type="button"
                          onClick={() => setIsCatalogModalOpen(true)}
                          className="text-[9px] font-extrabold text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/20 px-2 py-0.5 rounded-md hover:bg-[#c5a880]/20 transition-all flex items-center gap-1"
                        >
                          <Box className="w-3 h-3" />
                          จัดการคลังวัสดุ
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">วัสดุโครงสร้าง (Carcass)</label>
                          <select
                            value={itemCarcass}
                            onChange={e => setItemCarcass(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกโครงสร้าง --</option>
                            {(materialCatalog.carcass || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">วัสดุปิดผิว (Surface)</label>
                          <select
                            value={itemSurface}
                            onChange={e => setItemSurface(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกการปิดผิว --</option>
                            {(materialCatalog.surface || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">ฟิตติ้ง/บานพับ (Fittings)</label>
                          <select
                            value={itemFittings}
                            onChange={e => setItemFittings(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกฟิตติ้ง --</option>
                            {(materialCatalog.fittings || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 block font-semibold">อุปกรณ์เสริม (Accessories)</label>
                          <select
                            value={itemAccessories}
                            onChange={e => setItemAccessories(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#1f212d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                          >
                            <option value="">-- เลือกอุปกรณ์เสริม --</option>
                            {(materialCatalog.accessories || []).map(mat => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                            <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">หมายเหตุสเปกเพิ่มเติม / สเปกแบบพิเศษ (Custom Specs)</label>
                      <textarea
                        rows={2}
                        placeholder="กรอกสเปกเพิ่มเติมในกรณีที่มีคุณสมบัติเฉพาะกิจนอกเหนือจากตัวเลือกคลัง..."
                        value={itemSpecs}
                        onChange={e => setItemSpecs(e.target.value)}
                        className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Pricing & Quantity */}
                {formTab === 'pricing' && (
                  <div className="space-y-4 animate-fadeIn">
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
                  </div>
                )}

              </div>

              {/* Wizard Footer buttons */}
              <div className="p-4 border-t border-[#1f212d] bg-[#12131a] flex gap-3 shrink-0">
                {formTab === 'info' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditItemModalOpen(false)}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!itemArea || !itemCategory || !itemSubCategory || !itemName) {
                          showToast('กรุณากรอกข้อมูลทั่วไปให้ครบถ้วนก่อนไปขั้นตอนถัดไป', 'error');
                          return;
                        }
                        setFormTab('specs');
                      }}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/10"
                    >
                      <span>ขั้นตอนถัดไป (สเปกวัสดุ)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {formTab === 'specs' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormTab('info')}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTab('pricing')}
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/10"
                    >
                      <span>ขั้นตอนถัดไป (ปริมาณ & ราคา)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {formTab === 'pricing' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormTab('specs')}
                      className="w-1/3 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/15"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>บันทึกการแก้ไข</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MATERIAL CATALOG MANAGEMENT MODAL ================= */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-2xl bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#c5a880]" />
                  <span>จัดการคลังวัสดุมาตรฐาน (Material Catalog)</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">เพิ่ม แก้ไข หรือลบตัวเลือกสำหรับ Dropdown สเปกวัสดุโครงสร้างและฟิตติ้ง</p>
              </div>
              <button 
                onClick={() => setIsCatalogModalOpen(false)} 
                className="text-gray-400 hover:text-white transition-colors bg-[#1c1d24] hover:bg-[#252731] p-1.5 rounded-lg border border-[#2d2f3d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-[#1f212d]/60 bg-[#171821] px-4 pt-2">
              <button
                type="button"
                onClick={() => { setActiveCatalogTab('carcass'); setEditingCatalogIndex(null); }}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeCatalogTab === 'carcass'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                โครงสร้าง (Carcass)
              </button>
              <button
                type="button"
                onClick={() => { setActiveCatalogTab('surface'); setEditingCatalogIndex(null); }}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeCatalogTab === 'surface'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                ปิดผิว (Surface)
              </button>
              <button
                type="button"
                onClick={() => { setActiveCatalogTab('fittings'); setEditingCatalogIndex(null); }}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeCatalogTab === 'fittings'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                ฟิตติ้ง (Fittings)
              </button>
              <button
                type="button"
                onClick={() => { setActiveCatalogTab('accessories'); setEditingCatalogIndex(null); }}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeCatalogTab === 'accessories'
                    ? 'border-[#c5a880] text-[#c5a880]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                อุปกรณ์เสริม (Accessories)
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[50vh]">
              {/* Add New Item Form inside Tab */}
              <form onSubmit={handleAddCatalogItem} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={`เพิ่มตัวเลือกใหม่ในหมวด ${
                    activeCatalogTab === 'carcass' ? 'โครงสร้าง' :
                    activeCatalogTab === 'surface' ? 'ปิดผิว' :
                    activeCatalogTab === 'fittings' ? 'ฟิตติ้ง' : 'อุปกรณ์เสริม'
                  }...`}
                  value={newCatalogItem}
                  onChange={e => setNewCatalogItem(e.target.value)}
                  className="flex-1 bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-extrabold px-4 py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม</span>
                </button>
              </form>

              {/* Items List */}
              <div className="space-y-2">
                {(materialCatalog[activeCatalogTab] || []).length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[#1f212d] rounded-xl text-xs text-gray-500">
                    ยังไม่มีรายการตัวเลือกในหมวดหมู่นี้
                  </div>
                ) : (
                  (materialCatalog[activeCatalogTab] || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1c1d24]/50 border border-[#2d2f3d] hover:border-[#c5a880]/30 transition-all gap-3"
                    >
                      {editingCatalogIndex === idx ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingCatalogValue}
                            onChange={e => setEditingCatalogValue(e.target.value)}
                            className="flex-1 bg-[#12131a] border border-[#c5a880] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCatalogItem(idx)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] transition-colors"
                          >
                            บันทึก
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatalogIndex(null)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-3 py-1 rounded-lg text-[10px] transition-colors"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs text-gray-300 font-medium leading-relaxed">{item}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditCatalogItem(idx, item)}
                              className="p-1.5 rounded hover:bg-[#1c1d24] text-gray-400 hover:text-[#c5a880] transition-colors"
                              title="แก้ไขชื่อวัสดุ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCatalogItem(idx)}
                              className="p-1.5 rounded hover:bg-red-950/30 text-gray-400 hover:text-red-400 transition-colors"
                              title="ลบตัวเลือก"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1f212d] bg-[#12131a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2 bg-[#1c1d24] hover:bg-[#252731] border border-[#2d2f3d] text-gray-300 font-bold rounded-xl text-xs transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
