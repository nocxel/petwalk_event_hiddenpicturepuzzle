'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Check,
  Sparkles,
  MapPin,
  AlertCircle,
  Copy,
  RefreshCw,
  Crown,
  Heart,
  ExternalLink,
  Share2,
  X,
  Camera,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { STORE_INFO } from '@/data/items';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const INSTAGRAM_POST_URL = 'https://www.instagram.com/p/Det4MiYjwVP/';

interface CouponModalProps {
  couponCode: string;
  issueDate: string;
  validUntil: string;
  discountRate: 10 | 15;
  reissueCount: number; // 0: 첫 발급(재발급 1회 가능), 1: 재발급 완료
  hasVisitedInsta: boolean; // 인스타 방문 여부
  onVisitInsta: () => void;
  onReissueCoupon: () => Promise<10 | 15> | (10 | 15);
  onClose: () => void;
  onResetGame: () => void;
}

export default function CouponModal({
  couponCode,
  issueDate,
  validUntil,
  discountRate,
  reissueCount,
  hasVisitedInsta,
  onVisitInsta,
  onReissueCoupon,
  onClose,
  onResetGame,
}: CouponModalProps) {
  const couponCardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReissuing, setIsReissuing] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [canWebShare, setCanWebShare] = useState(false);

  // 인앱 브라우저(인스타그램, 카카오톡, 페이스북, 라인, 네이버 등) 감지
  const isInAppBrowser = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Instagram|KAKAOTALK|FBAN|FBAV|Line|NAVER|DaumApps|everytimeApp/i.test(ua);
  };

  // 인스타그램 게시물 열기 및 방문 상태 갱신
  const handleOpenInstagram = () => {
    window.open(INSTAGRAM_POST_URL, '_blank', 'noopener,noreferrer');
    onVisitInsta();
    triggerToast('인스타그램으로 이동합니다! 게시물 ❤️ 좋아요를 누르고 돌아와주세요.');
  };

  // 빠방하고 신나는 15% 최대혜택 세레모니 폭죽 이펙트
  const triggerMegaCelebration = () => {
    // 1. 모바일 기기 햅틱 피드백 (지원 기기)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } catch {
        // ignore
      }
    }

    // 2. 화면 좌/우 대형 캐논 폭발 (1차)
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.65 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#FF1493', '#00E5FF', '#7000FF'],
      scalar: 1.2,
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.65 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#FF1493', '#00E5FF', '#7000FF'],
      scalar: 1.2,
    });

    // 3. 중앙에서 솟구치는 황금빛 별과 링 파티클 (0.25초 뒤)
    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        origin: { x: 0.5, y: 0.45 },
        shapes: ['star', 'circle'],
        colors: ['#FFE8A3', '#FFD700', '#FFA000', '#FF6D00', '#FFFFFF', '#FF3E3E'],
        scalar: 1.3,
      });
    }, 250);

    // 4. 약 3.5초 동안 사방에서 연속으로 팡팡 터지는 화려한 불꽃놀이 (Fireworks)
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const fireworksInterval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(fireworksInterval);
        return;
      }
      const particleCount = 35 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.45 + 0.1,
        },
        colors: ['#FFD700', '#FF3E3E', '#00E5FF', '#FF00FF', '#76FF03', '#FFD600', '#FF6D00'],
        shapes: ['star', 'circle'],
      });
    }, 320);
  };

  // 10% 쿠폰 시 은은하고 차분한 기본 축하 이펙트
  const triggerStandardCelebration = () => {
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 50,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#E66A2B', '#E5A93C', '#8A5231'],
    });
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 50,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#E66A2B', '#E5A93C', '#8A5231'],
    });
  };

  // 모달 오픈 시 당첨된 쿠폰 할인율에 맞춰 이펙트 실행 + Web Share 지원 여부 확인
  useEffect(() => {
    if (discountRate === 15) {
      triggerMegaCelebration();
    } else {
      triggerStandardCelebration();
    }

    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      setCanWebShare(true);
    }
  }, [discountRate]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  // DataURL -> File 변환 헬퍼 (Web Share API용)
  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: 'image/png' });
  };

  // 모바일 시스템 공유 시트 열기 (사진 앱에 저장 / 카톡 나에게 보내기 등)
  const handleShareImage = async (imgUrl?: string) => {
    const targetUrl = imgUrl || capturedImageUrl;
    if (!targetUrl) return;

    try {
      const fileName = `PETWALK_쿠폰_${discountRate}프로_${couponCode}.png`;
      const file = await dataUrlToFile(targetUrl, fileName);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `PETWALK ${discountRate}% 할인 쿠폰`,
          text: `PETWALK 매장 및 택배 주문 시 사용 가능한 ${discountRate}% 할인 쿠폰 (${couponCode})`,
        });
        triggerToast('공유 메뉴가 열렸습니다! [이미지 저장]을 선택해주세요.');
      } else {
        triggerToast('📸 지금 화면을 휴대폰 스크린샷(전원+볼륨 버튼)으로 캡처해주세요!');
      }
    } catch (err) {
      // 사용자가 공유 창을 닫은 경우(AbortError)는 무시
      if ((err as Error)?.name !== 'AbortError') {
        triggerToast('📸 지금 화면을 휴대폰 스크린샷(전원+볼륨 버튼)으로 캡처해주세요!');
      }
    }
  };

  // 이미지 캡처 저장
  const handleCapture = async () => {
    if (!couponCardRef.current) return;

    try {
      setIsCapturing(true);
      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await toPng(couponCardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#FFFDF9',
      });

      const fileName = `PETWALK_쿠폰_${discountRate}프로_${couponCode}.png`;

      // 1) 인스타그램 / 카카오톡 등 인앱 브라우저인 경우:
      //    자동 다운로드가 막혀있으므로 깨끗한 스크린샷 촬영용 모달을 띄우고 직접 캡처 안내
      if (isInAppBrowser()) {
        setCapturedImageUrl(dataUrl);
        triggerToast('📸 지금 화면을 휴대폰 버튼(전원+볼륨)으로 직접 캡처해주세요!');
        return;
      }

      // 2) 일반 브라우저(크롬, 사파리 등): 즉시 다운로드 실행 + 캡처 모달 함께 표시
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCapturedImageUrl(dataUrl);
      triggerToast('📷 쿠폰 이미지가 저장되었습니다! (직접 화면 캡처도 가능)');
    } catch (err) {
      console.error('Capture error:', err);
      triggerToast('📸 지금 이 화면을 휴대폰 스크린샷으로 직접 캡처해주세요!');
    } finally {
      setIsCapturing(false);
    }
  };

  // 쿠폰 코드 복사
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(couponCode);
      setCopiedCode(true);
      triggerToast('쿠폰 번호가 복사되었습니다!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 1회 재발급 시도 핸들러
  const handleReissue = async () => {
    if (reissueCount >= 1 || isReissuing) return;

    setIsReissuing(true);

    // 긴장감과 재미를 주는 0.8초 추첨 연출
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const newRate = await onReissueCoupon();
      if (newRate === 15) {
        triggerMegaCelebration();
        triggerToast('🎊 대박! 최대 혜택 15% 할인 쿠폰에 당첨되셨습니다!');
      } else {
        triggerToast('10% 할인 쿠폰으로 최종 확정되었습니다!');
      }
    } catch (err) {
      console.error('Reissue error:', err);
      triggerToast('재발급 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsReissuing(false);
    }
  };

  const is15Percent = discountRate === 15;
  const canReissue = reissueCount === 0 && !is15Percent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md my-auto bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#EAD5C2] overflow-hidden transform transition-all animate-scaleUp">
        {/* Header Banner - 15% 당첨 시 화려한 골드 & 앰버 테마 */}
        <div
          className={`px-5 py-4 text-white text-center relative overflow-hidden transition-all duration-500 ${
            is15Percent
              ? 'bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#F59E0B]'
              : 'bg-gradient-to-r from-[#8A5231] via-[#C8672D] to-[#E66A2B]'
          }`}
        >
          {/* 반짝이 광택 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

          {is15Percent ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/25 rounded-full text-xs font-black mb-1 backdrop-blur-md shadow-sm border border-yellow-200/40 whitespace-nowrap">
                <Crown className="w-4 h-4 text-yellow-200 animate-bounce shrink-0" />
                <span className="tracking-wider text-yellow-100">LUCKY JACKPOT!</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center justify-center gap-1 sm:gap-1.5 drop-shadow-md whitespace-nowrap">
                <span>🎉</span> 축하합니다! 최대혜택 당첨! <span>🎉</span>
              </h2>
              <p className="text-xs text-yellow-100 mt-1 font-semibold leading-relaxed">
                축하합니다! 전 품목 <strong>15% 최대 할인 혜택</strong>에 당첨되셨습니다!
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-1 backdrop-blur-sm whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-[#FFE8A3] shrink-0" />
                MISSION COMPLETE
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white whitespace-nowrap">
                축하합니다! 모두 찾으셨습니다 🎉
              </h2>
              <p className="text-xs text-[#FFE0C2] mt-0.5 leading-relaxed">
                PETWALK 매장 및 택배 주문 시 사용 가능한 10% 할인 쿠폰이 발급되었습니다!
              </p>
            </>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          {/* THE CAPTURABLE COUPON CARD */}
          <div
            ref={couponCardRef}
            className={`relative rounded-2xl border-2 border-dashed p-4 sm:p-5 shadow-inner text-[#3A2016] overflow-hidden transition-all duration-300 ${
              is15Percent
                ? 'bg-gradient-to-b from-[#FFFDF2] to-[#FFF7E6] border-[#F59E0B] shadow-amber-100'
                : 'bg-gradient-to-b from-[#FFFDF9] to-[#FDF8F2] border-[#DDBFA8]'
            }`}
          >
            {/* Cut-out ticket circles */}
            <div
              className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFFDF9] border-r-2 ${
                is15Percent ? 'border-[#F59E0B]' : 'border-[#DDBFA8]'
              }`}
            />
            <div
              className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFFDF9] border-l-2 ${
                is15Percent ? 'border-[#F59E0B]' : 'border-[#DDBFA8]'
              }`}
            />


            {/* Top brand header */}
            <div
              className={`flex items-center justify-between gap-2 pb-3 border-b ${
                is15Percent ? 'border-[#FDE68A]' : 'border-[#EBD6C4]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">🐾</span>
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg tracking-wider text-[#3A2016] leading-tight">
                    PETWALK
                  </h3>
                  <p className="text-[10px] text-[#8C6B55] font-medium truncate">
                    PREMIUM PET SELECT SHOP
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E66A2B] text-white whitespace-nowrap">
                  매장 전용
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB] text-white whitespace-nowrap">
                  택배 가능
                </span>
              </div>
            </div>

            {/* Coupon Value Display */}
            <div className="text-center py-3.5 sm:py-4 relative">
              <span
                className={`text-[11px] sm:text-xs font-bold tracking-widest uppercase block mb-1 ${
                  is15Percent ? 'text-[#B45309]' : 'text-[#C8672D]'
                }`}
              >
                {is15Percent ? '★ AUTUMN SPECIAL JACKPOT ★' : 'AUTUMN SPECIAL EVENT'}
              </span>

              <div
                className={`text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-1.5 ${
                  is15Percent ? 'text-[#B45309]' : 'text-[#8A5231]'
                }`}
              >
                <span>{discountRate}%</span>
                <span className="text-2xl sm:text-3xl font-bold">OFF</span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#3A2016] mt-1.5">
                PETWALK 매장 전용 {discountRate}% 할인 쿠폰
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-[#B45309] mt-0.5">
                {STORE_INFO.coupon.applicableItems}
              </p>
            </div>

            {/* Crucial Store Conditions & Instruction */}
            <div
              className={`rounded-xl p-2.5 sm:p-3 border text-center space-y-1.5 mb-3 ${
                is15Percent
                  ? 'bg-[#FFFBEB] border-[#FDE68A]'
                  : 'bg-[#FAF0E6] border-[#E9D5C4]'
              }`}
            >
              <p className="text-[11px] sm:text-xs font-extrabold text-[#9A3412] flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{STORE_INFO.coupon.notice}</span>
              </p>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#5C3821] bg-white/80 py-1 px-2 rounded-md border border-[#DFC3AD]">
                👉 {STORE_INFO.coupon.instruction}
              </p>
            </div>

            {/* Coupon Details Table */}
            <div
              className={`text-[11px] text-[#7A5A43] space-y-1 pb-3 border-b px-1 ${
                is15Percent ? 'border-[#FDE68A]' : 'border-[#EBD6C4]'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-[#9E8270] shrink-0">쿠폰 번호:</span>
                <span className="font-mono font-bold text-[#3A2016] flex items-center gap-1 whitespace-nowrap">
                  {couponCode}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[#9E8270] shrink-0">발급 일시:</span>
                <span className="font-medium whitespace-nowrap">{issueDate}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[#9E8270] shrink-0">유효 기간:</span>
                <span className="font-bold text-[#E66A2B] text-right">
                  발급일로부터 30일 ({validUntil} 까지)
                </span>
              </div>
            </div>

            {/* Simulated Barcode Graphic */}
            <div className="pt-3 text-center">
              <div className="inline-block py-1 px-4 bg-white rounded border border-[#E2D2C0]">
                {/* SVG Barcode Representation */}
                <div className="flex items-center justify-center gap-[2px] h-9 sm:h-10 px-1">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="bg-[#2D1B13] h-full"
                        style={{ width: `${w}px` }}
                      />
                    )
                  )}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#775742] mt-0.5">
                  *{couponCode}*
                </div>
              </div>
            </div>
          </div>

          {/* 재발급 섹션 (10% 쿠폰이거나 재발급 기회가 남아있는 경우) */}
          {canReissue ? (
            !hasVisitedInsta ? (
              /* 1단계: 인스타 좋아요 미션 버튼 */
              <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F5] to-[#FFF7ED] rounded-2xl p-3.5 sm:p-4 border-2 border-[#F687B3] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black text-[#B83280] min-w-0">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E53E3E] fill-[#E53E3E] animate-pulse shrink-0" />
                    <span className="truncate">인스타 좋아요 누르고 15% 재발급 찬스!</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E53E3E] text-white whitespace-nowrap shrink-0">
                    15% 확률 50%
                  </span>
                </div>
                <p className="text-[11px] text-[#702459] leading-relaxed">
                  현재 <strong>10% 할인 쿠폰</strong>입니다. PETWALK 인스타그램 게시물에 <strong>❤️ 좋아요</strong>를 누르고 돌아오시면, <strong>15% 할인 당첨 확률이 50%</strong>인 재발급 기회가 즉시 열립니다! (단 1번 가능)
                </p>
                <button
                  onClick={handleOpenInstagram}
                  className="w-full py-3 px-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:brightness-105 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap"
                >
                  <InstagramIcon className="w-4 h-4 shrink-0" />
                  <span>❤️ 인스타 좋아요 누르고 재발급 받기</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </button>
              </div>
            ) : (
              /* 2단계: 인스타 방문 완료 후 재발급 버튼 활성화 */
              <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] rounded-2xl p-3.5 border-2 border-[#FBD38D] shadow-sm space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#C05621] min-w-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DD6B20] shrink-0" />
                    <span className="truncate">미션 완료! 재발급 잠금 해제 (1회)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DD6B20] text-white whitespace-nowrap shrink-0">
                    15% 확률 50%
                  </span>
                </div>
                <p className="text-[11px] text-[#7B341E] leading-relaxed">
                  인스타 미션 완료! 2번째 발급 도전 시{' '}
                  <strong className="text-[#C05621] underline decoration-2">
                    15% 할인 당첨 확률이 50%
                  </strong>
                  로 대폭 상승합니다! (단 1번만 가능)
                </p>
                <button
                  onClick={handleReissue}
                  disabled={isReissuing}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-[#DD6B20] to-[#D69E2E] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-75 whitespace-nowrap"
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${isReissuing ? 'animate-spin' : ''}`} />
                  <span>
                    {isReissuing ? '행운의 쿠폰 재추첨 중... 🎲' : '🎲 15% 당첨 도전! 쿠폰 다시 뽑기'}
                  </span>
                </button>
              </div>
            )
          ) : !is15Percent ? (
            <div className="bg-[#F7EFE6] rounded-xl p-2.5 border border-[#E8DACB] text-center text-xs font-medium text-[#7C5D48]">
              <span>ℹ️ 재발급 기회(1회)를 모두 사용하셨습니다. (10% 할인 최종 확정)</span>
            </div>
          ) : null}

          {/* 화면 직접 캡처 안내 배너 (인스타그램 인앱 브라우저 대응) */}
          <div className="bg-[#FFF4EB] border-2 border-[#F59E0B] rounded-2xl p-3 text-center space-y-1 shadow-sm">
            <p className="text-xs sm:text-sm font-black text-[#B45309] flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-[#E66A2B] shrink-0" />
              <span>지금 이 화면을 휴대폰으로 직접 캡처해주세요!</span>
            </p>
            <p className="text-[11px] text-[#7C5D48] leading-snug">
              인스타그램 앱에서는 이미지 다운로드가 제한될 수 있습니다.<br />
              <strong>휴대폰 화면 캡처(전원 + 볼륨 버튼)</strong>로 찍어주셔도 동일하게 사용 가능합니다!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* 1. SCREENSHOT / CAPTURE BUTTON */}
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className={`w-full py-3.5 px-4 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] whitespace-nowrap ${
                is15Percent
                  ? 'bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#E66A2B] hover:brightness-105'
                  : 'bg-gradient-to-r from-[#E66A2B] to-[#E5A93C] hover:brightness-105'
              }`}
            >
              <Download className="w-5 h-5 shrink-0" />
              <span>{isCapturing ? '쿠폰 준비 중...' : '📸 쿠폰 크게 보기 / 이미지 저장'}</span>
            </button>

            {/* Sub actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyCode}
                className="py-2.5 px-3 bg-white hover:bg-[#FDF6EE] border border-[#DFC3AD] text-[#7A5A43] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{copiedCode ? '복사 완료' : '쿠폰 번호 복사'}</span>
              </button>

              <button
                onClick={onResetGame}
                className="py-2.5 px-3 bg-white hover:bg-[#FDF6EE] border border-[#DFC3AD] text-[#7A5A43] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>게임 다시하기</span>
              </button>
            </div>
          </div>

          {/* Store Guide Info */}
          <div className="bg-[#FAF3EB] rounded-2xl p-3.5 border border-[#E8DACB] text-xs text-[#6B4B36] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#3A2016]">
              <MapPin className="w-4 h-4 text-[#E66A2B] shrink-0" />
              <span>PETWALK 매장 및 택배 주문 안내</span>
            </div>
            <p className="text-[11px] text-[#7C5D48] leading-relaxed">
              매장 방문 결제 시 또는 택배 주문 시 본 화면 또는 캡처해 두신 이미지를 제시해주시면 {discountRate}% 즉시 할인이 적용됩니다. (발급일로부터 30일간 사용 가능)
            </p>
          </div>

          {/* Close button */}
          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-xs text-[#A28472] hover:text-[#5C3821] underline"
            >
              닫고 매장 둘러보기
            </button>
          </div>
        </div>
      </div>

      {/* 스크린샷 촬영 전용 깔끔한 쿠폰 보기 모달 */}
      {capturedImageUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
          onClick={() => setCapturedImageUrl(null)}
        >
          <div
            className="w-full max-w-sm my-auto bg-[#FFFDF9] rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#EAD5C2] space-y-3.5 text-center relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 X 버튼 */}
            <button
              onClick={() => setCapturedImageUrl(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#F5EBE1] hover:bg-[#EAD5C2] text-[#5C3821] flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 상단 안내 배지 및 타이틀 */}
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E5] text-[#D9531E] text-xs font-extrabold whitespace-nowrap">
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>화면 캡처(스크린샷) 안내</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#3A2016] leading-snug">
                지금 이 화면을 그대로<br />
                <span className="text-[#E66A2B] underline decoration-2">휴대폰 화면 캡처(스크린샷)</span> 해주세요!
              </h3>
              <p className="text-xs text-[#7A5A43] leading-relaxed">
                휴대폰의 <strong>[전원 버튼 + 볼륨 버튼]</strong>을 동시에 눌러 화면을 캡처하시면 사진첩에 바로 저장됩니다.
              </p>
            </div>

            {/* 실제 쿠폰 이미지 */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#E66A2B] shadow-lg bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImageUrl}
                alt={`PETWALK ${discountRate}% 할인 쿠폰`}
                className="w-full h-auto rounded-xl select-auto pointer-events-auto"
                style={{ WebkitTouchCallout: 'default' }}
              />
              <div className="mt-1.5 py-1.5 px-2 bg-[#FFF5EB] rounded-lg text-xs font-extrabold text-[#C85A17] flex items-center justify-center gap-1">
                <span>📸 지금 이 화면을 캡처해서 매장에 보여주세요!</span>
              </div>
            </div>

            {/* 하단 액션 버튼들 */}
            <div className="space-y-2 pt-1">
              {canWebShare && (
                <button
                  onClick={() => handleShareImage(capturedImageUrl)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#E66A2B] to-[#E5A93C] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>공유하기 (나에게 카톡 보내기 등)</span>
                </button>
              )}

              <button
                onClick={() => setCapturedImageUrl(null)}
                className="w-full py-2.5 px-4 bg-[#EFE5DC] hover:bg-[#E5D6C8] text-[#4A2E1B] font-bold text-xs sm:text-sm rounded-xl transition-colors"
              >
                확인 (닫기)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-max max-w-[92vw] bg-[#3A2016] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-center animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE8A3] shrink-0" />
          <span className="leading-snug">{showToast}</span>
        </div>
      )}
    </div>
  );
}
