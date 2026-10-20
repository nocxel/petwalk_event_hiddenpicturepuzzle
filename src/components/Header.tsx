'use client';

import React from 'react';
import { Sparkles, HelpCircle, RotateCcw } from 'lucide-react';
import { STORE_INFO } from '@/data/items';

interface HeaderProps {
  foundCount: number;
  totalCount: number;
  showHints: boolean;
  onToggleHints: () => void;
  onReset: () => void;
}

export default function Header({
  foundCount,
  totalCount,
  showHints,
  onToggleHints,
  onReset,
}: HeaderProps) {
  const isAllFound = foundCount === totalCount;
  const progressPercent = Math.round((foundCount / totalCount) * 100);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DCCF] shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#8A5231] to-[#E66A2B] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm shrink-0">
            🐾
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
              <span className="font-black tracking-wider text-[#3A2016] text-sm sm:text-lg whitespace-nowrap shrink-0">
                {STORE_INFO.name}
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F5E6D3] text-[#8A5231] whitespace-nowrap shrink-0">
                가을 이벤트 🍂
              </span>
            </div>
            <p className="text-[11px] text-[#8C6B55] hidden sm:block truncate">
              숨은 5가지 순간을 찾고 최대 15% 할인 쿠폰을 받으세요!
            </p>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Progress Bar Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F7EFE6] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#E8D8C5] shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-[#8A5231] flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E66A2B] animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              {foundCount}/{totalCount}
            </span>
            <div className="w-10 sm:w-24 h-2 bg-[#E2D2C0] rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-gradient-to-r from-[#E66A2B] to-[#E5A93C] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hint Toggle Button */}
          <button
            onClick={onToggleHints}
            className={`p-1.5 sm:p-2 rounded-full border transition-all text-xs flex items-center gap-1 shrink-0 ${
              showHints
                ? 'bg-[#E66A2B] text-white border-[#E66A2B] shadow-sm'
                : 'bg-white text-[#8A5231] border-[#E8D8C5] hover:bg-[#FDF6EE]'
            }`}
            title="힌트 켜기/끄기"
            aria-label="힌트 켜기/끄기"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline font-medium whitespace-nowrap">힌트</span>
          </button>

          {/* Reset Button */}
          {foundCount > 0 && (
            <button
              onClick={onReset}
              className="p-1.5 sm:p-2 rounded-full border border-[#E8D8C5] bg-white text-[#A28472] hover:text-[#8A5231] hover:bg-[#FDF6EE] transition-all shrink-0"
              title="처음부터 다시하기"
              aria-label="다시하기"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
