'use client';

import React, { useState, useEffect } from 'react';
import { mockInventory } from '@/lib/mockData';
import { InventoryItem } from '@/lib/types';
import { Box, Search, AlertTriangle, Plus, Edit2, Trash2, X, Loader2, Check, Warehouse, LayoutGrid, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form Fields state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stockQty, setStockQty] = useState(0);
  const [minStockAlert, setMinStockAlert] = useState(0);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');

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

  // Fetch inventory from Supabase and merge with mock inventory
  const loadInventory = async () => {
    try {
      setLoading(true);

      // Load deleted list from localStorage
      let deletedList: string[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('deleted_inventory');
          if (saved) {
            deletedList = JSON.parse(saved).map((n: string) => n.toLowerCase());
          }
        } catch (e) {
          console.error('Error parsing deleted_inventory:', e);
        }
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      let merged = [...mockInventory.filter(item => !deletedList.includes(item.sku.toLowerCase()))];
      if (data && data.length > 0) {
        const mapped: InventoryItem[] = data.map((item: any) => {
          const qty = Number(item.stock_qty || 0);
          const alertMin = Number(item.min_stock_alert || 0);
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (qty <= 0) {
            status = 'out_of_stock';
          } else if (qty <= alertMin) {
            status = 'low_stock';
          }

          return {
            id: item.id,
            name: item.name,
            sku: item.sku || '',
            stockQty: qty,
            minStockAlert: alertMin,
            unit: item.unit || 'pcs',
            category: item.category || '',
            warehouseLocation: item.warehouse_location || '',
            status: status
          };
        }).filter(item => !deletedList.includes(item.sku.toLowerCase()));

        // Merge DB with mock (deduplicate by SKU)
        const dbSkus = mapped.map(item => item.sku.toLowerCase());
        merged = [
          ...mapped,
          ...mockInventory.filter(mi => 
            !dbSkus.includes(mi.sku.toLowerCase()) && 
            !deletedList.includes(mi.sku.toLowerCase())
          )
        ];
      } else {
        merged = mockInventory.filter(item => !deletedList.includes(item.sku.toLowerCase()));
      }
      setInventory(merged);
    } catch (err) {
      console.error('Error loading inventory:', err);
      showToast('ไม่สามารถดึงข้อมูลคลังสินค้าได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Check if ID belongs to mock data
  const isMockItem = (id: string) => {
    return id.startsWith('i') && id.length <= 3;
  };

  // Reset form inputs
  const resetForm = () => {
    setName('');
    setSku('');
    setStockQty(0);
    setMinStockAlert(0);
    setUnit('pcs');
    setCategory('');
    setWarehouseLocation('');
    setSelectedItem(null);
  };

  // Open Edit Modal
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setName(item.name);
    setSku(item.sku);
    setStockQty(item.stockQty);
    setMinStockAlert(item.minStockAlert);
    setUnit(item.unit);
    setCategory(item.category);
    setWarehouseLocation(item.warehouseLocation);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      showToast('กรุณากรอกข้อมูล ชื่อวัสดุ และ SKU', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let status = 'in_stock';
      if (Number(stockQty) <= 0) {
        status = 'out_of_stock';
      } else if (Number(stockQty) <= Number(minStockAlert)) {
        status = 'low_stock';
      }

      const { data, error } = await supabase
        .from('inventory')
        .insert([
          {
            name: name.trim(),
            sku: sku.trim().toUpperCase(),
            stock_qty: Number(stockQty),
            min_stock_alert: Number(minStockAlert),
            unit: unit.trim(),
            category: category.trim(),
            warehouse_location: warehouseLocation.trim(),
            status: status
          }
        ])
        .select();

      if (error) throw error;

      showToast('เพิ่มรายการวัสดุใหม่เข้าคลังสำเร็จแล้ว!', 'success');
      setIsAddModalOpen(false);
      resetForm();
      loadInventory();
    } catch (err: any) {
      console.error('Error adding inventory item:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!name || !sku) {
      showToast('กรุณากรอกข้อมูล ชื่อวัสดุ และ SKU', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (Number(stockQty) <= 0) {
        status = 'out_of_stock';
      } else if (Number(stockQty) <= Number(minStockAlert)) {
        status = 'low_stock';
      }

      if (isMockItem(selectedItem.id)) {
        // Mock edit locally
        const updated = inventory.map(item => 
          item.id === selectedItem.id 
            ? { ...item, name, sku: sku.toUpperCase(), stockQty: Number(stockQty), minStockAlert: Number(minStockAlert), unit, category, warehouseLocation, status }
            : item
        );
        setInventory(updated);
        showToast('แก้ไขข้อมูลวัสดุจำลองเรียบร้อยแล้ว', 'success');
      } else {
        // Update Supabase
        const { error } = await supabase
          .from('inventory')
          .update({
            name: name.trim(),
            sku: sku.trim().toUpperCase(),
            stock_qty: Number(stockQty),
            min_stock_alert: Number(minStockAlert),
            unit: unit.trim(),
            category: category.trim(),
            warehouse_location: warehouseLocation.trim(),
            status: status
          })
          .eq('id', selectedItem.id);

        if (error) throw error;
        showToast('ปรับปรุงยอดสต็อกคลังสำเร็จแล้ว!', 'success');
        loadInventory();
      }
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error editing inventory item:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    // Save to deleted list in localStorage
    const skuToDelete = selectedItem.sku.toLowerCase();
    let deletedList: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('deleted_inventory');
        if (saved) {
          deletedList = JSON.parse(saved);
        }
      } catch (e) {
        console.error(e);
      }
      if (!deletedList.includes(skuToDelete)) {
        deletedList.push(skuToDelete);
        localStorage.setItem('deleted_inventory', JSON.stringify(deletedList));
      }
    }

    setSubmitting(true);
    try {
      if (isMockItem(selectedItem.id)) {
        // Mock delete locally
        const updated = inventory.filter(item => item.id !== selectedItem.id);
        setInventory(updated);
        showToast('ลบรายการวัสดุจำลองเรียบร้อยแล้ว', 'success');
      } else {
        // Delete from Supabase
        const { error } = await supabase
          .from('inventory')
          .delete()
          .eq('id', selectedItem.id);

        if (error) throw error;

        setInventory(prev => prev.filter(item => item.id !== selectedItem.id));
        showToast('ลบรายการวัสดุออกจากคลังแล้ว!', 'success');
      }
      setIsDeleteModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filtering
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category.toLowerCase())))];

  // Dynamic alerts aggregation
  const alertItems = inventory.filter(item => item.status !== 'in_stock');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative font-sans">
      
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

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f212d] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">คลังวัสดุ (Material Inventory)</h2>
          <p className="text-xs text-gray-400 mt-1">ระบบคุมคลังและตรวจสอบยอดไม้ HMR ฟิตติ้ง สีพ่น หน้าบาน และอุปกรณ์จัดซื้อวัสดุ</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto shrink-0">
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }} 
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-black font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#d4af37]/10"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มวัสดุใหม่</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#12131a] p-4 rounded-2xl border border-[#1f212d]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="ค้นหาวัสดุ หรือ รหัส SKU..."
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
          <option value="all">ทุกหมวดหมู่วัสดุ</option>
          {categories.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Dynamic Low Stock Alerts Banner */}
      {alertItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-4.5 h-4.5 text-[#d4af37] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#d4af37]">ระบบตรวจพบวัสดุเตือนภัยใกล้หมด/หมดคลัง</div>
            <p className="text-[11px] text-gray-400 mt-1">
              กรุณาจัดเตรียมและตรวจสอบรายการสั่งซื้อวัสดุ ได้แก่:{' '}
              {alertItems.map((item, index) => (
                <strong key={item.id} className="text-gray-300">
                  {item.name} ({item.stockQty} {item.unit} คงเหลือ){index < alertItems.length - 1 ? ', ' : ''}
                </strong>
              ))}
              {' '}เพื่อป้องกันสายงานติดตั้ง built-in สะดุดหน้างาน
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
          <span>กำลังดึงข้อมูลคลังสินค้า...</span>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center py-24 bg-[#12131a] border border-[#1f212d] rounded-2xl text-xs text-gray-500">
          ไม่พบรายการวัสดุที่ตรงตามคำค้นหา
        </div>
      ) : (
        /* Inventory Table & Mobile Cards */
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#12131a] border border-[#1f212d] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#0c0d12]/50 border-b border-[#1f212d] text-gray-400 text-[10px] font-extrabold uppercase tracking-wider select-none">
                    <th className="p-4">รายการวัสดุ</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4 text-center">คงเหลือ</th>
                    <th className="p-4 text-center">เตือนขั้นต่ำ</th>
                    <th className="p-4">ที่อยู่ชั้นวาง</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f212d]/60 text-xs text-gray-300">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-gray-800/80 text-gray-400 shrink-0">
                            <Box className="w-4 h-4 text-[#c5a880]" />
                          </div>
                          <span className="font-bold text-white group-hover:text-[#c5a880] transition-colors">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 font-mono font-bold tracking-wider">{item.sku}</td>
                      <td className="p-4 capitalize">{item.category}</td>
                      <td className="p-4 text-center font-extrabold text-white">{item.stockQty} {item.unit}</td>
                      <td className="p-4 text-center text-gray-500 font-semibold">{item.minStockAlert} {item.unit}</td>
                      <td className="p-4">{item.warehouseLocation || 'ไม่ระบุโซน'}</td>
                      <td className="p-4">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusStyle(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openEditModal(item)}
                            title="แก้ไข/ปรับสต็อก"
                            className="p-1.5 rounded-lg bg-[#1f212d] hover:bg-[#c5a880] text-gray-400 hover:text-black transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            title="ลบวัสดุ"
                            className="p-1.5 rounded-lg bg-[#1f212d] hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {filteredInventory.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#12131a] border border-[#1f212d] space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-gray-800/80 text-[#c5a880] shrink-0">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs leading-tight">{item.name}</h4>
                      <span className="text-[10px] text-gray-500 font-mono font-bold tracking-wider mt-0.5 block">{item.sku}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${getStatusStyle(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] border-t border-[#1f212d]/50 pt-3 text-gray-400">
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold">คงเหลือ</span>
                    <span className="text-white font-bold text-xs">{item.stockQty} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold">เกณฑ์เตือนภัย</span>
                    <span className="text-gray-300 font-semibold text-xs">{item.minStockAlert} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold">หมวดหมู่</span>
                    <span className="text-gray-300 font-medium capitalize">{item.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold">ที่อยู่ชั้นวาง</span>
                    <span className="text-gray-300 font-medium">{item.warehouseLocation || 'ไม่ระบุโซน'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#1f212d]/40 pt-2.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f212d] hover:bg-[#c5a880] text-gray-300 hover:text-black text-[10px] font-bold transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f212d] hover:bg-red-500 text-gray-300 hover:text-white text-[10px] font-bold transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ADD MATERIAL MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">เพิ่มรายการวัสดุใหม่เข้าคลัง</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อรายการวัสดุ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ไม้ HMR 15มม. (เกรด A)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รหัส SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น HMR-15-A"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่วัสดุ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น wood, fittings, paint"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">คงเหลือคลัง *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQty}
                    onChange={e => setStockQty(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ยอดแจ้งเตือนขั้นต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={e => setMinStockAlert(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หน่วยเรียกหน่วยวัด *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แผ่น, ตัว, แกลลอน"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ตำแหน่งจัดเก็บในคลังวัสดุ</label>
                <input
                  type="text"
                  placeholder="เช่น Zone A-2, ชั้น 1 ด้านขวา"
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
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
                    <span>บันทึกเข้าคลัง</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MATERIAL MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-md bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-5 border-b border-[#1f212d] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">แก้ไข / ปรับยอดวัสดุคงเหลือ</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditItem} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อรายการวัสดุ *</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อวัสดุ"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">รหัส SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="SKU"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่วัสดุ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ประเภทหมวดหมู่"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">คงเหลือคลัง *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQty}
                    onChange={e => setStockQty(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ยอดแจ้งเตือนขั้นต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={e => setMinStockAlert(Number(e.target.value))}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หน่วยเรียก</label>
                  <input
                    type="text"
                    required
                    placeholder="หน่วยเรียก"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-[#1c1d24] border border-[#2d2f3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ตำแหน่งจัดเก็บในคลังวัสดุ</label>
                <input
                  type="text"
                  placeholder="ตำแหน่งโกดัง"
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
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
                    <span>อัปเดตข้อมูล</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-0 md:p-4">
          <div className="w-full max-w-sm bg-[#12131a] border-t md:border border-[#1f212d] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl animate-slideUp md:animate-scaleUp pb-8 md:pb-0 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto my-3 block md:hidden" />
            
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">ต้องการลบรายการวัสดุนี้?</h3>
                <p className="text-xs text-gray-400">
                  คุณกำลังจะลบ <strong className="text-white">{selectedItem.name}</strong> (SKU: {selectedItem.sku}) ออกจากคลังวัสดุอย่างถาวร การกระทำนี้ไม่สามารถย้อนคืนได้
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
                  onClick={handleDeleteItem}
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
