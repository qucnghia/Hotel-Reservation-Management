import { useState, useMemo, useEffect } from 'react';
import { UsersIcon } from '../icons/Icons.jsx';
import { Avatar, Badge, Card, EmptyState, Pagination, SearchInput, Table } from '../ui';
import { usePagination } from '../../utils/usePagination.js';
import { MEMBERSHIP, formatMoney } from '../../utils/labels.js';

export default function CustomerTable({ guests, selectedCustomer, onSelectCustomer, onEdit, onClearSelection }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Bấm ra ngoài bảng thì bỏ chọn dòng
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (!e.target.closest('tr') && !e.target.closest('[role="dialog"]')) {
                if (onClearSelection) onClearSelection();
            }
        };
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [onClearSelection]);

    const filteredGuests = useMemo(() => {
        if (!searchTerm.trim()) return guests || [];
        const term = searchTerm.toLowerCase();
        return (guests || []).filter(g => {
            const name = (g.fullName || '').toLowerCase();
            const email = (g.email || '').toLowerCase();
            const membership = (g.membership || '').toLowerCase();
            return name.includes(term) || email.includes(term) || String(g.id).includes(term) || membership.includes(term);
        });
    }, [guests, searchTerm]);
    const pager = usePagination(filteredGuests);

    return (
        <Card>
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm theo tên, email, hạng hoặc mã..."
                    className="w-full sm:max-w-xs"
                />
                <p className="text-sm text-muted">
                    <span className="font-medium text-fg">{filteredGuests.length}</span> / {guests?.length || 0} khách hàng
                </p>
            </div>

            {/* Bảng ưu đãi theo hạng hội viên */}
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5 text-xs text-muted">
                <span>Ưu đãi hội viên:</span>
                {Object.entries(MEMBERSHIP).map(([key, m]) => (
                    <span key={key} title={m.minSpend ? `Chi tiêu tích luỹ từ ${m.minSpend} đ` : 'Hạng mặc định khi mới đăng ký'}>
                        <Badge tone={m.tone}>{m.label} · {m.discount > 0 ? `giảm ${m.discount}%` : 'không giảm'}</Badge>
                    </span>
                ))}
            </div>

            {filteredGuests.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title={searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng'}
                    description={searchTerm ? 'Thử tìm với từ khoá khác.' : 'Bấm "Thêm khách hàng" để tạo hồ sơ đầu tiên.'}
                />
            ) : (
                <Table head={['Mã', 'Họ và tên', 'Hạng', { label: 'Chi tiêu tích luỹ', className: 'text-right' }, 'Ngày sinh', 'Email']}>
                    {pager.pageItems.map((guest) => {
                        const mem = MEMBERSHIP[guest.membership] || MEMBERSHIP.CUSTOMER;
                        const isSelected = selectedCustomer?.id === guest.id;
                        return (
                            <tr
                                key={guest.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectCustomer) onSelectCustomer(guest);
                                    if (onEdit) onEdit(guest);
                                }}
                                title="Bấm để sửa thông tin hoặc xem lịch sử đặt phòng"
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]' : 'hover:bg-row-hover'}`}
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-muted tabular">#{guest.id}</td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <span className="flex items-center gap-2.5">
                                        <Avatar name={guest.fullName} tone={mem.tone === 'gray' ? 'accent' : mem.tone} />
                                        <span className="font-medium text-fg">{guest.fullName || '—'}</span>
                                    </span>
                                </td>
                                <td className="px-4 py-3"><Badge tone={mem.tone}>{mem.label}</Badge></td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-fg tabular">{formatMoney(guest.paidPrice)}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted tabular">{guest.dob || '—'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted">{guest.email || '—'}</td>
                            </tr>
                        );
                    })}
                </Table>
            )}
            <Pagination {...pager} />
        </Card>
    );
}
