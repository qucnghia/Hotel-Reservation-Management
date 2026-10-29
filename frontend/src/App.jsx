import { useState, useEffect } from 'react';
import { getGuests, deleteGuest } from './services/customerService';
import { getRooms, deleteRoom } from './services/roomService';
import { getBookings } from './services/bookingService';
import {
    CustomerForm,
    CustomerTable,
    RoomForm,
    BookingForm,
    BookingTable,
    CustomerBookingHistoryModal,
    HotelFloorPlan2D,
    RevenueManagement,
    RoomCalendar,
    ServiceCatalog,
    ThemeToggle,
    UsersIcon,
    BedIcon,
    BookmarkIcon,
    RefreshIcon,
    PlusIcon,
    HistoryIcon,
    MapIcon,
    CalendarIcon,
    TrendingUpIcon,
    ConciergeBellIcon,
    MenuIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from './components';
import { Alert, Button, PageHeader, Segmented } from './components/ui';
import { useToast } from './utils/toast.js';

const NAV_ITEMS = [
    { id: 'rooms', label: 'Phòng', icon: BedIcon },
    { id: 'bookings', label: 'Đặt phòng', icon: BookmarkIcon },
    { id: 'guests', label: 'Khách hàng', icon: UsersIcon },
    { id: 'services', label: 'Dịch vụ', icon: ConciergeBellIcon },
    { id: 'revenue', label: 'Doanh thu', icon: TrendingUpIcon }
];

const ROOM_VIEWS = [
    { value: '2d', label: 'Sơ đồ', icon: MapIcon },
    { value: 'calendar', label: 'Lịch', icon: CalendarIcon }
];

function App() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('rooms'); // 'guests' | 'rooms' | 'bookings' | 'revenue'
    const [roomViewMode, setRoomViewMode] = useState('2d'); // '2d' | 'calendar'
    const [bookingInitialRoom, setBookingInitialRoom] = useState('');
    const [bookingInitialCheckIn, setBookingInitialCheckIn] = useState('');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(() => {
        try {
            return localStorage.getItem('hotel_nav_collapsed') === 'true';
        } catch {
            return false;
        }
    });
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);

    // Customer state
    const [guests, setGuests] = useState([]);
    const [pickedCustomer, setSelectedCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewingHistoryCustomer, setViewingHistoryCustomer] = useState(null);

    // Room state
    const [rooms, setRooms] = useState([]);
    const [pickedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);

    // Booking state
    const [bookings, setBookings] = useState([]);

    // General state
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    // Lấy bản mới nhất của khách/phòng đang chọn từ danh sách vừa tải (biến mất nếu đã bị xoá)
    const selectedCustomer = pickedCustomer ? guests.find(g => g.id === pickedCustomer.id) ?? null : null;
    const selectedRoom = pickedRoom ? rooms.find(r => r.roomNumber === pickedRoom.roomNumber) ?? null : null;

    // Xóa khách hàng
    const handleDeleteCustomer = async (id, name) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa khách hàng "${name || id}" (ID: #${id}) không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteGuest(id);
            toast.success(`Đã xoá khách hàng ${name || `#${id}`}.`);
            if (editingCustomer?.id === id) {
                setEditingCustomer(null);
                setShowCustomerForm(false);
            }
            fetchGuests();
        } catch (err) {
            console.error('Lỗi khi xóa khách hàng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa khách hàng!';
            toast.error(typeof msg === 'string' ? msg : 'Không thể xoá khách hàng.');
        }
    };

    // Xóa phòng
    const handleDeleteRoom = async (roomNumber) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa phòng #${roomNumber} không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteRoom(roomNumber);
            toast.success(`Đã xoá phòng ${roomNumber}.`);
            if (editingRoom?.roomNumber === roomNumber) {
                setEditingRoom(null);
                setShowRoomForm(false);
            }
            fetchRooms();
        } catch (err) {
            console.error('Lỗi khi xóa phòng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa phòng!';
            toast.error(typeof msg === 'string' ? msg : 'Không thể xoá phòng.');
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
            setServerError("Không kết nối được tới máy chủ (http://localhost:8080). Hãy kiểm tra backend Spring Boot đã chạy chưa.");
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
            setServerError("Không kết nối được tới máy chủ (http://localhost:8080). Hãy kiểm tra backend Spring Boot đã chạy chưa.");
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
            setServerError("Không kết nối được tới máy chủ (http://localhost:8080). Hãy kiểm tra backend Spring Boot đã chạy chưa.");
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
                        setServerError("Không kết nối được tới máy chủ (http://localhost:8080). Hãy kiểm tra backend Spring Boot đã chạy chưa.");
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Lỗi tải dữ liệu ban đầu:", err);
                    setServerError("Không kết nối được tới máy chủ (http://localhost:8080).");
                }
            }
        };

        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Làm mới ngầm toàn bộ dữ liệu khi người dùng chuyển tab
    const switchTab = (tab) => {
        setActiveTab(tab);
        setMobileNavOpen(false);
        setEditingCustomer(null);
        setEditingRoom(null);
        fetchGuests(true);
        fetchRooms(true);
        fetchBookings(true);
    };

    // Tự động làm mới ngay khi người dùng quay lại cửa sổ ứng dụng
    useEffect(() => {
        const handleFocus = () => {
            fetchGuests(true);
            fetchRooms(true);
            fetchBookings(true);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const reloadAll = () => {
        fetchGuests();
        fetchRooms();
        fetchBookings();
    };

    const openNewRoom = () => {
        setEditingRoom(null);
        setSelectedRoom(null);
        setShowRoomForm(true);
    };

    const openEditRoom = (room) => {
        setEditingRoom(room);
        setSelectedRoom(room);
        setShowRoomForm(true);
    };

    const toggleNav = () => {
        setNavCollapsed(prev => {
            try {
                localStorage.setItem('hotel_nav_collapsed', String(!prev));
            } catch {
                // Không lưu được thì chỉ không nhớ lựa chọn cho lần sau
            }
            return !prev;
        });
    };

    // collapsed: chỉ hiện icon (dùng cho sidebar màn hình lớn); ngăn kéo điện thoại luôn mở rộng
    const renderSidebar = (collapsed) => (
        <div className="flex h-full flex-col">
            <div className={`flex items-center gap-2.5 py-4 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
                <img src="/hotel-building-logo.png" alt="" className="h-8 w-8 shrink-0 rounded-lg border border-line bg-white object-contain p-0.5" />
                {!collapsed && (
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-sidebar-fg">Hotel Manager</p>
                        <p className="text-xs text-sidebar-muted">Quản lý khách sạn</p>
                    </div>
                )}
            </div>

            <nav className={`flex flex-1 flex-col gap-0.5 py-2 ${collapsed ? 'px-2' : 'px-3'}`} aria-label="Điều hướng chính">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => switchTab(id)}
                            aria-current={active ? 'page' : undefined}
                            aria-label={collapsed ? label : undefined}
                            title={collapsed ? label : undefined}
                            className={`group relative flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
                                collapsed ? 'justify-center px-0' : 'px-2.5'
                            } ${active ? 'bg-sidebar-active text-sidebar-fg' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg'}`}
                        >
                            {/* Vạch đánh dấu mục đang mở */}
                            <span
                                aria-hidden="true"
                                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-amber-300 transition-all duration-200 dark:bg-accent ${active ? 'opacity-100' : 'scale-y-0 opacity-0'}`}
                            />
                            <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${active ? 'text-amber-300 dark:text-accent' : ''}`} />
                            {!collapsed && label}
                        </button>
                    );
                })}
            </nav>

            <div className={`flex flex-col gap-0.5 border-t border-sidebar-line py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
                <ThemeToggle compact={collapsed} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-canvas">
            {/* Sidebar cố định trên màn hình lớn, thu gọn được thành cột icon */}
            <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-line bg-sidebar transition-[width] duration-200 lg:block ${navCollapsed ? 'w-16' : 'w-60'}`}>
                {renderSidebar(navCollapsed)}
                <button
                    type="button"
                    onClick={toggleNav}
                    aria-label={navCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
                    title={navCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
                    aria-expanded={!navCollapsed}
                    className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-line-strong bg-surface text-muted shadow-sm hover:text-fg cursor-pointer"
                >
                    {navCollapsed ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronLeftIcon className="h-3.5 w-3.5" />}
                </button>
            </aside>

            {/* Sidebar dạng ngăn kéo trên điện thoại */}
            {mobileNavOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-line bg-sidebar shadow-xl animate-fadeIn">
                        {renderSidebar(false)}
                    </aside>
                </div>
            )}

            <div className={`transition-[padding] duration-200 ${navCollapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
                {/* Thanh trên cùng cho điện thoại */}
                <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur lg:hidden">
                    <Button variant="ghost" size="icon" icon={MenuIcon} onClick={() => setMobileNavOpen(true)} aria-label="Mở menu" />
                    <span className="text-sm font-semibold text-fg">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
                </div>

                <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
                    {serverError && (
                        <Alert
                            tone="amber"
                            action={<Button size="sm" icon={RefreshIcon} iconClassName={loading ? 'animate-spin' : ''} onClick={reloadAll} disabled={loading}>Thử lại</Button>}
                        >
                            {serverError}
                        </Alert>
                    )}

                    {/* key theo tab để nội dung hiện dần mỗi lần chuyển trang */}
                    <div key={activeTab} className="flex flex-col gap-5 animate-fadeIn">
                    {/* TAB: KHÁCH HÀNG */}
                    {activeTab === 'guests' && (
                        <>
                            <PageHeader
                                title="Khách hàng"
                                icon={UsersIcon}
                                tone="teal"
                                description="Hồ sơ khách, chi tiêu tích luỹ và hạng hội viên."
                                actions={
                                    <>
                                        <Button
                                            icon={HistoryIcon}
                                            onClick={() => {
                                                if (selectedCustomer) setViewingHistoryCustomer(selectedCustomer);
                                                else if (guests.length > 0) setViewingHistoryCustomer(guests[0]);
                                                else toast.error('Chưa có khách hàng nào trong hệ thống.');
                                            }}
                                        >
                                            Lịch sử đặt phòng
                                        </Button>
                                        <Button
                                            variant="primary"
                                            icon={PlusIcon}
                                            onClick={() => {
                                                setEditingCustomer(null);
                                                setSelectedCustomer(null);
                                                setShowCustomerForm(true);
                                            }}
                                        >
                                            Thêm khách hàng
                                        </Button>
                                    </>
                                }
                            />

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
                                        toast.success(editingCustomer ? 'Đã lưu thông tin khách hàng.' : 'Đã thêm khách hàng mới.');
                                        setEditingCustomer(null);
                                        setSelectedCustomer(null);
                                        setShowCustomerForm(false);
                                        fetchGuests();
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
                        </>
                    )}

                    {/* TAB: PHÒNG */}
                    {activeTab === 'rooms' && (
                        <>
                            <PageHeader
                                title="Phòng"
                                icon={BedIcon}
                                tone="amber"
                                description="Tình trạng buồng phòng theo tầng hoặc theo lịch."
                                actions={
                                    <>
                                        <Segmented options={ROOM_VIEWS} value={roomViewMode} onChange={setRoomViewMode} />
                                        <Button variant="primary" icon={PlusIcon} onClick={openNewRoom}>Thêm phòng</Button>
                                    </>
                                }
                            />

                            {roomViewMode === 'calendar' ? (
                                <RoomCalendar
                                    rooms={rooms}
                                    bookings={bookings}
                                    onBookRoom={(room, checkInDate) => {
                                        setBookingInitialRoom(room.roomNumber);
                                        setBookingInitialCheckIn(checkInDate);
                                        setShowBookingForm(true);
                                    }}
                                />
                            ) : (
                                <HotelFloorPlan2D
                                    rooms={rooms}
                                    bookings={bookings}
                                    selectedRoom={selectedRoom}
                                    onSelectRoom={(r) => setSelectedRoom(r)}
                                    onEdit={openEditRoom}
                                    onBookRoom={(room) => {
                                        setBookingInitialRoom(room.roomNumber);
                                        setShowBookingForm(true);
                                    }}
                                    onAddNewRoom={openNewRoom}
                                />
                            )}

                            {showRoomForm && (
                                <RoomForm
                                    key={editingRoom ? editingRoom.roomNumber : 'new-room'}
                                    editingRoom={editingRoom}
                                    existingRooms={rooms}
                                    onSaved={() => {
                                        toast.success(editingRoom ? `Đã cập nhật phòng ${editingRoom.roomNumber}.` : 'Đã thêm phòng mới.');
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(false);
                                        fetchRooms();
                                    }}
                                    onClose={() => {
                                        setEditingRoom(null);
                                        setSelectedRoom(null);
                                        setShowRoomForm(false);
                                    }}
                                    onDelete={handleDeleteRoom}
                                />
                            )}
                        </>
                    )}

                    {/* TAB: ĐẶT PHÒNG */}
                    {activeTab === 'bookings' && (
                        <>
                            <PageHeader
                                title="Đặt phòng"
                                icon={BookmarkIcon}
                                tone="accent"
                                description="Theo dõi đơn, nhận/trả phòng, dịch vụ và thanh toán."
                                actions={<Button variant="primary" icon={PlusIcon} onClick={() => setShowBookingForm(true)}>Tạo đơn</Button>}
                            />

                            <BookingTable
                                bookings={bookings}
                                loading={loading}
                                onReload={() => {
                                    fetchBookings();
                                    fetchRooms();
                                    fetchGuests();
                                }}
                            />
                        </>
                    )}

                    {/* TAB: DỊCH VỤ */}
                    {activeTab === 'services' && <ServiceCatalog />}

                    {/* TAB: DOANH THU */}
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
                    </div>
                </main>
            </div>

            {/* Modal tạo đơn (dùng chung cho tab Đặt phòng, sơ đồ và lịch) */}
            {showBookingForm && (
                <BookingForm
                    guests={guests}
                    rooms={rooms}
                    bookings={bookings}
                    initialRoomNumber={bookingInitialRoom}
                    initialCheckIn={bookingInitialCheckIn}
                    onSaved={() => {
                        toast.success('Đã tạo đơn đặt phòng.');
                        fetchBookings();
                        fetchRooms(); // Đồng bộ trạng thái phòng
                        fetchGuests(); // Đồng bộ chi tiêu và hạng hội viên khách hàng
                        setShowBookingForm(false);
                        setBookingInitialRoom('');
                        setBookingInitialCheckIn('');
                    }}
                    onClose={() => {
                        setShowBookingForm(false);
                        setBookingInitialRoom('');
                        setBookingInitialCheckIn('');
                    }}
                />
            )}

            {/* Modal lịch sử đặt phòng của khách */}
            {viewingHistoryCustomer && (
                <CustomerBookingHistoryModal
                    customer={viewingHistoryCustomer}
                    guests={guests}
                    onSelectCustomer={(c) => setViewingHistoryCustomer(c)}
                    onClose={() => setViewingHistoryCustomer(null)}
                />
            )}
        </div>
    );
}

export default App;
