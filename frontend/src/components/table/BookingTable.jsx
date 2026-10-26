import { useState } from 'react';
import { updateBookingStatus } from '../../services/bookingService.js';
import { XMarkIcon, SearchIcon, BookmarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';

const BOOKING_STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', tag: 'CONFIRMED' },
    { value: 'CHECKED_IN', label: 'Đang lưu trú', tag: 'CHECKED_IN' },
    { value: 'CHECKED_OUT', label: 'Đã trả phòng', tag: 'CHECKED_OUT' },
    { value: 'CANCELLED', label: 'Đã hủy', tag: 'CANCELLED' }
];

const STATUS_BADGES = {
    CONFIRMED: {
        label: 'Đã xác nhận',
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25',
        dot: 'bg-blue-400'
    },
    CHECKED_IN: {
        label: 'Đang lưu trú',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
        dot: 'bg-emerald-400'
    },
    CHECKED_OUT: {
        label: 'Đã trả phòng',
        bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25',
        dot: 'bg-purple-400'
    },
    CANCELLED: {
        label: 'Đã hủy',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25',
        dot: 'bg-rose-400'
    }
};

// Luồng trạng thái 1 chiều (không quay lại): Đã xác nhận -> Đang lưu trú -> Đã trả phòng
const NEXT_STATUS = {
    CONFIRMED: 'CHECKED_IN',
    CHECKED_IN: 'CHECKED_OUT'
};

export default function BookingTable({ bookings = [], loading = false, onReload }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState(null);

    const handleStatusChange = async (id, newStatus) => {
        setProcessingId(id);
        try {
            await updateBookingStatus(id, newStatus);
            if (onReload) onReload();
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái đơn:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn đặt phòng');
        } finally {
            setProcessingId(null);
        }
    };


    const filteredBookings = bookings.filter((b) => {
        const matchesSearch =
            String(b.id).includes(searchTerm) ||
            String(b.roomNumber).includes(searchTerm) ||
            (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Header và Bộ lọc */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <BookmarkIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Danh Sách Đơn Đặt Phòng</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tổng cộng {bookings.length} đơn đặt phòng trong hệ thống</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm tên khách, số phòng, #ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Filter Status */}
                    <GlideSelect
                        options={BOOKING_STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        ariaLabel="Lọc theo trạng thái đơn"
                        size="md"
                        align="right"
                        menuWidth={240}
                        surfaceColor="#0f172a"
                        highlightColor="#334155"
                        accentColor="#818cf8"
                        textColor="#f8fafc"
                        radius={14}
                    />
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80 min-h-[360px]">
                <table className="w-full text-left border-collapse text-base">
                    <thead>
                        <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-300 uppercase text-sm font-bold tracking-wider">
                            <th className="py-4 px-4">Mã Đơn</th>
                            <th className="py-4 px-4">Khách Hàng</th>
                            <th className="py-4 px-4">Phòng</th>
                            <th className="py-4 px-4">Thời Gian Ở</th>
                            <th className="py-4 px-4">Tổng Tiền</th>
                            <th className="py-4 px-4">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {loading && bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Đang tải danh sách đặt phòng...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                    Không tìm thấy đơn đặt phòng nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((b) => {
                                const badge = STATUS_BADGES[b.bookingStatus] || {
                                    label: b.bookingStatus,
                                    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30 hover:bg-slate-500/25',
                                    dot: 'bg-slate-400'
                                };
                                const isBusy = processingId === b.id;
                                const nextStatus = NEXT_STATUS[b.bookingStatus];
                                const nextLabel = nextStatus ? STATUS_BADGES[nextStatus]?.label : null;
                                const isCycable = Boolean(nextStatus);

                                return (
                                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                                        {/* Mã đơn */}
                                        <td className="py-4 px-4 font-bold text-base text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                            #{b.id}
                                        </td>

                                        {/* Khách hàng */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-base text-white">{b.customerName || `Khách #${b.customerId}`}</div>
                                            <div className="text-sm text-slate-400">{b.customerEmail}</div>
                                        </td>

                                        {/* Phòng */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-base text-white">Phòng {b.roomNumber}</div>
                                            <div className="text-sm text-slate-300">{b.roomType}</div>
                                        </td>

                                        {/* Thời gian ở */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-200">
                                                {b.checkInDate} <span className="text-slate-500">→</span> {b.checkOutDate}
                                            </div>
                                            <div className="text-xs text-blue-400 font-bold mt-0.5">
                                                {b.durationNights || 1} đêm
                                            </div>
                                        </td>

                                        {/* Tổng tiền */}
                                        <td className="py-4 px-4 font-bold text-base text-emerald-400 whitespace-nowrap">
                                            <span className="inline-flex items-baseline gap-1">
                                                <span>{Number(b.totalPrice || 0).toLocaleString('vi-VN')}</span>
                                                <span className="text-xs font-semibold text-emerald-500">đ</span>
                                            </span>
                                        </td>

                                        {/* Trạng thái - luồng 1 chiều: Đã xác nhận -> Đang lưu trú -> Đã trả phòng (kết thúc, không quay lại) */}
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {isCycable ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(b.id, nextStatus)}
                                                        disabled={isBusy}
                                                        title={`Nhấn để chuyển sang: ${nextLabel}`}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed select-none ${badge.bg}`}
                                                    >
                                                        {isBusy ? (
                                                            <span className="w-2 h-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                                                        )}
                                                        <span>{badge.label}</span>
                                                    </button>
                                                ) : (
                                                    <span
                                                        title={b.bookingStatus === 'CHECKED_OUT' ? 'Đơn đã hoàn tất (Đã trả phòng)' : 'Đơn đặt phòng đã bị hủy'}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border select-none ${badge.bg}`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                                                        <span>{badge.label}</span>
                                                    </span>
                                                )}

                                                {/* Nếu đang là "Đã xác nhận" thì bên cạnh có nút hủy */}
                                                {b.bookingStatus === 'CONFIRMED' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                                                        disabled={isBusy}
                                                        title="Hủy đơn đặt phòng này"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />
                                                        <span>Hủy</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
