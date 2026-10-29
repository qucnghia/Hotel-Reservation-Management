import { useState, useMemo, useEffect } from 'react';
import { BedIcon, PencilIcon, CalendarIcon, PlusIcon } from '../icons/Icons.jsx';
import { Badge, Button, Card, EmptyState, Modal, SearchInput, Segmented } from '../ui';
import { ROOM_STATUS, ROOM_TYPE, floorOf, formatMoney } from '../../utils/labels.js';

// Vạch màu bên trái + nền ngả nhẹ theo trạng thái
const STRIPES = {
    green: 'border-l-emerald-500 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-400/5 dark:hover:bg-emerald-400/15',
    blue: 'border-l-blue-500 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-400/5 dark:hover:bg-blue-400/15',
    amber: 'border-l-amber-500 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-400/5 dark:hover:bg-amber-400/15',
    gray: 'border-l-slate-400 bg-slate-100/80 hover:bg-slate-200/80 dark:border-l-slate-600 dark:bg-white/[0.02] dark:hover:bg-white/[0.07]'
};

const getActiveBooking = (bookings, roomNumber) =>
    bookings.find(b => Number(b.roomNumber) === Number(roomNumber) && (b.bookingStatus === 'CHECKED_IN' || b.bookingStatus === 'CONFIRMED'));

export default function HotelFloorPlan2D({ rooms = [], bookings = [], selectedRoom, onSelectRoom, onEdit, onBookRoom, onAddNewRoom }) {
    const [selectedFloor, setSelectedFloor] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [inspectedRoom, setInspectedRoom] = useState(null);

    const floors = useMemo(() => [...new Set(rooms.map(r => floorOf(r.roomNumber)))].sort((a, b) => a - b), [rooms]);

    const counts = useMemo(() => {
        const c = { ALL: rooms.length };
        Object.keys(ROOM_STATUS).forEach(s => { c[s] = rooms.filter(r => r.roomStatus === s).length; });
        return c;
    }, [rooms]);
    const occupancyRate = rooms.length ? Math.round(((counts.OCCUPIED + counts.BOOKED) / rooms.length) * 100) : 0;

    const isFilterActive = statusFilter !== 'ALL' || Boolean(searchTerm.trim());
    const matches = (room) =>
        (statusFilter === 'ALL' || room.roomStatus === statusFilter) &&
        (!searchTerm.trim() || String(room.roomNumber).includes(searchTerm.trim()) || (room.roomType || '').toLowerCase().includes(searchTerm.trim().toLowerCase()));

    const visibleFloors = selectedFloor === 'ALL' ? floors : [selectedFloor];
    const floorOptions = [{ value: 'ALL', label: 'Tất cả tầng' }, ...floors.map(f => ({ value: f, label: `Tầng ${f}` }))];

    useEffect(() => {
        if (!selectedRoom && !inspectedRoom) return;

        const handleOutsideClick = (e) => {
            if (e.target.closest('[data-room-tile]') || e.target.closest('[role="dialog"]') || e.target.closest('.modal-content')) {
                return;
            }
            onSelectRoom?.(null);
            setInspectedRoom(null);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onSelectRoom?.(null);
                setInspectedRoom(null);
            }
        };

        document.addEventListener('pointerdown', handleOutsideClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handleOutsideClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedRoom, inspectedRoom, onSelectRoom]);

    const openRoom = (room) => {
        if (selectedRoom?.roomNumber === room.roomNumber && !inspectedRoom) {
            onSelectRoom?.(null);
            return;
        }
        onSelectRoom?.(room);
        setInspectedRoom(room);
    };

    if (rooms.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={BedIcon}
                    title="Chưa có phòng nào"
                    description="Tạo phòng đầu tiên để bắt đầu quản lý sơ đồ khách sạn."
                    action={onAddNewRoom && <Button variant="primary" icon={PlusIcon} onClick={onAddNewRoom}>Thêm phòng</Button>}
                />
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Thanh lọc */}
            <Card className="flex flex-col gap-3 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {floors.length > 1 && <Segmented options={floorOptions} value={selectedFloor} onChange={setSelectedFloor} />}
                        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm số phòng, hạng..." className="w-full sm:w-56" />
                    </div>
                    <p className="text-sm text-muted">
                        Công suất <span className="font-semibold text-fg tabular">{occupancyRate}%</span>
                        <span className="mx-1.5 text-faint">·</span>
                        {counts.OCCUPIED} có khách, {counts.BOOKED} đã đặt
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo trạng thái">
                    {[['ALL', { label: 'Tất cả', tone: null }], ...Object.entries(ROOM_STATUS)].map(([key, s]) => {
                        const active = statusFilter === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setStatusFilter(active && key !== 'ALL' ? 'ALL' : key)}
                                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer ${
                                    active ? 'bg-fg text-surface ring-fg' : 'text-muted ring-line-strong hover:bg-hover hover:text-fg'
                                }`}
                            >
                                {s.tone && <span className={`h-1.5 w-1.5 rounded-full ${{ green: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500', gray: 'bg-gray-400' }[s.tone]}`} />}
                                {s.label}
                                <span className={`tabular ${active ? 'opacity-70' : 'text-faint'}`}>{counts[key]}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Các tầng */}
            {visibleFloors.map(floor => {
                const floorRooms = rooms
                    .filter(r => floorOf(r.roomNumber) === floor)
                    .sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));
                const free = floorRooms.filter(r => r.roomStatus === 'AVAILABLE').length;

                return (
                    <Card key={floor}>
                        <div className="flex items-center justify-between border-b border-line px-4 py-3">
                            <h3 className="text-sm font-semibold text-fg">Tầng {floor}</h3>
                            <p className="text-xs text-muted">{floorRooms.length} phòng · {free} trống</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {floorRooms.map((room, i) => (
                                <RoomTile
                                    key={room.roomNumber}
                                    index={i}
                                    room={room}
                                    activeBooking={getActiveBooking(bookings, room.roomNumber)}
                                    isSelected={selectedRoom?.roomNumber === room.roomNumber}
                                    isDimmed={isFilterActive && !matches(room)}
                                    onOpen={() => openRoom(room)}
                                />
                            ))}
                        </div>
                    </Card>
                );
            })}

            {inspectedRoom && (
                <RoomInspector
                    room={inspectedRoom}
                    activeBooking={getActiveBooking(bookings, inspectedRoom.roomNumber)}
                    onClose={() => {
                        setInspectedRoom(null);
                        onSelectRoom?.(null);
                    }}
                    onEdit={() => {
                        setInspectedRoom(null);
                        onSelectRoom?.(null);
                        onEdit?.(inspectedRoom);
                    }}
                    onBook={onBookRoom && (() => {
                        setInspectedRoom(null);
                        onSelectRoom?.(null);
                        onBookRoom(inspectedRoom);
                    })}
                />
            )}
        </div>
    );
}

function RoomTile({ room, activeBooking, isSelected, isDimmed, onOpen, index = 0 }) {
    const status = ROOM_STATUS[room.roomStatus] || ROOM_STATUS.AVAILABLE;
    const type = ROOM_TYPE[room.roomType];

    return (
        <button
            type="button"
            data-room-tile
            onClick={onOpen}
            aria-label={`Phòng ${room.roomNumber}, ${status.label}`}
            style={{ '--i': index }}
            className={`animate-rise flex min-h-[104px] flex-col justify-between rounded-lg border border-l-4 border-line p-3 text-left shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md motion-reduce:hover:translate-y-0 ${STRIPES[status.tone]} ${
                isSelected ? 'ring-2 ring-accent' : ''
            } ${isDimmed ? 'opacity-35 hover:opacity-100' : ''}`}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-semibold leading-none text-fg tabular">{room.roomNumber}</span>
                <Badge tone={type?.tone}>{type?.label || room.roomType}</Badge>
            </div>
            <div className="mt-3">
                {activeBooking ? (
                    <>
                        <p className="truncate text-xs font-medium text-fg">{activeBooking.customerName}</p>
                        <p className="text-xs text-muted tabular">đến {activeBooking.checkOutDate}</p>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-medium text-muted">{status.label}</p>
                        <p className="text-xs text-muted tabular">{formatMoney(room.basePrice)}/đêm</p>
                    </>
                )}
            </div>
        </button>
    );
}

function RoomInspector({ room, activeBooking, onClose, onEdit, onBook }) {
    const status = ROOM_STATUS[room.roomStatus] || ROOM_STATUS.AVAILABLE;
    const type = ROOM_TYPE[room.roomType];
    const details = [
        ['Hạng phòng', `${type?.label || room.roomType} · ${type?.name || ''}`],
        ['Giá mỗi đêm', formatMoney(room.basePrice)],
        ['Giường', room.bedType || '—'],
        ['Diện tích', room.areaSquareMeters ? `${room.areaSquareMeters} m²` : '—']
    ];

    return (
        <Modal
            title={<span className="inline-flex items-center gap-2">Phòng {room.roomNumber} <Badge tone={status.tone} dot>{status.label}</Badge></span>}
            description={`Tầng ${floorOf(room.roomNumber)}`}
            icon={BedIcon}
            onClose={onClose}
            size="sm"
            footer={
                <>
                    <Button icon={PencilIcon} onClick={onEdit}>Sửa phòng</Button>
                    {onBook && room.roomStatus !== 'UNDER_MAINTENANCE' && (
                        <Button variant="primary" icon={CalendarIcon} onClick={onBook}>Đặt phòng</Button>
                    )}
                </>
            }
        >
            <dl className="divide-y divide-line text-sm">
                {details.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted">{label}</dt>
                        <dd className="font-medium text-fg tabular">{value}</dd>
                    </div>
                ))}
            </dl>

            {activeBooking && (
                <div className="mt-3 rounded-lg border border-line bg-subtle/50 px-3.5 py-3 text-sm">
                    <p className="text-xs text-muted">{activeBooking.bookingStatus === 'CHECKED_IN' ? 'Khách đang lưu trú' : 'Đơn sắp tới'}</p>
                    <p className="mt-0.5 font-medium text-fg">{activeBooking.customerName || `Khách #${activeBooking.customerId}`}</p>
                    <p className="text-muted tabular">{activeBooking.checkInDate} → {activeBooking.checkOutDate} · {activeBooking.durationNights} đêm</p>
                </div>
            )}
        </Modal>
    );
}
