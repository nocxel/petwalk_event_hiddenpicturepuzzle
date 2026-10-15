'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Tag, Gift } from 'lucide-react';
import { HiddenItem } from '@/data/items';

interface ItemFoundModalProps {
  item: HiddenItem | null;
  foundCount: number;
  totalCount: number;
  onClose: () => void;
  onClaimCoupon: () => void;
}

export default function ItemFoundModal({
  item,
  foundCount,
  totalCount,
  onClose,
  onClaimCoupon,
}: ItemFoundModalProps) {
  if (!item) return null;

  const isAllCompleted = foundCount >= totalCount;
  const remainingCount = totalCount - foundCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#E8D4C0] overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-[#8A5231] via-[#B2572B] to-[#E66A2B] px-6 pt-5 pb-4 text-white text-center relative">
          {/* Discovered Cutout Image */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white/95 rounded-2xl mb-2 backdrop-blur-md border-2 border-[#FFE8A3] shadow-lg p-1.5 animate-bounce-gentle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#2D6A4F] text-white rounded-full flex items-center justify-center border-2 border-white shadow">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <p className="text-xs font-semibold text-[#FFE0C2] uppercase tracking-wider">
            Hidden Item Discovered!
          </p>
          <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-white tracking-tight">
            🎉 {item.name} 발견!
          </h3>
          <p className="text-xs text-[#FFF0E0] mt-1">
            {item.tagline}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Item Description */}
          <div className="bg-[#FAF3EB] p-3.5 rounded-2xl border border-[#EADBCC] text-center">
            <p className="text-xs sm:text-sm text-[#624735] leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Featured Brands Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Tag className="w-4 h-4 text-[#E66A2B]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#3A2016]">
                PETWALK 매장 취급 대표 브랜드 & 라인업
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.brands.map((brand, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#F5ECE0] text-[#633A1F] border border-[#E2D2C0] shadow-2xs hover:bg-[#EBDBC8] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E66A2B] mr-1.5" />
                  {brand}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#9A7D69] mt-2">
              💡 매장에 오시면 직접 착용 및 시식, 체험해 보실 수 있습니다.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#F3ECE4] rounded-xl text-xs font-medium text-[#7C5A42]">
            <span>현재 발견 현황</span>
            <span className="font-bold text-[#8A5231]">
              {foundCount} / {totalCount} 완료
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2">
            {isAllCompleted ? (
              <button
                onClick={onClaimCoupon}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E66A2B] via-[#E5833C] to-[#E5A93C] hover:brightness-105 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Gift className="w-5 h-5" />
                <span>모두 찾으셨습니다! 할인 쿠폰 받기 ➔</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 bg-[#8A5231] hover:bg-[#724124] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>계속 찾기 ({remainingCount}개 남음)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
