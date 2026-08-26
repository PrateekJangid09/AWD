// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from '../App';

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

function render() { act(() => root.render(<App />)); }
function byText(t: string): HTMLElement | undefined {
  return [...container.querySelectorAll('button,h1,h2,h3,.c-title,.fixbtn')].find((e) => (e.textContent || '').includes(t)) as HTMLElement | undefined;
}
function click(el: Element | undefined | null) { act(() => { el?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); }
function type(el: HTMLInputElement, value: string, blur = true) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (blur) el.dispatchEvent(new Event('blur', { bubbles: true }));
  });
}
function addHex(hex: string) {
  const add = byText('Add your first color') || container.querySelector('.slot.empty button');
  click(add);
  type(container.querySelector('.fmt input') as HTMLInputElement, hex);
  click(byText('Use color'));
}

describe('WebPalette Studio — full UI flow', () => {
  it('mounts with the public MVP positioning and empty state', () => {
    render();
    expect(byText('Turn your brand colors into a complete website palette.')).toBeTruthy();
    expect(byText('Bring the colors you already have.')).toBeTruthy();
    expect(byText('Add your first color')).toBeTruthy();
  });

  it('adds two colors and completes all five semantic roles', async () => {
    render();
    addHex('#FFFD74');
    addHex('#75BBFD');
    await waitFor(() => expect(container.querySelectorAll('.suggest-card').length).toBeGreaterThanOrEqual(1));
    click(container.querySelector('.fixbtn'));
    expect(new Set([...container.querySelectorAll('.role-tag')].map((e) => e.textContent)).size).toBe(5);
    expect(container.textContent).toContain('Why each color is here');
    expect(container.querySelectorAll('.decision-row').length).toBe(5);
    expect(container.textContent).toContain('5 of 5 roles ready');
  });

  it('name search allows spaces and closes on select', () => {
    render();
    click(byText('Add your first color'));
    const nameInp = container.querySelector('.name-inp') as HTMLInputElement;
    type(nameInp, 'Sky Blue', false);
    const rows = container.querySelectorAll('.nr');
    expect(rows.length).toBeGreaterThan(0);
    click(rows[0]);
    expect(container.querySelectorAll('.nr').length).toBe(0);
    const hex = (container.querySelector('.fmt input') as HTMLInputElement).value;
    expect(/^#[0-9A-Fa-f]{6}$/.test(hex)).toBe(true);
  });

  it('accepting a suggested option makes it a chosen role-locked decision', async () => {
    render();
    addHex('#0047AB');
    await waitFor(() => expect(container.querySelector('.suggest-card')).toBeTruthy());
    const option = container.querySelector('.suggest-card') as HTMLButtonElement;
    const suggestedHex = option.textContent?.match(/#[0-9A-F]{6}/i)?.[0];
    click(option);
    expect(container.textContent).toContain('Chosen');
    expect(container.textContent).toContain('Role locked');
    expect(suggestedHex).toBeTruthy();

    click(container.querySelector('.fixbtn'));
    const selected = [...container.querySelectorAll('.slot')].find((slot) => slot.querySelector('.origin.selected'));
    expect(selected?.textContent).toContain(suggestedHex!);
  });

  it('keeps the current website preview honest with two colors', () => {
    render();
    addHex('#FFFD74');
    addHex('#75BBFD');
    click(byText('Preview current palette'));
    expect(container.textContent).toContain('Current palette');
    expect(container.textContent).toContain('No hidden colors');
    expect(container.textContent).toContain('Missing roles are not secretly generated');
    expect(container.querySelectorAll('.web-chip').length).toBe(2);
  });

  it('preserves a real before/after snapshot across completion', () => {
    render();
    addHex('#FFFD74');
    addHex('#75BBFD');
    click(byText('Complete palette'));
    click(byText('Preview completed palette'));
    expect(byText('Before')).toBeTruthy();
    expect(byText('After')).toBeTruthy();
    expect(container.textContent).toContain('Completed palette');
    click(byText('Before'));
    expect(container.textContent).toContain('Current palette');
    expect(container.querySelectorAll('.web-chip').length).toBe(2);
    click(byText('After'));
    expect(container.querySelectorAll('.web-chip').length).toBe(5);
  });

  it('preview remains available after removing a source and completing from the surviving source', () => {
    render();
    addHex('#6C63FF');
    addHex('#FFF6F1');
    click(container.querySelector('.fixbtn'));

    const sourceSlots = [...container.querySelectorAll('.slot')].filter((slot) => slot.querySelector('.origin.source'));
    expect(sourceSlots.length).toBe(2);
    click(sourceSlots[0].querySelector('.x'));

    click(container.querySelector('.fixbtn'));
    const previewButton = byText('Preview website') as HTMLButtonElement;
    expect(previewButton.disabled).toBe(false);
    click(previewButton);
    expect(container.textContent).toContain('Completed palette');
  });

  it('a palette completed from one source is previewable', () => {
    render();
    addHex('#6C63FF');
    click(container.querySelector('.fixbtn'));
    const previewButton = byText('Preview website') as HTMLButtonElement;
    expect(previewButton.disabled).toBe(false);
  });

  it('swaps Primary and Secondary and preserves the semantic roles through completion', () => {
    render();
    addHex('#6C63FF');
    addHex('#FF6112');

    const slotFor = (label: string) => [...container.querySelectorAll('.slot')].find((slot) => slot.querySelector('.role-tag')?.textContent === label);
    const primaryBefore = slotFor('Primary')?.querySelector('.slot-hex')?.textContent;
    const secondaryBefore = slotFor('Secondary')?.querySelector('.slot-hex')?.textContent;
    expect(primaryBefore).toBeTruthy();
    expect(secondaryBefore).toBeTruthy();

    click(byText('Primary ⇄ Secondary'));
    expect(slotFor('Primary')?.querySelector('.slot-hex')?.textContent).toBe(secondaryBefore);
    expect(slotFor('Secondary')?.querySelector('.slot-hex')?.textContent).toBe(primaryBefore);
    expect(container.textContent).toContain('Role locked');

    click(container.querySelector('.fixbtn'));
    expect(slotFor('Primary')?.querySelector('.slot-hex')?.textContent).toBe(secondaryBefore);
    expect(slotFor('Secondary')?.querySelector('.slot-hex')?.textContent).toBe(primaryBefore);
  });
});
