import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";

/**
 * Component MorphMenuButton:
 * Nút bấm chuyển đổi hoạt ảnh mượt mà giữa Icon Menu (3 gạch) và Icon X (Đóng).
 * Hỗ trợ tối ưu cả chế độ sáng (Light Mode) và chế độ tối (Dark Mode).
 */
export function MorphMenuButton({
    open = false,
    setOpen,
    onClick,
    size = 20,
    className = "",
    label,
    ...props
}) {
    const handleClick = (e) => {
        if (setOpen) {
            setOpen((prev) => !prev);
        }
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-expanded={open}
            aria-label={label || (open ? "Đóng menu" : "Mở menu")}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                open
                    ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/40 hover:bg-blue-100 dark:hover:bg-blue-600/30 shadow-md shadow-blue-500/10"
                    : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
            } ${className}`}
            {...props}
        >
            <MorphIcon icon={open ? X : Menu} size={size} />
            {label && <span className="text-xs font-bold">{label}</span>}
        </button>
    );
}

/**
 * Component MorphIconButton:
 * Nút chuyển đổi tổng quát giữa 2 icon bất kỳ từ lucide data.
 */
export function MorphIconButton({
    active = false,
    onToggle,
    activeIcon = X,
    inactiveIcon = Menu,
    size = 20,
    className = "",
    ariaLabel = "Toggle",
    ...props
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={active}
            aria-label={ariaLabel}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${className}`}
            {...props}
        >
            <MorphIcon icon={active ? activeIcon : inactiveIcon} size={size} />
        </button>
    );
}

// Re-export MorphIcon gốc để tái sử dụng
export { MorphIcon };
