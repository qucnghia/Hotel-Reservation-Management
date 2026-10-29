import { useState } from 'react';
import { createExtraService, updateExtraService } from '../../services/extraService.js';
import { PlusIcon, PencilIcon, TrashIcon } from '../icons/Icons.jsx';
import { Alert, Button, Field, Input, Modal } from '../ui';
import { PRICING_MODE } from '../../utils/labels.js';

export default function ServiceForm({ editingService, onSaved, onClose, onDelete }) {
    const [formData, setFormData] = useState({
        name: editingService?.name || '',
        unitPrice: editingService?.unitPrice ?? '',
        pricingMode: editingService?.pricingMode || 'PER_ITEM'
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
        if (!formData.name.trim()) {
            setError('Vui lòng nhập tên dịch vụ.');
            return;
        }
        if (!Number(formData.unitPrice) || Number(formData.unitPrice) <= 0) {
            setError('Đơn giá phải lớn hơn 0.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (editingService) {
                await updateExtraService(editingService.id, formData);
            } else {
                await createExtraService(formData);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể lưu dịch vụ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingService ? `Sửa dịch vụ` : 'Thêm dịch vụ'}
            description={editingService ? editingService.name : 'Dịch vụ phát sinh khách có thể dùng trong thời gian lưu trú.'}
            icon={editingService ? PencilIcon : PlusIcon}
            onClose={onClose}
            size="sm"
            footer={
                <>
                    {editingService && onDelete && (
                        <Button variant="danger" icon={TrashIcon} className="mr-auto" disabled={loading} onClick={() => onDelete(editingService)}>
                            Xoá
                        </Button>
                    )}
                    <Button onClick={onClose} disabled={loading}>Huỷ</Button>
                    <Button type="submit" form="service-form" variant="primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : editingService ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
                    </Button>
                </>
            }
        >
            <form id="service-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <Alert>{error}</Alert>}

                <Field label="Tên dịch vụ" htmlFor="service-name" required>
                    <Input id="service-name" name="name" value={formData.name} onChange={handleChange} placeholder="Spa thư giãn" maxLength={100} required autoFocus />
                </Field>

                <Field label="Cách tính tiền" required>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cách tính tiền">
                        {Object.entries(PRICING_MODE).map(([value, m]) => {
                            const active = formData.pricingMode === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setFormData(prev => ({ ...prev, pricingMode: value }))}
                                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                        active ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line-strong hover:bg-hover'
                                    }`}
                                >
                                    <p className="text-sm font-medium text-fg">{m.label}</p>
                                    <p className="text-xs text-muted">Giá mỗi {m.unit}</p>
                                </button>
                            );
                        })}
                    </div>
                </Field>

                <Field
                    label={`Đơn giá (VNĐ / ${PRICING_MODE[formData.pricingMode].unit})`}
                    htmlFor="service-price"
                    required
                    hint="Đổi giá chỉ áp dụng cho lần thêm sau, hoá đơn cũ giữ nguyên giá lúc thêm."
                >
                    <Input id="service-price" type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} placeholder="100000" min="1" required />
                </Field>
            </form>
        </Modal>
    );
}
