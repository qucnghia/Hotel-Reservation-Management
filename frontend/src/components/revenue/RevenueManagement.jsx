import { useState, useMemo } from 'react';
import GlideSelect from '../glide-select';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    BanknotesIcon,
    CreditCardIcon,
    PieChartIcon,
    BuildingOfficeIcon,
    BedIcon,
    UsersIcon,
    BookmarkIcon,
    StarIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    SearchIcon,
    RefreshIcon,
    CheckCircleIcon
} from '../icons';

// Tùy chọn GlideSelect cho Bộ Lọc Khoảng Thời Gian
const TIME_RANGE_OPTIONS = [
    { value: 'ALL', label: 'Tất cả thời gian' },
    { value: 'THIS_MONTH', label: 'Tháng này' },
    { value: '30_DAYS', label: '30 ngày qua' },
    { value: '7_DAYS', label: '7 ngày qua' }
];

// Tùy chọn GlideSelect cho Bộ Lọc Trạng Thái Sổ Quỹ
const LEDGER_STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'CHECKED_OUT', label: 'Đã hoàn tất thanh toán' },
    { value: 'CHECKED_IN', label: 'Đang lưu trú' },
    { value: 'CONFIRMED', label: 'Chờ thanh toán (Đã cọc)' },
    { value: 'CANCELLED', label: 'Đã hủy đơn' }
];

// Tùy chọn GlideSelect cho Bộ Lọc Hạng Phòng Sổ Quỹ
const LEDGER_ROOM_TYPE_OPTIONS = [
    { value: 'ALL', label: 'Tất cả hạng phòng' },
    { value: 'STANDARD', label: 'Standard Room' },
    { value: 'VIP', label: 'VIP Suite' },
    { value: 'LUXURY', label: 'Presidential Luxury' }
];

// Cấu hình nhãn và màu sắc trạng thái giao dịch
const TRANSACTION_STATUS = {
    CHECKED_OUT: {
        label: 'Đã hoàn tất thanh toán',
        shortLabel: 'Đã thanh toán',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        type: 'realized'
    },
    CHECKED_IN: {
        label: 'Đang ghi nhận lưu trú',
        shortLabel: 'Đang lưu trú',
        bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400',
        type: 'active'
    },
    CONFIRMED: {
        label: 'Doanh thu chờ thu (Đã cọc/Xác nhận)',
        shortLabel: 'Chờ thanh toán',
        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        type: 'pending'
    },
    CANCELLED: {
        label: 'Đã hủy đơn (Thất thoát)',
        shortLabel: 'Đã hủy',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
        type: 'cancelled'
    }
};

const ROOM_TYPE_META = {
    STANDARD: {
        name: 'Standard Room',
        color: '#38bdf8',
        textColor: 'text-sky-400',
        bgSubtle: 'bg-sky-500/10 border-sky-500/20',
        barColor: 'from-sky-500 to-blue-600',
        badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    },
    VIP: {
        name: 'VIP Suite',
        color: '#f59e0b',
        textColor: 'text-amber-400',
        bgSubtle: 'bg-amber-500/10 border-amber-500/20',
        barColor: 'from-amber-400 to-yellow-600',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    LUXURY: {
        name: 'Presidential Luxury',
        color: '#c084fc',
        textColor: 'text-purple-400',
        bgSubtle: 'bg-purple-500/10 border-purple-500/20',
        barColor: 'from-purple-500 to-indigo-600',
        badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    }
};

// Helper phân tích chuỗi ngày tháng đa định dạng (DD/MM/YYYY, YYYY-MM-DD, HH:mm:ss, ISO)
function parseAppDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
    const str = String(dateStr).trim();

    // 1. Khớp định dạng DD/MM/YYYY hoặc DD/MM/YYYY HH:mm:ss
    const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (ddmmyyyyMatch) {
        return new Date(
            parseInt(ddmmyyyyMatch[3], 10),
            parseInt(ddmmyyyyMatch[2], 10) - 1,
            parseInt(ddmmyyyyMatch[1], 10),
            ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0,
            ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0,
            ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0
        );
    }

    // 2. Khớp định dạng YYYY-MM-DD hoặc YYYY-MM-DD HH:mm:ss hoặc ISO
    const yyyymmddMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (yyyymmddMatch) {
        return new Date(
            parseInt(yyyymmddMatch[1], 10),
            parseInt(yyyymmddMatch[2], 10) - 1,
            parseInt(yyyymmddMatch[3], 10),
            yyyymmddMatch[4] ? parseInt(yyyymmddMatch[4], 10) : 0,
            yyyymmddMatch[5] ? parseInt(yyyymmddMatch[5], 10) : 0,
            yyyymmddMatch[6] ? parseInt(yyyymmddMatch[6], 10) : 0
        );
    }

    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateLabel(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${m}`;
}

function formatFullDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${m}/${y}`;
}

export default function RevenueManagement({ bookings = [], rooms = [], guests = [], onRefresh }) {
    // Bộ lọc thời gian: ALL | THIS_MONTH | 30_DAYS | 7_DAYS
    const [timeRange, setTimeRange] = useState('ALL');
    const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'bookings'
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [ledgerSearch, setLedgerSearch] = useState('');
    const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');
    const [ledgerRoomTypeFilter, setLedgerRoomTypeFilter] = useState('ALL');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Xử lý làm mới
    const handleRefresh = async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setTimeout(() => setIsRefreshing(false), 500);
            }
        }
    };

    // 1. Lọc đơn theo khoảng thời gian được chọn
    const filteredBookings = useMemo(() => {
        if (timeRange === 'ALL') return bookings;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return bookings.filter(b => {
            // Xác định mốc thời gian của đơn (ưu tiên checkInDate, sau đó là createdAt)
            const dateStr = b.checkInDate || b.createdAt;
            if (!dateStr) return true;
            const bookingDate = parseAppDate(dateStr);
            if (!bookingDate) return true;

            if (timeRange === 'THIS_MONTH') {
                return bookingDate.getFullYear() === now.getFullYear() && bookingDate.getMonth() === now.getMonth();
            } else if (timeRange === '30_DAYS') {
                const diffTime = startOfToday.getTime() - bookingDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);
                return diffDays <= 30 && diffDays >= -30;
            } else if (timeRange === '7_DAYS') {
                const diffTime = startOfToday.getTime() - bookingDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);
                return diffDays <= 7 && diffDays >= -7;
            }
            return true;
        });
    }, [bookings, timeRange]);

    // 2. Tính toán các chỉ số KPI tài chính cốt lõi
    const metrics = useMemo(() => {
        let realizedRevenue = 0; // CHECKED_OUT + CHECKED_IN
        let completedRevenue = 0; // CHECKED_OUT
        let activeRevenue = 0; // CHECKED_IN
        let pendingRevenue = 0; // CONFIRMED
        let lostRevenue = 0; // CANCELLED
        let realizedNights = 0;
        let totalBookingsCount = filteredBookings.length;
        let successfulBookingsCount = 0;

        filteredBookings.forEach(b => {
            const price = Number(b.totalPrice || 0);
            const nights = Number(b.durationNights || 1);

            if (b.bookingStatus === 'CHECKED_OUT') {
                realizedRevenue += price;
                completedRevenue += price;
                realizedNights += nights;
                successfulBookingsCount++;
            } else if (b.bookingStatus === 'CHECKED_IN') {
                realizedRevenue += price;
                activeRevenue += price;
                realizedNights += nights;
                successfulBookingsCount++;
            } else if (b.bookingStatus === 'CONFIRMED') {
                pendingRevenue += price;
            } else if (b.bookingStatus === 'CANCELLED') {
                lostRevenue += price;
            }
        });

        // Tổng số phòng trong hệ thống
        const totalRooms = rooms.length || 1;
        const occupiedRooms = rooms.filter(r => r.roomStatus === 'OCCUPIED').length;
        const availableRooms = rooms.filter(r => r.roomStatus === 'AVAILABLE').length;
        const maintenanceRooms = rooms.filter(r => r.roomStatus === 'MAINTENANCE').length;

        // Công suất lấp đầy hiện tại (%)
        const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

        // ADR (Average Daily Rate): Doanh thu thực nhận / Số đêm đã bán
        const adr = realizedNights > 0 ? Math.round(realizedRevenue / realizedNights) : 0;

        // RevPAR (Revenue Per Available Room): Doanh thu thực tế / Tổng số phòng
        const revPAR = Math.round(realizedRevenue / totalRooms);

        // Tỷ lệ hủy phòng
        const cancellationRate = totalBookingsCount > 0
            ? Math.round((filteredBookings.filter(b => b.bookingStatus === 'CANCELLED').length / totalBookingsCount) * 100)
            : 0;

        return {
            realizedRevenue,
            completedRevenue,
            activeRevenue,
            pendingRevenue,
            lostRevenue,
            totalGrossPipeline: realizedRevenue + pendingRevenue,
            realizedNights,
            adr,
            revPAR,
            occupancyRate,
            totalRooms,
            occupiedRooms,
            availableRooms,
            maintenanceRooms,
            totalBookingsCount,
            successfulBookingsCount,
            cancellationRate
        };
    }, [filteredBookings, rooms]);

    // 3. Phân bổ doanh thu theo từng loại phòng (Room Types Breakdown)
    const roomTypeStats = useMemo(() => {
        const stats = {
            STANDARD: { count: 0, revenue: 0, nights: 0, roomCount: 0 },
            VIP: { count: 0, revenue: 0, nights: 0, roomCount: 0 },
            LUXURY: { count: 0, revenue: 0, nights: 0, roomCount: 0 }
        };

        // Đếm số lượng phòng trong khách sạn
        rooms.forEach(r => {
            const type = (r.roomType || 'STANDARD').toUpperCase();
            if (stats[type]) {
                stats[type].roomCount++;
            }
        });

        // Tính doanh thu từ các đơn phòng thực tế (CHECKED_OUT & CHECKED_IN)
        filteredBookings.forEach(b => {
            if (b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN') {
                const type = (b.roomType || 'STANDARD').toUpperCase();
                if (stats[type]) {
                    stats[type].count++;
                    stats[type].revenue += Number(b.totalPrice || 0);
                    stats[type].nights += Number(b.durationNights || 1);
                }
            }
        });

        const totalRev = metrics.realizedRevenue || 1;
        return Object.keys(stats).map(key => {
            const data = stats[key];
            const meta = ROOM_TYPE_META[key] || ROOM_TYPE_META.STANDARD;
            const percentage = Math.round((data.revenue / totalRev) * 100);
            const adr = data.nights > 0 ? Math.round(data.revenue / data.nights) : 0;
            return {
                type: key,
                name: meta.name,
                meta,
                revenue: data.revenue,
                count: data.count,
                nights: data.nights,
                roomCount: data.roomCount,
                percentage,
                adr
            };
        });
    }, [filteredBookings, rooms, metrics.realizedRevenue]);

    // 4. Biểu đồ dòng doanh thu theo trình tự thời gian (SVG Area & Line Chart)
    const chartData = useMemo(() => {
        // Lấy danh sách đơn hợp lệ (bỏ qua CANCELLED)
        const validBookings = [...filteredBookings].filter(b => b.bookingStatus !== 'CANCELLED');

        if (validBookings.length === 0) {
            return [
                { label: 'Chưa có đơn', fullDate: 'Hôm nay', revenue: 0, count: 0, pending: 0 }
            ];
        }

        // Gom nhóm doanh thu theo từng ngày
        const dailyData = {};

        validBookings.forEach(b => {
            const dateObj = parseAppDate(b.checkInDate || b.createdAt);
            if (!dateObj) return;

            const key = formatDateKey(dateObj);
            if (!dailyData[key]) {
                dailyData[key] = {
                    dateObj,
                    label: formatDateLabel(dateObj),
                    fullDate: formatFullDate(dateObj),
                    revenue: 0,
                    pending: 0,
                    count: 0
                };
            }

            const price = Number(b.totalPrice || 0);
            if (b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN') {
                dailyData[key].revenue += price;
            } else if (b.bookingStatus === 'CONFIRMED') {
                dailyData[key].pending += price;
            }
            dailyData[key].count++;
        });

        const sortedKeys = Object.keys(dailyData).sort();
        if (sortedKeys.length === 0) {
            return [
                { label: 'Chưa có đơn', fullDate: 'Hôm nay', revenue: 0, count: 0, pending: 0 }
            ];
        }

        // Nếu chỉ có duy nhất 1 ngày có dữ liệu, thêm mốc ngày hôm trước (0đ) và hôm sau (0đ)
        // để tạo thành đường cong/đỉnh sóng có độ dốc trực quan, không bị vẽ thành đường thẳng tắp nằm ngang
        if (sortedKeys.length === 1) {
            const singleItem = dailyData[sortedKeys[0]];
            const d = singleItem.dateObj;

            const prevD = new Date(d);
            prevD.setDate(prevD.getDate() - 1);
            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);

            return [
                {
                    dateObj: prevD,
                    label: formatDateLabel(prevD),
                    fullDate: formatFullDate(prevD),
                    revenue: 0,
                    pending: 0,
                    count: 0
                },
                singleItem,
                {
                    dateObj: nextD,
                    label: formatDateLabel(nextD),
                    fullDate: formatFullDate(nextD),
                    revenue: 0,
                    pending: 0,
                    count: 0
                }
            ];
        }

        // Nếu có nhiều ngày, kiểm tra khoảng thời gian giữa ngày đầu và ngày cuối
        const firstDateObj = dailyData[sortedKeys[0]].dateObj;
        const lastDateObj = dailyData[sortedKeys[sortedKeys.length - 1]].dateObj;
        const diffDays = Math.round((lastDateObj.getTime() - firstDateObj.getTime()) / (1000 * 3600 * 24));

        // Nếu khoảng cách ngày từ 1 đến 15 ngày, tạo dòng thời gian liên tục từng ngày (Daily timeline)
        // Bắt đầu từ 1 ngày trước mốc đầu tiên (0đ) để đường cong có chân dốc mềm mại bắt đầu từ 0
        if (diffDays >= 1 && diffDays <= 15) {
            const continuousList = [];
            const cur = new Date(firstDateObj);
            // Thêm 1 ngày đệm phía trước để biểu đồ có chân dốc mềm mại bắt đầu từ 0
            cur.setDate(cur.getDate() - 1);

            while (cur <= lastDateObj) {
                const key = formatDateKey(cur);
                if (dailyData[key]) {
                    continuousList.push(dailyData[key]);
                } else {
                    continuousList.push({
                        dateObj: new Date(cur),
                        label: formatDateLabel(cur),
                        fullDate: formatFullDate(cur),
                        revenue: 0,
                        pending: 0,
                        count: 0
                    });
                }
                cur.setDate(cur.getDate() + 1);
            }
            return continuousList;
        }

        // Nếu khoảng cách lớn hơn 15 ngày, lấy danh sách các ngày có giao dịch đã được sắp xếp (tối đa 15 mốc gần nhất)
        const list = sortedKeys.map(k => dailyData[k]);
        if (list.length > 15) {
            return list.slice(list.length - 15);
        }
        return list;
    }, [filteredBookings]);

    // SVG Chart coordinate calculations
    const svgChart = useMemo(() => {
        const width = 800;
        const height = 260;
        const padding = { top: 30, right: 30, bottom: 40, left: 60 };

        if (!chartData || chartData.length === 0) {
            return { points: [], areaPath: '', linePath: '', maxY: 100, width, height, padding };
        }

        const values = chartData.map(d => chartMetric === 'revenue' ? d.revenue : d.count);
        const rawMax = Math.max(...values, 1);
        // Làm tròn max Y để biểu đồ thông thoáng
        const maxY = chartMetric === 'revenue' ? Math.ceil(rawMax * 1.25 / 1000000) * 1000000 || rawMax * 1.25 : Math.ceil(rawMax * 1.3);

        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;

        const points = chartData.map((d, index) => {
            const val = chartMetric === 'revenue' ? d.revenue : d.count;
            const x = chartData.length === 1
                ? padding.left + innerWidth / 2
                : padding.left + (index / (chartData.length - 1)) * innerWidth;
            const y = padding.top + innerHeight - (val / maxY) * innerHeight;
            return { x, y, val, label: d.label, fullDate: d.fullDate, revenue: d.revenue, count: d.count };
        });

        // Tạo path trơn mượt cho đường cong
        let linePath = '';
        if (points.length === 1) {
            linePath = `M ${points[0].x} ${points[0].y}`;
        } else {
            linePath = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                const midX = (curr.x + next.x) / 2;
                linePath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
            }
        }

        // Tạo vùng gradient fill (Area path)
        const groundY = padding.top + innerHeight;
        let areaPath = '';
        if (points.length === 1) {
            areaPath = '';
        } else {
            areaPath = linePath + ` L ${points[points.length - 1].x} ${groundY} L ${points[0].x} ${groundY} Z`;
        }

        return { points, linePath, areaPath, maxY, width, height, padding };
    }, [chartData, chartMetric]);

    // 5. Bảng xếp hạng Top khách hàng chi tiêu nhiều nhất (VIP Revenue Contributors)
    const topVipGuests = useMemo(() => {
        // Tính tổng tiền từ bookings cho từng khách hàng (nếu có)
        const spentFromBookings = {};
        const bookingsCount = {};
        (bookings || []).forEach(b => {
            const price = Number(b.totalPrice || 0);
            const cId = b.customerId;
            if (cId) {
                // Với các đơn đã checkout hoặc checkin
                if (b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN') {
                    spentFromBookings[cId] = (spentFromBookings[cId] || 0) + price;
                }
                bookingsCount[cId] = (bookingsCount[cId] || 0) + 1;
            }
        });

        // Kết hợp dữ liệu khách từ danh sách guests và tổng chi tiêu thực tế
        return [...guests]
            .map(g => {
                // Backend Customer entity trả về trường `payedPrice`
                const backendPayed = Number(g.payedPrice ?? g.PayedPrice ?? g.payed ?? g.Payed ?? 0);
                const fromBookings = spentFromBookings[g.id] ?? 0;
                // Lấy giá trị lớn nhất giữa số liệu tích lũy và số liệu tổng các đơn đặt
                const totalSpent = Math.max(backendPayed, fromBookings);

                return {
                    id: g.id,
                    name: g.fullName || g.FullName || `Khách hàng #${g.id}`,
                    email: g.email || g.Email || 'Không có email',
                    membership: (g.membership || 'CUSTOMER').toUpperCase(),
                    totalSpent,
                    bookingCount: bookingsCount[g.id] || 0
                };
            })
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
    }, [guests, bookings]);

    // 6. Lọc danh sách giao dịch cho Sổ Doanh Thu (Ledger)
    const filteredLedger = useMemo(() => {
        return filteredBookings.filter(b => {
            const matchesSearch =
                String(b.id).includes(ledgerSearch) ||
                String(b.roomNumber).includes(ledgerSearch) ||
                (b.customerName || '').toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                (b.customerEmail || '').toLowerCase().includes(ledgerSearch.toLowerCase());

            const matchesStatus = ledgerStatusFilter === 'ALL' || b.bookingStatus === ledgerStatusFilter;
            const matchesRoomType = ledgerRoomTypeFilter === 'ALL' || (b.roomType || '').toUpperCase() === ledgerRoomTypeFilter;

            return matchesSearch && matchesStatus && matchesRoomType;
        });
    }, [filteredBookings, ledgerSearch, ledgerStatusFilter, ledgerRoomTypeFilter]);

    // Xuất báo cáo dạng CSV
    const handleExportCSV = () => {
        const headers = ['Mã Đơn', 'Ngày Check-in', 'Ngày Check-out', 'Khách Hàng', 'Phòng', 'Hạng Phòng', 'Số Đêm', 'Tổng Tiền (VND)', 'Trạng Thái'];
        const rows = filteredLedger.map(b => [
            `#${b.id}`,
            b.checkInDate || '',
            b.checkOutDate || '',
            `"${b.customerName || `Khách #${b.customerId}`}"`,
            b.roomNumber,
            b.roomType,
            b.durationNights || 1,
            b.totalPrice || 0,
            TRANSACTION_STATUS[b.bookingStatus]?.shortLabel || b.bookingStatus
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bao_Cao_Doanh_Thu_Khach_San_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // In báo cáo tài chính
    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn pb-12">
            {/* === HÀNG 1: BANNER ĐIỀU HÀNH & BỘ LỌC THỜI GIAN TOÀN DIỆN === */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-30">
                {/* Ánh sáng nền trang trí nghệ thuật */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mt-20"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mb-20"></div>
                </div>

                <div className="relative z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <span>Executive Financial Suite</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400" />
                            <span>Quản Lý Doanh Thu & Tài Chính</span>
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl">
                            Phân tích luồng tiền thời gian thực, hiệu suất bán phòng (RevPAR, ADR), tỷ lệ lấp đầy và cấu trúc sinh lời khách sạn.
                        </p>
                    </div>

                    {/* Bộ điều khiển khoảng thời gian GlideSelect & Nút xuất báo cáo */}
                    <div className="flex flex-wrap items-center gap-2.5 relative z-40">
                        {/* GlideSelect Thời Gian */}
                        <GlideSelect
                            options={TIME_RANGE_OPTIONS}
                            value={timeRange}
                            onChange={(val) => setTimeRange(val)}
                            ariaLabel="Chọn khoảng thời gian báo cáo"
                            size="md"
                            align="left"
                            menuWidth={210}
                            showTags={false}
                            surfaceColor="#0f172a"
                            highlightColor="#1e293b"
                            accentColor="#10b981"
                            textColor="#f8fafc"
                            radius={14}
                        />

                        {/* Nút Làm mới dữ liệu */}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            title="Làm mới toàn bộ chỉ số tài chính"
                            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                            <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                            <span className="hidden sm:inline text-xs sm:text-sm font-semibold">Cập nhật</span>
                        </button>

                        {/* Nút Xuất CSV */}
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            title="Xuất bảng kê giao dịch ra file CSV (Excel)"
                            className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Xuất CSV</span>
                        </button>

                        {/* Nút In Báo Cáo */}
                        <button
                            type="button"
                            onClick={handlePrintReport}
                            title="In bản tổng hợp doanh thu"
                            className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">In</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* === HÀNG 2: 4 THẺ KPI TÀI CHÍNH CỐT LÕI (LUXURY EXECUTIVE CARDS) === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
                {/* KPI 1: Doanh Thu Thực Nhận */}
                <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Doanh Thu Thực Nhận</span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                            <TrendingUpIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                            <span>{metrics.realizedRevenue.toLocaleString('vi-VN')}</span>
                            <span className="text-sm font-bold text-emerald-400">đ</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                {metrics.successfulBookingsCount} đơn thành công
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{metrics.realizedNights} đêm phòng</span>
                        </div>
                    </div>
                </div>

                {/* KPI 2: Doanh Thu Chờ Thu (Dự Kiến Pipeline) */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-xl hover:border-amber-500/50 transition-all group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Doanh Thu Dự Kiến</span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                            <BookmarkIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                            <span>{metrics.pendingRevenue.toLocaleString('vi-VN')}</span>
                            <span className="text-sm font-bold text-amber-400">đ</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="font-semibold text-amber-300">Đơn đã xác nhận / cọc phòng</span>
                        </div>
                    </div>
                </div>

                {/* KPI 3: ADR - Average Daily Rate */}
                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">ADR (Giá BQ / Đêm)</span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                            <BedIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                            <span>{metrics.adr.toLocaleString('vi-VN')}</span>
                            <span className="text-sm font-bold text-indigo-400">đ</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-slate-400">Hiệu suất giá trên mỗi đêm bán</span>
                        </div>
                    </div>
                </div>

                {/* KPI 4: RevPAR - Revenue Per Available Room */}
                <div className="bg-slate-900/80 border border-purple-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-xl hover:border-purple-500/50 transition-all group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">RevPAR (Doanh Thu/Phòng)</span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                            <BuildingOfficeIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                            <span>{metrics.revPAR.toLocaleString('vi-VN')}</span>
                            <span className="text-sm font-bold text-purple-400">đ</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-purple-300 font-bold">{metrics.totalRooms} phòng</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Lấp đầy: {metrics.occupancyRate.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === HÀNG 3: BIỂU ĐỒ TRỰC QUAN DOANH THU & PHÂN BỔ LOẠI PHÒNG === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CỘT TRÁI (2 PHẦN): BIỂU ĐỒ AREA & LINE CHART SVG NGHỆ THUẬT */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <TrendingUpIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>Xu Hướng Doanh Thu Theo Dòng Thời Gian</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Biểu đồ quỹ đạo tài chính và khối lượng đặt phòng</p>
                            </div>
                        </div>

                        {/* Toggle giữa Doanh thu và Số lượng đơn */}
                        <div className="flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setChartMetric('revenue')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    chartMetric === 'revenue'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Doanh thu (VND)
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMetric('bookings')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    chartMetric === 'bookings'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Số lượng đơn
                            </button>
                        </div>
                    </div>

                    {/* VÙNG VẼ SVG CHART */}
                    <div className="relative w-full pt-4 min-h-[280px]">
                        <svg
                            viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
                            className="w-full h-auto overflow-visible select-none"
                        >
                            <defs>
                                {/* Gradient tô bóng màu ngọc bích cho Doanh thu */}
                                <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                                    <stop offset="70%" stopColor="#059669" stopOpacity="0.08" />
                                    <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                                </linearGradient>

                                {/* Gradient tô bóng tím xanh cho Lượt đặt */}
                                <linearGradient id="bookingsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
                                    <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.08" />
                                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
                                </linearGradient>

                                {/* Filter đổ bóng cho line chart */}
                                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={chartMetric === 'revenue' ? '#10b981' : '#6366f1'} floodOpacity="0.5" />
                                </filter>
                            </defs>

                            {/* Lưới đường ngang phụ trợ */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                const yPos = svgChart.padding.top + (svgChart.height - svgChart.padding.top - svgChart.padding.bottom) * ratio;
                                const valLabel = chartMetric === 'revenue'
                                    ? Math.round(svgChart.maxY * (1 - ratio)).toLocaleString('vi-VN')
                                    : Math.round(svgChart.maxY * (1 - ratio));
                                return (
                                    <g key={i}>
                                        <line
                                            x1={svgChart.padding.left}
                                            y1={yPos}
                                            x2={svgChart.width - svgChart.padding.right}
                                            y2={yPos}
                                            stroke="#334155"
                                            strokeOpacity="0.3"
                                            strokeDasharray="4 4"
                                        />
                                        <text
                                            x={svgChart.padding.left - 10}
                                            y={yPos + 4}
                                            fill="#64748b"
                                            fontSize="10"
                                            textAnchor="end"
                                            fontWeight="600"
                                        >
                                            {valLabel}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Vùng bóng Area Gradient */}
                            {svgChart.areaPath && (
                                <path
                                    d={svgChart.areaPath}
                                    fill={chartMetric === 'revenue' ? "url(#revenueAreaGrad)" : "url(#bookingsAreaGrad)"}
                                    className="transition-all duration-500 ease-out"
                                />
                            )}

                            {/* Đường Line chính */}
                            {svgChart.linePath && (
                                <path
                                    d={svgChart.linePath}
                                    fill="none"
                                    stroke={chartMetric === 'revenue' ? "#10b981" : "#818cf8"}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glowEffect)"
                                    className="transition-all duration-500 ease-out"
                                />
                            )}

                            {/* Đường chỉ dẫn dọc khi hover (Vertical Crosshair Guideline) */}
                            {hoveredPoint && (
                                <line
                                    x1={hoveredPoint.x}
                                    y1={svgChart.padding.top}
                                    x2={hoveredPoint.x}
                                    y2={svgChart.height - svgChart.padding.bottom}
                                    stroke="#475569"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                    opacity="0.7"
                                    className="pointer-events-none transition-all duration-150"
                                />
                            )}

                            {/* Các điểm dữ liệu tương tác (Interactive Data Points) */}
                            {svgChart.points.map((pt, idx) => {
                                const isHovered = hoveredPoint && hoveredPoint.label === pt.label && hoveredPoint.x === pt.x;
                                const strokeColor = chartMetric === 'revenue' ? "#10b981" : "#6366f1";

                                return (
                                    <g
                                        key={idx}
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(pt)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    >
                                        {/* Vùng cảm ứng rộng trong suốt giúp rê chuột mượt mà */}
                                        <rect
                                            x={pt.x - 24}
                                            y={svgChart.padding.top}
                                            width="48"
                                            height={svgChart.height - svgChart.padding.top - svgChart.padding.bottom}
                                            fill="transparent"
                                        />

                                        {/* Vòng hào quang highlight chính xác tại điểm hover (dùng thuộc tính SVG chuẩn, không dùng CSS scale để tránh lệch tâm) */}
                                        {isHovered && (
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="10"
                                                fill={strokeColor}
                                                fillOpacity="0.25"
                                                className="pointer-events-none"
                                            />
                                        )}

                                        {/* Điểm dữ liệu chuẩn trên đường cong */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? 6 : 4}
                                            fill={isHovered ? strokeColor : "#ffffff"}
                                            stroke={isHovered ? "#ffffff" : strokeColor}
                                            strokeWidth={isHovered ? 2.5 : 2}
                                            className="transition-all duration-150 pointer-events-none"
                                        />

                                        {/* Nhãn ngày trục hoành X */}
                                        <text
                                            x={pt.x}
                                            y={svgChart.height - 12}
                                            fill={isHovered ? "#ffffff" : "#94a3b8"}
                                            fontSize="10"
                                            fontWeight={isHovered ? "700" : "600"}
                                            textAnchor="middle"
                                            className="pointer-events-none transition-colors"
                                        >
                                            {pt.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Floating Tooltip khi hover lên điểm trên biểu đồ (tự lật vị trí thông minh nếu ở đỉnh) */}
                        {hoveredPoint && (() => {
                            const isNearTop = (hoveredPoint.y / svgChart.height) < 0.35;
                            return (
                                <div
                                    className={`absolute pointer-events-none z-30 p-3 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs transition-transform transform -translate-x-1/2 ${
                                        isNearTop ? 'translate-y-4' : '-translate-y-full -translate-y-2'
                                    }`}
                                    style={{
                                        left: `${(hoveredPoint.x / svgChart.width) * 100}%`,
                                        top: `${(hoveredPoint.y / svgChart.height) * 100}%`
                                    }}
                                >
                                    <div className="font-extrabold text-white pb-1 border-b border-slate-800">
                                        Mốc: {hoveredPoint.fullDate || hoveredPoint.label}
                                    </div>
                                    <div className="mt-1.5 flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
                                            <span>Doanh thu:</span>
                                            <span>{hoveredPoint.revenue.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-indigo-300">
                                            <span>Số lượt đặt:</span>
                                            <span>{hoveredPoint.count} lượt</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* CỘT PHẢI (1 PHẦN): CƠ CẤU DOANH THU THEO HẠNG PHÒNG */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                <PieChartIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Cơ Cấu Hạng Phòng</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tỷ trọng đóng góp vào tổng doanh thu</p>
                            </div>
                        </div>

                        {/* Thanh tỷ trọng kết hợp đa sắc (Stacked Progress Bar) */}
                        <div className="mt-5">
                            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                                {roomTypeStats.map(stat => (
                                    <div
                                        key={stat.type}
                                        style={{ width: `${stat.percentage}%`, backgroundColor: stat.meta.color }}
                                        title={`${stat.name}: ${stat.percentage}%`}
                                        className="h-full transition-all duration-500 hover:brightness-125"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Danh sách phân tích chi tiết từng loại phòng */}
                        <div className="mt-5 flex flex-col gap-3.5">
                            {roomTypeStats.map(stat => (
                                <div
                                    key={stat.type}
                                    className={`p-3.5 rounded-2xl border ${stat.meta.bgSubtle} transition-all hover:border-slate-600/60`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: stat.meta.color }}
                                            />
                                            <span className="font-bold text-sm text-white">{stat.name}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${stat.meta.badge}`}>
                                            {stat.percentage}%
                                        </span>
                                    </div>

                                    <div className="mt-2.5 flex items-baseline justify-between text-xs">
                                        <span className="text-slate-400">Doanh thu:</span>
                                        <span className={`font-black text-sm ${stat.meta.textColor}`}>
                                            {stat.revenue.toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                                        <span>Đã bán: <strong className="text-slate-200">{stat.count} lượt</strong> ({stat.nights} đêm)</span>
                                        <span>ADR: <strong className="text-slate-300">{stat.adr.toLocaleString('vi-VN')} đ</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* === HÀNG 4: BẢNG XẾP HẠNG KHÁCH HÀNG VIP ĐÓNG GÓP & GHI CHÚ QUẢN TRỊ === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TOP VIP SPENDERS (LEADERBOARD) */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <StarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Top Khách Hàng VIP Đóng Góp Doanh Thu</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Những khách hàng có giá trị vòng đời (LTV) cao nhất khách sạn</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                            Top 5 Khách
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/80 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-3">Hạng</th>
                                    <th className="py-3 px-3">Khách Hàng</th>
                                    <th className="py-3 px-3">Hạng Hội Viên</th>
                                    <th className="py-3 px-3 text-right">Tổng Đã Chi Tiêu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {topVipGuests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                                            Chưa có dữ liệu chi tiêu khách hàng.
                                        </td>
                                    </tr>
                                ) : (
                                    topVipGuests.map((g, idx) => {
                                        const rankColors = [
                                            'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
                                            'bg-slate-300 text-slate-900 font-bold',
                                            'bg-amber-700/80 text-amber-100 font-bold'
                                        ];
                                        const badgeColor =
                                            g.membership === 'VIP' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                            g.membership === 'PLUS' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                                            g.membership === 'ECONOMY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                            'bg-slate-800 text-slate-400 border-slate-700';

                                        return (
                                            <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs ${
                                                        idx < 3 ? rankColors[idx] : 'bg-slate-800 text-slate-300'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="font-bold text-white">{g.name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {g.email}
                                                        {g.bookingCount > 0 && (
                                                            <span className="ml-1.5 text-slate-500">• {g.bookingCount} đơn</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${badgeColor}`}>
                                                        <StarIcon className="w-3 h-3" />
                                                        {g.membership}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                                    <span className="font-black text-base text-emerald-400">
                                                        {g.totalSpent.toLocaleString('vi-VN')}
                                                    </span>
                                                    <span className="text-xs font-semibold text-emerald-500 ml-1">đ</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* EXECUTIVE STRATEGIC INSIGHTS CARD */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <BuildingOfficeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Chỉ Số & Khuyến Nghị Quản Trị</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tối ưu hóa doanh thu khách sạn (Revenue Optimization)</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            {/* Insight 1: Hạng phòng sinh lời */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUpIcon className="w-3.5 h-3.5" />
                                    <span>Tối ưu giá phòng (ADR)</span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                    Hạng phòng VIP Suite chiếm tỷ trọng doanh thu cao với mức ADR đạt {metrics.adr > 0 ? metrics.adr.toLocaleString('vi-VN') : '1.200.000'} đ. Khuyến nghị duy trì gói dịch vụ cao cấp kèm bữa sáng.
                                </p>
                            </div>

                            {/* Insight 2: Kiểm soát tỷ lệ hủy phòng */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUpIcon className="w-3.5 h-3.5" />
                                    <span>Tỷ Lệ Hủy Phòng</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-slate-300">Tỷ lệ hủy đơn hiện tại:</span>
                                    <span className="text-sm font-extrabold text-white">{metrics.cancellationRate}%</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-1">
                                    {metrics.cancellationRate < 10
                                        ? 'Tỷ lệ hủy phòng nằm trong ngưỡng an toàn tối ưu (< 10%).'
                                        : 'Cần áp dụng chính sách đặt cọc linh hoạt để giảm tỷ lệ đơn hủy.'}
                                </div>
                            </div>

                            {/* Insight 3: Dòng tiền tổng thể */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <BanknotesIcon className="w-3.5 h-3.5" />
                                    <span>Tổng Dòng Tiền Kỳ Vọng (Gross Pipeline)</span>
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                    {metrics.totalGrossPipeline.toLocaleString('vi-VN')} <span className="text-xs text-emerald-400">đ</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Bao gồm doanh thu thực nhận cộng thêm toàn bộ đơn đã xác nhận chờ thanh toán.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === HÀNG 5: SỔ GIAO DỊCH DOANH THU CHI TIẾT (FINANCIAL LEDGER) === */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5 relative z-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                            <CreditCardIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>Sổ Nhật Ký Doanh Thu & Giao Dịch</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                                    {filteredLedger.length} giao dịch
                                </span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                Chi tiết toàn bộ chứng từ thanh toán, trạng thái phòng và dòng tiền theo từng đơn đặt
                            </p>
                        </div>
                    </div>

                    {/* Bộ lọc trong sổ nhật ký */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Ô tìm kiếm */}
                        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm mã đơn, phòng, tên khách..."
                                value={ledgerSearch}
                                onChange={(e) => setLedgerSearch(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors"
                            />
                        </div>

                        {/* GlideSelect Trạng Thái Thanh Toán */}
                        <GlideSelect
                            options={LEDGER_STATUS_OPTIONS}
                            value={ledgerStatusFilter}
                            onChange={(val) => setLedgerStatusFilter(val)}
                            ariaLabel="Lọc theo trạng thái thanh toán"
                            size="md"
                            align="right"
                            menuWidth={240}
                            showTags={false}
                            surfaceColor="#0f172a"
                            highlightColor="#1e293b"
                            accentColor="#14b8a6"
                            textColor="#f8fafc"
                            radius={14}
                        />

                        {/* GlideSelect Hạng Phòng */}
                        <GlideSelect
                            options={LEDGER_ROOM_TYPE_OPTIONS}
                            value={ledgerRoomTypeFilter}
                            onChange={(val) => setLedgerRoomTypeFilter(val)}
                            ariaLabel="Lọc theo hạng phòng"
                            size="md"
                            align="right"
                            menuWidth={210}
                            showTags={false}
                            surfaceColor="#0f172a"
                            highlightColor="#1e293b"
                            accentColor="#14b8a6"
                            textColor="#f8fafc"
                            radius={14}
                        />
                    </div>
                </div>

                {/* BẢNG SỔ NHẬT KÝ CHI TIẾT */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800/80 min-h-[300px] relative z-10">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-300 uppercase text-xs font-bold tracking-wider">
                                <th className="py-3.5 px-4">Mã Đơn</th>
                                <th className="py-3.5 px-4">Khách Hàng</th>
                                <th className="py-3.5 px-4">Phòng & Hạng</th>
                                <th className="py-3.5 px-4">Thời Gian Ở</th>
                                <th className="py-3.5 px-4">Thành Tiền (VND)</th>
                                <th className="py-3.5 px-4">Trạng Thái Dòng Tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                        Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
                                    </td>
                                </tr>
                            ) : (
                                filteredLedger.map(b => {
                                    const statusInfo = TRANSACTION_STATUS[b.bookingStatus] || {
                                        label: b.bookingStatus,
                                        shortLabel: b.bookingStatus,
                                        bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                                        dot: 'bg-slate-400'
                                    };
                                    const roomMeta = ROOM_TYPE_META[(b.roomType || 'STANDARD').toUpperCase()] || ROOM_TYPE_META.STANDARD;

                                    return (
                                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                                            {/* Mã đơn */}
                                            <td className="py-4 px-4 font-bold text-teal-400 whitespace-nowrap">
                                                #{b.id}
                                            </td>

                                            {/* Khách hàng */}
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-white">{b.customerName || `Khách #${b.customerId}`}</div>
                                                <div className="text-xs text-slate-400">{b.customerEmail}</div>
                                            </td>

                                            {/* Phòng & Hạng phòng */}
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-white">Phòng {b.roomNumber}</div>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${roomMeta.badge} mt-0.5`}>
                                                    {b.roomType}
                                                </span>
                                            </td>

                                            {/* Thời gian ở */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="text-xs text-slate-300 font-medium">
                                                    {b.checkInDate} <span className="text-slate-500">→</span> {b.checkOutDate}
                                                </div>
                                                <div className="text-[11px] text-teal-400 font-bold mt-0.5">
                                                    {b.durationNights || 1} đêm
                                                </div>
                                            </td>

                                            {/* Thành tiền */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-black text-base text-emerald-400">
                                                    {Number(b.totalPrice || 0).toLocaleString('vi-VN')}
                                                    <span className="text-xs font-semibold text-emerald-500 ml-1">đ</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    Đơn giá: {Number(b.basePrice || 0).toLocaleString('vi-VN')} đ/đêm
                                                </div>
                                            </td>

                                            {/* Trạng thái dòng tiền */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                                                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                                                    <span>{statusInfo.shortLabel}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
