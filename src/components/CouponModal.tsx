'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Share2, Check, Sparkles, MapPin, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { STORE_INFO } from '@/data/items';

interface CouponModalProps {
  couponCode: string;
  issueDate: string;
  validUntil: string;
  onClose: () => void;
  onResetGame: () => void;
}

export default function CouponModal({
  couponCode,
  issueDate,
  validUntil,
  onClose,
  onResetGame,
}: CouponModalProps) {
  const couponCardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#E66A2B', '#E5A93C', '#8A5231', '#52B788'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#E66A2B', '#E5A93C', '#8A5231', '#52B788'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCapture = async () => {
    if (!couponCardRef.current) return;

    try {
      setIsCapturing(true);

      // Give a tiny tick for style stabilization
      await new Promise((r) => setTimeout(r, 100));

      const dataUrl = await toPng(couponCardRef.current, {
        quality: 0.98,
        pixelRatio: 2, // High resolution for crisp barcodes and text
        backgroundColor: '#FFFDF9',
      });

      setCapturedImageUrl(dataUrl);

      // Try file download
      const link = document.createElement('a');
      link.download = `PETWALK_쿠폰_${couponCode}.png`;
      link.href = dataUrl;
      link.click();

      triggerToast('📷 쿠폰 이미지가 저장되었습니다!');
    } catch (err) {
      console.error('Capture error:', err);
      triggerToast('이미지 저장에 실패했습니다. 화면을 직접 스크린샷 캡처해주세요!');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(couponCode);
      setCopiedCode(true);
      triggerToast('쿠폰 번호가 복사되었습니다!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md my-auto bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#EAD5C2] overflow-hidden transform transition-all animate-scaleUp">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#8A5231] via-[#C8672D] to-[#E66A2B] px-5 py-4 text-white text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-1 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE8A3]" />
            MISSION COMPLETE
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            축하합니다! 모두 찾으셨습니다 🎉
          </h2>
          <p className="text-xs text-[#FFE0C2] mt-0.5">
            PETWALK 매장 및 택배 주문 시 사용 가능한 15% 할인 쿠폰이 발급되었습니다!
          </p>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* THE CAPTURABLE COUPON CARD */}
          <div
            ref={couponCardRef}
            className="relative bg-gradient-to-b from-[#FFFDF9] to-[#FDF8F2] rounded-2xl border-2 border-dashed border-[#DDBFA8] p-5 shadow-inner text-[#3A2016] overflow-hidden"
          >
            {/* Cut-out ticket circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFFDF9] border-r-2 border-[#DDBFA8]" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFFDF9] border-l-2 border-[#DDBFA8]" />

            {/* Top brand header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBD6C4]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <div>
                  <h3 className="font-black text-lg tracking-wider text-[#3A2016]">
                    PETWALK
                  </h3>
                  <p className="text-[10px] text-[#8C6B55] font-medium">
                    PREMIUM PET SELECT SHOP
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E66A2B] text-white">
                  매장 전용
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB] text-white">
                  택배 가능
                </span>
              </div>
            </div>

            {/* Coupon Value Display */}
            <div className="text-center py-4">
              <span className="text-xs font-bold text-[#C8672D] tracking-widest uppercase block mb-1">
                AUTUMN SPECIAL EVENT
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#8A5231]">
                15% <span className="text-2xl sm:text-3xl font-bold">OFF</span>
              </div>
              <p className="text-sm font-bold text-[#3A2016] mt-1">
                {STORE_INFO.coupon.title}
              </p>
              <p className="text-xs font-bold text-[#B45309] mt-1">
                {STORE_INFO.coupon.applicableItems}
              </p>
            </div>

            {/* Crucial Store Conditions & Instruction */}
            <div className="bg-[#FAF0E6] rounded-xl p-3 border border-[#E9D5C4] text-center space-y-1.5 mb-3">
              <p className="text-xs font-extrabold text-[#9A3412] flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {STORE_INFO.coupon.notice}
              </p>
              <p className="text-[11px] font-bold text-[#5C3821] bg-white/70 py-1 px-2 rounded-md border border-[#DFC3AD]">
                👉 {STORE_INFO.coupon.instruction}
              </p>
            </div>

            {/* Coupon Details Table */}
            <div className="text-[11px] text-[#7A5A43] space-y-1 pb-3 border-b border-[#EBD6C4] px-1">
              <div className="flex justify-between">
                <span className="text-[#9E8270]">쿠폰 번호:</span>
                <span className="font-mono font-bold text-[#3A2016] flex items-center gap-1">
                  {couponCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E8270]">발급 일시:</span>
                <span className="font-medium">{issueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9E8270]">유효 기간:</span>
                <span className="font-bold text-[#E66A2B]">
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

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* 1. SCREENSHOT / CAPTURE BUTTON (MAIN USER REQUEST) */}
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E66A2B] to-[#E5A93C] hover:brightness-105 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{isCapturing ? '쿠폰 저장 중...' : '📸 화면 캡처하기 (이미지로 저장)'}</span>
            </button>

            {/* Sub actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyCode}
                className="py-2.5 px-3 bg-white hover:bg-[#FDF6EE] border border-[#DFC3AD] text-[#7A5A43] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode ? '복사 완료' : '쿠폰 번호 복사'}</span>
              </button>

              <button
                onClick={onResetGame}
                className="py-2.5 px-3 bg-white hover:bg-[#FDF6EE] border border-[#DFC3AD] text-[#7A5A43] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>게임 다시하기</span>
              </button>
            </div>
          </div>

          {/* Store Guide Info */}
          <div className="bg-[#FAF3EB] rounded-2xl p-3.5 border border-[#E8DACB] text-xs text-[#6B4B36] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#3A2016]">
              <MapPin className="w-4 h-4 text-[#E66A2B]" />
              <span>PETWALK 매장 및 택배 주문 안내</span>
            </div>
            <p className="text-[11px] text-[#7C5D48] leading-relaxed">
              매장 방문 결제 시 또는 택배 주문 시 본 화면 또는 캡처해 두신 이미지를 제시해주시면 15% 즉시 할인이 적용됩니다. (발급일로부터 30일간 사용 가능)
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

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#3A2016] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE8A3]" />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
