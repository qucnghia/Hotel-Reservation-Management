import { useState, useMemo, useEffect } from 'react';
import { 
    BedIcon as Bed, 
    HotelIcon as Hotel, 
    CompassIcon as Compass, 
    LayersIcon as Layers, 
    PlusIcon as Plus, 
    PencilIcon as Pencil, 
    CalendarIcon as Calendar, 
    SearchIcon as Search, 
    XMarkIcon as X,
    BathIcon as Bath,
    WifiIcon as Wifi,
    WindIcon as Wind,
    ShieldAlertIcon as ShieldAlert
} from '../icons/Icons.jsx';

// Cấu hình trạng thái phòng
const ROOM_STATUS_CONFIG = {
    AVAILABLE: {
        label: 'Sẵn sàng',
        tag: 'Trống',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)] border-emerald-500/60',
        bg: 'bg-emerald-950/20 hover:bg-emerald-900/30',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/50',
        indicator: 'bg-emerald-500 text-white',
        statusText: 'Phòng trống, sẵn sàng đón khách'
    },
    BOOKED: {
        label: 'Đã đặt',
        tag: 'Đã cọc',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)] border-amber-500/60',
        bg: 'bg-amber-950/20 hover:bg-amber-900/30',
        dot: 'bg-amber-400',
        border: 'border-amber-500/50',
        indicator: 'bg-amber-500 text-white',
        statusText: 'Đã có khách đặt trước'
    },
    OCCUPIED: {
        label: 'Có khách',
        tag: 'Đang ở',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)] border-rose-500/60',
        bg: 'bg-rose-950/20 hover:bg-rose-900/30',
        dot: 'bg-rose-400',
        border: 'border-rose-500/50',
        indicator: 'bg-rose-500 text-white',
        statusText: 'Khách đang lưu trú'
    },
    UNDER_MAINTENANCE: {
        label: 'Bảo trì',
        tag: 'Bảo trì',
        badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        glow: 'shadow-[0_0_15px_rgba(148,163,184,0.15)] border-slate-600',
        bg: 'bg-slate-900/40 hover:bg-slate-800/40',
        dot: 'bg-slate-400',
        border: 'border-slate-600',
        indicator: 'bg-slate-600 text-slate-200',
        statusText: 'Đang bảo dưỡng trang thiết bị'
    }
};

// Cấu hình hạng phòng
const ROOM_TYPE_CONFIG = {
    STANDARD: {
        label: 'STANDARD',
        vietnameseName: 'Tiêu Chuẩn',
        badge: 'room-badge-standard',
        accent: 'from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    },
    VIP: {
        label: 'VIP',
        vietnameseName: 'Cao Cấp',
        badge: 'room-badge-vip',
        accent: 'from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40',
    },
    LUXURY: {
        label: 'LUXURY',
        vietnameseName: 'Sang Trọng',
        badge: 'room-badge-luxury',
        accent: 'from-amber-500/20 to-yellow-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40',
    }
};


export default function HotelFloorPlan2D({
    rooms = [],
    bookings = [],
    selectedRoom,
    onSelectRoom,
    onClearSelection,
    onEdit,
    onBookRoom,
    onAddNewRoom
}) {
    const [selectedFloor, setSelectedFloor] = useState('ALL'); // 'ALL' | number
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [inspectedRoom, setInspectedRoom] = useState(null);

    // Xử lý chọn / bỏ chọn phòng:
    // - Click vào phòng -> hiện viền tím
    // - Click lại chính phòng đó -> bỏ viền tím
    const handleRoomClick = (room) => {
        if (selectedRoom?.roomNumber === room.roomNumber) {
            if (onClearSelection) onClearSelection();
            else if (onSelectRoom) onSelectRoom(null);
        } else {
            if (onSelectRoom) onSelectRoom(room);
        }
    };

    // Lắng nghe click ra ngoài để bỏ viền tím
    useEffect(() => {
        const handleDocumentClick = (e) => {
            // Nếu click ra ngoài ô phòng (room-2d-card) và ra ngoài modal chi tiết -> bỏ viền tím
            if (!e.target.closest('.room-2d-card') && !e.target.closest('.room-inspector-modal')) {
                if (onClearSelection) {
                    onClearSelection();
                } else if (onSelectRoom) {
                    onSelectRoom(null);
                }
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [onClearSelection, onSelectRoom]);

    // Tính toán danh sách tầng dựa trên số phòng
    const floors = useMemo(() => {
        const floorSet = new Set();
        rooms.forEach(r => {
            const num = Number(r.roomNumber);
            const floor = num >= 100 ? Math.floor(num / 100) : 1;
            floorSet.add(floor);
        });
        return Array.from(floorSet).sort((a, b) => a - b);
    }, [rooms]);

    // Format tiền tệ
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '0 ₫';
        return `${Number(amount).toLocaleString('vi-VN')} ₫`;
    };

    // Tìm thông tin khách hàng đang lưu trú tại phòng (nếu có)
    const getActiveBookingForRoom = (roomNum) => {
        return bookings.find(b => 
            Number(b.roomNumber) === Number(roomNum) && 
            (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN' || b.bookingStatus === 'OCCUPIED')
        );
    };

    // Thống kê nhanh toàn khách sạn
    const stats = useMemo(() => {
        const total = rooms.length;
        const available = rooms.filter(r => r.roomStatus === 'AVAILABLE').length;
        const booked = rooms.filter(r => r.roomStatus === 'BOOKED').length;
        const occupied = rooms.filter(r => r.roomStatus === 'OCCUPIED').length;
        const maintenance = rooms.filter(r => r.roomStatus === 'UNDER_MAINTENANCE').length;
        const occupancyRate = total > 0 ? Math.round(((occupied + booked) / total) * 100) : 0;

        return { total, available, booked, occupied, maintenance, occupancyRate };
    }, [rooms]);

    // Kiểm tra bộ lọc có đang được áp dụng hay không
    const isFilterActive = statusFilter !== 'ALL' || typeFilter !== 'ALL' || Boolean(searchTerm.trim());

    // Hàm kiểm tra 1 phòng có khớp với bộ lọc hay không (dùng để highlight / dim)
    const isRoomMatchingFilter = (room) => {
        if (!isFilterActive) return true;

        const matchesStatus = statusFilter === 'ALL' || room.roomStatus === statusFilter;
        const matchesType = typeFilter === 'ALL' || room.roomType === typeFilter;
        const matchesSearch = !searchTerm.trim() || 
            String(room.roomNumber).includes(searchTerm.trim()) ||
            (room.roomType || '').toLowerCase().includes(searchTerm.trim().toLowerCase());

        return matchesStatus && matchesType && matchesSearch;
    };

    // Số lượng phòng khớp với bộ lọc
    const matchingRoomsCount = rooms.filter(isRoomMatchingFilter).length;

    const getStatusCount = (st) => {
        switch (st) {
            case 'AVAILABLE': return stats.available;
            case 'BOOKED': return stats.booked;
            case 'OCCUPIED': return stats.occupied;
            case 'UNDER_MAINTENANCE': return stats.maintenance;
            default: return stats.total;
        }
    };

    // Nhóm TẤT CẢ các phòng theo tầng (cố định vĩnh viễn theo kiến trúc tòa nhà, không bao giờ đổi chỗ khi lọc)
    const roomsGroupedByFloor = useMemo(() => {
        const grouped = {};
        const floorsToRender = selectedFloor === 'ALL' ? floors : [Number(selectedFloor)];

        floorsToRender.forEach(floor => {
            const floorRooms = rooms
                .filter(r => {
                    const parsed = parseInt(String(r.roomNumber).replace(/\D/g, ''), 10);
                    const num = isNaN(parsed) ? 100 : parsed;
                    const rf = num >= 100 ? Math.floor(num / 100) : 1;
                    return rf === floor;
                })
                .sort((a, b) => {
                    const numA = parseInt(String(a.roomNumber).replace(/\D/g, ''), 10) || 0;
                    const numB = parseInt(String(b.roomNumber).replace(/\D/g, ''), 10) || 0;
                    return numA - numB;
                });
            grouped[floor] = floorRooms;
        });

        return grouped;
    }, [rooms, selectedFloor, floors]);

    // Phân chia danh sách phòng của 1 tầng thành 2 cánh vĩnh viễn theo số phòng:
    // Cánh Bắc (North Wing) = Dãy phòng LẺ
    // Cánh Nam (South Wing) = Dãy phòng CHẴN
    // Khi người dùng bấm lọc trạng thái, cánh và vị trí ô phòng giữ 100% cố định!
    const splitRoomsIntoWings = (floorRooms) => {
        if (!floorRooms || floorRooms.length === 0) return { northWing: [], southWing: [] };

        const sorted = [...floorRooms].sort((a, b) => {
            const numA = parseInt(String(a.roomNumber).replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(String(b.roomNumber).replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });

        const evenRooms = sorted.filter(r => {
            const num = parseInt(String(r.roomNumber).replace(/\D/g, ''), 10) || 0;
            return num % 2 === 0;
        });
        const oddRooms = sorted.filter(r => {
            const num = parseInt(String(r.roomNumber).replace(/\D/g, ''), 10) || 0;
            return num % 2 !== 0;
        });

        // Nếu có cả phòng chẵn và lẻ: Lẻ -> Dãy Bắc, Chẵn -> Dãy Nam
        if (evenRooms.length > 0 && oddRooms.length > 0) {
            return {
                northWing: oddRooms,  // Dãy phòng lẻ (Bắc / Hướng Biển)
                southWing: evenRooms  // Dãy phòng chẵn (Nam / Hướng Vườn)
            };
        }

        // Nếu tầng chỉ có phòng lẻ: toàn bộ ở Dãy Bắc
        if (oddRooms.length > 0 && evenRooms.length === 0) {
            return {
                northWing: oddRooms,
                southWing: []
            };
        }

        // Nếu tầng chỉ có phòng chẵn: toàn bộ ở Dãy Nam
        if (evenRooms.length > 0 && oddRooms.length === 0) {
            return {
                northWing: [],
                southWing: evenRooms
            };
        }

        const mid = Math.ceil(sorted.length / 2);
        return {
            northWing: sorted.slice(0, mid),
            southWing: sorted.slice(mid)
        };
    };

    return (
        <div className="w-full flex flex-col gap-5">
            {/* 1. THANH ĐIỀU KHIỂN & CHỌN TẦNG (FLOOR SELECTOR RIBBON) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Sơ đồ khách sạn 2D
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê công suất phòng */}
                    <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-2.5 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Công suất phòng</div>
                                <div className="text-lg font-black text-indigo-400">{stats.occupancyRate}%</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-800 hidden sm:block" />

                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex flex-col">
                                <span className="text-slate-400 font-medium">Sẵn sàng</span>
                                <span className="font-extrabold text-emerald-400">{stats.available} phòng</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 font-medium">Đang ở</span>
                                <span className="font-extrabold text-rose-400">{stats.occupied} phòng</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 font-medium">Đã đặt</span>
                                <span className="font-extrabold text-amber-400">{stats.booked} phòng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách nút chọn Tầng (Elevator Floor Buttons) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5 whitespace-nowrap">
                        <Compass className="w-4 h-4 text-indigo-400" />
                        Chọn Tầng:
                    </span>

                    <button
                        type="button"
                        onClick={() => setSelectedFloor('ALL')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2 ${
                            selectedFloor === 'ALL'
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                        <span>Toàn Bộ Khách Sạn</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 text-white font-black">
                            {rooms.length} phòng
                        </span>
                    </button>

                    {floors.map(floorNum => {
                        const countInFloor = rooms.filter(r => {
                            const n = Number(r.roomNumber);
                            return (n >= 100 ? Math.floor(n / 100) : 1) === floorNum;
                        }).length;

                        const availInFloor = rooms.filter(r => {
                            const n = Number(r.roomNumber);
                            return (n >= 100 ? Math.floor(n / 100) : 1) === floorNum && r.roomStatus === 'AVAILABLE';
                        }).length;

                        const isSelected = selectedFloor === floorNum;

                        return (
                            <button
                                key={floorNum}
                                type="button"
                                onClick={() => setSelectedFloor(floorNum)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                                        : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-lg bg-black/40 flex items-center justify-center text-[11px] font-black text-indigo-300">
                                    {floorNum}F
                                </span>
                                <span>Tầng {floorNum}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                                    availInFloor > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                } font-semibold`}>
                                    {availInFloor}/{countInFloor} trống
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Thanh Lọc & Tìm kiếm */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm phòng theo số phòng (vd: 101, 202)..."
                            className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Bộ lọc trạng thái */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Trạng thái:</span>
                        {['ALL', 'AVAILABLE', 'BOOKED', 'OCCUPIED', 'UNDER_MAINTENANCE'].map(st => {
                            const config = ROOM_STATUS_CONFIG[st];
                            const isSelected = statusFilter === st;
                            const count = getStatusCount(st);
                            return (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setStatusFilter(statusFilter === st && st !== 'ALL' ? 'ALL' : st)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-1 ring-indigo-400'
                                            : 'bg-slate-100 dark:bg-slate-950/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {config?.dot && <span className={`w-2 h-2 rounded-full ${config.dot}`} />}
                                    <span>{st === 'ALL' ? 'Tất cả' : config?.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        isSelected 
                                            ? 'bg-indigo-500/30 text-indigo-200' 
                                            : 'bg-slate-800/80 text-slate-400'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Banner thông báo trạng thái lọc */}
                {isFilterActive && (
                    <div className={`rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs border transition-all ${
                        matchingRoomsCount > 0 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${matchingRoomsCount > 0 ? 'bg-indigo-400 animate-pulse' : 'bg-amber-400'}`} />
                            <span>
                                {matchingRoomsCount > 0 ? (
                                    <>Đang làm nổi bật <strong className="text-slate-900 dark:text-white font-black">{matchingRoomsCount}/{rooms.length} phòng</strong> trên sơ đồ.</>
                                ) : (
                                    <>Không có phòng nào phù hợp với bộ lọc hiện tại.</>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('ALL');
                                setTypeFilter('ALL');
                                setSearchTerm('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all cursor-pointer text-[11px] whitespace-nowrap"
                        >
                            Đặt lại bộ lọc
                        </button>
                    </div>
                )}
            </div>

            {/* 2. BẢN VẼ SƠ ĐỒ 2D CÁC TẦNG (2D BLUEPRINT CANVAS) */}
            <div className="flex flex-col gap-8">
                {rooms.length === 0 ? (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-4">
                            <Bed className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Chưa có phòng nào được tạo trên hệ thống</h4>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                            Bấm nút bên dưới để tạo phòng đầu tiên cho khách sạn của bạn.
                        </p>
                        {onAddNewRoom && (
                            <button
                                type="button"
                                onClick={onAddNewRoom}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm Phòng Mới</span>
                            </button>
                        )}
                    </div>
                ) : (
                    Object.entries(roomsGroupedByFloor).map(([floorStr, floorRooms]) => {
                        const floorNum = Number(floorStr);
                        const { northWing, southWing } = splitRoomsIntoWings(floorRooms);

                        return (
                            <div 
                                key={floorNum}
                                className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl relative overflow-hidden"
                            >
                                {/* Dải màu viền đầu tầng */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

                                {/* Header Tầng */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
                                            {floorNum}F
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                <span>Mặt Bằng Tầng {floorNum}</span>
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                <span>Tổng số: <strong className="text-slate-900 dark:text-slate-200">{floorRooms.length} phòng</strong></span>
                                                <span>•</span>
                                                <span className="text-emerald-400 font-bold">{floorRooms.filter(r => r.roomStatus === 'AVAILABLE').length} phòng trống</span>
                                                {isFilterActive && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-indigo-400 font-bold">
                                                            {floorRooms.filter(isRoomMatchingFilter).length} phòng khớp lọc
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* KHUNG SƠ ĐỒ 2D KIẾN TRÚC */}
                                <div className="relative bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
                                    {/* Lưới tọa độ Blueprint mờ ảo */}
                                    <div 
                                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{
                                            backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
                                            backgroundSize: '24px 24px'
                                        }}
                                    />

                                    <div className="min-w-[850px] flex flex-col gap-6 relative z-10">
                                        {/* DÃY BẮC */}
                                        {northWing.length > 0 && (
                                            <div>
                                                <div className="flex items-center mb-2 px-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                        <span>Dãy Phòng Hướng Bắc</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {northWing.map(room => {
                                                        const isMatched = isRoomMatchingFilter(room);
                                                        const isDimmed = isFilterActive && !isMatched;
                                                        return (
                                                            <Room2DPod
                                                                key={room.roomNumber}
                                                                room={room}
                                                                isSelected={selectedRoom?.roomNumber === room.roomNumber}
                                                                isDimmed={isDimmed}
                                                                isHighlighted={isFilterActive && isMatched}
                                                                activeBooking={getActiveBookingForRoom(room.roomNumber)}
                                                                doorPosition="bottom" // Cửa mở xuống hành lang
                                                                onSelect={() => handleRoomClick(room)}
                                                                onInspect={() => setInspectedRoom(room)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* HÀNH LANG CHÍNH (GRAND CENTRAL CORRIDOR) */}
                                        <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                                            {/* Vạch kẻ giữa hành lang; các tiện ích nằm đè lên như cửa mở ra hành lang */}
                                            <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-700/60 pointer-events-none" />

                                            <span className="relative px-2 rounded-md bg-slate-900 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 whitespace-nowrap">
                                                Hành lang tầng {floorNum}
                                            </span>

                                            <div className="relative flex flex-1 items-center justify-center gap-2 flex-nowrap">
                                                <CorridorChip icon={Layers} label="3 thang máy" />
                                                <CorridorChip icon={ShieldAlert} label="Lối thoát hiểm" tone="text-amber-400" />
                                            </div>

                                            <CorridorChip
                                                icon={Hotel}
                                                label={floorNum === 1 ? 'Quầy lễ tân' : 'Lounge phục vụ'}
                                                tone="text-indigo-300"
                                            />
                                        </div>

                                        {/* DÃY NAM */}
                                        {southWing.length > 0 && (
                                            <div>
                                                <div className="flex items-center mb-2 px-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                                        <span>Dãy Phòng Hướng Nam</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {southWing.map(room => {
                                                        const isMatched = isRoomMatchingFilter(room);
                                                        const isDimmed = isFilterActive && !isMatched;
                                                        return (
                                                            <Room2DPod
                                                                key={room.roomNumber}
                                                                room={room}
                                                                isSelected={selectedRoom?.roomNumber === room.roomNumber}
                                                                isDimmed={isDimmed}
                                                                isHighlighted={isFilterActive && isMatched}
                                                                activeBooking={getActiveBookingForRoom(room.roomNumber)}
                                                                doorPosition="top" // Cửa mở lên hành lang
                                                                onSelect={() => handleRoomClick(room)}
                                                                onInspect={() => setInspectedRoom(room)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 3. MODAL / DRAWER XEM CHI TIẾT PHÒNG 2D (ROOM INSPECTOR DIALOG) */}
            {inspectedRoom && (
                <div 
                    className="room-inspector-modal fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
                    onClick={() => setInspectedRoom(null)}
                >
                    <div 
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95)] ring-1 ring-white/10 select-none overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Thanh ambient glow ở trên cùng */}
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90" />

                        {/* Header Dialog */}
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
                                    {inspectedRoom.roomNumber}
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider border ${ROOM_TYPE_CONFIG[inspectedRoom.roomType]?.badge}`}>
                                        {ROOM_TYPE_CONFIG[inspectedRoom.roomType]?.label || inspectedRoom.roomType}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setInspectedRoom(null)}
                                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chi tiết thông số phòng */}
                        <div className="space-y-4">
                            {/* Trạng thái hiện tại */}
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tình trạng buồng phòng:</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${ROOM_STATUS_CONFIG[inspectedRoom.roomStatus]?.badge}`}>
                                    <span className={`w-2 h-2 rounded-full ${ROOM_STATUS_CONFIG[inspectedRoom.roomStatus]?.dot}`} />
                                    <span>{ROOM_STATUS_CONFIG[inspectedRoom.roomStatus]?.label || inspectedRoom.roomStatus}</span>
                                </span>
                            </div>

                            {/* Giá niêm yết */}
                            <div className="room-inspector-price-box p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/40 border border-emerald-200/90 dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-950/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
                                <div>
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-slate-400">Giá phòng/đêm</div>
                                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 tracking-tight font-mono">
                                        {formatCurrency(inspectedRoom.basePrice)}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span>Đã bao gồm VAT</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">& Bữa sáng Buffet</div>
                                </div>
                            </div>

                            {/* Thông số kiến trúc & Tiện nghi */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                                    <Bed className="w-4 h-4 text-indigo-400" />
                                    <div>
                                        <div className="text-slate-400 font-medium">Giường ngủ</div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{inspectedRoom.bedType}</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                                    <Wind className="w-4 h-4 text-blue-400" />
                                    <div>
                                        <div className="text-slate-400 font-medium">Diện tích phòng</div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{inspectedRoom.areaSquareMeters} m²</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                                    <Bath className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <div className="text-slate-400 font-medium">Phòng tắm</div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">Bồn tắm nằm & Vòi sen</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <div className="text-slate-400 font-medium">Kết nối internet</div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">Wifi 6 Tốc độ cao</div>
                                    </div>
                                </div>
                            </div>

                            {/* Khách hàng đang lưu trú (nếu có) */}
                            {(() => {
                                const activeBooking = getActiveBookingForRoom(inspectedRoom.roomNumber);
                                if (!activeBooking) return null;
                                return (
                                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5">
                                        <div className="font-bold text-rose-300 flex items-center justify-between">
                                            <span>Khách đang lưu trú:</span>
                                            <span className="font-black text-slate-900 dark:text-white">{activeBooking.customerName || `Khách #${activeBooking.customerId}`}</span>
                                        </div>
                                        <div className="text-slate-300 flex items-center justify-between">
                                            <span>Thời gian lưu trú:</span>
                                            <span>{activeBooking.checkInDate} → {activeBooking.checkOutDate} ({activeBooking.durationNights} đêm)</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Nút hành động */}
                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setInspectedRoom(null);
                                    if (onEdit) onEdit(inspectedRoom);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5"
                            >
                                <Pencil className="w-4 h-4 text-indigo-400" />
                                <span>Chỉnh Sửa Phòng</span>
                            </button>

                            {inspectedRoom.roomStatus === 'AVAILABLE' && onBookRoom && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInspectedRoom(null);
                                        onBookRoom(inspectedRoom);
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Tạo Đơn Đặt Phòng</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ô tiện ích nhỏ trên hành lang (thang máy, lối thoát hiểm, lễ tân)
function CorridorChip({ icon: Icon, label, tone = 'text-slate-300' }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold whitespace-nowrap ${tone}`}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
        </span>
    );
}

// COMPONENT CĂN PHÒNG 2D TRÊN MẶT BẰNG KIẾN TRÚC (ROOM 2D BLUEPRINT POD)
function Room2DPod({
    room, 
    isSelected, 
    isDimmed, 
    isHighlighted, 
    activeBooking, 
    doorPosition = 'bottom',
    onSelect, 
    onInspect
}) {
    const statusConfig = ROOM_STATUS_CONFIG[room.roomStatus] || ROOM_STATUS_CONFIG.AVAILABLE;
    const typeConfig = ROOM_TYPE_CONFIG[room.roomType] || ROOM_TYPE_CONFIG.STANDARD;

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '0 ₫';
        return `${Number(amount).toLocaleString('vi-VN')} ₫`;
    };

    return (
        <div
            onClick={onSelect}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onInspect) onInspect(room);
            }}
            className={`room-2d-card group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer select-none border-2 flex flex-col justify-between min-h-[115px] sm:min-h-[120px] ${
                isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-400/80 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xl scale-[1.02] z-20'
                    : isDimmed
                        ? 'opacity-30 grayscale-[70%] border-dashed border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/40 hover:opacity-90 hover:grayscale-0 hover:border-solid hover:scale-[1.01] hover:z-10'
                        : isHighlighted
                            ? `${statusConfig.border} ${statusConfig.bg} ring-2 ring-indigo-400/60 scale-[1.01] z-10 ${statusConfig.glow}`
                            : `${statusConfig.border} ${statusConfig.bg} hover:scale-[1.02] hover:z-10 ${statusConfig.glow}`
            }`}
        >
            {/* ĐÈN CHỈ BÁO CỬA RA VÀO KIẾN TRÚC & SMART RFID LOCK */}
            <div 
                className={`absolute left-6 w-8 h-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 flex items-center justify-center z-10 transition-all duration-300 shadow-xs ${
                    doorPosition === 'bottom' ? '-bottom-1' : '-top-1'
                } ${isDimmed ? 'opacity-40 group-hover:opacity-100' : 'opacity-100'}`}
                title="Cửa phòng & Đèn RFID"
            >
                {/* Đèn chỉ báo khóa cửa RFID */}
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            </div>

            {/* PHẦN ĐẦU CỦA PHÒNG: SỐ PHÒNG & HẠNG PHÒNG */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {room.roomNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${typeConfig.badge}`}>
                        {room.roomType}
                    </span>
                </div>

                {/* Huy hiệu trạng thái */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs whitespace-nowrap shrink-0 ${statusConfig.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    <span>{statusConfig.label}</span>
                </span>
            </div>

            {/* PHẦN CHÂN PHÒNG: GIÁ TIỀN & THÔNG TIN KHÁCH (NẾU CÓ) */}
            <div className="pt-2.5 border-t border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between text-xs mt-3">
                <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block leading-none">Giá phòng/đêm</span>
                    <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 inline-block">
                        {formatCurrency(room.basePrice)}
                    </span>
                </div>

                {activeBooking ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onInspect) onInspect(room);
                        }}
                        className="text-right cursor-pointer hover:opacity-85 transition-opacity"
                        title="Xem chi tiết khách đang lưu trú"
                    >
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block truncate max-w-[90px] underline decoration-rose-500/40">
                            {activeBooking.customerName || 'Đang ở'}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">
                            Check-out: {activeBooking.checkOutDate}
                        </span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onInspect) onInspect(room);
                        }}
                        className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-bold transition-colors flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Xem chi tiết phòng & đặt phòng"
                    >
                        <span>Chi tiết</span>
                        <span>→</span>
                    </button>
                )}
            </div>
        </div>
    );
}
