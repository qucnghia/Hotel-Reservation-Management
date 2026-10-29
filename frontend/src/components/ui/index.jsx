import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ExclamationTriangleIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons.jsx';

// Nhãn: nền đậm vừa + chữ tông 800 để đọc rõ trên nền trắng và cả khi dòng đang được rê chuột
const TONES = {
    gray: 'bg-slate-200 text-slate-800 ring-slate-400/50 dark:bg-slate-400/15 dark:text-slate-200 dark:ring-slate-400/30',
    accent: 'bg-blue-100 text-blue-800 ring-blue-500/40 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/30',
    teal: 'bg-teal-100 text-teal-800 ring-teal-500/40 dark:bg-teal-400/15 dark:text-teal-200 dark:ring-teal-400/30',
    blue: 'bg-blue-100 text-blue-800 ring-blue-500/40 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/30',
    green: 'bg-emerald-100 text-emerald-800 ring-emerald-500/40 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/30',
    amber: 'bg-amber-100 text-amber-900 ring-amber-500/50 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30',
    red: 'bg-rose-100 text-rose-800 ring-rose-500/40 dark:bg-rose-400/15 dark:text-rose-200 dark:ring-rose-400/30',
    purple: 'bg-violet-100 text-violet-800 ring-violet-500/40 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-400/30'
};

const DOTS = {
    gray: 'bg-slate-500 dark:bg-slate-400',
    accent: 'bg-blue-600 dark:bg-blue-400',
    teal: 'bg-teal-600 dark:bg-teal-400',
    blue: 'bg-blue-600 dark:bg-blue-400',
    green: 'bg-emerald-600 dark:bg-emerald-400',
    amber: 'bg-amber-600 dark:bg-amber-400',
    red: 'bg-rose-600 dark:bg-rose-400',
    purple: 'bg-violet-600 dark:bg-violet-400'
};

// Ô icon có màu (tiêu đề trang, thẻ chỉ số, ảnh đại diện)
const ICON_TONES = {
    gray: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300',
    accent: 'bg-accent-soft text-accent',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
    purple: 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300'
};

export function IconTile({ icon: Icon, tone = 'accent', size = 'md' }) {
    const sizes = { sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4', md: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5' };
    return (
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${ICON_TONES[tone] || ICON_TONES.accent} ${sizes[size]}`}>
            <Icon />
        </span>
    );
}

// Ảnh đại diện bằng chữ cái đầu của tên
export function Avatar({ name = '', tone = 'gray' }) {
    const initials = name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
    return (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${ICON_TONES[tone] || ICON_TONES.gray}`}>
            {initials}
        </span>
    );
}

export function Badge({ tone = 'gray', dot = false, className = '', children }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${TONES[tone] || TONES.gray} ${className}`}>
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone] || DOTS.gray}`} />}
            {children}
        </span>
    );
}

const BUTTON_VARIANTS = {
    primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-sm hover:shadow-md hover:shadow-accent/30',
    secondary: 'bg-surface text-fg ring-1 ring-inset ring-line-strong hover:bg-hover shadow-sm',
    ghost: 'text-muted hover:text-fg hover:bg-hover',
    danger: 'bg-surface text-rose-600 ring-1 ring-inset ring-line-strong hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
};

const BUTTON_SIZES = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-sm gap-2',
    icon: 'h-8 w-8 justify-center'
};

export function Button({ variant = 'secondary', size = 'md', icon: Icon, iconClassName = '', className = '', type = 'button', children, ...props }) {
    return (
        <button
            type={type}
            className={`inline-flex items-center rounded-lg font-medium whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 cursor-pointer active:scale-[0.97] disabled:active:scale-100 motion-reduce:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
            {...props}
        >
            {Icon && <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} />}
            {children}
        </button>
    );
}

export function Card({ className = '', children, ...props }) {
    return (
        <div className={`rounded-xl border border-line bg-surface shadow-sm ${className}`} {...props}>
            {children}
        </div>
    );
}

export function PageHeader({ title, description, actions, icon, tone }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                {icon && <IconTile icon={icon} tone={tone} />}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
                    {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function Segmented({ options, value, onChange, className = '' }) {
    return (
        <div className={`inline-flex rounded-lg bg-subtle p-0.5 ring-1 ring-inset ring-line ${className}`}>
            {options.map(({ value: v, label, icon: Icon }) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => onChange(v)}
                    aria-pressed={value === v}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors cursor-pointer ${
                        value === v ? 'bg-surface text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:bg-hover hover:text-fg'
                    }`}
                >
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                </button>
            ))}
        </div>
    );
}

const INPUT_CLASS = 'block w-full h-9 rounded-lg border border-line-strong bg-surface px-3 text-sm text-fg placeholder:text-faint shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-subtle disabled:text-muted disabled:cursor-not-allowed';

export function Input({ className = '', ...props }) {
    return <input className={`${INPUT_CLASS} ${className}`} {...props} />;
}

export function SearchInput({ value, onChange, placeholder, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="pl-9 pr-8"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Xoá từ khoá"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-faint hover:text-fg cursor-pointer"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export function Field({ label, htmlFor, required, hint, children, className = '' }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
            )}
            {children}
            {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
    );
}

export function Alert({ tone = 'red', children, action }) {
    const tones = {
        red: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200',
        amber: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
    };
    return (
        <div role="alert" className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm ${tones[tone]}`}>
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{children}</div>
            {action}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            {Icon && (
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-muted">
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <p className="text-sm font-medium text-fg">{title}</p>
            {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Số chạy từ giá trị cũ tới giá trị mới (ease-out), bỏ qua nếu người dùng tắt chuyển động
export function AnimatedNumber({ value, format = (n) => n.toLocaleString('vi-VN'), duration = 700 }) {
    const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);
    const fromRef = useRef(display);

    useEffect(() => {
        const from = fromRef.current;
        if (prefersReducedMotion() || from === value) {
            fromRef.current = value;
            const frame = requestAnimationFrame(() => setDisplay(value));
            return () => cancelAnimationFrame(frame);
        }
        let frame;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = Math.round(from + (value - from) * eased);
            fromRef.current = current;
            setDisplay(current);
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <>{format(display)}</>;
}

export function StatCard({ label, value, hint, icon, tone = 'accent', className = '', style }) {
    return (
        <Card className={`p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 ${className}`} style={style}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-muted">{label}</p>
                {icon && <IconTile icon={icon} tone={tone} size="sm" />}
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-fg tabular">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </Card>
    );
}

const MODAL_SIZES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
};

// Portal ra body để không bị giam trong khung cha có transform/backdrop-filter
export function Modal({ title, description, icon: Icon, onClose, footer, size = 'md', children }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fadeIn" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl animate-scaleIn ${MODAL_SIZES[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        {Icon && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                                <Icon className="h-5 w-5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-fg">{title}</h2>
                            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" icon={XMarkIcon} />
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-subtle/50 px-5 py-3">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}

// Danh sách số trang rút gọn: 1 … 4 5 6 … 12
const pageNumbers = (page, total) => {
    const pages = new Set([1, total, page - 1, page, page + 1]);
    const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
};

// Thanh phân trang dưới bảng; nhận thẳng kết quả của usePagination
export function Pagination({ page, totalPages, setPage, from, to, total }) {
    if (total === 0) return null;
    return (
        <div className="flex flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-sm sm:flex-row">
            <p className="text-muted tabular">
                Hiển thị <span className="font-medium text-fg">{from}–{to}</span> trên {total}
            </p>
            {totalPages > 1 && (
                <nav className="flex items-center gap-1" aria-label="Phân trang">
                    <Button size="icon" variant="ghost" icon={ChevronLeftIcon} disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Trang trước" />
                    {pageNumbers(page, totalPages).map((p, i) =>
                        p === '…' ? (
                            <span key={`gap-${i}`} className="px-1 text-faint">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                aria-current={p === page ? 'page' : undefined}
                                className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium tabular transition-colors cursor-pointer ${
                                    p === page ? 'bg-accent text-accent-fg shadow-sm' : 'text-muted hover:bg-hover hover:text-fg'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <Button size="icon" variant="ghost" icon={ChevronRightIcon} disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Trang sau" />
                </nav>
            )}
        </div>
    );
}

// Bảng dữ liệu: khung + kiểu chữ tiêu đề thống nhất
export function Table({ head, children, className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-thead text-xs font-semibold text-thead-fg">
                    <tr>
                        {head.map((h, i) => (
                            <th key={i} scope="col" className={`whitespace-nowrap px-4 py-2.5 font-medium ${typeof h === 'object' ? h.className || '' : ''}`}>
                                {typeof h === 'object' ? h.label : h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">{children}</tbody>
            </table>
        </div>
    );
}
