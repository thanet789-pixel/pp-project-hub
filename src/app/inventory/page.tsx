'use client';

import React, { useState } from 'react';
import { mockInventory } from '@/lib/mockData';
import { InventoryItem } from '@/lib/types';
import { Box, Search, AlertTriangle, ArrowUpDown, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'มีของในคลัง';
      case 'low_stock': return 'ของใกล้หมด';
      default: return 'ของหมดคลัง';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">คลังวัสดุ (Material Inventory)</h2>
          <p className="text-xs text-gray-400">ระบบคุมคลังและตรวจสอบยอดไม้ HMR ฟิตติ้ง สีพ่น หน้าบาน และอุปกรณ์จัดซื้อวัสดุ</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#1f212d] w-64">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="ค้นหาวัสดุ, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-gray-500"
            />
          </div>
          <button onClick={() => alert('สร้างใบสั่งซื้อวัสดุ')} className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-[#c5a880] text-black font-semibold text-xs hover:bg-[#b0936b] transition-colors">
            <span>สั่งซื้อวัสดุ</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Banner */}
      {inventory.some(item => item.status !== 'in_stock') && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-400">ระบบตรวจพบวัสดุใกล้หมดคลัง</div>
            <p className="text-[11px] text-gray-400 mt-1">กรุณาตรวจรายการสั่งซื้อสำหรับ กาวตะปูแรงยึดสูง Pattex และสีกัลวาไนซ์ โจตัน เพื่อป้องกันงานสะดุดหน้างาน</p>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-[#12131a] border border-[#1f212d] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0c0d12]/50 border-b border-[#1f212d] text-gray-400 text-xs font-bold uppercase tracking-wider select-none">
              <th className="p-4">รายการวัสดุ</th>
              <th className="p-4">SKU</th>
              <th className="p-4">หมวดหมู่</th>
              <th className="p-4 text-center">คงเหลือ</th>
              <th className="p-4 text-center">ขั้นต่ำเตือน</th>
              <th className="p-4">ที่อยู่คลัง</th>
              <th className="p-4">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f212d] text-xs text-gray-300">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-gray-800 text-gray-400">
                      <Box className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 font-mono">{item.sku}</td>
                <td className="p-4 capitalize">{item.category}</td>
                <td className="p-4 text-center font-bold text-white">{item.stockQty} {item.unit}</td>
                <td className="p-4 text-center text-gray-500">{item.minStockAlert} {item.unit}</td>
                <td className="p-4">{item.warehouseLocation}</td>
                <td className="p-4">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusStyle(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
