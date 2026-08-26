import { useRef } from 'react';
import { Swatch, ROLE_LABEL, Role } from '../lib/types';
import { bestText } from '../lib/color';
import { Slots } from '../hooks/usePalette';

interface Props {
  slots: Slots;
  onAdd: (index: number) => void;
  onEdit: (index: number, hex: string) => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onExplain?: (role: Role) => void;
}

function decisionLabel(c: Swatch) {
  if (c.origin === 'suggestion') return 'Chosen';
  if (c.origin === 'role-swap') return 'Role locked';
  if (c.source) return 'Your color';
  return 'Generated';
}

function decisionClass(c: Swatch) {
  if (c.origin === 'suggestion') return 'selected';
  if (c.origin === 'role-swap') return 'swapped';
  if (c.source) return 'source';
  return 'generated';
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M6.5 6.75v8m3.5-8v8m3.5-8v8M4.75 4.5h10.5M8 4.5V3.25h4V4.5m-6 0 .6 11.25h6.8L14 4.5" />
    </svg>
  );
}

export function PaletteRow({ slots, onAdd, onEdit, onRemove, onReorder, onExplain }: Props) {
  const from = useRef<number | null>(null);
  return (
    <div className="palette-row">
      {slots.map((c, i) =>
        c ? (
          <div
            key={`${c.hex}-${i}`} className="slot" draggable
            onDragStart={(e) => { from.current = i; e.currentTarget.classList.add('dragging'); }}
            onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drop'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drop')}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drop'); if (from.current != null && from.current !== i) onReorder(from.current, i); from.current = null; }}
          >
            <div className="sw clean-swatch" style={{ background: c.hex }} onClick={() => onEdit(i, c.hex)}>
              <span className="role-label-clean" style={{ color: bestText(c.hex) }}>{ROLE_LABEL[c.role]}</span>
            </div>

            <div className="slot-body">
              <div className="slot-title-row">
                <div className="slot-title-copy">
                  <span className="slot-name" title={c.name}>{c.name}</span>
                  <span className="slot-hex">{c.hex}</span>
                </div>
                <button
                  className="remove-swatch"
                  aria-label={`Remove ${c.name}`}
                  title={`Remove ${c.name}`}
                  onClick={() => onRemove(i)}
                >
                  <TrashIcon />
                </button>
              </div>

              <div className={`decision-line ${decisionClass(c)}`} title={c.roleLocked ? 'This semantic role will be kept during future completion.' : c.source ? 'This HEX value is protected.' : 'This supporting color can be replaced.'}>
                <span className="decision-dot" aria-hidden="true" />
                <span>{decisionLabel(c)}</span>
                {c.roleLocked && c.origin !== 'role-swap' && <><i aria-hidden="true">·</i><span>Role locked</span></>}
              </div>

              <div className="slot-foot refined-slot-foot">
                <div className="slot-text-actions">
                  <button className="mini text-action" onClick={() => onEdit(i, c.hex)}>Edit</button>
                  <button className="mini why text-action" onClick={() => onExplain?.(c.role)}>Why this role?</button>
                </div>
                <span className="reorder-controls refined-reorder" aria-label="Reorder palette card">
                  <button aria-label={`Move ${c.name} left`} disabled={i === 0} onClick={() => onReorder(i, i - 1)}>←</button>
                  <button aria-label={`Move ${c.name} right`} disabled={i === slots.length - 1} onClick={() => onReorder(i, i + 1)}>→</button>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="slot empty">
            <button onClick={() => onAdd(i)}><span className="plus">+</span>Add color</button>
          </div>
        ),
      )}
    </div>
  );
}
export type { Swatch };
