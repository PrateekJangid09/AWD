import { beforeAll } from 'vitest';
// React 18 act() environment flag + canvas stub for jsdom
beforeAll(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = (() => ({
      createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4) }),
      putImageData: () => {}, beginPath: () => {}, arc: () => {}, stroke: () => {}, fill: () => {},
      lineWidth: 1, strokeStyle: '#000',
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
});
