import { useState, useEffect } from 'react';
import { getGuests } from './services/customerService';
import { getRooms } from './services/roomService';
import { getBookings } from './services/bookingService';
import CustomerForm from './components/CustomerForm.jsx';
import CustomerTable from './components/CustomerTable.jsx';
import RoomForm from './components/RoomForm.jsx';
import RoomTable from './components/RoomTable.jsx';
import BookingForm from './components/BookingForm.jsx';
import BookingTable from './components/BookingTable.jsx';
// === [OPTIONAL EFFECT: React Bits Electric Logo & Particle Text] ===
import HotelElectricLogo from './components/electric-logo/HotelElectricLogo.jsx';
import ParticleText from './components/particle-text/ParticleText.jsx';
import { UsersIcon, BedIcon, BookmarkIcon, RefreshIcon, ExclamationTriangleIcon } from './components/Icons';

function App() {
    const [activeTab, setActiveTab] = useState('guests'); // 'guests' | 'rooms' | 'bookings'

    // Customer state
    const [guests, setGuests] = useState([]);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Room state
    const [rooms, setRooms] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);

    // Booking state
    const [bookings, setBookings] = useState([]);

    // General state
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    const fetchGuests = async () => {
        setLoading(true);
        setServerError(null);
        try {
            const res = await getGuests();
            setGuests(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách khách hàng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/guests`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        setLoading(true);
        setServerError(null);
        try {
            const res = await getRooms();
            setRooms(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách phòng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/rooms`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        setServerError(null);
        try {
            const res = await getBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách đặt phòng:", err);
            setServerError("Không thể kết nối đến Backend (`http://localhost:8080/hotel/bookings`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
        } finally {
            setLoading(false);
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
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 sm:px-5 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Khách hàng</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 block">{guests.length}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 sm:px-5 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tổng số phòng</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 block">{rooms.length}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <BedIcon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 sm:px-5 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Phòng sẵn sàng</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">{availableRoomsCount}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <BedIcon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 sm:px-5 flex items-center justify-between backdrop-blur-md hover:border-slate-700/60 transition-colors shadow-inner">
                            <div>
                                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">Đơn đang hiệu lực</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-1 block">{activeBookingsCount}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                                <BookmarkIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap gap-3" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'guests'}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'guests'
                                    ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/20'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                            }`}
                            onClick={() => {
                                setActiveTab('guests');
                                setEditingCustomer(null);
                            }}
                        >
                            <UsersIcon className="w-4 h-4" />
                            <span>Quản lý Khách Hàng</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                activeTab === 'guests' ? 'bg-blue-900/80 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {guests.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'rooms'}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'rooms'
                                    ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/20'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                            }`}
                            onClick={() => {
                                setActiveTab('rooms');
                                setEditingRoom(null);
                            }}
                        >
                            <BedIcon className="w-4 h-4" />
                            <span>Quản lý Phòng</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                activeTab === 'rooms' ? 'bg-blue-900/80 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {rooms.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'bookings'}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'bookings'
                                    ? 'bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/20'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                            }`}
                            onClick={() => {
                                setActiveTab('bookings');
                            }}
                        >
                            <BookmarkIcon className="w-4 h-4" />
                            <span>Quản lý Đặt Phòng</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                activeTab === 'bookings' ? 'bg-indigo-900/80 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {bookings.length}
                            </span>
                        </button>
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

                {/* Main Content Layout */}
                <main className="w-full">
                    {/* TAB 1: KHÁCH HÀNG */}
                    {activeTab === 'guests' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <section className="lg:col-span-4 w-full">
                                <CustomerForm
                                    key={editingCustomer ? editingCustomer.id : 'new-customer'}
                                    editingCustomer={editingCustomer}
                                    existingGuests={guests}
                                    onSaved={() => {
                                        setEditingCustomer(null);
                                        fetchGuests();
                                    }}
                                    onCancelEdit={() => setEditingCustomer(null)}
                                />
                            </section>

                            <section className="lg:col-span-8 w-full flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <UsersIcon className="w-5 h-5 text-blue-400" />
                                        <span>Danh Sách Khách Hàng</span>
                                    </h2>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                        onClick={fetchGuests}
                                        disabled={loading}
                                        aria-label="Làm mới danh sách khách hàng"
                                    >
                                        <RefreshIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                        <span>{loading ? 'Đang tải...' : 'Làm mới (GET)'}</span>
                                    </button>
                                </div>
                                <CustomerTable
                                    guests={guests}
                                    onEdit={(customer) => setEditingCustomer(customer)}
                                    onCustomerDeleted={fetchGuests}
                                />
                            </section>
                        </div>
                    )}

                    {/* TAB 2: PHÒNG KHÁCH SẠN */}
                    {activeTab === 'rooms' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <section className="lg:col-span-4 w-full">
                                <RoomForm
                                    key={editingRoom ? editingRoom.roomNumber : 'new-room'}
                                    editingRoom={editingRoom}
                                    existingRooms={rooms}
                                    onSaved={() => {
                                        setEditingRoom(null);
                                        fetchRooms();
                                    }}
                                    onCancelEdit={() => setEditingRoom(null)}
                                />
                            </section>

                            <section className="lg:col-span-8 w-full flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <BedIcon className="w-5 h-5 text-blue-400" />
                                        <span>Danh Sách Phòng</span>
                                    </h2>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                        onClick={fetchRooms}
                                        disabled={loading}
                                        aria-label="Làm mới danh sách phòng"
                                    >
                                        <RefreshIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                        <span>{loading ? 'Đang tải...' : 'Làm mới (GET)'}</span>
                                    </button>
                                </div>
                                <RoomTable
                                    rooms={rooms}
                                    onEdit={(room) => setEditingRoom(room)}
                                    onRoomDeleted={fetchRooms}
                                />
                            </section>
                        </div>
                    )}

                    {/* TAB 3: ĐẶT PHÒNG (BOOKINGS) */}
                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <section className="lg:col-span-4 w-full">
                                <BookingForm
                                    guests={guests}
                                    rooms={rooms}
                                    onSaved={() => {
                                        fetchBookings();
                                        fetchRooms(); // Đồng bộ trạng thái phòng
                                    }}
                                />
                            </section>

                            <section className="lg:col-span-8 w-full flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <BookmarkIcon className="w-5 h-5 text-indigo-400" />
                                        <span>Quản Lý Đặt Phòng (Bookings)</span>
                                    </h2>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                        onClick={() => {
                                            fetchBookings();
                                            fetchRooms();
                                            fetchGuests();
                                        }}
                                        disabled={loading}
                                        aria-label="Làm mới danh sách đặt phòng"
                                    >
                                        <RefreshIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                        <span>{loading ? 'Đang tải...' : 'Làm mới (GET)'}</span>
                                    </button>
                                </div>
                                <BookingTable
                                    bookings={bookings}
                                    loading={loading}
                                    onReload={() => {
                                        fetchBookings();
                                        fetchRooms();
                                    }}
                                />
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;