'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemTracker from '@/components/ItemTracker';
import GameCanvas from '@/components/GameCanvas';
import ItemFoundModal from '@/components/ItemFoundModal';
import CouponModal from '@/components/CouponModal';
import { HIDDEN_ITEMS, STORE_INFO, HiddenItem } from '@/data/items';
import { Gift, Sparkles, MapPin, Clock, Phone, Share2, Check } from 'lucide-react';

const STORAGE_KEY_FOUND = 'petwalk_event_found_items';
const STORAGE_KEY_COUPON = 'petwalk_event_coupon';

export default function HomePage() {
  const [foundItemIds, setFoundItemIds] = useState<string[]>([]);
  const [modalItem, setModalItem] = useState<HiddenItem | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [activeHintItemId, setActiveHintItemId] = useState<string | null>(null);

  const [couponData, setCouponData] = useState<{
    code: string;
    issueDate: string;
    validUntil: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedFound = localStorage.getItem(STORAGE_KEY_FOUND);
      if (savedFound) {
        setFoundItemIds(JSON.parse(savedFound));
      }

      const savedCoupon = localStorage.getItem(STORAGE_KEY_COUPON);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        // Check if saved coupon is already expired
        if (parsed?.validUntil) {
          const parts = parsed.validUntil.split('.').map(Number);
          if (parts.length >= 3) {
            const validDate = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
            if (validDate < new Date()) {
              // Expired coupon: remove it so a fresh one can be issued
              localStorage.removeItem(STORAGE_KEY_COUPON);
              setCouponData(null);
              return;
            }
          }
        }
        setCouponData(parsed);
      }
    } catch (e) {
      console.error('LocalStorage init error', e);
    }
  }, []);

  // Save to LocalStorage
  const updateFoundItems = (newIds: string[]) => {
    setFoundItemIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY_FOUND, JSON.stringify(newIds));
    } catch (e) {
      console.error(e);
    }
  };

  // Generate unique coupon (fresh upon game completion)
  const generateCoupon = (forceNew = false) => {
    if (!forceNew && couponData) return couponData;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const issueDateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const validDate = new Date(now);
    validDate.setDate(validDate.getDate() + 30);
    const validUntilStr = `${validDate.getFullYear()}.${String(validDate.getMonth() + 1).padStart(2, '0')}.${String(
      validDate.getDate()
    ).padStart(2, '0')}`;

    const newCoupon = {
      code: `PW-AUTUMN-${randomSuffix}`,
      issueDate: issueDateStr,
      validUntil: validUntilStr,
    };

    try {
      localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(newCoupon));
    } catch (e) {
      console.error(e);
    }

    setCouponData(newCoupon);
    return newCoupon;
  };

  // Handle item discovered
  const handleItemFound = (item: HiddenItem) => {
    if (foundItemIds.includes(item.id)) return;

    const nextIds = [...foundItemIds, item.id];
    updateFoundItems(nextIds);
    setModalItem(item);

    // If all items found, generate a brand-new coupon with the current timestamp!
    if (nextIds.length >= HIDDEN_ITEMS.length) {
      generateCoupon(true);
    }
  };

  // When user inspects an already found item
  const handleInspectFoundItem = (item: HiddenItem) => {
    setModalItem(item);
  };

  // Reset event
  const handleReset = () => {
    if (confirm('게임을 처음부터 다시 시작하시겠습니까?')) {
      setFoundItemIds([]);
      setModalItem(null);
      setShowCouponModal(false);
      setShowHints(false);
      setActiveHintItemId(null);
      setCouponData(null);
      try {
        localStorage.removeItem(STORAGE_KEY_FOUND);
        localStorage.removeItem(STORAGE_KEY_COUPON);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Share URL copy
  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isAllFound = foundItemIds.length >= HIDDEN_ITEMS.length;

  const handleOpenCoupon = () => {
    if (!couponData) {
      generateCoupon(true);
    }
    setShowCouponModal(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#2A1E17]">
      {/* Top Sticky Header */}
      <Header
        foundCount={foundItemIds.length}
        totalCount={HIDDEN_ITEMS.length}
        showHints={showHints}
        onToggleHints={() => setShowHints((prev) => !prev)}
        onReset={handleReset}
      />

      {/* Item Progress Tracker Bar */}
      <ItemTracker
        items={HIDDEN_ITEMS}
        foundItemIds={foundItemIds}
        activeHintItemId={activeHintItemId}
        onSelectHintItem={(id) =>
          setActiveHintItemId((prev) => (prev === id ? null : id))
        }
      />

      {/* Main Game Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col gap-4">
        {/* Game Canvas / Interactive Image */}
        <GameCanvas
          foundItemIds={foundItemIds}
          showHints={showHints}
          activeHintItemId={activeHintItemId}
          onItemFound={handleItemFound}
          onInspectFoundItem={handleInspectFoundItem}
        />

        {/* All Found Claim Banner (If finished) */}
        {isAllFound && (
          <div className="bg-gradient-to-r from-[#E66A2B] via-[#E5833C] to-[#E5A93C] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulseGlow">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                <Gift className="w-6 h-6 text-[#FFE8A3]" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl">
                  🎉 5가지 아이템을 모두 찾으셨습니다!
                </h3>
                <p className="text-xs text-[#FFF0E0]">
                  매장에서 사용 가능한 15% 할인 쿠폰을 지금 바로 확인하고 캡처하세요.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCoupon}
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#8A5231] font-black text-sm rounded-xl shadow hover:bg-[#FFF6ED] active:scale-95 transition-all shrink-0"
            >
              🎟️ 15% 할인 쿠폰 보기
            </button>
          </div>
        )}

        {/* Event Guide & Store Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
          {/* How to participate */}
          <div className="bg-[#FAF3EB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF]">
            <h4 className="font-bold text-sm sm:text-base text-[#3A2016] flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#E66A2B]" />
              이벤트 참여 및 쿠폰 사용 방법
            </h4>
            <ol className="space-y-2.5 text-xs sm:text-sm text-[#6A4B36]">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EAD4C0] text-[#7A4D2F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>그림 터치:</strong> 축제 속 5가지 특별한 모습(목줄 산책, 자동차 드라이빙, 피크닉 이동가방, 간식 줄다리기, 공중 원반 점핑)을 모두 찾아보세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EAD4C0] text-[#7A4D2F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>쿠폰 발급 및 캡처:</strong> 5가지를 모두 찾으면 <strong>[15% 할인 쿠폰]</strong>이 즉시 발급됩니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EAD4C0] text-[#7A4D2F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>매장 제시:</strong> PETWALK 매장 방문 후 결제 시 캡처 화면을 직원에게 보여주세요!
                </span>
              </li>
            </ol>
          </div>

          {/* Store Info */}
          <div className="bg-[#FAF3EB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#3A2016] flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#E66A2B]" />
                {STORE_INFO.name} 매장 안내
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-[#6A4B36]">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8A5231] shrink-0" />
                  <span>반려견과 함께 편안하게 방문할 수 있는 프리미엄 셀렉트샵</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8A5231] shrink-0" />
                  <span>영업시간: 화~일 11:00 ~ 20:00 (매주 월요일 정기휴무)</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-[#E66A2B]">💡 유의사항:</span>
                  <span>매장 기존 할인 품목과 중복 적용되지 않습니다.</span>
                </p>
              </div>
            </div>

            {/* Share Button */}
            <div className="pt-4 mt-3 border-t border-[#E8DCCF] flex items-center justify-between">
              <span className="text-xs text-[#8A664E]">친구에게 이벤트 공유하기</span>
              <button
                onClick={handleShareLink}
                className="px-3 py-1.5 bg-white hover:bg-[#FFF6ED] border border-[#DFC3AD] text-[#7A5A43] font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedLink ? '링크 복사됨!' : '이벤트 링크 복사'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Discovery Modal */}
      <ItemFoundModal
        item={modalItem}
        foundCount={foundItemIds.length}
        totalCount={HIDDEN_ITEMS.length}
        onClose={() => setModalItem(null)}
        onClaimCoupon={() => {
          setModalItem(null);
          setShowCouponModal(true);
        }}
      />

      {/* Final 15% Discount Coupon Modal */}
      {showCouponModal && couponData && (
        <CouponModal
          couponCode={couponData.code}
          issueDate={couponData.issueDate}
          validUntil={couponData.validUntil}
          onClose={() => setShowCouponModal(false)}
          onResetGame={handleReset}
        />
      )}

      {/* Floating Coupon Button if already completed */}
      {isAllFound && !showCouponModal && !modalItem && (
        <div className="fixed bottom-5 right-5 z-40 animate-bounce-gentle">
          <button
            onClick={handleOpenCoupon}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#E66A2B] to-[#E5A93C] text-white font-extrabold text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white"
          >
            <Gift className="w-4 h-4" />
            <span>내 15% 쿠폰 보기</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 py-6 bg-[#F5ECE0] border-t border-[#E8DCCF] text-center text-xs text-[#8A6B54]">
        <p className="font-bold text-[#3A2016]">{STORE_INFO.name} PET BOUTIQUE</p>
        <p className="mt-1 text-[11px] text-[#A28472]">
          © {new Date().getFullYear()} {STORE_INFO.name}. All rights reserved. • event.petwalk.kr
        </p>
      </footer>
    </main>
  );
}
