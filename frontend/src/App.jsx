import { useState, useEffect } from 'react';
import { getGuests, deleteGuest } from './services/customerService';
import { getRooms, deleteRoom } from './services/roomService';
import { getBookings } from './services/bookingService';
import {
    CustomerForm,
    CustomerTable,
    RoomForm,
    RoomTable,
    BookingForm,
    BookingTable,
    CustomerBookingHistoryModal,
    HotelFloorPlan2D,
    RevenueManagement,
    ThemeToggle,
    MorphMenuButton,
    UsersIcon,
    BedIcon,
    BookmarkIcon,
    RefreshIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    HistoryIcon,
    MapIcon,
    TableIcon,
    TrendingUpIcon,
    BanknotesIcon
} from './components';

function App() {
    const [activeTab, setActiveTab] = useState('rooms'); // 'guests' | 'rooms' | 'bookings' | 'revenue'
    const [roomViewMode, setRoomViewMode] = useState('2d'); // '2d' | 'table'
    const [bookingInitialRoom, setBookingInitialRoom] = useState('');
    const [menuOpen, setMenuOpen] = useState(true);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);

    // Customer state
    const [guests, setGuests] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewingHistoryCustomer, setViewingHistoryCustomer] = useState(null);

    // Room state
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);

    // Booking state
    const [bookings, setBookings] = useState([]);

    // General state
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    // Đồng bộ khách hàng đang chọn khi danh sách khách thay đổi (nếu có khách đang được chọn)
    useEffect(() => {
        if (selectedCustomer) {
            const found = guests.find(g => g.id === selectedCustomer.id);
            if (!found) setSelectedCustomer(null);
            else setSelectedCustomer(found);
        }
    }, [guests]);

    // Đồng bộ phòng đang chọn khi danh sách phòng thay đổi (nếu có phòng đang được chọn)
    useEffect(() => {
        if (selectedRoom) {
            const found = rooms.find(r => r.roomNumber === selectedRoom.roomNumber);
            if (!found) setSelectedRoom(null);
            else setSelectedRoom(found);
        }
    }, [rooms]);

    // Xóa khách hàng
    const handleDeleteCustomer = async (id, name) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa khách hàng "${name || id}" (ID: #${id}) không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteGuest(id);
            alert(`Đã xóa thành công khách hàng #${id}!`);
            if (editingCustomer?.id === id) {
                setEditingCustomer(null);
                setShowCustomerForm(false);
            }
            fetchGuests();
        } catch (err) {
            console.error('Lỗi khi xóa khách hàng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa khách hàng!';
            alert(`Lỗi khi xóa: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    // Xóa phòng
    const handleDeleteRoom = async (roomNumber) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa phòng #${roomNumber} không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteRoom(roomNumber);
            alert(`Đã xóa thành công phòng #${roomNumber}!`);
            if (editingRoom?.roomNumber === roomNumber) {
                setEditingRoom(null);
                setShowRoomForm(false);
            }
            fetchRooms();
        } catch (err) {
            console.error('Lỗi khi xóa phòng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa phòng!';
            alert(`Lỗi khi xóa: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const fetchGuests = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        setServerError(null);
        try {
            const res = await getGuests();
            setGuests(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách khách hàng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/guests`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const fetchRooms = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        setServerError(null);
        try {
            const res = await getRooms();
            setRooms(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách phòng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/rooms`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const fetchBookings = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        setServerError(null);
        try {
            const res = await getBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách đặt phòng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/bookings`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    // Tải dữ liệu ban đầu
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                const [guestRes, roomRes, bookingRes] = await Promise.allSettled([
                    getGuests(),
                    getRooms(),
                    getBookings()
                ]);

                if (isMounted) {
                    if (guestRes.status === 'fulfilled') setGuests(guestRes.value.data || []);
                    if (roomRes.status === 'fulfilled') setRooms(roomRes.value.data || []);
                    if (bookingRes.status === 'fulfilled') setBookings(bookingRes.value.data || []);

                    if (guestRes.status === 'rejected' && roomRes.status === 'rejected') {
                        setServerError("Không thể kết nối đến Backend (`http://localhost:8080`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Lỗi tải dữ liệu ban đầu:", err);
                    setServerError("Không thể kết nối đến Backend (`http://localhost:8080`).");
                }
            }
        };

        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, []);

    // 1. Tự động làm mới dữ liệu khi người dùng chuyển tab (không cần bấm nút)
    useEffect(() => {
        if (activeTab === 'guests') fetchGuests();
        else if (activeTab === 'rooms') fetchRooms();
        else if (activeTab === 'bookings') {
            fetchBookings();
            fetchRooms(true);
            fetchGuests(true);
        } else if (activeTab === 'revenue') {
            fetchBookings(true);
            fetchRooms(true);
            fetchGuests(true);
        }
    }, [activeTab]);

    // 2. Tự động làm mới dữ liệu ngầm định kỳ (mỗi 5 giây) để cập nhật dữ liệu mới nhất
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'guests') {
                fetchGuests(true);
            } else if (activeTab === 'rooms') {
                fetchRooms(true);
            } else if (activeTab === 'bookings' || activeTab === 'revenue') {
                fetchBookings(true);
                fetchRooms(true);
                fetchGuests(true);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // 3. Tự động làm mới ngay khi người dùng quay lại cửa sổ ứng dụng
    useEffect(() => {
        const handleFocus = () => {
            fetchGuests(true);
            fetchRooms(true);
            fetchBookings(true);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Thống kê nhanh
    const availableRoomsCount = rooms.filter(r => r.roomStatus === 'AVAILABLE').length;
    const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN').length;
    const totalRevenueRealized = bookings
        .filter(b => b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN')
        .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

    const handleRefreshCurrentTab = () => {
        if (activeTab === 'guests') fetchGuests();
        else if (activeTab === 'rooms') fetchRooms();
        else if (activeTab === 'bookings') fetchBookings();
        else if (activeTab === 'revenue') {
            fetchBookings();
            fetchRooms();
            fetchGuests();
        }
    };

    return (
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
            <div className="w-full max-w-[1600px] flex flex-col gap-6">

                {/* Header Card with Liquid Glass style */}
                <header className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Background subtle glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    {/* HÀNG 1: LOGO VÀ TIÊU ĐỀ & CHUYỂN ĐỔI GIAO DIỆN */}
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 w-full py-2">
                        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                            {/* Logo Khách Sạn */}
                            <div className="w-24 sm:w-32 md:w-40 h-20 sm:h-24 md:h-28 rounded-2xl bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-900/15 border border-slate-700/60 transition-transform duration-300 hover:scale-105">
                                <img
                                    src="/hotel-building-logo.png"
                                    alt="Hotel Management Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Tiêu đề Khách Sạn */}
                            <div className="text-center sm:text-left flex flex-col justify-center">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider text-slate-900 dark:text-white uppercase font-luxury leading-tight">
                                    Hotel Management
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-2 font-semibold tracking-widest uppercase">
                                    Hệ thống quản trị và điều hành khách sạn
                                </p>
                            </div>
                        </div>

                        {/* Nút Chuyển Đổi Giao Diện Sáng / Tối */}
                        <div className="flex items-center self-center sm:self-auto">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Thanh điều khiển Danh mục & Nút MorphMenuButton */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-start flex-wrap gap-3">
                        {/* === [PACKAGE MORPH-ICONS: Nút Menu Morphing (Quản lý khách sạn) ở góc trái] === */}
                        <MorphMenuButton
                            open={menuOpen}
                            setOpen={setMenuOpen}
                            label="Quản lý khách sạn"
                            title="Bấm để mở / thu gọn menu bên trái"
                            className="px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"
                        />

                        {/* Thẻ hiển thị phân hệ đang quản lý */}
                        <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-base shadow-sm">
                            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Đang quản lý:</span>
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                                {activeTab === 'guests' && <><UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Quản lý Khách Hàng ({guests.length})</>}
                                {activeTab === 'rooms' && <><BedIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Quản lý Phòng ({rooms.length})</>}
                                {activeTab === 'bookings' && <><BookmarkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Quản lý Đặt Phòng ({bookings.length})</>}
                                {activeTab === 'revenue' && <><TrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Quản lý Doanh Thu & Tài Chính</>}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Server Error Notification */}
                {serverError && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300 text-sm shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-amber-400" />
                            <span>{serverError}</span>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                            onClick={handleRefreshCurrentTab}
                        >
                            <RefreshIcon className="w-3.5 h-3.5" />
                            <span>Thử kết nối lại</span>
                        </button>
                    </div>
                )}

                {/* 2-Column Layout: Sidebar Menu bên trái & Nội dung quản lý bên phải */}
                <div className="w-full flex flex-col lg:flex-row items-start gap-6">
                    {/* CỘT TRÁI: THANH MENU ĐIỀU HÀNH (SIDEBAR NAVIGATION) */}
                    {menuOpen && (
                        <aside className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 flex flex-col gap-4 animate-fadeIn lg:sticky lg:top-6 z-20">
                            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-3 relative overflow-hidden">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Menu Quản Lý
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                                        4 mục
                                    </span>
                                </div>

                                {/* Danh sách 4 nút menu xếp dọc - MỖI NÚT TRÊN 1 DÒNG DUY NHẤT */}
                                <nav className="flex flex-col gap-2">
                                    {/* Mục 1: Khách Hàng */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('guests');
                                            setEditingCustomer(null);
                                        }}
                                        className={`w-full px-3.5 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group whitespace-nowrap ${
                                            activeTab === 'guests'
                                                ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white border-blue-400/40 shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30'
                                                : 'bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            }`}>
                                                <UsersIcon className="w-4.5 h-4.5" />
                                            </div>
                                            <span className="font-bold text-sm whitespace-nowrap">Quản lý Khách Hàng</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                            activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {guests.length} khách
                                        </span>
                                    </button>

                                    {/* Mục 2: Phòng */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('rooms');
                                            setEditingRoom(null);
                                        }}
                                        className={`w-full px-3.5 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group whitespace-nowrap ${
                                            activeTab === 'rooms'
                                                ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white border-amber-300/40 shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/30'
                                                : 'bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                activeTab === 'rooms' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                <BedIcon className="w-4.5 h-4.5" />
                                            </div>
                                            <span className="font-bold text-sm whitespace-nowrap">Quản lý Phòng</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                            activeTab === 'rooms' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {rooms.length} phòng
                                        </span>
                                    </button>

                                    {/* Mục 3: Đặt Phòng */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('bookings')}
                                        className={`w-full px-3.5 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group whitespace-nowrap ${
                                            activeTab === 'bookings'
                                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white border-purple-400/40 shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/30'
                                                : 'bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                            }`}>
                                                <BookmarkIcon className="w-4.5 h-4.5" />
                                            </div>
                                            <span className="font-bold text-sm whitespace-nowrap">Quản lý Đặt Phòng</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                            activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {bookings.length} đơn
                                        </span>
                                    </button>

                                    {/* Mục 4: Doanh Thu */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('revenue')}
                                        className={`w-full px-3.5 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group whitespace-nowrap ${
                                            activeTab === 'revenue'
                                                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/30'
                                                : 'bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                activeTab === 'revenue' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                                <TrendingUpIcon className="w-4.5 h-4.5" />
                                            </div>
                                            <span className="font-bold text-sm whitespace-nowrap">Báo Cáo Doanh Thu</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                            activeTab === 'revenue' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                            Tài chính
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* CỘT PHẢI: NỘI DUNG CHÍNH (MAIN CONTENT) */}
                    <main className="flex-1 w-full min-w-0">
                    {/* TAB 1: KHÁCH HÀNG */}
                    {activeTab === 'guests' && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <UsersIcon className="w-6 h-6 text-blue-400" />
                                    <span>Danh Sách Khách Hàng</span>
                                </h2>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCustomer(null);
                                            setSelectedCustomer(null);
                                            setShowCustomerForm(true);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Tạo Hồ Sơ Khách Hàng</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedCustomer) {
                                                setViewingHistoryCustomer(selectedCustomer);
                                            } else if (guests.length > 0) {
                                                setViewingHistoryCustomer(guests[0]);
                                            } else {
                                                alert('Chưa có khách hàng nào trong hệ thống!');
                                            }
                                        }}
                                        title="Xem lịch sử đặt phòng"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/25 active:bg-blue-200 dark:active:bg-blue-500/35 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-sm sm:text-base font-bold shadow-sm dark:shadow-lg transition-all cursor-pointer"
                                    >
                                        <HistoryIcon className="w-4 h-4" />
                                        <span>Lịch Sử</span>
                                    </button>
                                </div>
                            </div>

                            <CustomerTable
                                guests={guests}
                                selectedCustomer={selectedCustomer}
                                onSelectCustomer={(c) => setSelectedCustomer(c)}
                                onEdit={(customer) => {
                                    setEditingCustomer(customer);
                                    setSelectedCustomer(customer);
                                    setShowCustomerForm(true);
                                }}
                                onClearSelection={() => setSelectedCustomer(null)}
                            />

                            {showCustomerForm && (
                                <CustomerForm
                                    key={editingCustomer ? editingCustomer.id : 'new-customer'}
                                    editingCustomer={editingCustomer}
                                    existingGuests={guests}
                                    onSaved={() => {
                                        setEditingCustomer(null);
                                        setSelectedCustomer(null);
                                        setShowCustomerForm(false);
                                        fetchGuests();
                                    }}
                                    onCancelEdit={() => {
                                        setEditingCustomer(null);
                                        setSelectedCustomer(null);
                                        setShowCustomerForm(false);
                                    }}
                                    onClose={() => {
                                        setEditingCustomer(null);
                                        setSelectedCustomer(null);
                                        setShowCustomerForm(false);
                                    }}
                                    onDelete={handleDeleteCustomer}
                                    onViewHistory={(customer) => {
                                        setShowCustomerForm(false);
                                        setViewingHistoryCustomer(customer);
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* TAB 2: PHÒNG KHÁCH SẠN */}
                    {activeTab === 'rooms' && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <BedIcon className="w-6 h-6 text-indigo-400" />
                                    <span>Quản Lý Buồng Phòng</span>
                                </h2>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Toggle Sơ đồ 2D / Dạng Bảng */}
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => setRoomViewMode('2d')}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                                roomViewMode === '2d'
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <MapIcon className="w-4 h-4" />
                                            <span>Sơ Đồ 2D</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRoomViewMode('table')}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                                roomViewMode === 'table'
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <TableIcon className="w-4 h-4" />
                                            <span>Dạng Bảng</span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingRoom(null);
                                            setSelectedRoom(null);
                                            setShowRoomForm(true);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Tạo Phòng Ở Mới</span>
                                    </button>
                                </div>
                            </div>

                            {roomViewMode === '2d' ? (
                                <HotelFloorPlan2D
                                    rooms={rooms}
                                    bookings={bookings}
                                    selectedRoom={selectedRoom}
                                    onSelectRoom={(r) => setSelectedRoom(r)}
                                    onClearSelection={() => setSelectedRoom(null)}
                                    onEdit={(room) => {
                                        setEditingRoom(room);
                                        setSelectedRoom(room);
                                        setShowRoomForm(true);
                                    }}
                                    onBookRoom={(room) => {
                                        setBookingInitialRoom(room.roomNumber);
                                        setShowBookingForm(true);
                                    }}
                                    onAddNewRoom={() => {
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(true);
                                    }}
                                />
                            ) : (
                                <RoomTable
                                    rooms={rooms}
                                    selectedRoom={selectedRoom}
                                    onSelectRoom={(r) => setSelectedRoom(r)}
                                    onEdit={(room) => {
                                        setEditingRoom(room);
                                        setSelectedRoom(room);
                                        setShowRoomForm(true);
                                    }}
                                    onClearSelection={() => setSelectedRoom(null)}
                                />
                            )}

                            {showRoomForm && (
                                <RoomForm
                                    key={editingRoom ? editingRoom.roomNumber : 'new-room'}
                                    editingRoom={editingRoom}
                                    existingRooms={rooms}
                                    onSaved={() => {
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(false);
                                        fetchRooms();
                                    }}
                                    onCancelEdit={() => {
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(false);
                                    }}
                                    onClose={() => {
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(false);
                                    }}
                                    onDelete={handleDeleteRoom}
                                />
                            )}
                        </div>
                    )}

                    {/* TAB 3: ĐẶT PHÒNG (BOOKINGS) */}
                    {activeTab === 'bookings' && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <BookmarkIcon className="w-6 h-6 text-purple-400" />
                                    <span>Quản Lý Đặt Phòng (Bookings)</span>
                                </h2>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingForm(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Tạo Đơn Đặt Phòng</span>
                                    </button>
                                </div>
                            </div>

                            <BookingTable
                                bookings={bookings}
                                loading={loading}
                                onReload={() => {
                                    fetchBookings();
                                    fetchRooms();
                                    fetchGuests();
                                }}
                            />
                        </div>
                    )}

                    {/* TAB 4: QUẢN LÝ DOANH THU & TÀI CHÍNH */}
                    {activeTab === 'revenue' && (
                        <RevenueManagement
                            bookings={bookings}
                            rooms={rooms}
                            guests={guests}
                            onRefresh={async () => {
                                await Promise.allSettled([
                                    fetchBookings(true),
                                    fetchRooms(true),
                                    fetchGuests(true)
                                ]);
                            }}
                        />
                    )}
                </main>
            </div>

                {/* Modal Tạo Đơn Đặt Phòng (dùng chung cho cả Tab Đặt Phòng & Sơ Đồ 2D Khách Sạn) */}
                {showBookingForm && (
                    <BookingForm
                        guests={guests}
                        rooms={rooms}
                        bookings={bookings}
                        initialRoomNumber={bookingInitialRoom}
                        onSaved={() => {
                            fetchBookings();
                            fetchRooms(); // Đồng bộ trạng thái phòng
                            fetchGuests(); // Đồng bộ chi tiêu và hạng hội viên khách hàng
                            setShowBookingForm(false);
                            setBookingInitialRoom('');
                        }}
                        onClose={() => {
                            setShowBookingForm(false);
                            setBookingInitialRoom('');
                        }}
                    />
                )}

                {/* Modal Xem Lịch Sử Đặt Phòng Của Khách Hàng */}
                {viewingHistoryCustomer && (
                    <CustomerBookingHistoryModal
                        customer={viewingHistoryCustomer}
                        guests={guests}
                        onSelectCustomer={(c) => setViewingHistoryCustomer(c)}
                        onClose={() => setViewingHistoryCustomer(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;