import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { addBookingService, removeBookingService, addBookingPayment } from '../../services/bookingService.js';
import { XMarkIcon, PlusIcon, TrashIcon, PrinterIcon, ExclamationTriangleIcon, ReceiptPercentIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';

// Khớp với enum ExtraServiceType ở backend (giá thật do backend chốt khi thêm)
const SERVICE_OPTIONS = [
    { value: 'MINIBAR', label: 'Minibar', tag: '50.000 đ / món' },
    { value: 'LAUNDRY', label: 'Giặt là', tag: '80.000 đ / lượt' },
    { value: 'BREAKFAST', label: 'Ăn sáng buffet', tag: '150.000 đ / người / đêm' },
    { value: 'AIRPORT_TRANSFER', label: 'Đưa đón sân bay', tag: '300.000 đ / lượt' }
];

const METHOD_OPTIONS = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'CARD', label: 'Thẻ' },
    { value: 'TRANSFER', label: 'Chuyển khoản' }
];
const METHOD_LABELS = Object.fromEntries(METHOD_OPTIONS.map(m => [m.value, m.label]));

const PAYMENT_TYPE_LABELS = { DEPOSIT: 'Tiền cọc', PAYMENT: 'Thanh toán', REFUND: 'Hoàn tiền' };

const STATUS_LABELS = {
    CONFIRMED: 'Đã xác nhận',
    CHECKED_IN: 'Đang lưu trú',
    CHECKED_OUT: 'Đã trả phòng',
    CANCELLED: 'Đã hủy'
};

const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;

const SELECT_STYLE = {
    size: 'md',
    fullWidth: true,
    surfaceColor: '#020617',
    highlightColor: '#1e293b',
    accentColor: '#818cf8',
    textColor: '#f8fafc',
    radius: 12
};

export default function BookingDetailModal({ booking, onClose, onChanged }) {
    const [serviceType, setServiceType] = useState('BREAKFAST');
    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const editable = booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'CHECKED_IN';
    const nights = booking.durationNights || 1;
    const roomRaw = Number(booking.basePrice || 0) * nights;
    const discount = Math.max(0, roomRaw - Number(booking.totalPrice || 0));
    const balance = Number(booking.balanceDue || 0);

    // Gọi API rồi để bảng tải lại; đơn mới sẽ chảy vào lại qua prop booking
    const run = async (action) => {
        setBusy(true);
        setError(null);
        try {
            await action();
            await onChanged();
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể thực hiện thao tác, vui lòng thử lại!');
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleAddService = (e) => {
        e.preventDefault();
        run(() => addBookingService(booking.id, serviceType, quantity)).then(ok => ok && setQuantity(1));
    };

    const handlePay = (e) => {
        e.preventDefault();
        const value = Number(amount || balance);
        if (!value || value <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        run(() => addBookingPayment(booking.id, value, method)).then(ok => ok && setAmount(''));
    };

    // Portal ra body: khung bảng có backdrop-blur nên 'fixed' bên trong sẽ bị giam trong khung
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <ReceiptPercentIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-tight">
                                Đơn #{booking.id} • {booking.customerName}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Phòng {booking.roomNumber} ({booking.roomType}) • {booking.checkInDate} → {booking.checkOutDate} • {STATUS_LABELS[booking.bookingStatus] || booking.bookingStatus}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                        aria-label="Đóng"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* === HOÁ ĐƠN (phần này được in) === */}
                    <div className="invoice-print space-y-5">
                        <div className="hidden print:block">
                            <h2 className="text-2xl font-bold">HOÁ ĐƠN LƯU TRÚ</h2>
                            <p>Đơn #{booking.id} • Khách: {booking.customerName} ({booking.customerEmail})</p>
                            <p>Phòng {booking.roomNumber} ({booking.roomType}) • {booking.checkInDate} → {booking.checkOutDate} ({nights} đêm)</p>
                        </div>

                        {/* Tóm tắt tiền */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5 text-sm">
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Tiền phòng ({nights} đêm × {money(booking.basePrice)})</span>
                                <span className="font-semibold text-slate-200">{money(roomRaw)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-400">Ưu đãi hội viên</span>
                                    <span className="font-semibold text-amber-400">-{money(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Dịch vụ phát sinh</span>
                                <span className="font-semibold text-slate-200">{money(booking.serviceTotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-1 border-t border-slate-800 text-base">
                                <span className="font-bold text-slate-900 dark:text-white">Tổng cộng</span>
                                <span className="font-black text-emerald-400">{money(booking.grandTotal)}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Đã thu</span>
                                <span className="font-semibold text-slate-200">{money(booking.paidAmount)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 text-base">
                                <span className="font-bold text-slate-900 dark:text-white">Còn nợ</span>
                                <span className={`font-black ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{money(balance)}</span>
                            </div>
                        </div>

                        {/* Dịch vụ */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Dịch vụ phát sinh</h4>
                            {booking.services?.length ? (
                                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                                    <table className="w-full text-sm whitespace-nowrap">
                                        <tbody className="divide-y divide-slate-800/70">
                                            {booking.services.map(s => (
                                                <tr key={s.id}>
                                                    <td className="px-3 py-2.5 font-semibold text-slate-200">{s.displayName}</td>
                                                    <td className="px-3 py-2.5 text-slate-400">× {s.quantity}</td>
                                                    <td className="px-3 py-2.5 text-slate-400">{money(s.unitPrice)}</td>
                                                    <td className="px-3 py-2.5 text-right font-bold text-slate-200">{money(s.cost)}</td>
                                                    {editable && (
                                                        <td className="px-2 py-2.5 w-10 print:hidden">
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => run(() => removeBookingService(booking.id, s.id))}
                                                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                                                                aria-label={`Bớt dịch vụ ${s.displayName}`}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Chưa có dịch vụ nào.</p>
                            )}
                        </div>

                        {/* Lịch sử thanh toán */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Thanh toán</h4>
                            {booking.payments?.length ? (
                                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                                    <table className="w-full text-sm whitespace-nowrap">
                                        <tbody className="divide-y divide-slate-800/70">
                                            {booking.payments.map(p => (
                                                <tr key={p.id}>
                                                    <td className="px-3 py-2.5 text-slate-400">{p.paidAt}</td>
                                                    <td className="px-3 py-2.5 font-semibold text-slate-200">{PAYMENT_TYPE_LABELS[p.type] || p.type}</td>
                                                    <td className="px-3 py-2.5 text-slate-400">{METHOD_LABELS[p.method] || p.method}</td>
                                                    <td className={`px-3 py-2.5 text-right font-bold ${p.type === 'REFUND' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {p.type === 'REFUND' ? '-' : ''}{money(p.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Chưa thu khoản nào.</p>
                            )}
                        </div>
                    </div>

                    {/* === THAO TÁC (không in) === */}
                    {editable && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
                            <form onSubmit={handleAddService} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Thêm dịch vụ</h4>
                                <GlideSelect options={SERVICE_OPTIONS} value={serviceType} onChange={setServiceType} ariaLabel="Chọn dịch vụ" {...SELECT_STYLE} />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        aria-label="Số lượng"
                                        className="w-24 bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Thêm</span>
                                    </button>
                                </div>
                            </form>

                            <form onSubmit={handlePay} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {booking.bookingStatus === 'CONFIRMED' ? 'Thu tiền cọc' : 'Thu tiền'}
                                </h4>
                                <GlideSelect options={METHOD_OPTIONS} value={method} onChange={setMethod} ariaLabel="Phương thức thanh toán" {...SELECT_STYLE} />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder={balance > 0 ? String(balance) : 'Đã đủ'}
                                        disabled={balance <= 0}
                                        aria-label="Số tiền"
                                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={busy || balance <= 0}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Thu tiền
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">Để trống số tiền để thu đủ số còn nợ.</p>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center gap-2 cursor-pointer"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        <span>In hoá đơn</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
