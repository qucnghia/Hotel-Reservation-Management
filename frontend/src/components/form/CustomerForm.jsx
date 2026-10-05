import { useState, useEffect } from 'react';
import { createGuest, updateGuest } from '../../services/customerService.js';
import { PlusIcon, PencilIcon, ExclamationTriangleIcon, XMarkIcon, TrashIcon, HistoryIcon, StarIcon } from '../icons/Icons.jsx';
import CustomDatePicker from '../date-picker/CustomDatePicker.jsx';

const MEMBERSHIP_STYLES = {
    VIP: {
        badge: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50',
        label: 'VIP (-15%)'
    },
    PLUS: {
        badge: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/50',
        label: 'PLUS (-10%)'
    },
    ECONOMY: {
        badge: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50',
        label: 'ECONOMY (-5%)'
    },
    CUSTOMER: {
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        label: 'CUSTOMER'
    }
};

export default function CustomerForm({ editingCustomer, existingGuests = [], onSaved, onCancelEdit, onClose, onDelete, onViewHistory }) {
    const [formData, setFormData] = useState({
        fullName: editingCustomer?.fullName || editingCustomer?.FullName || '',
        dob: editingCustomer?.dob || editingCustomer?.DOB || '',
        email: editingCustomer?.email || editingCustomer?.Email || ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Kiểm tra định dạng ngày dd/MM/yyyy
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(formData.dob.trim())) {
            setError('Ngày sinh phải có định dạng dd/MM/yyyy (ví dụ: 22/01/2006)');
            return;
        }

        // 2. Kiểm tra trùng Email ngay tại Client trước khi gửi
        const emailInput = formData.email.trim().toLowerCase();
        if (!editingCustomer && existingGuests.some(g => (g.email || g.Email || '').toLowerCase() === emailInput)) {
            setError(`Email "${formData.email}" đã được đăng ký cho một khách hàng khác. Vui lòng nhập email khác!`);
            return;
        }

        setLoading(true);
        try {
            if (editingCustomer) {
                // UPDATE (PUT)
                await updateGuest(editingCustomer.id, formData);
                alert(`Cập nhật thông tin khách hàng #${editingCustomer.id} thành công!`);
            } else {
                // CREATE (POST)
                await createGuest(formData);
                alert('Tạo hồ sơ khách hàng mới thành công!');
            }
            setFormData({ fullName: '', dob: '', email: '' });
            onSaved();
        } catch (err) {
            console.error('Lỗi khi lưu khách hàng:', err);
            if (err.response) {
                const status = err.response.status;
                if (status === 400) {
                    setError('Dữ liệu không hợp lệ (400 Bad Request). Vui lòng kiểm tra lại ngày sinh (dd/MM/yyyy) hoặc email.');
                } else if (status === 500) {
                    setError(`Email "${formData.email}" đã tồn tại trong hệ thống. Vui lòng chọn một email khác!`);
                } else {
                    setError(err.response.data?.message || `Lỗi từ máy chủ (Mã: ${status})`);
                }
            } else {
                setError(err.message || 'Không thể kết nối đến máy chủ Backend!');
            }
        } finally {
            setLoading(false);
        }
    };

    const memKey = editingCustomer?.membership || 'CUSTOMER';
    const memStyle = MEMBERSHIP_STYLES[memKey] || MEMBERSHIP_STYLES.CUSTOMER;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                editingCustomer
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}>
                                {editingCustomer ? <PencilIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-white text-xl leading-tight">
                                        {editingCustomer ? 'Chỉnh Sửa Khách Hàng' : 'Tạo Hồ Sơ Khách Hàng'}
                                    </h3>
                                    {editingCustomer && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${memStyle.badge}`}>
                                            <StarIcon className="w-3 h-3 text-amber-400" />
                                            <span>{memStyle.label}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mt-1">
                                    {editingCustomer ? (
                                        <span>Khách hàng <strong className="text-white">#{editingCustomer.id}</strong> • {editingCustomer.fullName || editingCustomer.FullName}</span>
                                    ) : (
                                        'Điền thông tin bên dưới để tạo hồ sơ lưu trú'
                                    )}
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
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl flex items-start gap-2.5 leading-relaxed shadow-sm">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Thẻ thông tin nhanh & Nút xem lịch sử nếu đang sửa */}
                        {editingCustomer && (
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block">Chi tiêu tích lũy</span>
                                    <span className="text-lg font-black text-emerald-400 whitespace-nowrap inline-flex items-baseline gap-1">
                                        <span>{Number(editingCustomer.payedPrice || 0).toLocaleString('vi-VN')}</span>
                                        <span className="text-xs font-semibold text-emerald-500">đ</span>
                                    </span>
                                </div>
                                {onViewHistory && (
                                    <button
                                        type="button"
                                        onClick={() => onViewHistory(editingCustomer)}
                                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
                                    >
                                        <HistoryIcon className="w-4 h-4" />
                                        <span>Xem Lịch Sử Đặt Phòng</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Họ và tên */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="customer-fullName" className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Họ và tên</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <input
                                id="customer-fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="VD: Nguyễn Văn A"
                                required
                                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        {/* Ngày sinh */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="customer-dob" className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Ngày sinh (dd/MM/yyyy)</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <CustomDatePicker
                                id="customer-dob"
                                name="dob"
                                title="Chọn Ngày Sinh Khách Hàng"
                                value={formData.dob}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, dob: val }));
                                    if (error) setError(null);
                                }}
                                maxDate={new Date().toISOString().split('T')[0]}
                                placeholder="VD: 22/01/2006"
                                required
                                showPresets={true}
                                presetsType="birthday"
                            />
                            <span className="text-xs text-slate-400">Định dạng chuẩn: ngày/tháng/năm (vd: 22/01/2006)</span>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="customer-email" className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Địa chỉ Email</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <input
                                id="customer-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="VD: example@domain.com"
                                required
                                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
                        {editingCustomer && onDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete(editingCustomer.id, formData.fullName)}
                                disabled={loading}
                                className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                            >
                                <TrashIcon className="w-4 h-4 text-rose-400" />
                                <span>Xóa Khách Hàng</span>
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
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
                                    <span>Đang lưu...</span>
                                ) : (
                                    <span>{editingCustomer ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}