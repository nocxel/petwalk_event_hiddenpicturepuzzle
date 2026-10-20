'use client';

import React from 'react';
import { Check, Sparkles, HelpCircle } from 'lucide-react';
import { HiddenItem } from '@/data/items';

interface ItemTrackerProps {
  items: HiddenItem[];
  foundItemIds: string[];
  activeHintItemId: string | null;
  onSelectHintItem: (id: string) => void;
}

export default function ItemTracker({
  items,
  foundItemIds,
  activeHintItemId,
  onSelectHintItem,
}: ItemTrackerProps) {
  const activeItem = items.find((i) => i.id === activeHintItemId);

  return (
    <div className="w-full bg-gradient-to-b from-[#FFF9F2] to-[#FAF2E8] border-y border-[#E8DCCF] py-3 px-3 sm:px-4 shadow-2xs">
      <div className="max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E66A2B] animate-ping" />
            <h2 className="text-xs sm:text-sm font-black text-[#3A2016] tracking-tight">
              🔍 페스티벌 속 숨어있는 5가지 순간을 찾아라!
            </h2>
          </div>
          <span className="text-[11px] text-[#8C6B55] font-medium hidden sm:inline">
            카드를 터치하면 해당 모습의 힌트와 위치를 확인할 수 있어요
          </span>
        </div>

        {/* 5 Product Cutout Cards Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {items.map((item) => {
            const isFound = foundItemIds.includes(item.id);
            const isSelected = activeHintItemId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectHintItem(item.id)}
                className={`group relative flex flex-col items-center justify-between p-1 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 min-w-0 ${
                  isFound
                    ? 'bg-gradient-to-b from-[#EDF7F1] to-[#E2F2E8] border-2 border-[#52B788] shadow-sm ring-2 ring-[#52B788]/20'
                    : isSelected
                    ? 'bg-gradient-to-b from-[#FFF2E5] to-[#FFE5CC] border-2 border-[#E66A2B] shadow-lg scale-105 ring-4 ring-[#E66A2B]/25'
                    : 'bg-white hover:bg-[#FFFAF5] border-2 border-[#EEDBCC] hover:border-[#D99A6E] shadow-xs hover:shadow-md'
                }`}
                title={`${item.name} - ${isFound ? '발견 완료' : '터치하여 힌트 보기'}`}
              >
                {/* Found Stamp Badge */}
                {isFound && (
                  <div className="absolute -top-1.5 -right-1 z-20 bg-[#2D6A4F] text-white text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-white animate-scaleUp whitespace-nowrap">
                    <Check className="w-2.5 h-2.5 stroke-[4]" />
                    <span className="hidden sm:inline">발견!</span>
                  </div>
                )}

                {/* Selected Indicator Ping */}
                {!isFound && isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E66A2B] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E66A2B]" />
                  </span>
                )}

                {/* Real Product Cutout Image Container */}
                <div className="relative w-full aspect-square max-w-[84px] max-h-[84px] flex items-center justify-center p-0.5 sm:p-1 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`w-full h-full object-contain transition-transform duration-300 drop-shadow-md ${
                      isFound
                        ? 'opacity-85 filter contrast-105'
                        : isSelected
                        ? 'scale-110 drop-shadow-lg'
                        : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Product Name Label */}
                <div className="w-full text-center mt-0.5 sm:mt-1 pt-1 border-t border-black/5">
                  <span
                    className={`block text-[10px] sm:text-xs font-bold leading-tight truncate ${
                      isFound
                        ? 'text-[#2D6A4F]'
                        : isSelected
                        ? 'text-[#C45318]'
                        : 'text-[#4A3222]'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-[9px] font-medium block mt-0.5 whitespace-nowrap ${
                      isFound
                        ? 'text-[#40916C] font-semibold'
                        : isSelected
                        ? 'text-[#E66A2B] font-semibold'
                        : 'text-[#9A7D69]'
                    }`}
                  >
                    {isFound ? '✓ 찾음' : '🔍 찾기'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Hint Box */}
        {activeItem && (
          <div className="mt-2.5 p-3 bg-gradient-to-r from-[#FFF4E8] via-[#FFEEDD] to-[#FFF4E8] border border-[#F5C29E] rounded-2xl text-xs text-[#6A3815] flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#F4BE9B] p-0.5 shrink-0 overflow-hidden shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-[#8A3A10] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E66A2B]" />
                  [{activeItem.name}] 힌트
                </p>
                <p className="text-[11px] sm:text-xs text-[#6A3815] mt-0.5">
                  {activeItem.hint}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectHintItem('')}
              className="px-2.5 py-1 bg-white hover:bg-[#FFF6ED] border border-[#E9C4A6] text-[#A34E1A] rounded-lg text-[11px] font-bold shrink-0 transition-all shadow-2xs"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
