import { useState } from 'react';
import { createGuest, updateGuest } from '../services/customerService';
import { PlusIcon, PencilIcon, CalendarIcon, ExclamationTriangleIcon, XMarkIcon } from './Icons';

export default function CustomerForm({ editingCustomer, existingGuests = [], onSaved, onCancelEdit }) {
    const [formData, setFormData] = useState({
        fullName: editingCustomer?.fullName || editingCustomer?.FullName || '',
        dob: editingCustomer?.dob || editingCustomer?.DOB || '',
        email: editingCustomer?.email || editingCustomer?.Email || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    // Hỗ trợ chọn ngày từ input type="date" và tự chuyển thành dd/MM/yyyy
    const handleDatePickerChange = (e) => {
        const val = e.target.value; // YYYY-MM-DD
        if (val) {
            const [year, month, day] = val.split('-');
            setFormData(prev => ({ ...prev, dob: `${day}/${month}/${year}` }));
        }
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
                alert(`Cập nhật khách hàng #${editingCustomer.id} thành công!`);
            } else {
                // CREATE (POST)
                await createGuest(formData);
                alert('Thêm khách hàng mới thành công!');
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

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5 hover:border-slate-700/80 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        editingCustomer
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                        {editingCustomer ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                            {editingCustomer ? `Cập nhật Khách Hàng` : 'Thêm Khách Hàng Mới'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {editingCustomer ? `Mã định danh ID: #${editingCustomer.id}` : 'Điền thông tin bên dưới để tạo hồ sơ'}
                        </p>
                    </div>
                </div>
                {editingCustomer && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                        Đang sửa
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed shadow-sm">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Field: FullName */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-fullName" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
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
                    aria-required="true"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Field: DOB */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-dob" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Ngày sinh (dd/MM/yyyy)</span>
                    <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="flex gap-2">
                    <input
                        id="customer-dob"
                        type="text"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        placeholder="VD: 22/01/2006"
                        required
                        aria-required="true"
                        aria-describedby="dob-hint"
                        className="flex-1 min-w-0 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                    />
                    <label
                        htmlFor="customer-date-picker"
                        title="Mở bảng chọn lịch"
                        className="cursor-pointer flex items-center justify-center w-11 h-10.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all flex-shrink-0"
                    >
                        <CalendarIcon className="w-5 h-5 text-slate-300" />
                        <input
                            id="customer-date-picker"
                            type="date"
                            onChange={handleDatePickerChange}
                            className="sr-only"
                            aria-label="Chọn ngày sinh từ lịch"
                        />
                    </label>
                </div>
                <span id="dob-hint" className="text-[11px] text-slate-400">Định dạng chuẩn: ngày/tháng/năm (vd: 22/01/2006)</span>
            </div>

            {/* Field: Email */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
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
                    aria-required="true"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-slate-800/80">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            {editingCustomer ? <PencilIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                            <span>{editingCustomer ? 'Lưu Cập Nhật (PUT)' : 'Thêm Khách Hàng (POST)'}</span>
                        </>
                    )}
                </button>

                {editingCustomer && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium py-2 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Hủy Chỉnh Sửa</span>
                    </button>
                )}
            </div>
        </form>
    );
}