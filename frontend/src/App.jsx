import { useState, useEffect } from 'react';
import { getGuests } from './services/customerService';
import { getRooms } from './services/roomService';
import CustomerForm from './components/CustomerForm.jsx';
import CustomerTable from './components/CustomerTable.jsx';
import RoomForm from './components/RoomForm.jsx';
import RoomTable from './components/RoomTable.jsx';
import { UsersIcon, BedIcon, RefreshIcon, ExclamationTriangleIcon } from './components/Icons';

function App() {
    const [activeTab, setActiveTab] = useState('guests'); // 'guests' | 'rooms'

    // Customer state
    const [guests, setGuests] = useState([]);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Room state
    const [rooms, setRooms] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);

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

    // Tải dữ liệu ban đầu
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                const [guestRes, roomRes] = await Promise.all([getGuests(), getRooms()]);
                if (isMounted) {
                    setGuests(guestRes.data || []);
                    setRooms(roomRes.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Lỗi tải dữ liệu ban đầu:", err);
                    setServerError("Không thể kết nối đến Backend (`http://localhost:8080`). Hãy đảm bảo ứng dụng Spring Boot đã được khởi chạy!");
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
    const occupiedRoomsCount = rooms.filter(r => r.roomStatus === 'OCCUPIED' || r.roomStatus === 'BOOKED').length;

    return (
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
            <div className="w-full max-w-7xl flex flex-col gap-6">

                {/* Header Card with Liquid Glass style */}
                <header className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Background subtle glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            {/* Logo Khách Sạn Mới */}
                            <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-xl shadow-blue-900/20 flex-shrink-0 border border-slate-700/60 overflow-hidden flex items-center justify-center">
                                <img
                                    src="/hotel-logo.png"
                                    alt="Hotel Resort Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-luxury font-bold tracking-wide text-white uppercase">
                                    Hotel Management
                                </h1>
                            </div>
                        </div>

                        {/* Metric Counter Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 self-stretch lg:self-auto">
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-center backdrop-blur-md">
                                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Khách hàng</span>
                                <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{guests.length}</span>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-center backdrop-blur-md">
                                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Tổng số phòng</span>
                                <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{rooms.length}</span>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-center backdrop-blur-md">
                                <span className="text-[11px] font-medium text-emerald-400 block uppercase tracking-wider">Phòng sẵn sàng</span>
                                <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">{availableRoomsCount}</span>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-center backdrop-blur-md">
                                <span className="text-[11px] font-medium text-amber-400 block uppercase tracking-wider">Đang thuê / đặt</span>
                                <span className="text-lg font-extrabold text-amber-400 font-mono mt-0.5 block">{occupiedRoomsCount}</span>
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
                            <span>Quản lý Phòng Khách Sạn</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                activeTab === 'rooms' ? 'bg-blue-900/80 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {rooms.length}
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
                            onClick={activeTab === 'guests' ? fetchGuests : fetchRooms}
                        >
                            <RefreshIcon className="w-3.5 h-3.5" />
                            <span>Thử kết nối lại</span>
                        </button>
                    </div>
                )}

                {/* Main Content Layout */}
                <main className="w-full">
                    {activeTab === 'guests' ? (
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
                    ) : (
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
                </main>
            </div>
        </div>
    );
}

export default App;