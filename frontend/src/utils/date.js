// Tiện ích ngày tháng dùng chung (định dạng dd/MM/yyyy của backend)

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
