import { useState, useMemo, useEffect } from 'react';
import { UsersIcon, SearchIcon, XMarkIcon, StarIcon } from '../icons/Icons.jsx';

const MEMBERSHIP_STYLES = {
    VIP: {
        badge: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50',
        label: 'VIP (-15%)',
        iconColor: 'text-amber-400'
    },
    PLUS: {
        badge: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/50',
        label: 'PLUS (-10%)',
        iconColor: 'text-indigo-400'
    },
    ECONOMY: {
        badge: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50',
        label: 'ECONOMY (-5%)',
        iconColor: 'text-emerald-400'
    },
    CUSTOMER: {
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        label: 'CUSTOMER',
        iconColor: 'text-slate-500'
    }
};

export default function CustomerTable({ guests, selectedCustomer, onSelectCustomer, onEdit, onClearSelection }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Lắng nghe click ra ngoài bảng để đưa màu dòng trở lại bình thường
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (!e.target.closest('tr') && !e.target.closest('.customer-modal')) {
                if (onClearSelection) onClearSelection();
            }
        };
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [onClearSelection]);

    const filteredGuests = useMemo(() => {
        if (!searchTerm.trim()) return guests || [];
        const term = searchTerm.toLowerCase();
        return (guests || []).filter(g => {
            const name = (g.fullName || g.FullName || '').toLowerCase();
            const email = (g.email || g.Email || '').toLowerCase();
            const membership = (g.membership || '').toLowerCase();
            const id = String(g.id || '');
            return name.includes(term) || email.includes(term) || id.includes(term) || membership.includes(term);
        });
    }, [guests, searchTerm]);

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md flex flex-col w-full">
            {/* Search Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên, email, hạng VIP hoặc ID..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <div className="text-sm text-slate-400 font-medium">
                        Tổng cộng: <strong className="text-slate-900 dark:text-white font-bold">{filteredGuests.length}</strong> / <span className="text-slate-700 dark:text-slate-300 font-semibold">{guests?.length || 0}</span> khách hàng
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-base text-slate-200">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                        <tr>
                            <th scope="col" className="px-5 py-4 w-20 text-center">ID</th>
                            <th scope="col" className="px-5 py-4">Họ và Tên</th>
                            <th scope="col" className="px-5 py-4">Hạng Hội Viên</th>
                            <th scope="col" className="px-5 py-4">Chi Tiêu Tích Lũy</th>
                            <th scope="col" className="px-5 py-4">Ngày sinh</th>
                            <th scope="col" className="px-5 py-4">Email</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                        {filteredGuests && filteredGuests.length > 0 ? (
                            filteredGuests.map((guest) => {
                                const guestId = guest.id;
                                const guestName = guest.fullName || guest.FullName || '---';
                                const guestDob = guest.dob || guest.DOB || '---';
                                const guestEmail = guest.email || guest.Email || '---';
                                const memKey = guest.membership || 'CUSTOMER';
                                const memStyle = MEMBERSHIP_STYLES[memKey] || MEMBERSHIP_STYLES.CUSTOMER;
                                const payed = Number(guest.payedPrice || 0);
                                const isSelected = selectedCustomer?.id === guestId;

                                return (
                                    <tr
                                        key={guestId}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onSelectCustomer) onSelectCustomer(guest);
                                            if (onEdit) onEdit(guest);
                                        }}
                                        title="Nhấn trực tiếp để chỉnh sửa thông tin hoặc xem lịch sử đặt phòng"
                                        className={`transition-colors duration-150 cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-600/25 border-l-4 border-l-blue-500 shadow-md'
                                                : 'hover:bg-slate-800/70 hover:border-l-4 hover:border-l-blue-400/60'
                                        }`}
                                    >
                                        <td className="px-5 py-4 text-center">
                                            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border inline-block shadow-sm ${
                                                isSelected
                                                    ? 'bg-blue-500 text-white border-blue-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                #{guestId}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-base text-slate-900 dark:text-white">
                                            {guestName}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${memStyle.badge}`}>
                                                <StarIcon className={`w-3.5 h-3.5 ${memStyle.iconColor}`} />
                                                <span>{memStyle.label}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-emerald-400 text-base whitespace-nowrap">
                                            <span className="inline-flex items-baseline gap-1">
                                                <span>{payed.toLocaleString('vi-VN')}</span>
                                                <span className="text-xs font-semibold text-emerald-500">đ</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-sm font-medium whitespace-nowrap">
                                            {guestDob}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                            {guestEmail}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-14 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                                            <UsersIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">
                                            {searchTerm ? 'Không tìm thấy khách hàng phù hợp.' : 'Chưa có khách hàng nào trong hệ thống.'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác.' : 'Bấm nút "Tạo Hồ Sơ Khách Hàng" ở trên để thêm khách hàng mới.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}