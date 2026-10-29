import { useEffect, useState } from 'react';
import { getExtraServices, deleteExtraService } from '../../services/extraService.js';
import { PlusIcon, PencilIcon, TrashIcon, ConciergeBellIcon } from '../icons/Icons.jsx';
import ServiceForm from '../form/ServiceForm.jsx';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Pagination, SearchInput, Table } from '../ui';
import { PRICING_MODE, formatMoney } from '../../utils/labels.js';
import { usePagination } from '../../utils/usePagination.js';
import { useToast } from '../../utils/toast.js';

export default function ServiceCatalog() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState(null); // null | { service } (service = null khi thêm mới)
    const toast = useToast();

    const load = async () => {
        try {
            const res = await getExtraServices();
            setServices(res.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được danh mục dịch vụ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        getExtraServices()
            .then(res => { if (!cancelled) setServices(res.data || []); })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Không tải được danh mục dịch vụ.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const handleDelete = async (service) => {
        if (!window.confirm(`Xoá dịch vụ "${service.name}"? Các đơn đã dùng dịch vụ này vẫn giữ nguyên hoá đơn.`)) return;
        try {
            await deleteExtraService(service.id);
            toast.success(`Đã xoá dịch vụ "${service.name}".`);
            setForm(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể xoá dịch vụ.');
        }
    };

    const term = searchTerm.trim().toLowerCase();
    const filtered = services.filter(s => !term || s.name.toLowerCase().includes(term));
    const pager = usePagination(filtered);

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Dịch vụ"
                description="Danh mục dịch vụ phát sinh dùng khi thêm vào đơn đặt phòng."
                icon={ConciergeBellIcon}
                tone="rose"
                actions={<Button variant="primary" icon={PlusIcon} onClick={() => setForm({ service: null })}>Thêm dịch vụ</Button>}
            />

            {error && <Alert>{error}</Alert>}

            <Card>
                <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm tên dịch vụ..." className="w-full sm:max-w-xs" />
                    <p className="text-sm text-muted"><span className="font-medium text-fg">{filtered.length}</span> / {services.length} dịch vụ</p>
                </div>

                {loading ? (
                    <p className="px-4 py-14 text-center text-sm text-muted">Đang tải danh mục...</p>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={ConciergeBellIcon}
                        title={term ? 'Không có dịch vụ phù hợp' : 'Chưa có dịch vụ nào'}
                        description={term ? 'Thử tìm với từ khoá khác.' : 'Bấm "Thêm dịch vụ" để tạo dịch vụ đầu tiên.'}
                    />
                ) : (
                    <Table head={['Tên dịch vụ', 'Cách tính', { label: 'Đơn giá', className: 'text-right' }, { label: '', className: 'w-px' }]}>
                        {pager.pageItems.map(s => {
                            const mode = PRICING_MODE[s.pricingMode] || PRICING_MODE.PER_ITEM;
                            return (
                                <tr key={s.id} onClick={() => setForm({ service: s })} className="cursor-pointer transition-colors hover:bg-row-hover" title="Bấm để sửa dịch vụ">
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-fg">{s.name}</td>
                                    <td className="px-4 py-3"><Badge tone={mode.tone}>{mode.label}</Badge></td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-fg tabular">
                                        {formatMoney(s.unitPrice)} <span className="text-muted">/ {mode.unit}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" icon={PencilIcon} onClick={() => setForm({ service: s })} aria-label={`Sửa ${s.name}`} />
                                            <Button size="icon" variant="ghost" icon={TrashIcon} onClick={() => handleDelete(s)} aria-label={`Xoá ${s.name}`} className="hover:text-rose-600 dark:hover:text-rose-400" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>
                )}
                <Pagination {...pager} />
            </Card>

            {form && (
                <ServiceForm
                    key={form.service?.id ?? 'new'}
                    editingService={form.service}
                    onSaved={() => { toast.success(form.service ? 'Đã lưu dịch vụ.' : 'Đã thêm dịch vụ mới.'); setForm(null); load(); }}
                    onClose={() => setForm(null)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
