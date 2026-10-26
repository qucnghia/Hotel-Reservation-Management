import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '../icons/Icons.jsx';

export default function ThemeToggle({ className = '', onThemeChange }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hotel_theme');
            if (saved === 'light' || saved === 'dark') return saved;
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
        }
        localStorage.setItem('hotel_theme', theme);
        if (onThemeChange) {
            onThemeChange(theme);
        }
    }, [theme, onThemeChange]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
            aria-label="Chuyển đổi chế độ sáng tối"
            className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-300 cursor-pointer shadow-md select-none ${
                isDark
                    ? 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-700/80 hover:border-amber-400/50 text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-400/50 text-slate-800 shadow-slate-200/50'
            } ${className}`}
        >
            {/* Icon Pill */}
            <div
                className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                    isDark
                        ? 'bg-amber-500/15 text-amber-400 group-hover:rotate-12'
                        : 'bg-indigo-500/10 text-indigo-600 group-hover:-rotate-12'
                }`}
            >
                {isDark ? (
                    <SunIcon className="w-5 h-5 text-amber-400" />
                ) : (
                    <MoonIcon className="w-5 h-5 text-indigo-600" />
                )}
            </div>

            {/* Label and Mode Text */}
            <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Giao diện
                </span>
                <span className="text-xs font-bold font-mono tracking-wide">
                    {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
                </span>
            </div>

            {/* Glow Indicator Dot */}
            <span
                className={`w-2 h-2 rounded-full transition-colors ml-0.5 ${
                    isDark ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                }`}
            />
        </button>
    );
}
