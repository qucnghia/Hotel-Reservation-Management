import { useState, useMemo } from 'react';
import { createBooking } from '../services/bookingService';
import { PlusIcon, ExclamationTriangleIcon, BookmarkIcon, CurrencyDollarIcon } from './Icons';

export default function BookingForm({ guests = [], rooms = [], onSaved }) {
    const [formData, setFormData] = useState({
        customerId: '',
        roomNumber: '',
        checkInDate: '',
        checkOutDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    // Chuyển đổi YYYY-MM-DD sang dd/MM/yyyy
    const handleDatePicker = (field, e) => {
        const val = e.target.value; // YYYY-MM-DD
        if (val) {
            const [y, m, d] = val.split('-');
            setFormData(prev => ({ ...prev, [field]: `${d}/${m}/${y}` }));
        }
    };

    // Chuyển đổi dd/MM/yyyy sang YYYY-MM-DD cho input type="date"
    const toISODate = (str) => {
        if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return '';
        const [d, m, y] = str.split('/');
        return `${y}-${m}-${d}`;
    };

    // Tính toán ước tính số đêm và tổng tiền
    const priceCalculation = useMemo(() => {
        const selectedRoom = rooms.find(r => String(r.roomNumber) === String(formData.roomNumber));
        if (!selectedRoom || !formData.checkInDate || !formData.checkOutDate) return null;

        const checkInIso = toISODate(formData.checkInDate);
        const checkOutIso = toISODate(formData.checkOutDate);

        if (!checkInIso || !checkOutIso) return null;

        const d1 = new Date(checkInIso);
        const d2 = new Date(checkOutIso);

        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const nights = diffDays <= 0 ? 1 : diffDays;
        const total = nights * (selectedRoom.basePrice || 0);

        return {
            nights,
            basePrice: selectedRoom.basePrice || 0,
            total,
            isNegative: diffDays < 0
        };
    }, [formData, rooms]);

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
            setError('Ngày nhận phòng phải đúng định dạng dd/MM/yyyy!');
            return;
        }

        if (!dateRegex.test(formData.checkOutDate.trim())) {
            setError('Ngày trả phòng phải đúng định dạng dd/MM/yyyy!');
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

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <BookmarkIcon className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Tạo Đơn Đặt Phòng Mới</h2>
                    <p className="text-xs text-slate-400">Kết nối khách hàng và phòng lưu trú với thuật toán kiểm tra trùng lịch</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Chọn khách hàng */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Khách Hàng <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="">-- Chọn khách hàng --</option>
                            {guests.map(g => (
                                <option key={g.id} value={g.id}>
                                    #{g.id} - {g.fullName || g.FullName} ({g.email || g.Email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chọn phòng */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Phòng Lưu Trú <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="">-- Chọn phòng trống / sẵn sàng --</option>
                            {rooms.map(r => (
                                <option key={r.roomNumber} value={r.roomNumber}>
                                    Phòng #{r.roomNumber} [{r.roomType}] - {Number(r.basePrice).toLocaleString('vi-VN')} VNĐ/đêm ({r.roomStatus})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ngày nhận phòng */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Ngày Nhận Phòng (Check-in) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="checkInDate"
                                placeholder="dd/MM/yyyy (vd: 01/10/2026)"
                                value={formData.checkInDate}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                            />
                            <input
                                type="date"
                                aria-label="Chọn ngày nhận phòng"
                                value={toISODate(formData.checkInDate)}
                                onChange={(e) => handleDatePicker('checkInDate', e)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-0 text-slate-300 w-6 h-6"
                            />
                        </div>
                    </div>

                    {/* Ngày trả phòng */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Ngày Trả Phòng (Check-out) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="checkOutDate"
                                placeholder="dd/MM/yyyy (vd: 05/10/2026)"
                                value={formData.checkOutDate}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                            />
                            <input
                                type="date"
                                aria-label="Chọn ngày trả phòng"
                                value={toISODate(formData.checkOutDate)}
                                onChange={(e) => handleDatePicker('checkOutDate', e)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-0 text-slate-300 w-6 h-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Box Tính toán tổng tiền theo thời gian thực */}
                {priceCalculation && !priceCalculation.isNegative && (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <CurrencyDollarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Thời gian lưu trú ước tính</p>
                                <p className="text-sm font-semibold text-slate-200">
                                    <span className="text-blue-400 font-bold">{priceCalculation.nights}</span> đêm
                                    <span className="text-slate-500 mx-2">×</span>
                                    {priceCalculation.basePrice.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Tổng tiền tạm tính</p>
                            <p className="text-lg font-extrabold text-emerald-400">
                                {priceCalculation.total.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-emerald-500">VNĐ</span>
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Đang xử lý đơn đặt phòng...</span>
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
    );
}
