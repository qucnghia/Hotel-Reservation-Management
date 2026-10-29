import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons.jsx';
import { parseAnyDate, formatToDDMMYYYY, isSameDay } from '../../utils/date.js';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 380;

const BOOKING_PRESETS = [
    { label: 'Hôm nay', days: 0 },
    { label: 'Ngày mai', days: 1 },
    { label: '+3 ngày', days: 3 },
    { label: '+7 ngày', days: 7 }
];
const BIRTHDAY_PRESETS = [18, 25, 30, 40];

export default function CustomDatePicker({
    value = '',
    onChange,
    minDate,
    maxDate,
    placeholder = 'dd/MM/yyyy',
    required = false,
    name,
    id,
    disabled = false,
    showPresets = true,
    presetsType = 'booking', // 'booking' | 'birthday'
    title = '',
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const anchorRef = useRef(null);
    const popoverRef = useRef(null);

    const selectedDate = useMemo(() => parseAnyDate(value), [value]);
    const minParsed = useMemo(() => parseAnyDate(minDate), [minDate]);
    const maxParsed = useMemo(() => parseAnyDate(maxDate), [maxDate]);

    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(() => (selectedDate || minParsed || today).getFullYear());
    const [viewMonth, setViewMonth] = useState(() => (selectedDate || minParsed || today).getMonth());
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const [decadeStartYear, setDecadeStartYear] = useState(() => Math.floor(viewYear / 12) * 12);

    const close = useCallback(() => {
        setIsOpen(false);
        setViewMode('days');
    }, []);

    const open = () => {
        if (disabled) return;
        // Mở lịch tại tháng của ngày đang chọn (nếu có)
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
        }
        setViewMode('days');
        setIsOpen(true);
    };

    // Đặt bảng lịch ngay dưới ô nhập (hoặc lật lên trên nếu thiếu chỗ); portal ra body để không bị khung cuộn cắt mất
    const updatePosition = useCallback(() => {
        const rect = anchorRef.current?.getBoundingClientRect();
        if (!rect) return;
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = spaceBelow < POPOVER_HEIGHT + 8 && rect.top > spaceBelow
            ? Math.max(8, rect.top - POPOVER_HEIGHT - 6)
            : rect.bottom + 6;
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - POPOVER_WIDTH - 8);
        setPosition({ top, left });
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) return undefined;
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    // Escape hoặc bấm ra ngoài thì đóng
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                close();
            }
        };
        const onDown = (e) => {
            if (!popoverRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) close();
        };
        window.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onDown, true);
        return () => {
            window.removeEventListener('keydown', onKey, true);
            document.removeEventListener('pointerdown', onDown, true);
        };
    }, [isOpen, close]);

    const isDateDisabled = useCallback((date) => {
        if (!date) return false;
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (minParsed && target < new Date(minParsed.getFullYear(), minParsed.getMonth(), minParsed.getDate())) return true;
        if (maxParsed && target > new Date(maxParsed.getFullYear(), maxParsed.getMonth(), maxParsed.getDate())) return true;
        return false;
    }, [minParsed, maxParsed]);

    // Lưới 42 ô ngày (6 tuần × 7 ngày, bắt đầu từ thứ Hai)
    const calendarGrid = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        return Array.from({ length: 42 }, (_, i) => {
            const d = new Date(viewYear, viewMonth, i - offset + 1);
            return { date: d, isCurrentMonth: d.getMonth() === viewMonth, disabled: isDateDisabled(d) };
        });
    }, [viewYear, viewMonth, isDateDisabled]);

    const shiftMonth = (delta) => {
        const d = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    };

    const pick = (date) => {
        if (isDateDisabled(date)) return;
        onChange?.(formatToDDMMYYYY(date));
        close();
    };

    const pickPreset = (days) => {
        const base = minParsed && minParsed > today ? new Date(minParsed) : new Date(today);
        base.setDate(base.getDate() + days);
        pick(base);
    };

    const pickBirthday = (age) => {
        const d = new Date(today.getFullYear() - age, 0, 1);
        onChange?.(formatToDDMMYYYY(d));
        setViewYear(d.getFullYear());
        setViewMonth(0);
        close();
    };

    const headerButton = 'rounded-md px-2 py-1 text-sm font-semibold text-fg hover:bg-hover cursor-pointer';
    const navButton = 'flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-fg cursor-pointer';
    const chip = 'rounded-md px-2 py-1 text-xs font-medium text-muted ring-1 ring-inset ring-line hover:bg-hover hover:text-fg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <div ref={anchorRef} className={`relative ${className}`}>
            <input
                type="text"
                id={id}
                name={name}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onFocus={open}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete="off"
                className="block h-9 w-full rounded-lg border border-line-strong bg-surface pl-3 pr-9 text-sm text-fg placeholder:text-faint shadow-sm transition-colors tabular focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-subtle disabled:text-muted"
            />
            <button
                type="button"
                onClick={() => (isOpen ? close() : open())}
                disabled={disabled}
                aria-label={title || 'Mở lịch chọn ngày'}
                aria-expanded={isOpen}
                className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-fg cursor-pointer disabled:cursor-not-allowed"
            >
                <CalendarIcon className="h-4 w-4" />
            </button>

            {isOpen && position && createPortal(
                <div
                    ref={popoverRef}
                    role="dialog"
                    aria-label={title || 'Chọn ngày'}
                    style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
                    className="fixed z-[60] select-none rounded-xl border border-line bg-surface p-3 shadow-lg animate-fadeIn"
                >
                    {/* Tháng / năm và điều hướng */}
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <button type="button" className={headerButton} onClick={() => setViewMode(m => (m === 'months' ? 'days' : 'months'))}>
                                {MONTHS[viewMonth]}
                            </button>
                            <button
                                type="button"
                                className={headerButton}
                                onClick={() => {
                                    setDecadeStartYear(Math.floor(viewYear / 12) * 12);
                                    setViewMode(m => (m === 'years' ? 'days' : 'years'));
                                }}
                            >
                                {viewYear}
                            </button>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                type="button"
                                className={navButton}
                                aria-label="Trước"
                                onClick={() => (viewMode === 'years' ? setDecadeStartYear(y => y - 12) : shiftMonth(-1))}
                            >
                                <ChevronLeftIcon />
                            </button>
                            <button
                                type="button"
                                className={navButton}
                                aria-label="Sau"
                                onClick={() => (viewMode === 'years' ? setDecadeStartYear(y => y + 12) : shiftMonth(1))}
                            >
                                <ChevronRightIcon />
                            </button>
                        </div>
                    </div>

                    {viewMode === 'months' && (
                        <div className="grid grid-cols-3 gap-1.5 py-1">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => { setViewMonth(i); setViewMode('days'); }}
                                    className={`h-9 rounded-md text-sm cursor-pointer ${viewMonth === i ? 'bg-accent text-accent-fg' : 'text-fg hover:bg-hover'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-1.5 py-1">
                            {Array.from({ length: 12 }, (_, i) => decadeStartYear + i).map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => { setViewYear(y); setViewMode('days'); }}
                                    className={`h-9 rounded-md text-sm tabular cursor-pointer ${
                                        viewYear === y ? 'bg-accent text-accent-fg' : y === today.getFullYear() ? 'text-accent font-semibold hover:bg-hover' : 'text-fg hover:bg-hover'
                                    }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    {viewMode === 'days' && (
                        <>
                            <div className="grid grid-cols-7 text-center">
                                {WEEKDAYS.map((wd) => (
                                    <div key={wd} className="flex h-8 items-center justify-center text-xs font-medium text-faint">{wd}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-0.5 text-center">
                                {calendarGrid.map((cell) => {
                                    const isSelected = selectedDate && isSameDay(selectedDate, cell.date);
                                    const isToday = isSameDay(today, cell.date);
                                    return (
                                        <button
                                            key={cell.date.getTime()}
                                            type="button"
                                            disabled={cell.disabled}
                                            onClick={() => pick(cell.date)}
                                            aria-label={formatToDDMMYYYY(cell.date)}
                                            aria-pressed={Boolean(isSelected)}
                                            className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm tabular transition-colors ${
                                                cell.disabled
                                                    ? 'cursor-not-allowed text-faint/50'
                                                    : isSelected
                                                        ? 'bg-accent font-semibold text-accent-fg cursor-pointer'
                                                        : isToday
                                                            ? 'font-semibold text-accent ring-1 ring-inset ring-accent/40 hover:bg-hover cursor-pointer'
                                                            : cell.isCurrentMonth
                                                                ? 'text-fg hover:bg-hover cursor-pointer'
                                                                : 'text-faint hover:bg-hover cursor-pointer'
                                            }`}
                                        >
                                            {cell.date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Lối tắt + xoá */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                        {showPresets && presetsType === 'booking' && BOOKING_PRESETS.map(p => (
                            <button key={p.label} type="button" className={chip} onClick={() => pickPreset(p.days)}>{p.label}</button>
                        ))}
                        {showPresets && presetsType === 'birthday' && BIRTHDAY_PRESETS.map(age => (
                            <button key={age} type="button" className={chip} onClick={() => pickBirthday(age)}>{age} tuổi</button>
                        ))}
                        {value && (
                            <button type="button" className={`${chip} ml-auto`} onClick={() => { onChange?.(''); close(); }}>
                                Xoá
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
