import { useRef, useEffect, useCallback } from 'react';

export interface HSV { h: number; s: number; v: number; }
export function hsvToRgb(h: number, s: number, v: number) {
  h = ((h % 360) + 360) % 360; s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = 60 * ((((g - b) / d) % 6));
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: mx ? (d / mx) * 100 : 0, v: mx * 100 };
}

const WR = 340;
export function ColorWheel({ hsv, onPick }: { hsv: HSV; onPick: (h: number, s: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const cx = WR / 2, cy = WR / 2, R = WR / 2 - 4;
    const img = ctx.createImageData(WR, WR), d = img.data;
    for (let y = 0; y < WR; y++) for (let x = 0; x < WR; x++) {
      const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy), idx = (y * WR + x) * 4;
      if (dist > R + 0.5) { d[idx + 3] = 0; continue; }
      let ang = (Math.atan2(dy, dx) * 180) / Math.PI; if (ang < 0) ang += 360;
      const sat = Math.min(1, dist / R) * 100;
      const c = hsvToRgb(ang, sat, hsv.v);
      d[idx] = c.r; d[idx + 1] = c.g; d[idx + 2] = c.b; d[idx + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const ang = (hsv.h * Math.PI) / 180, rad = (hsv.s / 100) * R;
    const hx = cx + Math.cos(ang) * rad, hy = cy + Math.sin(ang) * rad;
    ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
  }, [hsv.h, hsv.s, hsv.v]);

  useEffect(draw, [draw]);

  const pick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = ref.current; if (!cv) return;
    const rect = cv.getBoundingClientRect(), scale = WR / rect.width;
    const px = (e.clientX - rect.left) * scale, py = (e.clientY - rect.top) * scale;
    const cx = WR / 2, cy = WR / 2, R = WR / 2 - 4, dx = px - cx, dy = py - cy;
    let ang = (Math.atan2(dy, dx) * 180) / Math.PI; if (ang < 0) ang += 360;
    const sat = Math.min(1, Math.hypot(dx, dy) / R) * 100;
    onPick(ang, sat);
  };

  return (
    <canvas
      ref={ref}
      className="wheel-canvas"
      width={WR}
      height={WR}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
      onPointerMove={(e) => { if (dragging.current) pick(e); }}
      onPointerUp={() => { dragging.current = false; }}
    />
  );
}
