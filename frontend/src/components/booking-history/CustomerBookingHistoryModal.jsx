import { useState, useEffect, useMemo } from 'react';
import { getCustomerBookingHistory } from '../../services/bookingService';
import { HistoryIcon, BookmarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import { Alert, Badge, Button, EmptyState, Modal, Pagination, Table } from '../ui';
import { usePagination } from '../../utils/usePagination.js';
import { BOOKING_STATUS, MEMBERSHIP, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

export default function CustomerBookingHistoryModal({ customer, guests = [], onSelectCustomer, onClose }) {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!customer?.id) return undefined;
        let isMounted = true;
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getCustomerBookingHistory(customer.id);
                if (isMounted) setHistory(res.data);
            } catch (err) {
                console.error('Lỗi khi tải lịch sử đặt phòng:', err);
                if (isMounted) setError(err.response?.data?.message || 'Không thể tải lịch sử đặt phòng của khách hàng này.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchHistory();
        return () => { isMounted = false; };
    }, [customer]);

    const pager = usePagination(history?.bookings || []);

    const guestOptions = useMemo(() => {
        return (guests || []).map(g => ({ value: String(g.id), label: `${g.fullName} (#${g.id})` }));
    }, [guests]);

    if (!customer) return null;

    const mem = MEMBERSHIP[history?.membership || customer.membership] || MEMBERSHIP.CUSTOMER;
    const stats = [
        { label: 'Tổng đơn', value: history?.totalBookings ?? 0 },
        { label: 'Đã chi tiêu', value: formatMoney(history?.totalSpent) },
        { label: 'Hoàn tất', value: history?.completedBookings ?? 0 },
        { label: 'Đang hiệu lực', value: history?.activeBookings ?? 0 },
        { label: 'Đã huỷ', value: history?.cancelledBookings ?? 0 }
    ];

    return (
        <Modal
            title={<span className="inline-flex items-center gap-2">Lịch sử đặt phòng · {customer.fullName} <Badge tone={mem.tone}>{mem.label}</Badge></span>}
            description={`Mã #${customer.id} · ${customer.email}${customer.dob ? ` · Sinh ngày ${customer.dob}` : ''}`}
            icon={HistoryIcon}
            onClose={onClose}
            size="xl"
            footer={<Button onClick={onClose}>Đóng</Button>}
        >
            <div className="flex flex-col gap-4">
                {guestOptions.length > 1 && onSelectCustomer && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span>Xem khách khác:</span>
                        <GlideSelect
                            options={guestOptions}
                            value={String(customer.id)}
                            onChange={(val) => {
                                const next = guests.find(g => String(g.id) === String(val));
                                if (next) onSelectCustomer(next);
                            }}
                            ariaLabel="Chọn khách hàng khác"
                            size="sm"
                            menuWidth={240}
                        />
                    </div>
                )}

                {error && <Alert>{error}</Alert>}

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
                    {stats.map(s => (
                        <div key={s.label} className="bg-surface px-3 py-2.5">
                            <p className="text-xs text-muted">{s.label}</p>
                            <p className="mt-0.5 font-semibold text-fg tabular">{loading ? '—' : s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-lg border border-line">
                    {loading ? (
                        <p className="px-4 py-10 text-center text-sm text-muted">Đang tải lịch sử...</p>
                    ) : !history?.bookings?.length ? (
                        <EmptyState icon={BookmarkIcon} title="Khách hàng chưa có đơn đặt phòng nào" />
                    ) : (
                        <Table head={['Mã', 'Phòng', 'Thời gian lưu trú', 'Số đêm', { label: 'Tổng tiền', className: 'text-right' }, 'Trạng thái']}>
                            {pager.pageItems.map((b) => {
                                const status = BOOKING_STATUS[b.bookingStatus] || { label: b.bookingStatus, tone: 'gray' };
                                const type = ROOM_TYPE[b.roomType];
                                return (
                                    <tr key={b.id}>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-muted tabular">#{b.id}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5">
                                            <span className="mr-2 font-medium text-fg tabular">{b.roomNumber}</span>
                                            <Badge tone={type?.tone}>{type?.label || b.roomType}</Badge>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-fg tabular">{b.checkInDate} → {b.checkOutDate}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-muted tabular">{b.durationNights || 1}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-fg tabular">{formatMoney(b.grandTotal ?? b.totalPrice)}</td>
                                        <td className="px-4 py-2.5"><Badge tone={status.tone} dot>{status.label}</Badge></td>
                                    </tr>
                                );
                            })}
                        </Table>
                    )}
                    {!loading && <Pagination {...pager} />}
                </div>
            </div>
        </Modal>
    );
}
