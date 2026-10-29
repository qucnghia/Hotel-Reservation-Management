import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '../icons/Icons.jsx';
import { ToastContext } from '../../utils/toast.js';

const DURATION = 3500;

const STYLES = {
    success: { icon: CheckCircleIcon, tone: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
    error: { icon: ExclamationTriangleIcon, tone: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' }
};

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id) => {
        // Đánh dấu đang rời đi để chạy hiệu ứng trượt ra, rồi mới gỡ khỏi danh sách
        setToasts(list => list.map(t => (t.id === id ? { ...t, leaving: true } : t)));
        setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 180);
    }, []);

    const push = useCallback((type, message) => {
        const id = nextId.current++;
        setToasts(list => [...list.slice(-3), { id, type, message }]);
        setTimeout(() => dismiss(id), DURATION);
    }, [dismiss]);

    const api = useMemo(() => ({
        success: (message) => push('success', message),
        error: (message) => push('error', message)
    }), [push]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            {createPortal(
                <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
                    {toasts.map(t => {
                        const s = STYLES[t.type];
                        const Icon = s.icon;
                        return (
                            <div
                                key={t.id}
                                className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface py-3 pl-3.5 pr-2 text-sm shadow-lg ${t.leaving ? 'animate-toastOut' : 'animate-toastIn'}`}
                            >
                                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.tone}`} />
                                <p className="flex-1 pt-0.5 text-fg">{t.message}</p>
                                <button
                                    type="button"
                                    onClick={() => dismiss(t.id)}
                                    aria-label="Đóng thông báo"
                                    className="rounded-md p-1 text-faint hover:bg-hover hover:text-fg cursor-pointer"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                                {/* Thanh đếm ngược thời gian tự ẩn */}
                                <span className={`absolute bottom-0 left-0 h-0.5 w-full origin-left animate-toastTimer ${s.bar}`} style={{ animationDuration: `${DURATION}ms` }} />
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}
