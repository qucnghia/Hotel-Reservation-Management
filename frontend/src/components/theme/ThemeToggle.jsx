import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '../icons/Icons.jsx';

const readSavedTheme = () => {
    try {
        return localStorage.getItem('hotel_theme') === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
};

export default function ThemeToggle({ className = '', compact = false }) {
    const [theme, setTheme] = useState(readSavedTheme);
    const isDark = theme === 'dark';

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        try {
            localStorage.setItem('hotel_theme', theme);
        } catch {
            // Trình duyệt chặn bộ nhớ: vẫn đổi giao diện được, chỉ không nhớ lựa chọn
        }
    }, [theme, isDark]);

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={compact ? (isDark ? 'Giao diện sáng' : 'Giao diện tối') : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg py-2 ${compact ? 'justify-center' : 'px-2.5'} text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg cursor-pointer ${className}`}
        >
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            {!compact && <span>{isDark ? 'Giao diện sáng' : 'Giao diện tối'}</span>}
        </button>
    );
}
