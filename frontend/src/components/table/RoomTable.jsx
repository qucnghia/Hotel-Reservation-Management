import { useState, useMemo, useEffect } from 'react';
import { BedIcon, SearchIcon, XMarkIcon } from '../icons/Icons.jsx';
import GlideSelect from '../glide-select/GlideSelect.jsx';

const ROOM_STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'AVAILABLE', label: 'Sẵn sàng', tag: 'Trống' },
    { value: 'BOOKED', label: 'Đã đặt', tag: 'Đã cọc' },
    { value: 'OCCUPIED', label: 'Có khách', tag: 'Đang ở' },
    { value: 'UNDER_MAINTENANCE', label: 'Bảo trì', tag: 'Bảo trì' }
];

const ROOM_STATUS_CONFIG = {
    AVAILABLE: {
        label: 'Sẵn sàng',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400'
    },
    BOOKED: {
        label: 'Đã đặt',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400'
    },
    OCCUPIED: {
        label: 'Có khách',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400'
    },
    UNDER_MAINTENANCE: {
        label: 'Bảo trì',
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400'
    }
};

const ROOM_TYPE_CONFIG = {
    STANDARD: {
        label: 'STANDARD',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    },
    VIP: {
        label: 'VIP',
        badge: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
    },
    LUXURY: {
        label: 'LUXURY',
        badge: 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
    }
};

export default function RoomTable({ rooms, selectedRoom, onSelectRoom, onEdit, onClearSelection }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Lắng nghe click ra ngoài để bỏ chọn phòng
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (!e.target.closest('tr') && !e.target.closest('.room-modal')) {
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

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '0 ₫';
        return `${Number(amount).toLocaleString('vi-VN')} ₫`;
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md flex flex-col w-full relative">
            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 rounded-t-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo số phòng, hạng phòng..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <GlideSelect
                        options={ROOM_STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        ariaLabel="Lọc theo trạng thái phòng"
                        size="md"
                        align="right"
                        menuWidth={250}
                        surfaceColor="#0f172a"
                        highlightColor="#334155"
                        accentColor="#38bdf8"
                        textColor="#f8fafc"
                        radius={12}
                    />

                    <div className="text-sm text-slate-400 whitespace-nowrap font-medium">
                        Tổng: <span className="font-bold text-slate-900 dark:text-white">{filteredRooms.length}</span> / {rooms?.length || 0}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full rounded-b-2xl">
                <table className="w-full text-left text-base text-slate-700 dark:text-slate-200">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                        <tr>
                            <th scope="col" className="px-5 py-4 w-32">Số phòng</th>
                            <th scope="col" className="px-5 py-4">Hạng phòng</th>
                            <th scope="col" className="px-5 py-4">Giá cơ bản</th>
                            <th scope="col" className="px-5 py-4">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                        {filteredRooms && filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => {
                                const roomNum = room.roomNumber;
                                const roomType = room.roomType || '---';
                                const basePrice = room.basePrice;
                                const roomStatus = room.roomStatus;
                                const isSelected = selectedRoom?.roomNumber === roomNum;

                                return (
                                    <tr
                                        key={roomNum}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onSelectRoom) onSelectRoom(room);
                                            if (onEdit) onEdit(room);
                                        }}
                                        title="Nhấn trực tiếp để chỉnh sửa thông tin phòng"
                                        className={`transition-colors duration-150 cursor-pointer ${
                                            isSelected
                                                ? 'bg-indigo-600/25 border-l-4 border-l-indigo-500 shadow-md'
                                                : 'hover:bg-slate-800/70 hover:border-l-4 hover:border-l-indigo-400/60'
                                        }`}
                                    >
                                        <td className="px-5 py-4">
                                            <span className={`font-black text-base px-3 py-1.5 rounded-xl border inline-block shadow-sm ${
                                                isSelected
                                                    ? 'bg-indigo-500 text-white border-indigo-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {roomNum}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-medium">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${ROOM_TYPE_CONFIG[roomType]?.badge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                                {ROOM_TYPE_CONFIG[roomType]?.label || roomType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                            {formatCurrency(basePrice)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ROOM_STATUS_CONFIG[roomStatus]?.badge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                                <span className={`w-2 h-2 rounded-full ${ROOM_STATUS_CONFIG[roomStatus]?.dot || 'bg-slate-400'}`} />
                                                <span>{ROOM_STATUS_CONFIG[roomStatus]?.label || roomStatus}</span>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-14 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                                            <BedIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">
                                            {searchTerm ? 'Không tìm thấy phòng nào phù hợp.' : 'Chưa có dữ liệu phòng trong hệ thống.'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {searchTerm ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.' : 'Bấm nút "Tạo Phòng Ở Mới" ở trên để thêm phòng mới.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
