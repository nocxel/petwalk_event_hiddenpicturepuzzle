'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemTracker from '@/components/ItemTracker';
import GameCanvas from '@/components/GameCanvas';
import ItemFoundModal from '@/components/ItemFoundModal';
import CouponModal from '@/components/CouponModal';
import { HIDDEN_ITEMS, STORE_INFO, HiddenItem } from '@/data/items';
import { Gift, Sparkles, MapPin, Clock, Share2, Check } from 'lucide-react';

const STORAGE_KEY_FOUND = 'petwalk_event_found_items';
const STORAGE_KEY_COUPON = 'petwalk_event_coupon';

export interface CouponData {
  code: string;
  issueDate: string;
  validUntil: string;
  discountRate: 10 | 15;
  reissueCount: number; // 0: 첫 발급(재발급 1회 가능), 1: 재발급 완료(기회 소진)
  hasVisitedInsta?: boolean; // 인스타 좋아요 미션 참여 여부
}

export default function HomePage() {
  const [foundItemIds, setFoundItemIds] = useState<string[]>([]);
  const [modalItem, setModalItem] = useState<HiddenItem | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [activeHintItemId, setActiveHintItemId] = useState<string | null>(null);

  const [couponData, setCouponData] = useState<CouponData | null>(null);
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

        // 하위 호환성 및 무결성 보정
        if (parsed.discountRate !== 10 && parsed.discountRate !== 15) {
          parsed.discountRate = 10;
        }
        if (typeof parsed.reissueCount !== 'number') {
          parsed.reissueCount = 0;
        }
        if (typeof parsed.hasVisitedInsta !== 'boolean') {
          parsed.hasVisitedInsta = false;
        }

        setCouponData(parsed);
      }

      // 개발 및 검증용 콘솔 헬퍼 (F12 콘솔에서 즉시 테스트 가능)
      if (typeof window !== 'undefined') {
        (window as any).testCompleteAll = () => {
          updateFoundItems(HIDDEN_ITEMS.map((i) => i.id));
          const c = generateCoupon(false, true);
          setShowCouponModal(true);
          return `테스트 완료: ${c.discountRate}% 쿠폰 발급됨 (코드: ${c.code})`;
        };
        (window as any).test15Percent = () => {
          updateFoundItems(HIDDEN_ITEMS.map((i) => i.id));
          const now = new Date();
          const validDate = new Date(now);
          validDate.setDate(validDate.getDate() + 30);
          const c: CouponData = {
            code: `PW-AUTUMN15-${Math.floor(1000 + Math.random() * 9000)}`,
            issueDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            validUntil: `${validDate.getFullYear()}.${String(validDate.getMonth() + 1).padStart(2, '0')}.${String(validDate.getDate()).padStart(2, '0')}`,
            discountRate: 15,
            reissueCount: 0,
            hasVisitedInsta: false,
          };
          localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(c));
          setCouponData(c);
          setShowCouponModal(true);
          return '15% 최대혜택 당첨 모달 즉시 실행!';
        };
        (window as any).test10Percent = (visitedInsta = false) => {
          updateFoundItems(HIDDEN_ITEMS.map((i) => i.id));
          const now = new Date();
          const validDate = new Date(now);
          validDate.setDate(validDate.getDate() + 30);
          const c: CouponData = {
            code: `PW-AUTUMN10-${Math.floor(1000 + Math.random() * 9000)}`,
            issueDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            validUntil: `${validDate.getFullYear()}.${String(validDate.getMonth() + 1).padStart(2, '0')}.${String(validDate.getDate()).padStart(2, '0')}`,
            discountRate: 10,
            reissueCount: 0,
            hasVisitedInsta: visitedInsta,
          };
          localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(c));
          setCouponData(c);
          setShowCouponModal(true);
          return `10% 쿠폰 모달 즉시 실행 (인스타 방문 상태: ${visitedInsta ? '방문 완료' : '미방문(좋아요 버튼 표시)'})!`;
        };
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

  /**
   * 쿠폰 생성 함수
   * @param isReissue false: 최초 발급 (10% 쿠폰 90% / 15% 쿠폰 10%)
   *                  true:  재발급 (10% 쿠폰 50% / 15% 쿠폰 50%)
   * @param forceNew  기존 쿠폰 무시하고 강제 생성 여부
   */
  const generateCoupon = (isReissue = false, forceNew = false): CouponData => {
    if (!forceNew && !isReissue && couponData) return couponData;

    const rand = Math.random();
    let discountRate: 10 | 15;

    if (!isReissue) {
      // 1번째 발급: 10% 쿠폰이 90% / 15% 쿠폰이 10%
      discountRate = rand < 0.10 ? 15 : 10;
    } else {
      // 2번째 발급: 10% 쿠폰이 50% / 15% 쿠폰이 50%
      discountRate = rand < 0.50 ? 15 : 10;
    }

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

    const newCoupon: CouponData = {
      code: `PW-AUTUMN${discountRate}-${randomSuffix}`,
      issueDate: issueDateStr,
      validUntil: validUntilStr,
      discountRate,
      reissueCount: isReissue ? 1 : 0,
      hasVisitedInsta: isReissue ? (couponData?.hasVisitedInsta ?? true) : (couponData?.hasVisitedInsta ?? false),
    };

    try {
      localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(newCoupon));
    } catch (e) {
      console.error(e);
    }

    setCouponData(newCoupon);
    return newCoupon;
  };

  // 인스타그램 좋아요 미션 링크 방문 처리
  const handleVisitInsta = () => {
    if (!couponData) return;
    const updated: CouponData = {
      ...couponData,
      hasVisitedInsta: true,
    };
    try {
      localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setCouponData(updated);
  };

  // 재발급 실행 핸들러 (최대 1회 제한)
  const handleReissueCoupon = (): 10 | 15 => {
    if (!couponData || couponData.reissueCount >= 1) {
      return couponData?.discountRate ?? 10;
    }
    const nextCoupon = generateCoupon(true, true);
    return nextCoupon.discountRate;
  };

  // Handle item discovered
  const handleItemFound = (item: HiddenItem) => {
    if (foundItemIds.includes(item.id)) return;

    const nextIds = [...foundItemIds, item.id];
    updateFoundItems(nextIds);
    setModalItem(item);

    // If all items found, generate a fresh coupon if not already present
    if (nextIds.length >= HIDDEN_ITEMS.length) {
      if (!couponData) {
        generateCoupon(false, true);
      }
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
    if (!couponData || !couponData.discountRate) {
      generateCoupon(false, true);
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
                  {couponData?.discountRate
                    ? `발급된 ${couponData.discountRate}% 할인 쿠폰을 지금 바로 확인하고 캡처하세요.`
                    : '매장에서 사용 가능한 할인 쿠폰(최대 15%)을 지금 바로 확인하고 캡처하세요.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCoupon}
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#8A5231] font-black text-sm rounded-xl shadow hover:bg-[#FFF6ED] active:scale-95 transition-all shrink-0"
            >
              🎟️ {couponData?.discountRate ? `${couponData.discountRate}% 할인 쿠폰 보기` : '할인 쿠폰 보기'}
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
                  <strong>쿠폰 발급:</strong> 5가지를 모두 찾으면 <strong>[랜덤 할인 쿠폰 (10% 또는 15%)]</strong>이 즉시 발급됩니다. 아쉽다면 인스타 좋아요 미션 후 1회 재발급 찬스(15% 당첨 확률 50%)에 도전해보세요!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EAD4C0] text-[#7A4D2F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>매장 제시:</strong> PETWALK 매장 방문 후 결제 시 캡처 화면을 직원에게 보여주세요! (택배 주문 시에도 사용 가능)
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
                  <span>영업시간: 11:30 ~ 21:30 (매주 월요일 정기휴무)</span>
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
          handleOpenCoupon();
        }}
      />

      {/* Discount Coupon Modal */}
      {showCouponModal && couponData && (
        <CouponModal
          couponCode={couponData.code}
          issueDate={couponData.issueDate}
          validUntil={couponData.validUntil}
          discountRate={couponData.discountRate}
          reissueCount={couponData.reissueCount}
          hasVisitedInsta={couponData.hasVisitedInsta ?? false}
          onVisitInsta={handleVisitInsta}
          onReissueCoupon={handleReissueCoupon}
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
            <span>내 {couponData?.discountRate ? `${couponData.discountRate}% ` : ''}쿠폰 보기</span>
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
