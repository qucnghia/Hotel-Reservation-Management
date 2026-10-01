import { useState, useEffect, useMemo } from 'react';
import { getCustomerBookingHistory } from '../services/bookingService';
import { XMarkIcon, HistoryIcon, StarIcon, BookmarkIcon } from './Icons';
import GlideSelect from './glide-select';

const MEMBERSHIP_CONFIG = {
    VIP: {
        label: 'VIP',
        discount: 'Giảm 15%',
        badgeClass: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20',
        textColor: 'text-amber-400'
    },
    PLUS: {
        label: 'PLUS',
        discount: 'Giảm 10%',
        badgeClass: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/50 shadow-indigo-500/20',
        textColor: 'text-indigo-400'
    },
    ECONOMY: {
        label: 'ECONOMY',
        discount: 'Giảm 5%',
        badgeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20',
        textColor: 'text-emerald-400'
    },
    CUSTOMER: {
        label: 'CUSTOMER',
        discount: 'Tiêu chuẩn',
        badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
        textColor: 'text-slate-400'
    }
};

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
        label: 'Đang ở'
    },
    CHECKED_OUT: {
        bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400',
        label: 'Đã trả phòng'
    },
    CANCELLED: {
        bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Đã hủy'
    }
};

export default function CustomerBookingHistoryModal({ customer, guests = [], onSelectCustomer, onClose }) {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!customer?.id) return;

        let isMounted = true;
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getCustomerBookingHistory(customer.id);
                if (isMounted) {
                    setHistory(res.data);
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử đặt phòng:', err);
                if (isMounted) {
                    setError(err.response?.data?.message || 'Không thể tải lịch sử đặt phòng của khách hàng này.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchHistory();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            isMounted = false;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [customer, onClose]);

    const guestOptions = useMemo(() => {
        return (guests || []).map(g => ({
            value: String(g.id),
            label: `#${g.id} - ${g.fullName || g.FullName}`,
            tag: g.membership || 'CUSTOMER'
        }));
    }, [guests]);

    if (!customer) return null;

    const memConfig = MEMBERSHIP_CONFIG[history?.membership || customer.membership] || MEMBERSHIP_CONFIG.CUSTOMER;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            {/* Modal Container */}
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <HistoryIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    Lịch Sử Đặt Phòng: {history?.customerName || customer.fullName || customer.FullName}
                                </h2>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border shadow-sm ${memConfig.badgeClass}`}>
                                    <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Hạng {memConfig.label} ({memConfig.discount})</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm text-slate-400">
                                <span>Mã khách: <strong className="text-slate-200">#{customer.id}</strong></span>
                                <span>•</span>
                                <span>Email: <strong className="text-slate-200">{history?.email || customer.email || customer.Email}</strong></span>
                                <span>•</span>
                                <span>Ngày sinh: <strong className="text-slate-200">{history?.dob || customer.dob || customer.DOB}</strong></span>
                                {guests && guests.length > 1 && onSelectCustomer && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-slate-400 font-medium">Đổi khách:</span>
                                            <GlideSelect
                                                options={guestOptions}
                                                value={String(customer.id)}
                                                onChange={(val) => {
                                                    const nextGuest = guests.find(g => String(g.id) === String(val));
                                                    if (nextGuest) onSelectCustomer(nextGuest);
                                                }}
                                                size="sm"
                                                menuWidth={240}
                                                surfaceColor="#0f172a"
                                                highlightColor="#1e293b"
                                                accentColor="#38bdf8"
                                                textColor="#f8fafc"
                                                radius={10}
                                                ariaLabel="Đổi khách hàng xem lịch sử"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                        aria-label="Đóng cửa sổ"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Đang tải lịch sử đặt phòng...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary KPI Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tổng Đơn</p>
                                    <p className="text-2xl font-black text-white mt-1">{history.totalBookings || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center col-span-2 sm:col-span-1 flex flex-col justify-center">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tổng Chi Tiêu</p>
                                    <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 whitespace-nowrap inline-flex items-baseline justify-center gap-1">
                                        <span>{Number(history.totalSpent || 0).toLocaleString('vi-VN')}</span>
                                        <span className="text-xs font-semibold">đ</span>
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Hoàn Tất</p>
                                    <p className="text-2xl font-black text-purple-400 mt-1">{history.completedBookings || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Đang Ở</p>
                                    <p className="text-2xl font-black text-blue-400 mt-1">{history.activeBookings || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Đã Hủy</p>
                                    <p className="text-2xl font-black text-rose-400 mt-1">{history.cancelledBookings || 0}</p>
                                </div>
                            </div>

                            {/* Bookings Table */}
                            <div className="space-y-3">
                                <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <BookmarkIcon className="w-5 h-5 text-indigo-400" />
                                    <span>Danh sách các lần đặt phòng ({history.bookings?.length || 0})</span>
                                </h3>

                                <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                                    <table className="w-full text-left text-base text-slate-200">
                                        <thead className="bg-slate-950/80 text-sm uppercase tracking-wider text-slate-300 border-b border-slate-800 font-bold">
                                            <tr>
                                                <th scope="col" className="px-4 py-3.5">Mã đơn</th>
                                                <th scope="col" className="px-4 py-3.5">Phòng</th>
                                                <th scope="col" className="px-4 py-3.5">Thời gian lưu trú</th>
                                                <th scope="col" className="px-4 py-3.5">Số đêm</th>
                                                <th scope="col" className="px-4 py-3.5">Tổng tiền</th>
                                                <th scope="col" className="px-4 py-3.5 text-center">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {history.bookings && history.bookings.length > 0 ? (
                                                history.bookings.map((b) => {
                                                    const badge = STATUS_BADGES[b.bookingStatus] || STATUS_BADGES.CONFIRMED;
                                                    return (
                                                        <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="px-4 py-3.5 font-bold text-base text-indigo-400 whitespace-nowrap">
                                                                #{b.id}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="font-bold text-white">Phòng {b.roomNumber}</span>
                                                                <span className="text-xs font-semibold text-slate-300 ml-2 px-2 py-0.5 rounded bg-slate-800">[{b.roomType}]</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-sm font-medium text-slate-200 whitespace-nowrap">
                                                                {b.checkInDate} <span className="text-slate-500">→</span> {b.checkOutDate}
                                                            </td>
                                                            <td className="px-4 py-3.5 font-bold text-sm text-blue-400 whitespace-nowrap">
                                                                {b.durationNights || 1} đêm
                                                            </td>
                                                            <td className="px-4 py-3.5 font-bold text-base text-emerald-400 whitespace-nowrap">
                                                                <span className="inline-flex items-baseline gap-1">
                                                                    <span>{Number(b.totalPrice || 0).toLocaleString('vi-VN')}</span>
                                                                    <span className="text-xs font-semibold">đ</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                                    {badge.label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">
                                                        Khách hàng này chưa có đơn đặt phòng nào trong hệ thống.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
