import { useEffect, useState } from 'react';
import { addBookingService, removeBookingService, addBookingPayment } from '../../services/bookingService.js';
import { getExtraServices } from '../../services/extraService.js';
import { PlusIcon, TrashIcon, PrinterIcon, ReceiptPercentIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import { useToast } from '../../utils/toast.js';
import { Alert, Badge, Button, Input, Modal } from '../ui';
import { BOOKING_STATUS, PAYMENT_METHOD, PAYMENT_TYPE, PRICING_MODE, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD).map(([value, label]) => ({ value, label }));

function Row({ label, value, strong, tone }) {
    const toneClass = { red: 'text-rose-600 dark:text-rose-400', green: 'text-emerald-600 dark:text-emerald-400' }[tone] || 'text-fg';
    return (
        <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'text-[15px] font-semibold' : ''}`}>
            <span className={strong ? 'text-fg' : 'text-muted'}>{label}</span>
            <span className={`tabular ${toneClass}`}>{value}</span>
        </div>
    );
}

export default function BookingDetailModal({ booking, onClose, onChanged }) {
    const [catalog, setCatalog] = useState([]);
    const [serviceId, setServiceId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const editable = booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'CHECKED_IN';

    // Danh mục dịch vụ lấy từ trang Dịch vụ (chỉ cần khi đơn còn thêm được dịch vụ)
    useEffect(() => {
        if (!editable) return undefined;
        let cancelled = false;
        getExtraServices()
            .then(res => { if (!cancelled) setCatalog(res.data || []); })
            .catch(() => { if (!cancelled) setError('Không tải được danh mục dịch vụ.'); });
        return () => { cancelled = true; };
    }, [editable]);

    const serviceOptions = catalog.map(s => ({
        value: String(s.id),
        label: s.name,
        tag: `${formatMoney(s.unitPrice)} / ${(PRICING_MODE[s.pricingMode] || PRICING_MODE.PER_ITEM).unit}`
    }));
    const selectedServiceId = serviceId || serviceOptions[0]?.value || '';
    const nights = booking.durationNights || 1;
    const roomRaw = Number(booking.basePrice || 0) * nights;
    const discount = Math.max(0, roomRaw - Number(booking.totalPrice || 0));
    const balance = Number(booking.balanceDue || 0);
    const status = BOOKING_STATUS[booking.bookingStatus] || { label: booking.bookingStatus, tone: 'gray' };
    const type = ROOM_TYPE[booking.roomType];

    // Gọi API rồi để bảng tải lại; đơn mới sẽ chảy vào lại qua prop booking
    const run = async (action, successMessage) => {
        setBusy(true);
        setError(null);
        try {
            await action();
            if (successMessage) toast.success(successMessage);
            await onChanged();
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể thực hiện thao tác, vui lòng thử lại.');
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleAddService = (e) => {
        e.preventDefault();
        if (!selectedServiceId) {
            setError('Chưa có dịch vụ nào trong danh mục. Hãy thêm ở trang Dịch vụ.');
            return;
        }
        run(() => addBookingService(booking.id, selectedServiceId, quantity), 'Đã thêm dịch vụ vào đơn.').then(ok => ok && setQuantity(1));
    };

    const handlePay = (e) => {
        e.preventDefault();
        const value = Number(amount || balance);
        if (!value || value <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ.');
            return;
        }
        run(() => addBookingPayment(booking.id, value, method), `Đã thu ${formatMoney(value)}.`).then(ok => ok && setAmount(''));
    };

    return (
        <Modal
            title={<span className="inline-flex items-center gap-2">Đơn #{booking.id} · {booking.customerName} <Badge tone={status.tone} dot>{status.label}</Badge></span>}
            description={`Phòng ${booking.roomNumber} (${type?.label || booking.roomType}) · ${booking.checkInDate} → ${booking.checkOutDate} · ${nights} đêm`}
            icon={ReceiptPercentIcon}
            onClose={onClose}
            size="lg"
            footer={
                <>
                    <Button icon={PrinterIcon} onClick={() => window.print()} className="mr-auto">In hoá đơn</Button>
                    <Button onClick={onClose}>Đóng</Button>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                {error && <Alert>{error}</Alert>}

                {/* === HOÁ ĐƠN (phần này được in) === */}
                <div className="invoice-print flex flex-col gap-5">
                    <div className="hidden print:block">
                        <h2 className="text-xl font-bold">HOÁ ĐƠN LƯU TRÚ</h2>
                        <p>Đơn #{booking.id} · Khách: {booking.customerName} ({booking.customerEmail})</p>
                        <p>Phòng {booking.roomNumber} ({type?.label || booking.roomType}) · {booking.checkInDate} → {booking.checkOutDate} ({nights} đêm)</p>
                    </div>

                    <div className="rounded-lg border border-line px-4 py-2 text-sm">
                        <Row label={`Tiền phòng (${nights} đêm × ${formatMoney(booking.basePrice)})`} value={formatMoney(roomRaw)} />
                        {discount > 0 && <Row label="Ưu đãi hội viên" value={`−${formatMoney(discount)}`} tone="green" />}
                        <Row label="Dịch vụ phát sinh" value={formatMoney(booking.serviceTotal)} />
                        <div className="my-1 border-t border-line" />
                        <Row label="Tổng cộng" value={formatMoney(booking.grandTotal)} strong />
                        <Row label="Đã thu" value={formatMoney(booking.paidAmount)} />
                        <Row label="Còn nợ" value={formatMoney(balance)} strong tone={balance > 0 ? 'red' : 'green'} />
                    </div>

                    <section>
                        <h3 className="mb-2 text-sm font-medium text-fg">Dịch vụ phát sinh</h3>
                        {booking.services?.length ? (
                            <div className="divide-y divide-line rounded-lg border border-line text-sm">
                                {booking.services.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 px-3 py-2">
                                        <span className="flex-1 text-fg">{s.serviceName}</span>
                                        <span className="text-muted tabular">{s.quantity} × {formatMoney(s.unitPrice)}</span>
                                        <span className="w-28 text-right font-medium text-fg tabular">{formatMoney(s.cost)}</span>
                                        {editable && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                icon={TrashIcon}
                                                disabled={busy}
                                                onClick={() => run(() => removeBookingService(booking.id, s.id))}
                                                aria-label={`Bớt dịch vụ ${s.serviceName}`}
                                                className="print:hidden"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted">Chưa có dịch vụ nào.</p>
                        )}
                    </section>

                    <section>
                        <h3 className="mb-2 text-sm font-medium text-fg">Thanh toán</h3>
                        {booking.payments?.length ? (
                            <div className="divide-y divide-line rounded-lg border border-line text-sm">
                                {booking.payments.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                                        <span className="w-32 text-muted tabular">{p.paidAt}</span>
                                        <span className="flex-1 text-fg">{PAYMENT_TYPE[p.type] || p.type}</span>
                                        <span className="text-muted">{PAYMENT_METHOD[p.method] || p.method}</span>
                                        <span className={`w-28 text-right font-medium tabular ${p.type === 'REFUND' ? 'text-rose-600 dark:text-rose-400' : 'text-fg'}`}>
                                            {p.type === 'REFUND' ? '−' : ''}{formatMoney(p.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted">Chưa thu khoản nào.</p>
                        )}
                    </section>
                </div>

                {/* === THAO TÁC (không in) === */}
                {editable && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:hidden">
                        <form onSubmit={handleAddService} className="flex flex-col gap-2.5 rounded-lg border border-line bg-subtle/50 p-3">
                            <p className="text-sm font-medium text-fg">Thêm dịch vụ</p>
                            <GlideSelect options={serviceOptions} value={selectedServiceId} onChange={setServiceId} placeholder="Chưa có dịch vụ" ariaLabel="Chọn dịch vụ" fullWidth />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    aria-label="Số lượng"
                                    className="w-20"
                                />
                                <Button type="submit" variant="primary" icon={PlusIcon} disabled={busy} className="flex-1 justify-center">Thêm</Button>
                            </div>
                        </form>

                        <form onSubmit={handlePay} className="flex flex-col gap-2.5 rounded-lg border border-line bg-subtle/50 p-3">
                            <p className="text-sm font-medium text-fg">{booking.bookingStatus === 'CONFIRMED' ? 'Thu tiền cọc' : 'Thu tiền'}</p>
                            <GlideSelect options={METHOD_OPTIONS} value={method} onChange={setMethod} ariaLabel="Phương thức thanh toán" fullWidth />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={balance > 0 ? `${balance} (thu đủ)` : 'Đã thanh toán đủ'}
                                    disabled={balance <= 0}
                                    aria-label="Số tiền"
                                />
                                <Button type="submit" variant="success" disabled={busy || balance <= 0}>Thu tiền</Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
}
