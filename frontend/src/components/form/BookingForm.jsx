import { useState, useMemo, useEffect } from 'react';
import { createBooking } from '../../services/bookingService.js';
import { getAvailableRooms } from '../../services/roomService.js';
import { BookmarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import CustomDatePicker from '../date-picker/CustomDatePicker.jsx';
import { Alert, Button, Field, Modal } from '../ui';
import { MEMBERSHIP, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

// dd/MM/yyyy -> YYYY-MM-DD để so sánh chuỗi theo thứ tự ngày
const toISODate = (str) => {
    if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return '';
    const [d, m, y] = str.split('/');
    return `${y}-${m}-${d}`;
};

const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function BookingForm({ guests = [], rooms = [], bookings = [], initialRoomNumber = '', initialCheckIn = '', onSaved, onClose }) {
    const [formData, setFormData] = useState({
        customerId: '',
        roomNumber: initialRoomNumber ? String(initialRoomNumber) : '',
        checkInDate: initialCheckIn,
        checkOutDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const today = todayIso();

    const update = (field) => (val) => {
        setFormData(prev => ({ ...prev, [field]: val }));
        if (error) setError(null);
    };

    // Ước tính số đêm, ưu đãi hội viên và tổng tiền phòng
    const priceCalculation = useMemo(() => {
        const room = rooms.find(r => String(r.roomNumber) === String(formData.roomNumber));
        const customer = guests.find(g => String(g.id) === String(formData.customerId));
        const inIso = toISODate(formData.checkInDate);
        const outIso = toISODate(formData.checkOutDate);
        if (!room || !inIso || !outIso) return null;

        const diffDays = Math.round((new Date(outIso) - new Date(inIso)) / (1000 * 60 * 60 * 24));
        const nights = diffDays <= 0 ? 1 : diffDays;
        const rawTotal = nights * (room.basePrice || 0);
        const mem = MEMBERSHIP[customer?.membership] || MEMBERSHIP.CUSTOMER;
        const discountAmount = Math.round((rawTotal * mem.discount) / 100);

        return {
            nights,
            basePrice: room.basePrice || 0,
            rawTotal,
            membership: mem,
            discountAmount,
            total: rawTotal - discountAmount,
            isNegative: diffDays < 0
        };
    }, [formData, rooms, guests]);

    // Khách đang có đơn hiệu lực không đặt thêm được
    const activeCustomerIds = useMemo(() => {
        const ids = new Set();
        bookings.forEach((b) => {
            if ((b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && b.customerId != null) {
                ids.add(Number(b.customerId));
            }
        });
        return ids;
    }, [bookings]);

    const customerOptions = useMemo(() => {
        return guests
            .filter((g) => !activeCustomerIds.has(Number(g.id)))
            .map((g) => ({
                value: String(g.id),
                label: `${g.fullName} (#${g.id})`,
                tag: (MEMBERSHIP[g.membership] || MEMBERSHIP.CUSTOMER).label
            }));
    }, [guests, activeCustomerIds]);

    // Lọc phòng theo khoảng ngày: hỏi backend phòng nào còn trống khi đã chọn đủ 2 ngày hợp lệ
    const dateKey = (() => {
        const inIso = toISODate(formData.checkInDate);
        const outIso = toISODate(formData.checkOutDate);
        return inIso && outIso && outIso >= inIso ? `${formData.checkInDate}|${formData.checkOutDate}` : '';
    })();
    const [availability, setAvailability] = useState({ key: '', roomNumbers: null });

    useEffect(() => {
        if (!dateKey) return undefined;
        let cancelled = false;
        const [checkIn, checkOut] = dateKey.split('|');
        getAvailableRooms(checkIn, checkOut)
            .then((res) => {
                if (!cancelled) setAvailability({ key: dateKey, roomNumbers: new Set(res.data.map((r) => Number(r.roomNumber))) });
            })
            .catch((err) => {
                console.error('Lỗi tải phòng trống:', err);
                if (!cancelled) setAvailability({ key: dateKey, roomNumbers: null });
            });
        return () => { cancelled = true; };
    }, [dateKey]);

    // null = chưa chọn ngày hoặc đang tải: tạm hiện mọi phòng không bảo trì
    const freeRoomNumbers = dateKey && availability.key === dateKey ? availability.roomNumbers : null;
    const isCheckingRooms = Boolean(dateKey) && availability.key !== dateKey;
    const selectedRoomTaken = Boolean(freeRoomNumbers && formData.roomNumber && !freeRoomNumbers.has(Number(formData.roomNumber)));

    const roomOptions = useMemo(() => {
        return rooms
            .filter((r) => r.roomStatus !== 'UNDER_MAINTENANCE' && (!freeRoomNumbers || freeRoomNumbers.has(Number(r.roomNumber))))
            .map((r) => ({
                value: String(r.roomNumber),
                label: `Phòng ${r.roomNumber} · ${ROOM_TYPE[r.roomType]?.label || r.roomType}`,
                tag: formatMoney(r.basePrice)
            }));
    }, [rooms, freeRoomNumbers]);

    const roomHint = selectedRoomTaken
        ? null
        : !dateKey
            ? 'Chọn ngày nhận và trả phòng để chỉ hiện phòng còn trống.'
            : isCheckingRooms
                ? 'Đang kiểm tra phòng trống...'
                : roomOptions.length === 0
                    ? 'Không còn phòng trống trong khoảng ngày này.'
                    : `${roomOptions.length} phòng còn trống trong khoảng ngày đã chọn.`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!toISODate(formData.checkInDate.trim()) || !toISODate(formData.checkOutDate.trim())) {
            setError('Vui lòng chọn ngày nhận và trả phòng theo định dạng dd/MM/yyyy.');
            return;
        }
        if (toISODate(formData.checkInDate) < today) {
            setError('Ngày nhận phòng không thể ở trong quá khứ.');
            return;
        }
        if (priceCalculation?.isNegative) {
            setError('Ngày trả phòng không thể trước ngày nhận phòng.');
            return;
        }
        if (!formData.customerId) {
            setError('Vui lòng chọn khách hàng.');
            return;
        }
        if (!formData.roomNumber) {
            setError('Vui lòng chọn phòng.');
            return;
        }
        if (selectedRoomTaken) {
            setError(`Phòng ${formData.roomNumber} đã có đơn trong khoảng ngày này. Vui lòng chọn phòng khác.`);
            return;
        }

        setLoading(true);
        try {
            await createBooking(formData);
            if (onSaved) onSaved();
        } catch (err) {
            console.error('Lỗi tạo đơn đặt phòng:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tạo đơn đặt phòng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo đơn đặt phòng"
            description="Chọn ngày trước để chỉ thấy phòng còn trống."
            icon={BookmarkIcon}
            onClose={onClose}
            size="lg"
            footer={
                <>
                    <Button onClick={onClose} disabled={loading}>Huỷ</Button>
                    <Button type="submit" form="booking-form" variant="primary" disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Xác nhận đặt phòng'}
                    </Button>
                </>
            }
        >
            <form id="booking-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <Alert>{error}</Alert>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Ngày nhận phòng" htmlFor="check-in-date" required>
                        <CustomDatePicker
                            id="check-in-date"
                            name="checkInDate"
                            title="Chọn ngày nhận phòng"
                            value={formData.checkInDate}
                            onChange={update('checkInDate')}
                            minDate={today}
                            placeholder="dd/MM/yyyy"
                            required
                            presetsType="booking"
                        />
                    </Field>
                    <Field label="Ngày trả phòng" htmlFor="check-out-date" required>
                        <CustomDatePicker
                            id="check-out-date"
                            name="checkOutDate"
                            title="Chọn ngày trả phòng"
                            value={formData.checkOutDate}
                            onChange={update('checkOutDate')}
                            minDate={formData.checkInDate || today}
                            placeholder="dd/MM/yyyy"
                            required
                            presetsType="booking"
                        />
                    </Field>

                    <Field
                        label="Khách hàng"
                        required
                        hint={customerOptions.length === 0 ? 'Mọi khách hàng đều đang có đơn hiệu lực.' : null}
                    >
                        <GlideSelect
                            options={customerOptions}
                            value={formData.customerId}
                            onChange={update('customerId')}
                            placeholder={customerOptions.length === 0 ? 'Không có khách khả dụng' : 'Chọn khách hàng'}
                            ariaLabel="Chọn khách hàng"
                            fullWidth
                        />
                    </Field>
                    <Field label="Phòng" required hint={roomHint}>
                        <GlideSelect
                            options={roomOptions}
                            value={formData.roomNumber}
                            onChange={update('roomNumber')}
                            placeholder={roomOptions.length === 0 ? 'Không còn phòng trống' : 'Chọn phòng'}
                            ariaLabel="Chọn phòng lưu trú"
                            fullWidth
                        />
                        {selectedRoomTaken && (
                            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                Phòng {formData.roomNumber} đã có đơn trong khoảng ngày này, hãy chọn phòng khác.
                            </p>
                        )}
                    </Field>
                </div>

                {priceCalculation && !priceCalculation.isNegative && (
                    <div className="rounded-lg border border-line bg-subtle/50 px-4 py-3 text-sm">
                        <div className="flex justify-between py-1">
                            <span className="text-muted">{priceCalculation.nights} đêm × {formatMoney(priceCalculation.basePrice)}</span>
                            <span className="text-fg tabular">{formatMoney(priceCalculation.rawTotal)}</span>
                        </div>
                        {priceCalculation.discountAmount > 0 && (
                            <div className="flex justify-between py-1">
                                <span className="text-muted">Ưu đãi hạng {priceCalculation.membership.label} (−{priceCalculation.membership.discount}%)</span>
                                <span className="text-emerald-600 tabular dark:text-emerald-400">−{formatMoney(priceCalculation.discountAmount)}</span>
                            </div>
                        )}
                        <div className="mt-1 flex justify-between border-t border-line pt-2 font-semibold">
                            <span className="text-fg">Tiền phòng dự kiến</span>
                            <span className="text-fg tabular">{formatMoney(priceCalculation.total)}</span>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}
