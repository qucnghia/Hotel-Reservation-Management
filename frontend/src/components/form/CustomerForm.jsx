import { useState } from 'react';
import { createGuest, updateGuest } from '../../services/customerService.js';
import { PlusIcon, PencilIcon, TrashIcon, HistoryIcon } from '../icons/Icons.jsx';
import CustomDatePicker from '../date-picker/CustomDatePicker.jsx';
import { Alert, Badge, Button, Field, Input, Modal } from '../ui';
import { MEMBERSHIP, formatMoney } from '../../utils/labels.js';

export default function CustomerForm({ editingCustomer, existingGuests = [], onSaved, onClose, onDelete, onViewHistory }) {
    const [formData, setFormData] = useState({
        fullName: editingCustomer?.fullName || '',
        dob: editingCustomer?.dob || '',
        email: editingCustomer?.email || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob.trim())) {
            setError('Ngày sinh phải có định dạng dd/MM/yyyy (ví dụ: 22/01/2006).');
            return;
        }

        // Kiểm tra trùng email ngay trên giao diện trước khi gửi
        const emailInput = formData.email.trim().toLowerCase();
        if (!editingCustomer && existingGuests.some(g => (g.email || '').toLowerCase() === emailInput)) {
            setError(`Email "${formData.email}" đã được dùng cho khách hàng khác.`);
            return;
        }

        setLoading(true);
        try {
            if (editingCustomer) {
                await updateGuest(editingCustomer.id, formData);
            } else {
                await createGuest(formData);
            }
            onSaved();
        } catch (err) {
            console.error('Lỗi khi lưu khách hàng:', err);
            setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const mem = MEMBERSHIP[editingCustomer?.membership] || MEMBERSHIP.CUSTOMER;

    return (
        <Modal
            title={editingCustomer ? `Sửa khách hàng #${editingCustomer.id}` : 'Thêm khách hàng'}
            description={editingCustomer ? editingCustomer.fullName : 'Tạo hồ sơ lưu trú mới.'}
            icon={editingCustomer ? PencilIcon : PlusIcon}
            onClose={onClose}
            footer={
                <>
                    {editingCustomer && onDelete && (
                        <Button variant="danger" icon={TrashIcon} className="mr-auto" disabled={loading} onClick={() => onDelete(editingCustomer.id, formData.fullName)}>
                            Xoá
                        </Button>
                    )}
                    <Button onClick={onClose} disabled={loading}>Huỷ</Button>
                    <Button type="submit" form="customer-form" variant="primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : editingCustomer ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
                    </Button>
                </>
            }
        >
            <form id="customer-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <Alert>{error}</Alert>}

                {editingCustomer && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-subtle/50 px-3.5 py-3">
                        <div>
                            <p className="text-xs text-muted">Chi tiêu tích luỹ</p>
                            <p className="mt-0.5 flex items-center gap-2 font-semibold text-fg tabular">
                                {formatMoney(editingCustomer.paidPrice)}
                                <Badge tone={mem.tone}>{mem.label}</Badge>
                            </p>
                        </div>
                        {onViewHistory && (
                            <Button size="sm" icon={HistoryIcon} onClick={() => onViewHistory(editingCustomer)}>
                                Lịch sử đặt phòng
                            </Button>
                        )}
                    </div>
                )}

                <Field label="Họ và tên" htmlFor="customer-fullName" required>
                    <Input
                        id="customer-fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        required
                        autoFocus
                    />
                </Field>

                <Field label="Ngày sinh" htmlFor="customer-dob" required>
                    <CustomDatePicker
                        id="customer-dob"
                        name="dob"
                        title="Chọn ngày sinh"
                        value={formData.dob}
                        onChange={(val) => {
                            setFormData(prev => ({ ...prev, dob: val }));
                            if (error) setError(null);
                        }}
                        maxDate={new Date().toISOString().split('T')[0]}
                        placeholder="dd/MM/yyyy"
                        required
                        presetsType="birthday"
                    />
                </Field>

                <Field label="Email" htmlFor="customer-email" required>
                    <Input
                        id="customer-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ten@example.com"
                        required
                    />
                </Field>
            </form>
        </Modal>
    );
}
