import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

const SIZES = {
  sm: { chip: 32, row: 30, font: 12 },
  md: { chip: 42, row: 36, font: 14 },
  lg: { chip: 48, row: 40, font: 15 }
};
const PAD = 4;
const GAP = 2;
const MENU_GAP = 6;
const DEFAULT_OPTIONS = ['One', 'Two', 'Three'];
const STYLE = '@keyframes gs-swap{from{opacity:.6;filter:blur(2px)}}';

const norm = o => (typeof o === 'string' ? { value: o, label: o } : o);
const textOf = it => (typeof it.label === 'string' ? it.label : String(it.value));
const typeaheadIndex = (items, from, ch) => {
  const c = ch.toLowerCase();
  const n = items.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (textOf(items[i]).toLowerCase().startsWith(c)) return i;
  }
  return from;
};

export default function GlideSelect({
  options = DEFAULT_OPTIONS,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  showTags = true,
  accentColor = '#38bdf8',
  surfaceColor = '#0f172a',
  highlightColor = '#1e293b',
  textColor = '#f8fafc',
  size = 'md',
  radius = 12,
  menuWidth,
  placement = 'bottom',
  align = 'left',
  popDuration = 180,
  glideDuration = 220,
  rememberPosition = true,
  disabled = false,
  ariaLabel = 'Select',
  className = '',
  fullWidth = false
}) {
  const items = options.map(norm);
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value !== undefined ? String(value) : inner;
  const selected = items.findIndex(it => String(it.value) === String(current));
  const [phase, setPhase] = useState('closed');
  const [active, setActive] = useState(null);
  const [side, setSide] = useState(placement);
  const [actualAlign, setActualAlign] = useState(align);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const pillRef = useRef(null);
  const instant = useRef(false);
  const closeTimer = useRef(undefined);
  const scrub = useRef(null);
  const id = useId();
  const S = SIZES[size] ?? SIZES.md;
  const step = S.row + GAP;
  const popOut = Math.round((popDuration * 2) / 3);

  useLayoutEffect(() => {
    if (phase !== 'open') return;
    const el = menuRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    const r = root.getBoundingClientRect();
    const need = el.offsetHeight + MENU_GAP;

    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;

    let computedSide = placement;
    if (placement === 'bottom') {
      // Chỉ lật lên trên nếu bên dưới không đủ chỗ và bên trên thực sự rộng hơn và đủ chỗ
      if (spaceBelow < need && spaceAbove > spaceBelow && spaceAbove >= 120) {
        computedSide = 'top';
      }
    } else if (placement === 'top') {
      if (spaceAbove < need && spaceBelow > spaceAbove) {
        computedSide = 'bottom';
      }
    }
    setSide(computedSide);

    // Tính toán chiều cao tối đa khả dụng để không bao giờ bị cắt ngoài màn hình
    const availableH = (computedSide === 'top' ? spaceAbove : spaceBelow) - MENU_GAP - 16;
    if (availableH > 80) {
      el.style.maxHeight = `${Math.min(280, Math.floor(availableH))}px`;
    }

    // Tự động căn lề phải nếu bị tràn mép màn hình bên phải
    const targetW = el.offsetWidth || (menuWidth || 220);
    if (align === 'right' || r.left + targetW > window.innerWidth - 16) {
      setActualAlign('right');
    } else {
      setActualAlign('left');
    }

    el.style.transitionDuration = instant.current ? '0ms' : '';
    el.dataset.state = 'closed';
    void el.offsetHeight;
    el.dataset.state = 'open';
    const p = pillRef.current;
    if (p) {
      p.style.transition = 'none';
      p.style.transform = `translateY(${Math.max(0, selected) * step}px)`;
      p.style.opacity = '0';
      void p.offsetHeight;
      p.style.transition = '';
    }
  }, [phase, selected, step, placement, align, menuWidth]);

  useLayoutEffect(() => {
    const p = pillRef.current;
    if (!p || phase !== 'open') return;
    if (active === null) {
      p.style.opacity = '0';
      return;
    }
    const jump = instant.current || p.style.opacity !== '1';
    p.style.transitionDuration = jump ? '0ms, 150ms' : '';
    p.style.transform = `translateY(${active * step}px)`;
    p.style.opacity = '1';
    instant.current = false;
  }, [active, phase, step]);

  const open = viaKey => {
    if (disabled) return;
    clearTimeout(closeTimer.current);
    instant.current = true;
    setActive(selected >= 0 ? selected : viaKey ? 0 : null);
    setPhase('open');
  };

  const close = mode => {
    setActive(null);
    clearTimeout(closeTimer.current);
    const el = menuRef.current;
    if (mode === 'instant' || !el) {
      setPhase('closed');
      return;
    }
    el.style.transitionDuration = '';
    el.dataset.state = 'closed';
    setPhase('closing');
    closeTimer.current = setTimeout(() => setPhase('closed'), popOut + 20);
  };

  const pick = (i, viaKey) => {
    const it = items[i];
    if (!it) {
      close('instant');
      return;
    }
    if (String(it.value) !== String(current)) {
      if (value === undefined) setInner(it.value);
      onChange?.(it.value, it);
      if (!viaKey && rootRef.current) rootRef.current.dataset.swap = '';
    }
    close('instant');
    triggerRef.current?.focus({ preventScroll: true });
  };

  const onTriggerKey = e => {
    const k = e.key;
    const n = items.length;
    const cur = active ?? Math.max(0, selected);
    if (phase !== 'open') {
      if (k === 'Enter' || k === ' ' || k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        open(true);
      }
      return;
    }
    const go = i => {
      e.preventDefault();
      instant.current = true;
      setActive(Math.min(n - 1, Math.max(0, i)));
    };
    if (k === 'ArrowDown' || k === 'ArrowUp') go(active === null ? cur : cur + (k === 'ArrowDown' ? 1 : -1));
    else if (k === 'Home' || k === 'End') go(k === 'Home' ? 0 : n - 1);
    else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      pick(cur, true);
    } else if (k === 'Escape' || k === 'Tab') {
      if (k === 'Escape') e.preventDefault();
      close('instant');
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) go(typeaheadIndex(items, cur, k));
  };

  useEffect(() => {
    if (phase === 'closed') return undefined;
    const onDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close('pop');
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [phase]);

  useEffect(() => {
    if (disabled && phase !== 'closed') close('instant');
  }, [disabled]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const rowAt = y => {
    const s = scrub.current;
    if (!s) return null;
    const i = Math.floor((y - s.top - PAD) / step);
    return i >= 0 && i < items.length ? i : null;
  };

  const onListDown = e => {
    if (scrub.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    scrub.current = { id: e.pointerId, top: e.currentTarget.getBoundingClientRect().top };
    instant.current = true;
    setActive(rowAt(e.clientY));
  };

  const onListMove = e => {
    if (!scrub.current || scrub.current.id !== e.pointerId) return;
    const i = rowAt(e.clientY);
    if (i !== active) setActive(i);
  };

  const onListUp = e => {
    if (!scrub.current || scrub.current.id !== e.pointerId) return;
    const i = e.type === 'pointerup' ? rowAt(e.clientY) : null;
    scrub.current = null;
    if (i !== null) pick(i, false);
    else if (!rememberPosition) setActive(null);
  };

  const onListOver = e => {
    if (e.pointerType === 'touch' || scrub.current) return;
    const row = e.target.closest('[data-index]');
    if (!row) return;
    const i = Number(row.dataset.index);
    if (i !== active) setActive(i);
  };

  const origin = `${side === 'bottom' ? 'top' : 'bottom'} ${actualAlign}`;
  const computedMenuW = menuWidth ? `${menuWidth}px` : fullWidth ? '100%' : 'max-content';

  return (
    <div
      ref={rootRef}
      className={`group relative ${fullWidth ? 'w-full block' : 'inline-block'} data-[disabled]:opacity-50${className ? ` ${className}` : ''}`}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      style={{
        '--gs-accent': accentColor,
        '--gs-surface': surfaceColor,
        '--gs-highlight': highlightColor,
        '--gs-text': textColor,
        '--gs-radius': `${radius}px`,
        '--gs-inner-radius': `${Math.max(3, radius - 4)}px`,
        '--gs-chip': `${S.chip}px`,
        '--gs-row': `${S.row}px`,
        '--gs-font': `${S.font}px`,
        '--gs-menu-w': computedMenuW,
        '--gs-pop': `${popDuration}ms`,
        '--gs-pop-out': `${popOut}ms`,
        '--gs-glide': `${glideDuration}ms`,
        '--gs-origin': origin
      }}
      onAnimationEnd={e => {
        if (e.animationName === 'gs-swap' && rootRef.current) delete rootRef.current.dataset.swap;
      }}
    >
      <style>{STYLE}</style>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={phase === 'open'}
        aria-controls={`${id}-list`}
        aria-activedescendant={active !== null ? `${id}-${active}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`group/trigger relative m-0 ${fullWidth ? 'w-full justify-between' : 'inline-flex'} cursor-pointer touch-manipulation items-center gap-2 border border-slate-700/80 px-3.5 leading-none font-medium outline-none select-none [-webkit-tap-highlight-color:transparent] [font-family:inherit] [height:var(--gs-chip)] [border-radius:var(--gs-inner-radius)] [background:var(--gs-surface)] [color:var(--gs-text)] [font-size:var(--gs-font)] [transition:background-color_100ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] disabled:cursor-default enabled:active:scale-[0.98] motion-reduce:enabled:active:scale-100 motion-reduce:[transition:background-color_100ms_ease] aria-expanded:[background:color-mix(in_srgb,var(--gs-highlight)_70%,var(--gs-surface))] aria-expanded:border-blue-500/50 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[background:color-mix(in_srgb,var(--gs-highlight)_60%,var(--gs-surface))] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-slate-600 shadow-sm`}
        onPointerDown={e => {
          if (e.button !== 0 || disabled) return;
          e.currentTarget.focus({ preventScroll: true });
          if (phase === 'open') close('pop');
          else open(false);
        }}
        onKeyDown={onTriggerKey}
      >
        <span
          className="truncate data-[empty]:opacity-60 group-data-[swap]:animate-[gs-swap_160ms_ease] motion-reduce:group-data-[swap]:animate-none text-left"
          key={current}
          data-empty={selected < 0 ? '' : undefined}
        >
          {selected >= 0 ? items[selected].label : placeholder}
        </span>
        <span
          className="inline-flex shrink-0 [color:color-mix(in_srgb,var(--gs-text)_60%,transparent)] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] group-aria-expanded/trigger:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2.5} />
        </span>
      </button>
      {phase !== 'closed' ? (
        <div
          ref={menuRef}
          className="absolute z-50 min-w-full scale-95 p-1 opacity-0 border border-slate-700/80 [width:var(--gs-menu-w)] [border-radius:var(--gs-radius)] [background:var(--gs-surface)] shadow-2xl [transform-origin:var(--gs-origin)] [transition:opacity_var(--gs-pop)_cubic-bezier(0.23,1,0.32,1),transform_var(--gs-pop)_cubic-bezier(0.23,1,0.32,1)] data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:[transition-duration:var(--gs-pop-out)] data-[side=bottom]:top-[calc(100%+6px)] data-[side=top]:bottom-[calc(100%+6px)] data-[align=left]:left-0 data-[align=right]:right-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_var(--gs-pop)_ease] motion-reduce:data-[state=closed]:[transition-duration:var(--gs-pop-out)] max-h-64 overflow-y-auto overflow-x-hidden"
          data-state="open"
          data-side={side}
          data-align={actualAlign}
        >
          <div
            id={`${id}-list`}
            role="listbox"
            aria-label={ariaLabel}
            className="group/list relative grid touch-none gap-px"
            data-live={active !== null ? '' : undefined}
            onPointerOver={onListOver}
            onPointerLeave={() => {
              if (!scrub.current && !rememberPosition) setActive(null);
            }}
            onPointerDown={onListDown}
            onPointerMove={onListMove}
            onPointerUp={onListUp}
            onPointerCancel={onListUp}
            onLostPointerCapture={onListUp}
          >
            <span
              ref={pillRef}
              className="pointer-events-none absolute top-0 right-0 left-0 opacity-0 [height:var(--gs-row)] [border-radius:var(--gs-inner-radius)] [background:var(--gs-highlight)] [transition:transform_var(--gs-glide)_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] motion-reduce:[transition:opacity_150ms_ease]"
              aria-hidden="true"
            />
            {items.map((it, i) => (
              <div
                key={it.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === selected}
                data-index={i}
                className="relative z-[1] flex cursor-pointer items-center justify-between gap-2.5 pr-2.5 pl-3 select-none [-webkit-tap-highlight-color:transparent] [height:var(--gs-row)] [border-radius:var(--gs-inner-radius)] [color:var(--gs-text)] [font-size:var(--gs-font)] [transition:background-color_150ms_ease] aria-selected:[background:color-mix(in_srgb,var(--gs-highlight)_60%,transparent)] group-data-[live]/list:aria-selected:bg-transparent"
              >
                <span className="min-w-0 flex-1 truncate font-medium whitespace-nowrap">{it.label}</span>
                {showTags && it.tag ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 [color:color-mix(in_srgb,var(--gs-text)_75%,transparent)] text-[11px] font-medium whitespace-nowrap">
                    {it.tag}
                  </span>
                ) : null}
                <span
                  className="inline-flex shrink-0 invisible [color:var(--gs-accent)] data-[on]:visible ml-1"
                  data-on={i === selected ? '' : undefined}
                  aria-hidden="true"
                >
                  <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
