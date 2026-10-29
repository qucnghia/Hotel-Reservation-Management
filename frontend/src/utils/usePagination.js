import { useState } from 'react';

export const PAGE_SIZE = 10;

// Chia danh sách thành trang; khi bộ lọc làm danh sách ngắn lại thì tự kéo về trang cuối còn dữ liệu
export function usePagination(items, pageSize = PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * pageSize;

    return {
        page: current,
        totalPages,
        setPage,
        pageItems: items.slice(start, start + pageSize),
        from: items.length === 0 ? 0 : start + 1,
        to: Math.min(start + pageSize, items.length),
        total: items.length
    };
}
