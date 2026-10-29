import { useState, useMemo, useEffect } from 'react';
import { BedIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import { Badge, Card, EmptyState, Pagination, SearchInput, Table } from '../ui';
import { usePagination } from '../../utils/usePagination.js';
import { ROOM_STATUS, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

const STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    ...Object.entries(ROOM_STATUS).map(([value, s]) => ({ value, label: s.label }))
];

export default function RoomTable({ rooms, selectedRoom, onSelectRoom, onEdit, onClearSelection }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Bấm ra ngoài bảng thì bỏ chọn phòng
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (!e.target.closest('tr') && !e.target.closest('[role="dialog"]')) {
                if (onClearSelection) onClearSelection();
            }
        };
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [onClearSelection]);

    const filteredRooms = useMemo(() => {
        return (rooms || []).filter(room => {
            const matchesSearch =
                String(room.roomNumber).includes(searchTerm) ||
                (room.roomType || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || room.roomStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rooms, searchTerm, statusFilter]);
    const pager = usePagination(filteredRooms);

    return (
        <Card>
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm theo số phòng, hạng phòng..."
                        className="w-full sm:max-w-xs"
                    />
                    <GlideSelect
                        options={STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        ariaLabel="Lọc theo trạng thái phòng"
                        menuWidth={200}
                    />
                </div>
                <p className="text-sm text-muted">
                    <span className="font-medium text-fg">{filteredRooms.length}</span> / {rooms?.length || 0} phòng
                </p>
            </div>

            {filteredRooms.length === 0 ? (
                <EmptyState
                    icon={BedIcon}
                    title={searchTerm || statusFilter !== 'ALL' ? 'Không có phòng phù hợp' : 'Chưa có phòng nào'}
                    description={searchTerm || statusFilter !== 'ALL' ? 'Thử đổi bộ lọc hoặc từ khoá.' : 'Bấm "Thêm phòng" để tạo phòng đầu tiên.'}
                />
            ) : (
                <Table head={['Số phòng', 'Hạng', 'Giường', 'Diện tích', { label: 'Giá / đêm', className: 'text-right' }, 'Trạng thái']}>
                    {pager.pageItems.map((room) => {
                        const type = ROOM_TYPE[room.roomType];
                        const status = ROOM_STATUS[room.roomStatus];
                        const isSelected = selectedRoom?.roomNumber === room.roomNumber;
                        return (
                            <tr
                                key={room.roomNumber}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectRoom) onSelectRoom(room);
                                    if (onEdit) onEdit(room);
                                }}
                                title="Bấm để sửa thông tin phòng"
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]' : 'hover:bg-row-hover'}`}
                            >
                                <td className="whitespace-nowrap px-4 py-3 font-semibold text-fg tabular">{room.roomNumber}</td>
                                <td className="px-4 py-3"><Badge tone={type?.tone}>{type?.label || room.roomType}</Badge></td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted">{room.bedType || '—'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted tabular">{room.areaSquareMeters ? `${room.areaSquareMeters} m²` : '—'}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-fg tabular">{formatMoney(room.basePrice)}</td>
                                <td className="px-4 py-3"><Badge tone={status?.tone} dot>{status?.label || room.roomStatus}</Badge></td>
                            </tr>
                        );
                    })}
                </Table>
            )}
            <Pagination {...pager} />
        </Card>
    );
}
