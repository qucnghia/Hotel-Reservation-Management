import { useState } from 'react';
import { updateBookingStatus, deleteBooking } from '../services/bookingService';
import { TrashIcon, CheckCircleIcon, XMarkIcon, SearchIcon, BookmarkIcon } from './Icons';

const STATUS_BADGES = {
    PENDING: {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'Chờ duyệt'
    },
    CONFIRMED: {
        bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        dot: 'bg-blue-400',
        label: 'Đã xác nhận'
    },
    CHECKED_IN: {
        bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Đang lưu trú (In)'
    },
    CHECKED_OUT: {
        bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400',
        label: 'Đã trả phòng (Out)'
    },
    CANCELLED: {
        bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Đã hủy'
    }
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

    const handleDelete = async (id) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn đặt phòng #${id}?`)) return;
        setProcessingId(id);
        try {
            await deleteBooking(id);
            if (onReload) onReload();
        } catch (err) {
            console.error('Lỗi xóa đơn đặt phòng:', err);
            alert(err.response?.data?.message || 'Không thể xóa đơn đặt phòng');
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
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <BookmarkIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Danh Sách Đơn Đặt Phòng</h2>
                        <p className="text-xs text-slate-400">Tổng cộng {bookings.length} đơn đặt phòng trong hệ thống</p>
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
                            className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Filter Status */}
                    <select
                        aria-label="Lọc theo trạng thái đơn"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950/70 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="CHECKED_IN">Đang lưu trú (In)</option>
                        <option value="CHECKED_OUT">Đã trả phòng (Out)</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                            <th className="py-4 px-4">Mã Đơn</th>
                            <th className="py-4 px-4">Khách Hàng</th>
                            <th className="py-4 px-4">Phòng</th>
                            <th className="py-4 px-4">Thời Gian Ở</th>
                            <th className="py-4 px-4">Tổng Tiền</th>
                            <th className="py-4 px-4">Trạng Thái</th>
                            <th className="py-4 px-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {loading && bookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs">Đang tải danh sách đặt phòng...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                    Không tìm thấy đơn đặt phòng nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((b) => {
                                const badge = STATUS_BADGES[b.bookingStatus] || STATUS_BADGES.CONFIRMED;
                                const isBusy = processingId === b.id;

                                return (
                                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                                        {/* Mã đơn */}
                                        <td className="py-4 px-4 font-mono font-semibold text-indigo-400">
                                            #{b.id}
                                        </td>

                                        {/* Khách hàng */}
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-slate-200">{b.customerName || `Khách #${b.customerId}`}</div>
                                            <div className="text-xs text-slate-400">{b.customerEmail}</div>
                                        </td>

                                        {/* Phòng */}
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-white">Phòng #{b.roomNumber}</div>
                                            <div className="text-xs text-slate-400">{b.roomType}</div>
                                        </td>

                                        {/* Thời gian ở */}
                                        <td className="py-4 px-4">
                                            <div className="text-xs text-slate-300">
                                                {b.checkInDate} <span className="text-slate-500">→</span> {b.checkOutDate}
                                            </div>
                                            <div className="text-[11px] text-blue-400 font-medium">
                                                {b.durationNights || 1} đêm
                                            </div>
                                        </td>

                                        {/* Tổng tiền */}
                                        <td className="py-4 px-4 font-bold text-emerald-400">
                                            {Number(b.totalPrice || 0).toLocaleString('vi-VN')} <span className="text-[11px] font-normal text-emerald-500">VNĐ</span>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                {badge.label}
                                            </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Nút Check-in */}
                                                {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING') && (
                                                    <button
                                                        onClick={() => handleStatusChange(b.id, 'CHECKED_IN')}
                                                        disabled={isBusy}
                                                        title="Khách nhận phòng (Check-in)"
                                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors border border-emerald-500/30 flex items-center gap-1"
                                                    >
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        <span>Check-in</span>
                                                    </button>
                                                )}

                                                {/* Nút Check-out */}
                                                {b.bookingStatus === 'CHECKED_IN' && (
                                                    <button
                                                        onClick={() => handleStatusChange(b.id, 'CHECKED_OUT')}
                                                        disabled={isBusy}
                                                        title="Khách trả phòng (Check-out)"
                                                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-colors border border-purple-500/30 flex items-center gap-1"
                                                    >
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        <span>Check-out</span>
                                                    </button>
                                                )}

                                                {/* Nút Hủy đơn */}
                                                {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CHECKED_OUT' && (
                                                    <button
                                                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                                                        disabled={isBusy}
                                                        title="Hủy đơn đặt phòng"
                                                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Nút Xóa đơn */}
                                                <button
                                                    onClick={() => handleDelete(b.id)}
                                                    disabled={isBusy}
                                                    title="Xóa đơn đặt phòng"
                                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
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
