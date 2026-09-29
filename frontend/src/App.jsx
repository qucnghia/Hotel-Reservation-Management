import { useState, useEffect } from 'react';
import { getGuests, deleteGuest } from './services/customerService';
import { getRooms, deleteRoom } from './services/roomService';
import { getBookings } from './services/bookingService';
import CustomerForm from './components/CustomerForm.jsx';
import CustomerTable from './components/CustomerTable.jsx';
import RoomForm from './components/RoomForm.jsx';
import RoomTable from './components/RoomTable.jsx';
import BookingForm from './components/BookingForm.jsx';
import BookingTable from './components/BookingTable.jsx';
import CustomerBookingHistoryModal from './components/CustomerBookingHistoryModal.jsx';
// === [OPTIONAL EFFECT: React Bits Electric Logo & Particle Text] ===
import HotelElectricLogo from './components/electric-logo/HotelElectricLogo.jsx';
import ParticleText from './components/particle-text/ParticleText.jsx';
// === [PACKAGE MORPH-ICONS: Nút Menu Morphing (Menu <-> X)] ===
import { MorphMenuButton } from './components/morph-icons';
import { UsersIcon, BedIcon, BookmarkIcon, RefreshIcon, ExclamationTriangleIcon, PlusIcon, PencilIcon, TrashIcon, HistoryIcon } from './components/Icons';

function App() {
    const [activeTab, setActiveTab] = useState('guests'); // 'guests' | 'rooms' | 'bookings'
    const [menuOpen, setMenuOpen] = useState(false);
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
        }
    }, [activeTab]);

    // 2. Tự động làm mới dữ liệu ngầm định kỳ (mỗi 5 giây) để cập nhật dữ liệu mới nhất
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'guests') {
                fetchGuests(true);
            } else if (activeTab === 'rooms') {
                fetchRooms(true);
            } else if (activeTab === 'bookings') {
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

    const handleRefreshCurrentTab = () => {
        if (activeTab === 'guests') fetchGuests();
        else if (activeTab === 'rooms') fetchRooms();
        else fetchBookings();
    };

    return (
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
            <div className="w-full max-w-7xl flex flex-col gap-6">

                {/* Header Card with Liquid Glass style */}
                <header className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Background subtle glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    {/* HÀNG 1: LOGO VÀ TIÊU ĐỀ TO TRÀN ĐẦY 1 DÒNG */}
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 sm:gap-8 w-full py-2">
                        {/* === [BẮT ĐẦU: HIỆU ỨNG ELECTRIC LOGO (REACT BITS)] ===
                            Thư mục chứa hiệu ứng: src/components/electric-logo/
                            Khi không cần dùng nữa: chỉ việc xóa component này và thư mục trên! */}
                        <HotelElectricLogo
                            src="/hotel-building-logo.png"
                            size="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72"
                            glowColor="#1173fb"
                            scale={1}
                            intensity={0.5}
                            glow={0.8}
                            fill={0}
                            thickness={0.5}
                            strands={6}
                            bend={0}
                            crackle={0}
                            arcs={0.4}
                            flicker={0.6}
                            speed={0}
                            interactive={true}
                            cursorIntensity={2}
                            cursorRadius={180}
                        />
                        {/* === [KẾT THÚC: HIỆU ỨNG ELECTRIC LOGO] === */}

                        {/* === [BẮT ĐẦU: HIỆU ỨNG PARTICLE TEXT (REACT BITS)] ===
                            Thư mục chứa hiệu ứng: src/components/particle-text/
                            Khi không cần dùng nữa: chỉ việc xóa component này và thư mục trên! */}
                        <div className="flex-1 w-full min-w-0 h-36 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center">
                            <ParticleText
                                text="HOTEL MANAGEMENT"
                                fontSize="clamp(2.5rem, 5.5vw, 5rem)"
                                fontWeight={900}
                                fontFamily="'Playfair Display SC', Georgia, serif"
                                color="#ffffff"
                                highlightColor="#f59e0b" // hoặc #eab308, #d97706
                                particleSize={3.2}
                                density={2}
                                scatter={110}
                                gatherDuration={1300}
                                pointerRepel={50}
                                repelRadius={120}
                                idleDrift={0.15}
                                glow={true}
                                className="w-full h-full"
                            />
                        </div>
                        {/* === [KẾT THÚC: HIỆU ỨNG PARTICLE TEXT] === */}
                    </div>

                    {/* HÀNG 2: SỐ LIỆU THỐNG KÊ 1 DÒNG RIÊNG */}
                    <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full mt-4 pt-5 border-t border-slate-800/80">
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-4 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Khách hàng</span>
                                <span className="text-3xl sm:text-4xl font-black text-white mt-1 block">{guests.length}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-4 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Tổng số phòng</span>
                                <span className="text-3xl sm:text-4xl font-black text-white mt-1 block">{rooms.length}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <BedIcon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-4 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider block">Phòng sẵn sàng</span>
                                <span className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 block">{availableRoomsCount}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <BedIcon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-4 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-sm font-bold text-sky-400 uppercase tracking-wider block">Đơn đang hiệu lực</span>
                                <span className="text-3xl sm:text-4xl font-black text-sky-400 mt-1 block">{activeBookingsCount}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                                <BookmarkIcon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Thanh điều khiển Danh mục & Nút MorphMenuButton */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-base">
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Đang quản lý:</span>
                            <span className="font-extrabold text-white flex items-center gap-2 text-base">
                                {activeTab === 'guests' && <><UsersIcon className="w-5 h-5 text-blue-400" /> Quản lý Khách Hàng ({guests.length})</>}
                                {activeTab === 'rooms' && <><BedIcon className="w-5 h-5 text-indigo-400" /> Quản lý Phòng ({rooms.length})</>}
                                {activeTab === 'bookings' && <><BookmarkIcon className="w-5 h-5 text-purple-400" /> Quản lý Đặt Phòng ({bookings.length})</>}
                            </span>
                        </div>

                        {/* === [PACKAGE MORPH-ICONS: Nút Menu Morphing (Menu <-> X)] === */}
                        <div className="flex items-center gap-2">
                            <MorphMenuButton
                                open={menuOpen}
                                setOpen={setMenuOpen}
                                label={menuOpen ? "Đóng danh mục" : "Menu quản lý"}
                                title="Bấm để mở / đóng 3 ô quản lý"
                            />
                        </div>
                    </div>

                    {/* 3 Ô Quản Lý (Hiện ra khi bấm MorphMenuButton) */}
                    {menuOpen && (
                        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
                            {/* Ô 1: Quản lý Khách Hàng */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('guests');
                                    setEditingCustomer(null);
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                                    activeTab === 'guests'
                                        ? 'bg-gradient-to-r from-blue-700/90 via-indigo-600/90 to-blue-600/90 text-white border-blue-400/40 shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${
                                        activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        <UsersIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white">Quản lý Khách Hàng</div>
                                        <div className="text-xs text-slate-400 mt-0.5">Hồ sơ, hạng VIP & lịch sử</div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {guests.length} khách
                                </span>
                            </button>

                            {/* Ô 2: Quản lý Phòng */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('rooms');
                                    setEditingRoom(null);
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                                    activeTab === 'rooms'
                                        ? 'bg-gradient-to-r from-blue-700/90 via-indigo-600/90 to-blue-600/90 text-white border-blue-400/40 shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${
                                        activeTab === 'rooms' ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                                    }`}>
                                        <BedIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white">Quản lý Phòng</div>
                                        <div className="text-xs text-slate-400 mt-0.5">Loại phòng, giá & tình trạng</div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    activeTab === 'rooms' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {rooms.length} phòng
                                </span>
                            </button>

                            {/* Ô 3: Quản lý Đặt Phòng */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('bookings');
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                                    activeTab === 'bookings'
                                        ? 'bg-gradient-to-r from-indigo-700/90 via-purple-600/90 to-indigo-600/90 text-white border-indigo-400/40 shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${
                                        activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                        <BookmarkIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white">Quản lý Đặt Phòng</div>
                                        <div className="text-xs text-slate-400 mt-0.5">Check-in, check-out & hóa đơn</div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {bookings.length} đơn
                                </span>
                            </button>
                        </div>
                    )}
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

                {/* Main Content Layout */}
                <main className="w-full">
                    {/* TAB 1: KHÁCH HÀNG */}
                    {activeTab === 'guests' && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
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
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 active:bg-blue-500/35 text-blue-300 border border-blue-500/30 text-sm sm:text-base font-bold shadow-lg transition-all cursor-pointer"
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
                                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                                    <BedIcon className="w-6 h-6 text-indigo-400" />
                                    <span>Danh Sách Phòng</span>
                                </h2>
                                <div className="flex items-center gap-2.5 flex-wrap">
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
                                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
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

                            {showBookingForm && (
                                <BookingForm
                                    guests={guests}
                                    rooms={rooms}
                                    bookings={bookings}
                                    onSaved={() => {
                                        fetchBookings();
                                        fetchRooms(); // Đồng bộ trạng thái phòng
                                        fetchGuests(); // Đồng bộ chi tiêu và hạng hội viên khách hàng
                                        setShowBookingForm(false);
                                    }}
                                    onClose={() => setShowBookingForm(false)}
                                />
                            )}
                        </div>
                    )}
                </main>

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