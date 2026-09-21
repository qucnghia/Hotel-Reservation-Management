import { useState, useMemo } from 'react';
import { deleteRoom } from '../services/roomService';
import { PencilIcon, TrashIcon, BedIcon, SearchIcon, XMarkIcon } from './Icons';

export default function RoomTable({ rooms, onEdit, onRoomDeleted }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredRooms = useMemo(() => {
        return (rooms || []).filter(r => {
            const matchesSearch = !searchTerm.trim() ||
                String(r.roomNumber).includes(searchTerm) ||
                (r.roomType || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || r.roomStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [rooms, searchTerm, statusFilter]);

    const handleDelete = async (roomNumber) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa phòng #${roomNumber} không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteRoom(roomNumber);
            alert(`Đã xóa thành công phòng #${roomNumber}!`);
            onRoomDeleted();
        } catch (err) {
            console.error('Lỗi khi xóa phòng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa phòng!';
            alert(`Lỗi khi xóa: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Sẵn sàng (AVAILABLE)
                    </span>
                );
            case 'BOOKED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        Đã đặt (BOOKED)
                    </span>
                );
            case 'OCCUPIED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Có khách (OCCUPIED)
                    </span>
                );
            case 'UNDER_MAINTENANCE':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Bảo trì (MAINTENANCE)
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        {status}
                    </span>
                );
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md flex flex-col">
            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo số phòng, hạng phòng..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9.5 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                        aria-label="Lọc theo trạng thái phòng"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="AVAILABLE">Sẵn sàng (AVAILABLE)</option>
                        <option value="BOOKED">Đã đặt (BOOKED)</option>
                        <option value="OCCUPIED">Có khách (OCCUPIED)</option>
                        <option value="UNDER_MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                    </select>

                    <div className="text-xs text-slate-400 hidden md:block whitespace-nowrap">
                        <span className="font-semibold text-white">{filteredRooms.length}</span> / {rooms?.length || 0} phòng
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                    <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                            <th scope="col" className="px-5 py-3.5 w-28">Số phòng</th>
                            <th scope="col" className="px-5 py-3.5">Hạng phòng</th>
                            <th scope="col" className="px-5 py-3.5">Giá cơ bản</th>
                            <th scope="col" className="px-5 py-3.5">Trạng thái</th>
                            <th scope="col" className="px-5 py-3.5 w-36 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                        {filteredRooms && filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => {
                                const roomNum = room.roomNumber;
                                const roomType = room.roomType || '---';
                                const basePrice = room.basePrice;
                                const roomStatus = room.roomStatus;

                                return (
                                    <tr
                                        key={roomNum}
                                        className="hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <span className="font-bold text-white font-mono text-sm px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 inline-block shadow-sm">
                                                Phòng {roomNum}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs font-semibold">
                                                {roomType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-emerald-400 font-mono text-sm">
                                            {formatCurrency(basePrice)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {getStatusBadge(roomStatus)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(room)}
                                                    title="Chỉnh sửa thông tin phòng (PUT)"
                                                    aria-label={`Sửa phòng #${roomNum}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(roomNum)}
                                                    title="Xóa phòng (DELETE)"
                                                    aria-label={`Xóa phòng #${roomNum}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                    <span>Xóa</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-14 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                                            <BedIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">
                                            {searchTerm || statusFilter !== 'ALL'
                                                ? 'Không tìm thấy phòng phù hợp với bộ lọc.'
                                                : 'Chưa có phòng nào trong hệ thống.'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {searchTerm || statusFilter !== 'ALL'
                                                ? 'Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.'
                                                : 'Sử dụng biểu mẫu bên trái để khai báo phòng đầu tiên.'}
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
