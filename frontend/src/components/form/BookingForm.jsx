import { useState, useMemo, useEffect } from 'react';
import { createBooking } from '../../services/bookingService.js';
import { PlusIcon, ExclamationTriangleIcon, BookmarkIcon, CurrencyDollarIcon, XMarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import CustomDatePicker from '../date-picker/CustomDatePicker.jsx';

export default function BookingForm({ guests = [], rooms = [], bookings = [], initialRoomNumber = '', onSaved, onClose }) {
    const [formData, setFormData] = useState({
        customerId: '',
        roomNumber: initialRoomNumber ? String(initialRoomNumber) : '',
        checkInDate: '',
        checkOutDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bắt sự kiện phím Escape để đóng modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    // Chuyển đổi dd/MM/yyyy sang YYYY-MM-DD cho input type="date"
    const toISODate = (str) => {
        if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return '';
        const [d, m, y] = str.split('/');
        return `${y}-${m}-${d}`;
    };

    // Lấy ngày hôm nay định dạng YYYY-MM-DD
    const todayIso = useMemo(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }, []);

    // Tính toán ước tính số đêm, chiết khấu hạng hội viên và tổng tiền
    const priceCalculation = useMemo(() => {
        const selectedRoom = rooms.find(r => String(r.roomNumber) === String(formData.roomNumber));
        const selectedCustomer = guests.find(g => String(g.id) === String(formData.customerId));
        if (!selectedRoom || !formData.checkInDate || !formData.checkOutDate) return null;

        const checkInIso = toISODate(formData.checkInDate);
        const checkOutIso = toISODate(formData.checkOutDate);

        if (!checkInIso || !checkOutIso) return null;

        const d1 = new Date(checkInIso);
        const d2 = new Date(checkOutIso);

        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const nights = diffDays <= 0 ? 1 : diffDays;
        const rawTotal = nights * (selectedRoom.basePrice || 0);

        // Chiết khấu theo hạng hội viên backend: VIP (15%), PLUS (10%), ECONOMY (5%)
        const mem = selectedCustomer?.membership || 'CUSTOMER';
        let discountPercent = 0;
        if (mem === 'VIP') discountPercent = 15;
        else if (mem === 'PLUS') discountPercent = 10;
        else if (mem === 'ECONOMY') discountPercent = 5;

        const discountAmount = Math.round((rawTotal * discountPercent) / 100);
        const finalTotal = rawTotal - discountAmount;

        return {
            nights,
            basePrice: selectedRoom.basePrice || 0,
            rawTotal,
            membership: mem,
            discountPercent,
            discountAmount,
            total: finalTotal,
            isNegative: diffDays < 0
        };
    }, [formData, rooms, guests]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.customerId) {
            setError('Vui lòng chọn khách hàng!');
            return;
        }

        if (!formData.roomNumber) {
            setError('Vui lòng chọn số phòng!');
            return;
        }

        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(formData.checkInDate.trim())) {
            setError('Ngày nhận phòng phải đúng định dạng dd/MM/yyyy (ví dụ: 01/10/2026)!');
            return;
        }

        if (!dateRegex.test(formData.checkOutDate.trim())) {
            setError('Ngày trả phòng phải đúng định dạng dd/MM/yyyy (ví dụ: 05/10/2026)!');
            return;
        }

        const checkInIso = toISODate(formData.checkInDate);
        if (checkInIso && checkInIso < todayIso) {
            setError('Ngày nhận phòng (Check-in) không thể ở trong quá khứ!');
            return;
        }

        if (priceCalculation && priceCalculation.isNegative) {
            setError('Ngày trả phòng (Check-out) không thể diễn ra trước ngày nhận phòng (Check-in)!');
            return;
        }

        setLoading(true);
        try {
            await createBooking(formData);
            alert('🎉 Đặt phòng thành công!');
            setFormData({
                customerId: '',
                roomNumber: '',
                checkInDate: '',
                checkOutDate: ''
            });
            if (onSaved) onSaved();
        } catch (err) {
            console.error('Lỗi tạo đơn đặt phòng:', err);
            const msg = err.response?.data?.message || err.message || 'Không thể tạo đơn đặt phòng. Vui lòng thử lại!';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // 1. Lọc khách hàng: Khách hàng đang lưu trú (CHECKED_IN) hoặc đã xác nhận (CONFIRMED) sẽ không có trong danh sách chọn
    const activeCustomerIds = useMemo(() => {
        const ids = new Set();
        bookings.forEach((b) => {
            const status = b.bookingStatus;
            if (status === 'CONFIRMED' || status === 'CHECKED_IN') {
                if (b.customerId != null) {
                    ids.add(Number(b.customerId));
                }
            }
        });
        return ids;
    }, [bookings]);

    const availableGuests = useMemo(() => {
        return guests.filter((g) => !activeCustomerIds.has(Number(g.id)));
    }, [guests, activeCustomerIds]);

    const customerOptions = useMemo(() => {
        return availableGuests.map((g) => ({
            value: String(g.id),
            label: `#${g.id} - ${g.fullName || g.FullName}`,
            tag: g.membership || 'CUSTOMER'
        }));
    }, [availableGuests]);

    // 2. Lọc phòng: Phòng đã có người đặt (CONFIRMED), đang có khách (CHECKED_IN/OCCUPIED) hoặc đang bảo trì sẽ không có trong danh sách chọn
    const occupiedOrBookedRoomNumbers = useMemo(() => {
        const nums = new Set();
        bookings.forEach((b) => {
            const status = b.bookingStatus;
            if (status === 'CONFIRMED' || status === 'CHECKED_IN') {
                if (b.roomNumber != null) {
                    nums.add(Number(b.roomNumber));
                }
            }
        });
        return nums;
    }, [bookings]);

    const availableRooms = useMemo(() => {
        return rooms.filter((r) => {
            const isStatusAvailable = r.roomStatus === 'AVAILABLE';
            const isNotBooked = !occupiedOrBookedRoomNumbers.has(Number(r.roomNumber));
            return isStatusAvailable && isNotBooked;
        });
    }, [rooms, occupiedOrBookedRoomNumbers]);

    const roomOptions = useMemo(() => {
        return availableRooms.map((r) => ({
            value: String(r.roomNumber),
            label: `Phòng #${r.roomNumber} - ${r.roomType}`,
            tag: `${Number(r.basePrice || 0).toLocaleString('vi-VN')} ₫`
        }));
    }, [availableRooms]);

    // Tự động bỏ chọn nếu khách hàng hoặc phòng không còn khả dụng
    useEffect(() => {
        if (formData.customerId && activeCustomerIds.has(Number(formData.customerId))) {
            setFormData(prev => ({ ...prev, customerId: '' }));
        }
    }, [activeCustomerIds, formData.customerId]);

    useEffect(() => {
        if (formData.roomNumber && occupiedOrBookedRoomNumbers.has(Number(formData.roomNumber))) {
            setFormData(prev => ({ ...prev, roomNumber: '' }));
        }
    }, [occupiedOrBookedRoomNumbers, formData.roomNumber]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <BookmarkIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl leading-tight">
                                    Tạo Đơn Đặt Phòng Mới
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Kết nối khách hàng và phòng lưu trú với thuật toán kiểm tra trùng lịch
                                </p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                title="Đóng cửa sổ (hoặc ấn ra ngoài)"
                                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">
                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Chọn khách hàng */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-2">
                                    Khách Hàng <span className="text-rose-400">*</span>
                                </label>
                                <GlideSelect
                                    options={customerOptions}
                                    value={formData.customerId}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, customerId: val }));
                                        if (error) setError(null);
                                    }}
                                    placeholder={customerOptions.length === 0 ? "-- Tất cả khách đang có phòng --" : "-- Chọn khách hàng --"}
                                    ariaLabel="Chọn khách hàng"
                                    size="md"
                                    fullWidth
                                    surfaceColor="#020617"
                                    highlightColor="#1e293b"
                                    accentColor="#38bdf8"
                                    textColor="#f8fafc"
                                    radius={12}
                                />
                                {customerOptions.length === 0 && (
                                    <p className="text-xs text-amber-400/90 mt-1.5">
                                        * Tất cả khách hàng hiện tại đều đang lưu trú hoặc đã đặt phòng.
                                    </p>
                                )}
                            </div>

                            {/* Chọn phòng */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-2">
                                    Số Phòng <span className="text-rose-400">*</span>
                                </label>
                                <GlideSelect
                                    options={roomOptions}
                                    value={formData.roomNumber}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, roomNumber: val }));
                                        if (error) setError(null);
                                    }}
                                    placeholder={roomOptions.length === 0 ? "-- Hết phòng trống khả dụng --" : "-- Chọn phòng lưu trú --"}
                                    ariaLabel="Chọn phòng lưu trú"
                                    size="md"
                                    fullWidth
                                    surfaceColor="#020617"
                                    highlightColor="#1e293b"
                                    accentColor="#818cf8"
                                    textColor="#f8fafc"
                                    radius={12}
                                />
                                {roomOptions.length === 0 && (
                                    <p className="text-xs text-amber-400/90 mt-1.5">
                                        * Tất cả các phòng hiện đã có khách đặt hoặc đang lưu trú.
                                    </p>
                                )}
                            </div>

                            {/* Ngày nhận phòng */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-2">
                                    Ngày Nhận Phòng (Check-in) <span className="text-rose-400">*</span>
                                </label>
                                <CustomDatePicker
                                    id="check-in-date"
                                    name="checkInDate"
                                    title="Chọn Ngày Nhận Phòng (Check-in)"
                                    value={formData.checkInDate}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, checkInDate: val }));
                                        if (error) setError(null);
                                    }}
                                    minDate={todayIso}
                                    placeholder="dd/MM/yyyy"
                                    required
                                    showPresets={true}
                                    presetsType="booking"
                                />
                                <span className="text-xs text-slate-400 mt-1 block">Định dạng: ngày/tháng/năm (vd: 15/10/2026)</span>
                            </div>

                            {/* Ngày trả phòng */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-2">
                                    Ngày Trả Phòng (Check-out) <span className="text-rose-400">*</span>
                                </label>
                                <CustomDatePicker
                                    id="check-out-date"
                                    name="checkOutDate"
                                    title="Chọn Ngày Trả Phòng (Check-out)"
                                    value={formData.checkOutDate}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, checkOutDate: val }));
                                        if (error) setError(null);
                                    }}
                                    minDate={formData.checkInDate || todayIso}
                                    placeholder="dd/MM/yyyy"
                                    required
                                    showPresets={true}
                                    presetsType="booking"
                                />
                                <span className="text-xs text-slate-400 mt-1 block">Định dạng: ngày/tháng/năm (vd: 18/10/2026)</span>
                            </div>
                        </div>

                        {/* Box Tính toán tổng tiền theo thời gian thực */}
                        {priceCalculation && !priceCalculation.isNegative && (
                            <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <CurrencyDollarIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Thời gian lưu trú ước tính</p>
                                        <p className="text-base font-bold text-slate-100 mt-0.5 whitespace-nowrap">
                                            <span className="text-blue-400 font-black">{priceCalculation.nights}</span> đêm
                                            <span className="text-slate-500 mx-2">×</span>
                                            {priceCalculation.basePrice.toLocaleString('vi-VN')} đ
                                        </p>
                                        {priceCalculation.discountPercent > 0 && (
                                            <p className="text-xs sm:text-sm text-amber-400 font-bold mt-1 whitespace-nowrap">
                                                Ưu đãi hạng {priceCalculation.membership} (-{priceCalculation.discountPercent}%): -{priceCalculation.discountAmount.toLocaleString('vi-VN')} đ
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Tổng tiền thanh toán</p>
                                    <p className="text-2xl font-black text-emerald-400 mt-0.5 whitespace-nowrap inline-flex items-baseline justify-end gap-1">
                                        <span>{priceCalculation.total.toLocaleString('vi-VN')}</span>
                                        <span className="text-xs font-semibold text-emerald-500">đ</span>
                                    </p>
                                    {priceCalculation.discountPercent > 0 && (
                                        <p className="text-xs text-slate-400 line-through mt-0.5 whitespace-nowrap">
                                            Gốc: {priceCalculation.rawTotal.toLocaleString('vi-VN')} đ
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all cursor-pointer"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Xác Nhận Đặt Phòng</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
