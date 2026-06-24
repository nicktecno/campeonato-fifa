"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VIEWPORT = 280;
const OUTPUT = 400;

interface AvatarCropperProps {
  imageSrc: string;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

export function AvatarCropper({
  imageSrc,
  onConfirm,
  onCancel,
}: AvatarCropperProps) {
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const min = Math.max(VIEWPORT / img.naturalWidth, VIEWPORT / img.naturalHeight);
      setMinScale(min);
      setScale(min * 1.1);
      setPos({ x: 0, y: 0 });
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const clampPosition = useCallback(
    (x: number, y: number, currentScale: number) => {
      const img = imgRef.current;
      if (!img) return { x, y };

      const w = img.naturalWidth * currentScale;
      const h = img.naturalHeight * currentScale;
      const maxX = Math.max(0, (w - VIEWPORT) / 2);
      const maxY = Math.max(0, (h - VIEWPORT) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos(
      clampPosition(
        dragStart.current.posX + dx,
        dragStart.current.posY + dy,
        scale
      )
    );
  };

  const handlePointerUp = () => setDragging(false);

  const handleScaleChange = (value: number) => {
    setScale(value);
    setPos((p) => clampPosition(p.x, p.y, value));
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sourceRadius = VIEWPORT / 2 / scale;
    const centerX = img.naturalWidth / 2 - pos.x / scale;
    const centerY = img.naturalHeight / 2 - pos.y / scale;

    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      img,
      centerX - sourceRadius,
      centerY - sourceRadius,
      sourceRadius * 2,
      sourceRadius * 2,
      0,
      0,
      OUTPUT,
      OUTPUT
    );

    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-pitch-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-gold text-center mb-1">
          Ajustar avatar
        </h3>
        <p className="text-sm text-white/50 text-center mb-5">
          Arraste para posicionar e use o zoom para recortar
        </p>

        <div
          className="relative mx-auto rounded-full overflow-hidden border-4 border-gold/50 bg-black touch-none select-none"
          style={{ width: VIEWPORT, height: VIEWPORT }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {ready && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recorte"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`,
              }}
            />
          )}
          <div className="absolute inset-0 rounded-full ring-4 ring-black/20 pointer-events-none" />
        </div>

        <div className="mt-6 px-1">
          <div className="flex items-center justify-between text-sm text-white/60 mb-2">
            <span>Zoom</span>
            <span>{Math.round((scale / minScale) * 100)}%</span>
          </div>
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.01}
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-full accent-gold"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!ready}
            className="flex-1 py-3 rounded-xl bg-gold text-pitch-dark font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
