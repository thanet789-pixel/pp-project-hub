'use client';

import React from 'react';
import { mockContractors } from '@/lib/mockData';
import { Briefcase, Star, Phone, DollarSign, Award, CheckCircle } from 'lucide-react';

export default function ContractorsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-[#1f212d] pb-4">
        <h2 className="text-lg font-bold text-white tracking-wide">ผู้รับเหมาช่วง (Subcontractors)</h2>
        <p className="text-xs text-gray-400">รายการประเมินผลงาน ผู้รับเหมาโครงเหล็ก ระบบไฟฟ้า ประปา กระจก และหินงานติดตั้ง</p>
      </div>

      {/* Contractors Table/Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockContractors.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-[#12131a] border border-[#1f212d] hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col justify-between gap-4 group">
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-[#c5a880]/10 text-[#c5a880] group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{c.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors">{c.name}</h3>
                <span className="text-[10px] text-gray-500 uppercase font-semibold mt-1 block tracking-wider">{c.jobCategory}</span>
              </div>
            </div>

            {/* Performance KPI & payment status */}
            <div className="border-t border-[#1f212d] pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">🏆 คะแนนงาน</span>
                <span className="text-white font-bold">{c.performanceScore}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">💰 วงเงินสัญญา</span>
                <span className="text-white font-bold">฿{c.totalContractValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">💳 สถานะจ่ายเงิน</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${
                  c.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                  c.paymentStatus === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {c.paymentStatus === 'paid' ? 'ชำระครบแล้ว' : c.paymentStatus === 'partial' ? 'จ่ายบางส่วน' : 'รอชำระ'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => alert(`ดูข้อมูลสัญญาของ ${c.name}`)}
              className="w-full py-2 border border-[#1f212d] hover:border-[#c5a880]/30 hover:bg-[#c5a880]/5 rounded-xl text-xs text-gray-300 hover:text-white font-bold transition-all"
            >
              ดูรายละเอียดสัญญา
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
