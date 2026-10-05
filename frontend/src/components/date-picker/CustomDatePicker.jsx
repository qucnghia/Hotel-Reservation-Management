import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MorphIcon } from 'morphicons/react';
import { Calendar, X, ChevronLeft, ChevronRight, Check, Clock } from 'lucide';

const VI_WEEKDAYS = [
    { label: 'T2', name: 'Thứ 2' },
    { label: 'T3', name: 'Thứ 3' },
    { label: 'T4', name: 'Thứ 4' },
    { label: 'T5', name: 'Thứ 5' },
    { label: 'T6', name: 'Thứ 6' },
    { label: 'T7', name: 'Thứ 7', weekend: true },
    { label: 'CN', name: 'Chủ Nhật', weekend: true }
];

const VI_MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Chuyển đổi chuỗi dd/MM/yyyy hoặc YYYY-MM-DD sang Date
export const parseAnyDate = (val) => {
    if (!val || typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split('/').map(Number);
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
            return date;
        }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
            return date;
        }
    }
    return null;
};

// Định dạng Date sang dd/MM/yyyy
export const formatToDDMMYYYY = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

// So sánh 2 ngày cùng 1 ngày
export const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

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
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Ngày đang chọn (Date object)
    const selectedDate = useMemo(() => parseAnyDate(value), [value]);

    // Ngày giới hạn
    const minParsed = useMemo(() => parseAnyDate(minDate), [minDate]);
    const maxParsed = useMemo(() => parseAnyDate(maxDate), [maxDate]);

    // Tháng và Năm đang xem trong bảng lịch
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(() => (selectedDate || minParsed || today).getFullYear());
    const [viewMonth, setViewMonth] = useState(() => (selectedDate || minParsed || today).getMonth());
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'

    // Đồng bộ góc nhìn tháng/năm khi value thay đổi từ ngoài
    useEffect(() => {
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
        }
    }, [selectedDate]);

    // Bấm Escape để đóng modal lịch
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setViewMode('days');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Điều hướng tháng
    const handlePrevMonth = (e) => {
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    // Kiểm tra ngày có bị disabled không
    const isDateDisabled = (date) => {
        if (!date) return false;
        if (minParsed) {
            const minCopy = new Date(minParsed.getFullYear(), minParsed.getMonth(), minParsed.getDate());
            const targetCopy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (targetCopy < minCopy) return true;
        }
        if (maxParsed) {
            const maxCopy = new Date(maxParsed.getFullYear(), maxParsed.getMonth(), maxParsed.getDate());
            const targetCopy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (targetCopy > maxCopy) return true;
        }
        return false;
    };

    // Lưới 42 ô ngày (6 tuần x 7 ngày, bắt đầu từ Thứ 2)
    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0: CN, 1: T2, ..., 6: T7
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Số ngày tháng trước bù vào

        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const grid = [];
        for (let i = 0; i < 42; i++) {
            if (i < offset) {
                const dayNum = daysInPrevMonth - offset + i + 1;
                const d = new Date(viewYear, viewMonth - 1, dayNum);
                grid.push({
                    day: dayNum,
                    date: d,
                    isCurrentMonth: false,
                    disabled: isDateDisabled(d)
                });
            } else if (i < offset + daysInMonth) {
                const dayNum = i - offset + 1;
                const d = new Date(viewYear, viewMonth, dayNum);
                grid.push({
                    day: dayNum,
                    date: d,
                    isCurrentMonth: true,
                    disabled: isDateDisabled(d)
                });
            } else {
                const dayNum = i - offset - daysInMonth + 1;
                const d = new Date(viewYear, viewMonth + 1, dayNum);
                grid.push({
                    day: dayNum,
                    date: d,
                    isCurrentMonth: false,
                    disabled: isDateDisabled(d)
                });
            }
        }
        return grid;
    }, [viewYear, viewMonth, minParsed, maxParsed]);

    // Chọn ngày
    const handleSelectDay = (cell) => {
        if (cell.disabled) return;
        const formatted = formatToDDMMYYYY(cell.date);
        if (onChange) onChange(formatted);
        setIsOpen(false);
        setViewMode('days');
    };

    // Chọn nhanh (Presets)
    const handleQuickPreset = (daysToAdd) => {
        const base = minParsed && minParsed > today ? new Date(minParsed) : new Date(today);
        base.setDate(base.getDate() + daysToAdd);
        if (isDateDisabled(base)) return;
        const formatted = formatToDDMMYYYY(base);
        if (onChange) onChange(formatted);
        setIsOpen(false);
    };

    // Danh sách năm cho Chế độ chọn năm (lưới 12 năm kiểu decade view)
    const [decadeStartYear, setDecadeStartYear] = useState(() => Math.floor(viewYear / 12) * 12);

    useEffect(() => {
        setDecadeStartYear(Math.floor(viewYear / 12) * 12);
    }, [viewYear, isOpen]);

    const decadeYears = useMemo(() => {
        const years = [];
        for (let y = decadeStartYear; y < decadeStartYear + 12; y++) {
            years.push(y);
        }
        return years;
    }, [decadeStartYear]);

    // Chữ hiển thị tên thứ của ngày đang chọn
    const selectedDateLabel = useMemo(() => {
        if (!selectedDate) return null;
        const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return `${dayNames[selectedDate.getDay()]}, ${formatToDDMMYYYY(selectedDate)}`;
    }, [selectedDate]);

    // Chọn nhanh ngày sinh theo mốc tuổi
    const handleBirthdayPreset = (age) => {
        const targetYear = today.getFullYear() - age;
        const d = new Date(targetYear, 0, 1);
        const formatted = formatToDDMMYYYY(d);
        if (onChange) onChange(formatted);
        setViewYear(targetYear);
        setViewMonth(0);
        setIsOpen(false);
    };

    return (
        <div className={`relative flex items-center gap-2.5 ${className}`}>
            {/* Input gõ ngày trực tiếp */}
            <input
                ref={inputRef}
                type="text"
                id={id}
                name={name}
                value={value}
                onChange={(e) => {
                    if (onChange) onChange(e.target.value);
                }}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="flex-1 min-w-0 bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium shadow-inner"
            />

            {/* Nút bấm mở lịch với MorphIcon và hiệu ứng Glow */}
            <div className="relative flex-shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                        setViewMode('days');
                    }}
                    disabled={disabled}
                    title="Mở bảng chọn lịch"
                    aria-label="Mở bảng chọn lịch"
                    className={`cursor-pointer flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-md group active:scale-95 border ${
                        isOpen
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 ring-2 ring-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.5)]'
                            : 'bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-600 border-slate-700 hover:border-indigo-500/60 text-slate-300 hover:text-white hover:shadow-[0_0_18px_rgba(99,102,241,0.3)]'
                    }`}
                >
                    <MorphIcon
                        icon={isOpen ? X : Calendar}
                        spring="snappy"
                        size={22}
                        className={`transition-colors pointer-events-none ${isOpen ? 'text-rose-400' : 'text-indigo-400 group-hover:text-indigo-300'}`}
                    />
                </button>
            </div>

            {/* BẢNG LỊCH HIỆN RA TRƯỚC (Centered Floating Dialog via createPortal) */}
            {mounted && isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn select-none"
                    onClick={() => {
                        setIsOpen(false);
                        setViewMode('days');
                    }}
                >
                    <div
                        className="relative w-full max-w-[440px] bg-slate-950/98 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-[0_30px_90px_-10px_rgba(0,0,0,0.95),0_0_60px_rgba(99,102,241,0.25)] ring-1 ring-white/10 select-none overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Thanh ambient glow ở viền trên cùng */}
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90" />

                        {/* Hiệu ứng Ambient Glow nền mờ */}
                        <div className="pointer-events-none absolute -top-20 -left-20 w-52 h-52 bg-indigo-600/15 rounded-full blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -right-20 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl" />

                        {/* Header Tiêu đề Dialog nổi bật đằng trước */}
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/90 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                                    <MorphIcon icon={Calendar} size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                                        {title || (presetsType === 'birthday' ? 'Chọn Ngày Sinh' : 'Bảng Chọn Lịch')}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {presetsType === 'birthday' ? 'Chọn theo mốc tuổi hoặc ngày cụ thể' : 'Chọn ngày nhận / trả phòng lưu trú'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setViewMode('days');
                                }}
                                title="Đóng bảng lịch (hoặc bấm ESC / bấm ra ngoài)"
                                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            >
                                <MorphIcon icon={X} size={18} />
                            </button>
                        </div>

                    {/* Header: Tháng / Năm và nút điều hướng */}
                    <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-800/90 relative z-10">
                        {/* Nhấn vào để đổi sang chế độ chọn nhanh tháng hoặc năm */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode(v => v === 'months' ? 'days' : 'months')}
                                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-base sm:text-lg tracking-tight transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                    viewMode === 'months'
                                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                                        : 'bg-slate-900/90 hover:bg-indigo-950/50 text-white border-slate-800 hover:border-indigo-500/40'
                                }`}
                                title="Bấm để chọn nhanh tháng"
                            >
                                <span>{VI_MONTHS[viewMonth]}</span>
                                <span className={`text-xs transition-transform duration-200 ${viewMode === 'months' ? 'rotate-180 text-white' : 'text-indigo-400'}`}>▾</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode(v => v === 'years' ? 'days' : 'years')}
                                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-base sm:text-lg tracking-tight transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                    viewMode === 'years'
                                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                                        : 'bg-slate-900/90 hover:bg-indigo-950/50 text-indigo-300 hover:text-white border-slate-800 hover:border-indigo-500/40'
                                }`}
                                title="Bấm để chọn nhanh năm"
                            >
                                <span>{viewYear}</span>
                                <span className={`text-xs transition-transform duration-200 ${viewMode === 'years' ? 'rotate-180 text-white' : 'text-indigo-400'}`}>▾</span>
                            </button>
                        </div>

                        {/* Nút Tháng Trước / Tháng Sau với MorphIcon và spring feedback */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                title="Tháng trước"
                                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-indigo-600/30 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-800 hover:border-indigo-500/50 flex items-center justify-center active:scale-90 shadow-sm"
                            >
                                <MorphIcon icon={ChevronLeft} size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                title="Tháng sau"
                                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-indigo-600/30 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-800 hover:border-indigo-500/50 flex items-center justify-center active:scale-90 shadow-sm"
                            >
                                <MorphIcon icon={ChevronRight} size={18} />
                            </button>
                        </div>
                    </div>

                    {/* CHẾ ĐỘ 1: CHỌN THÁNG NHANH */}
                    {viewMode === 'months' && (
                        <div className="py-2 animate-fadeIn relative z-10">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 px-1">
                                <span>Chọn Tháng (Năm {viewYear})</span>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('days')}
                                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    Quay lại lịch ngày
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2.5">
                                {VI_MONTHS.map((mName, mIdx) => (
                                    <button
                                        key={mIdx}
                                        type="button"
                                        onClick={() => {
                                            setViewMonth(mIdx);
                                            setViewMode('days');
                                        }}
                                        className={`py-3.5 px-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                            viewMonth === mIdx
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 scale-[1.02]'
                                                : 'bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 text-slate-200 hover:text-white hover:border-slate-700 active:scale-95'
                                        }`}
                                    >
                                        {mName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CHẾ ĐỘ 2: CHỌN NĂM NHANH THEO THẬP NIÊN */}
                    {viewMode === 'years' && (
                        <div className="py-2 animate-fadeIn relative z-10">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                    Thập niên {decadeStartYear} - {decadeStartYear + 11}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setDecadeStartYear(y => y - 12)}
                                        title="12 năm trước"
                                        className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 cursor-pointer transition-all active:scale-90"
                                    >
                                        ◀ Trước
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDecadeStartYear(y => y + 12)}
                                        title="12 năm sau"
                                        className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 cursor-pointer transition-all active:scale-90"
                                    >
                                        Sau ▶
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-2 rounded-2xl bg-slate-900/50 border border-slate-800">
                                {decadeYears.map((y) => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                            setViewYear(y);
                                            setViewMode('days');
                                        }}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                                            viewYear === y
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold ring-2 ring-indigo-400 shadow-md shadow-indigo-600/30'
                                                : y === today.getFullYear()
                                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
                                                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CHẾ ĐỘ 3: LƯỚI NGÀY TO ĐẸP */}
                    {viewMode === 'days' && (
                        <div className="relative z-10">
                            {/* Lối tắt chọn nhanh cho Đặt Phòng */}
                            {showPresets && presetsType === 'booking' && (
                                <div className="flex items-center gap-1.5 mb-3.5 pb-3 border-b border-slate-800/80 flex-wrap">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Nhanh:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPreset(0)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        Hôm nay
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPreset(1)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        Ngày mai
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPreset(2)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        +2 đêm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPreset(3)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        +3 đêm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickPreset(7)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        +7 đêm
                                    </button>
                                </div>
                            )}

                            {/* Lối tắt chọn nhanh cho Ngày sinh */}
                            {showPresets && presetsType === 'birthday' && (
                                <div className="flex items-center gap-1.5 mb-3.5 pb-3 border-b border-slate-800/80 flex-wrap">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Độ tuổi:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleBirthdayPreset(18)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        18 tuổi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleBirthdayPreset(25)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        25 tuổi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleBirthdayPreset(30)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        30 tuổi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleBirthdayPreset(40)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer active:scale-95"
                                    >
                                        40 tuổi
                                    </button>
                                </div>
                            )}

                            {/* Tiêu đề các thứ trong tuần (T2 -> CN) */}
                            <div className="grid grid-cols-7 gap-1.5 mb-2.5 text-center">
                                {VI_WEEKDAYS.map((wd) => (
                                    <div
                                        key={wd.label}
                                        className={`h-8 flex items-center justify-center text-xs font-extrabold uppercase tracking-wider ${
                                            wd.weekend ? 'text-amber-400/90' : 'text-slate-400'
                                        }`}
                                    >
                                        {wd.label}
                                    </div>
                                ))}
                            </div>

                            {/* Lưới 42 Ngày To, Thoáng, Đẹp Mắt */}
                            <div className="grid grid-cols-7 gap-1.5 text-center">
                                {calendarGrid.map((cell, idx) => {
                                    const isSelected = selectedDate && isSameDay(selectedDate, cell.date);
                                    const isCurrentDay = isSameDay(today, cell.date);

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={cell.disabled}
                                            onClick={() => handleSelectDay(cell)}
                                            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-sm sm:text-base font-bold transition-all relative ${
                                                cell.disabled
                                                    ? 'opacity-20 cursor-not-allowed line-through text-slate-500 pointer-events-none'
                                                    : isSelected
                                                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 text-white font-extrabold shadow-xl shadow-indigo-600/50 scale-105 ring-2 ring-indigo-400 cursor-pointer z-10'
                                                    : isCurrentDay
                                                    ? 'bg-indigo-500/20 border border-indigo-400 text-indigo-300 font-extrabold hover:bg-indigo-500/35 cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                                                    : cell.isCurrentMonth
                                                    ? 'text-slate-100 hover:bg-slate-800/90 hover:text-white cursor-pointer hover:scale-105 active:scale-95'
                                                    : 'text-slate-600 hover:bg-slate-800/40 hover:text-slate-400 cursor-pointer'
                                            }`}
                                        >
                                            <span>{cell.day}</span>
                                            {isCurrentDay && !isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-0.5 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer thanh trạng thái */}
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                            {selectedDateLabel ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {selectedDateLabel}
                                </span>
                            ) : (
                                <span className="text-slate-500 italic">Chưa chọn ngày</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isDateDisabled(today)) {
                                        if (onChange) onChange(formatToDDMMYYYY(today));
                                        setViewYear(today.getFullYear());
                                        setViewMonth(today.getMonth());
                                        setIsOpen(false);
                                        setViewMode('days');
                                    }
                                }}
                                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-indigo-600/10 transition-colors cursor-pointer"
                            >
                                Hôm nay
                            </button>
                            {value && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onChange) onChange('');
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                    Xóa
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setViewMode('days');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold transition-all cursor-pointer border border-slate-700/80 active:scale-95"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}
    </div>
    );
}
