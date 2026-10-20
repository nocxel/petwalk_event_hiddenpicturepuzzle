'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Sparkles, Check, Navigation, HelpCircle } from 'lucide-react';
import { HiddenItem, HIDDEN_ITEMS } from '@/data/items';

interface GameCanvasProps {
  foundItemIds: string[];
  showHints: boolean;
  activeHintItemId: string | null;
  onItemFound: (item: HiddenItem) => void;
  onInspectFoundItem: (item: HiddenItem) => void;
}

interface ClickFeedback {
  id: number;
  x: number; // percentage
  y: number; // percentage
  type: 'hit' | 'near' | 'miss';
  message?: string;
}

export default function GameCanvas({
  foundItemIds,
  showHints,
  activeHintItemId,
  onItemFound,
  onInspectFoundItem,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Pan & Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Multi-touch pinch state
  const touchDistanceRef = useRef<number | null>(null);

  // Feedback animations
  const [clickEffects, setClickEffects] = useState<ClickFeedback[]>([]);
  const effectCounter = useRef<number>(0);

  // Last tap time for double-tap detection
  const lastTapRef = useRef<number>(0);

  // Keep pan within bounds when zoom changes or window resizes
  const clampPan = useCallback(
    (newPan: { x: number; y: number }, currentZoom: number) => {
      if (!containerRef.current || currentZoom <= 1) {
        return { x: 0, y: 0 };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * (currentZoom - 1)) / 2;
      const maxPanY = (rect.height * (currentZoom - 1)) / 2;

      return {
        x: Math.min(Math.max(newPan.x, -maxPanX), maxPanX),
        y: Math.min(Math.max(newPan.y, -maxPanY), maxPanY),
      };
    },
    []
  );

  // Update pan when zoomLevel resets to 1
  useEffect(() => {
    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan((prev) => clampPan(prev, zoomLevel));
    }
  }, [zoomLevel, clampPan]);

  // Focus view on item when active hint item selected
  useEffect(() => {
    if (!activeHintItemId) return;
    const targetItem = HIDDEN_ITEMS.find((i) => i.id === activeHintItemId);
    if (!targetItem || !containerRef.current) return;

    // Zoom in and pan smoothly to the target item
    const targetZoom = 2.2;
    setZoomLevel(targetZoom);

    const rect = containerRef.current.getBoundingClientRect();
    // Item center in pixels from top-left
    const targetPxX = (targetItem.target.x / 100) * rect.width;
    const targetPxY = (targetItem.target.y / 100) * rect.height;

    // Center of container
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Required pan to bring target to center
    const desiredPanX = (cx - targetPxX) * targetZoom;
    const desiredPanY = (cy - targetPxY) * targetZoom;

    setPan(clampPan({ x: desiredPanX, y: desiredPanY }, targetZoom));
  }, [activeHintItemId, clampPan]);

  // Native Web Audio chime effects
  const playSound = useCallback((type: 'success' | 'near' | 'miss') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // Cheerful ascending arpeggio fanfare (C5 - E5 - G5 - C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + idx * 0.08 + 0.35
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.36);
        });
      } else if (type === 'near') {
        // Playful double-tap chime for near-miss
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else {
        // Soft bubble pop for miss
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.11);
      }
    } catch {
      // Safely ignore if user has not interacted with audio
    }
  }, []);

  // Compute accurate percentage coordinates accounting for Pan & Zoom
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dx = clickX - cx;
    const dy = clickY - cy;

    const origDx = (dx - pan.x) / zoomLevel;
    const origDy = (dy - pan.y) / zoomLevel;

    const origX = cx + origDx;
    const origY = cy + origDy;

    const percentX = (origX / rect.width) * 100;
    const percentY = (origY / rect.height) * 100;

    return { percentX, percentY };
  };

  // Check item hit
  const checkTargetHit = (percentX: number, percentY: number) => {
    let hitItem: HiddenItem | null = null;
    let nearItem: HiddenItem | null = null;

    // Mobile generous touch tolerance buffer (+1.0%)
    const touchBuffer = 1.0;

    for (const item of HIDDEN_ITEMS) {
      if (foundItemIds.includes(item.id)) continue;

      const dist = Math.sqrt(
        Math.pow(percentX - item.target.x, 2) +
          Math.pow(percentY - item.target.y, 2)
      );

      // Hit check
      if (dist <= item.target.radius + touchBuffer) {
        hitItem = item;
        break;
      }

      // Check alternatives if any
      let altHit = false;
      if (item.alternativeTargets) {
        for (const alt of item.alternativeTargets) {
          const altDist = Math.sqrt(
            Math.pow(percentX - alt.x, 2) + Math.pow(percentY - alt.y, 2)
          );
          if (altDist <= alt.radius + touchBuffer) {
            hitItem = item;
            altHit = true;
            break;
          }
        }
      }
      if (altHit) break;

      // Near miss check
      if (dist <= item.target.nearRadius + touchBuffer && !nearItem) {
        nearItem = item;
      }
    }

    const effId = ++effectCounter.current;
    let effectType: 'hit' | 'near' | 'miss' = 'miss';
    let message: string | undefined;

    if (hitItem) {
      effectType = 'hit';
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 120]);
      }
      playSound('success');
      onItemFound(hitItem);
    } else if (nearItem) {
      effectType = 'near';
      message = '아주 가까워요! 🔍';
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      playSound('near');
    } else {
      effectType = 'miss';
      playSound('miss');
    }

    setClickEffects((prev) => [
      ...prev,
      {
        id: effId,
        x: percentX,
        y: percentY,
        type: effectType,
        message,
      },
    ]);

    setTimeout(() => {
      setClickEffects((prev) => prev.filter((eff) => eff.id !== effId));
    }, 1100);
  };

  // --- Mouse Drag & Click handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 5) {
      hasMovedRef.current = true;
    }

    if (zoomLevel > 1) {
      const nextPan = {
        x: panStartRef.current.x + deltaX,
        y: panStartRef.current.y + deltaY,
      };
      setPan(clampPan(nextPan, zoomLevel));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);

    // If moved more than 5px, treat as Pan/Drag, do NOT trigger tap!
    if (hasMovedRef.current) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords) {
      checkTargetHit(coords.percentX, coords.percentY);
    }
  };

  // --- Touch Drag & Tap Handlers (Mobile Optimized) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchDistanceRef.current = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;

      if (Math.hypot(deltaX, deltaY) > 6) {
        hasMovedRef.current = true;
      }

      if (zoomLevel > 1) {
        const nextPan = {
          x: panStartRef.current.x + deltaX,
          y: panStartRef.current.y + deltaY,
        };
        setPan(clampPan(nextPan, zoomLevel));
      }
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      // Pinch to zoom move
      hasMovedRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY
      );
      const ratio = currentDist / touchDistanceRef.current;

      setZoomLevel((prev) => {
        const next = Math.min(Math.max(prev * ratio, 1), 3.2);
        return Math.round(next * 10) / 10;
      });
      touchDistanceRef.current = currentDist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchDistanceRef.current = null;

      // Tap detection
      if (!hasMovedRef.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const now = Date.now();

        // Double-tap to zoom toggle
        if (now - lastTapRef.current < 280) {
          setZoomLevel((prev) => (prev > 1.2 ? 1 : 2.2));
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;

        const coords = getCanvasCoords(touch.clientX, touch.clientY);
        if (coords) {
          checkTargetHit(coords.percentX, coords.percentY);
        }
      }
    }
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.3 : -0.3;
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 3.2);
      return Math.round(next * 10) / 10;
    });
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 3.2);
      return Math.round(next * 10) / 10;
    });
  };

  const resetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Mini-map click to pan
  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!containerRef.current || zoomLevel <= 1) return;
    const miniRect = e.currentTarget.getBoundingClientRect();
    const clickRatioX = (e.clientX - miniRect.left) / miniRect.width;
    const clickRatioY = (e.clientY - miniRect.top) / miniRect.height;

    const rect = containerRef.current.getBoundingClientRect();
    const desiredPxX = clickRatioX * rect.width;
    const desiredPxY = clickRatioY * rect.height;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const targetPanX = (cx - desiredPxX) * zoomLevel;
    const targetPanY = (cy - desiredPxY) * zoomLevel;

    setPan(clampPan({ x: targetPanX, y: targetPanY }, zoomLevel));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Zoom & Helper Toolbar */}
      <div className="w-full flex items-center justify-between gap-2 px-1 sm:px-3 py-1.5 text-xs text-[#8A664E]">
        <div className="flex items-center gap-1.5 font-medium min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#E66A2B] animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs text-[#5A3822] leading-tight">
            {zoomLevel > 1 ? (
              <span>
                화면을 <strong>밀어 이동</strong>하고, 타깃을 <strong>터치</strong>하세요!
              </span>
            ) : (
              <span>
                두 손가락으로 벌리거나 <strong>[+] 버튼</strong>으로 확대해보세요!
              </span>
            )}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-[#E8DCCF] rounded-full px-1.5 sm:px-2 py-0.5 shadow-2xs shrink-0">
          <button
            onClick={() => handleZoom(-0.4)}
            disabled={zoomLevel <= 1}
            className="p-1 text-[#7A5A43] hover:text-[#3A2016] disabled:opacity-35"
            title="축소"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-extrabold px-1 min-w-[36px] sm:min-w-[40px] text-center text-[#E66A2B] whitespace-nowrap">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.4)}
            disabled={zoomLevel >= 3.2}
            className="p-1 text-[#7A5A43] hover:text-[#3A2016] disabled:opacity-35"
            title="확대"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={resetView}
              className="p-1 text-[#E66A2B] hover:text-[#C85A20] ml-0.5"
              title="전체 화면 보기"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Game Viewport */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#2B1B12] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-[#EAD7C5] aspect-[4/3] touch-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Scaled & Translated Layer */}
        <div
          className="relative w-full h-full will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Waldo Master Illustration */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src="/images/petwalk_autumn_festival.jpg"
            alt="PETWALK 가을 페스티벌 숨은그림찾기"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Click Ripple & Feedback Animations */}
          {clickEffects.map((eff) => (
            <div
              key={eff.id}
              className="absolute pointer-events-none z-30"
              style={{
                left: `${eff.x}%`,
                top: `${eff.y}%`,
              }}
            >
              {eff.type === 'hit' && (
                <div className="w-16 h-16 -ml-8 -mt-8 rounded-full bg-gradient-to-r from-amber-400/80 to-yellow-300/80 border-2 border-yellow-200 animate-ping" />
              )}

              {eff.type === 'near' && (
                <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full mb-1 animate-bounce">
                  <div className="bg-[#E66A2B] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap border border-white">
                    {eff.message}
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#E66A2B] animate-spin mt-1" />
                </div>
              )}

              {eff.type === 'miss' && (
                <div className="w-9 h-9 -ml-4.5 -mt-4.5 rounded-full border border-white/60 bg-white/25 animate-scaleUp" />
              )}
            </div>
          ))}

          {/* Hint Markers (if hints enabled or specific item hint active) */}
          {HIDDEN_ITEMS.map((item) => {
            const isFound = foundItemIds.includes(item.id);
            if (isFound) return null;

            const isSpecificActive = activeHintItemId === item.id;
            const shouldShowHint = showHints || isSpecificActive;

            if (!shouldShowHint) return null;

            return (
              <div
                key={`hint-${item.id}`}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${item.target.x}%`,
                  top: `${item.target.y}%`,
                }}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 border-dashed border-[#FFD166] bg-yellow-400/30 flex items-center justify-center animate-spin"
                  style={{ animationDuration: '5s' }}
                >
                  <Sparkles className="w-5 h-5 text-[#FFE27D] animate-pulse" />
                </div>
              </div>
            );
          })}

          {/* Found Markers (Persistent Badges) */}
          {HIDDEN_ITEMS.map((item) => {
            const isFound = foundItemIds.includes(item.id);
            if (!isFound) return null;

            return (
              <button
                key={`found-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectFoundItem(item);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                style={{
                  left: `${item.target.x}%`,
                  top: `${item.target.y}%`,
                }}
                title={`${item.name} (클릭하여 브랜드 보기)`}
              >
                {/* Golden glowing check badge */}
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-400 opacity-60" />
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#2D6A4F] to-[#52B788] text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-125">
                    <Check className="w-4 h-4 stroke-[3.5]" />
                  </div>
                </div>

                {/* Floating Tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-[#2D6A4F] text-white text-[10px] font-bold rounded-md shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mini-map Radar Navigator (shown when zoomed in) */}
        {zoomLevel > 1.1 && (
          <div
            onClick={handleMiniMapClick}
            className="absolute bottom-3 right-3 z-30 w-24 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden border-2 border-white shadow-xl bg-black/50 backdrop-blur-xs cursor-crosshair group"
            title="미니맵 (클릭한 위치로 시점 이동)"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/petwalk_autumn_festival.jpg"
              alt="미니맵"
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            />
            {/* Viewfinder Indicator Box */}
            <div
              className="absolute border-2 border-[#E66A2B] bg-[#E66A2B]/20 pointer-events-none rounded-xs"
              style={{
                width: `${100 / zoomLevel}%`,
                height: `${100 / zoomLevel}%`,
                left: `${50 - (pan.x / (containerRef.current ? containerRef.current.clientWidth * (zoomLevel - 1) : 1)) * (50 - 50 / zoomLevel) - 50 / zoomLevel}%`,
                top: `${50 - (pan.y / (containerRef.current ? containerRef.current.clientHeight * (zoomLevel - 1) : 1)) * (50 - 50 / zoomLevel) - 50 / zoomLevel}%`,
              }}
            />
            <span className="absolute bottom-0.5 right-1 text-[8px] text-white font-bold bg-black/60 px-1 rounded">
              미니맵
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
