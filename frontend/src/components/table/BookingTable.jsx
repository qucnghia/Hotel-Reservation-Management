import { useState } from 'react';
import { updateBookingStatus } from '../../services/bookingService.js';
import { BookmarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import BookingDetailModal from '../booking-detail/BookingDetailModal.jsx';
import { Badge, Button, Card, EmptyState, Pagination, SearchInput, Table } from '../ui';
import { usePagination } from '../../utils/usePagination.js';
import { useToast } from '../../utils/toast.js';
import { BOOKING_STATUS, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

const STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    ...['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(value => ({ value, label: BOOKING_STATUS[value].label }))
];

// Luồng 1 chiều: Đã xác nhận -> Đang lưu trú -> Đã trả phòng
const NEXT_ACTION = {
    CONFIRMED: { status: 'CHECKED_IN', label: 'Nhận phòng' },
    CHECKED_IN: { status: 'CHECKED_OUT', label: 'Trả phòng' }
};

export default function BookingTable({ bookings = [], loading = false, onReload }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState(null);
    const toast = useToast();
    const [detailId, setDetailId] = useState(null);
    const detailBooking = bookings.find(b => b.id === detailId);

    const handleStatusChange = async (id, newStatus) => {
        if (newStatus === 'CANCELLED' && !window.confirm(`Huỷ đơn #${id}? Tiền cọc (nếu có) sẽ được hoàn lại.`)) return;
        setProcessingId(id);
        try {
            await updateBookingStatus(id, newStatus);
            toast.success(`Đơn #${id}: ${BOOKING_STATUS[newStatus].label.toLowerCase()}.`);
            if (onReload) onReload();
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái đơn:', err);
            toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn đặt phòng.');
        } finally {
            setProcessingId(null);
        }
    };

    const term = searchTerm.toLowerCase();
    const filteredBookings = bookings.filter((b) => {
        const matchesSearch =
            String(b.id).includes(searchTerm) ||
            String(b.roomNumber).includes(searchTerm) ||
            (b.customerName || '').toLowerCase().includes(term) ||
            (b.customerEmail || '').toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const pager = usePagination(filteredBookings);

    return (
        <Card>
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm tên khách, số phòng, mã đơn..."
                        className="w-full sm:max-w-xs"
                    />
                    <GlideSelect
                        options={STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        ariaLabel="Lọc theo trạng thái đơn"
                        menuWidth={200}
                    />
                </div>
                <p className="text-sm text-muted">
                    <span className="font-medium text-fg">{filteredBookings.length}</span> / {bookings.length} đơn
                </p>
            </div>

            {loading && bookings.length === 0 ? (
                <p className="px-4 py-14 text-center text-sm text-muted">Đang tải danh sách đặt phòng...</p>
            ) : filteredBookings.length === 0 ? (
                <EmptyState
                    icon={BookmarkIcon}
                    title="Không có đơn đặt phòng phù hợp"
                    description='Thử đổi bộ lọc, hoặc bấm "Tạo đơn" để đặt phòng mới.'
                />
            ) : (
                <Table head={['Mã', 'Khách hàng', 'Phòng', 'Thời gian ở', { label: 'Tổng tiền', className: 'text-right' }, 'Trạng thái', { label: '', className: 'w-px' }]}>
                    {pager.pageItems.map((b) => {
                        const status = BOOKING_STATUS[b.bookingStatus] || { label: b.bookingStatus, tone: 'gray' };
                        const type = ROOM_TYPE[b.roomType];
                        const next = NEXT_ACTION[b.bookingStatus];
                        const isBusy = processingId === b.id;

                        return (
                            <tr
                                key={b.id}
                                onClick={() => setDetailId(b.id)}
                                title="Bấm để xem chi tiết, thêm dịch vụ, thu tiền, in hoá đơn"
                                className="cursor-pointer transition-colors hover:bg-row-hover"
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-muted tabular">#{b.id}</td>
                                <td className="px-4 py-3">
                                    <p className="whitespace-nowrap font-medium text-fg">{b.customerName || `Khách #${b.customerId}`}</p>
                                    <p className="whitespace-nowrap text-xs text-muted">{b.customerEmail}</p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <span className="mr-2 font-medium text-fg tabular">{b.roomNumber}</span>
                                    <Badge tone={type?.tone}>{type?.label || b.roomType}</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <p className="text-fg tabular">{b.checkInDate} → {b.checkOutDate}</p>
                                    <p className="text-xs text-muted">{b.durationNights || 1} đêm</p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <p className="font-medium text-fg tabular">{formatMoney(b.grandTotal ?? b.totalPrice)}</p>
                                    {b.bookingStatus !== 'CANCELLED' && (
                                        <p className={`text-xs tabular ${b.balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted'}`}>
                                            {b.balanceDue > 0 ? `Còn nợ ${formatMoney(b.balanceDue)}` : 'Đã thanh toán'}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3"><Badge tone={status.tone} dot>{status.label}</Badge></td>
                                <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5">
                                        {next && (
                                            <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => handleStatusChange(b.id, next.status)}>
                                                {next.label}
                                            </Button>
                                        )}
                                        {b.bookingStatus === 'CONFIRMED' && (
                                            <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => handleStatusChange(b.id, 'CANCELLED')}>
                                                Huỷ
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            )}
            <Pagination {...pager} />

            {detailBooking && (
                <BookingDetailModal
                    booking={detailBooking}
                    onClose={() => setDetailId(null)}
                    onChanged={() => onReload?.()}
                />
            )}
        </Card>
    );
}
