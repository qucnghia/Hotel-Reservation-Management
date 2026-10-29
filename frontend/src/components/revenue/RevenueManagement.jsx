import { useState, useMemo } from 'react';
import GlideSelect from '../glide-select/GlideSelect.jsx';
import { ArrowDownTrayIcon, PrinterIcon, RefreshIcon, BanknotesIcon, CreditCardIcon, BedIcon, TrendingUpIcon } from '../icons/Icons.jsx';
import { AnimatedNumber, Badge, Button, Card, EmptyState, PageHeader, Segmented, StatCard, Table } from '../ui';
import { BOOKING_STATUS, MEMBERSHIP, ROOM_TYPE, formatMoney } from '../../utils/labels.js';

const TIME_RANGE_OPTIONS = [
    { value: 'ALL', label: 'Tất cả thời gian' },
    { value: 'THIS_MONTH', label: 'Tháng này' },
    { value: '30_DAYS', label: '30 ngày qua' },
    { value: '7_DAYS', label: '7 ngày qua' }
];

const CHART_METRICS = [
    { value: 'revenue', label: 'Doanh thu' },
    { value: 'bookings', label: 'Số đơn' }
];

// Màu cột cơ cấu theo hạng phòng
const TYPE_BAR = { STANDARD: 'bg-gray-400', VIP: 'bg-violet-500', LUXURY: 'bg-amber-500' };

// Phân tích chuỗi ngày nhiều định dạng (dd/MM/yyyy, yyyy-MM-dd, có hoặc không kèm giờ)
function parseAppDate(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
}

const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateLabel = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const fullDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const emptyDay = (d) => ({ dateObj: d, label: dateLabel(d), fullDate: fullDate(d), revenue: 0, count: 0 });
const compactMoney = (n) => (n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr` : n.toLocaleString('vi-VN'));

export default function RevenueManagement({ bookings = [], rooms = [], guests = [], onRefresh }) {
    const [timeRange, setTimeRange] = useState('ALL');
    const [chartMetric, setChartMetric] = useState('revenue');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        try {
            // Giữ hiệu ứng xoay tối thiểu 600ms để người dùng thấy đã làm mới, kể cả khi mạng rất nhanh
            await Promise.all([onRefresh(), new Promise(r => setTimeout(r, 600))]);
        } finally {
            setIsRefreshing(false);
        }
    };

    // 1. Lọc đơn theo khoảng thời gian (theo ngày nhận phòng, thiếu thì theo ngày tạo)
    const filteredBookings = useMemo(() => {
        if (timeRange === 'ALL') return bookings;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return bookings.filter(b => {
            const bookingDate = parseAppDate(b.checkInDate || b.createdAt);
            if (!bookingDate) return true;
            if (timeRange === 'THIS_MONTH') {
                return bookingDate.getFullYear() === now.getFullYear() && bookingDate.getMonth() === now.getMonth();
            }
            const diffDays = Math.abs(startOfToday - bookingDate) / (1000 * 3600 * 24);
            return diffDays <= (timeRange === '30_DAYS' ? 30 : 7);
        });
    }, [bookings, timeRange]);

    // 2. Chỉ số tài chính chính
    const metrics = useMemo(() => {
        let realizedRevenue = 0;
        let completedRevenue = 0;
        let activeRevenue = 0;
        let pendingRevenue = 0;
        let realizedNights = 0;
        let successfulBookingsCount = 0;
        let cancelledCount = 0;

        filteredBookings.forEach(b => {
            // Thực nhận = tiền đã thu (gồm cọc, đã trừ hoàn); chờ thu = số khách còn nợ
            const paid = Number(b.paidAmount || 0);
            const due = Number(b.balanceDue || 0);
            const nights = Number(b.durationNights || 1);
            realizedRevenue += paid;

            if (b.bookingStatus === 'CHECKED_OUT') {
                completedRevenue += paid;
                realizedNights += nights;
                successfulBookingsCount++;
            } else if (b.bookingStatus === 'CHECKED_IN') {
                activeRevenue += paid;
                pendingRevenue += due;
                realizedNights += nights;
                successfulBookingsCount++;
            } else if (b.bookingStatus === 'CONFIRMED') {
                pendingRevenue += due;
            } else if (b.bookingStatus === 'CANCELLED') {
                cancelledCount++;
            }
        });

        const totalRooms = rooms.length || 1;
        const occupiedRooms = rooms.filter(r => r.roomStatus === 'OCCUPIED').length;

        return {
            realizedRevenue,
            pendingRevenue,
            realizedNights,
            successfulBookingsCount,
            // ADR: doanh thu phòng đã bán / số đêm đã bán
            adr: realizedNights > 0 ? Math.round((completedRevenue + activeRevenue) / realizedNights) : 0,
            // RevPAR: doanh thu thực nhận / tổng số phòng
            revPAR: Math.round(realizedRevenue / totalRooms),
            occupancyRate: rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0,
            cancellationRate: filteredBookings.length > 0 ? Math.round((cancelledCount / filteredBookings.length) * 100) : 0
        };
    }, [filteredBookings, rooms]);

    // 3. Cơ cấu doanh thu theo hạng phòng (đơn đã nhận phòng hoặc đã trả phòng)
    const roomTypeStats = useMemo(() => {
        const stats = Object.fromEntries(Object.keys(ROOM_TYPE).map(k => [k, { revenue: 0, nights: 0, count: 0, roomCount: 0 }]));
        rooms.forEach(r => { if (stats[r.roomType]) stats[r.roomType].roomCount++; });
        filteredBookings.forEach(b => {
            if ((b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN') && stats[b.roomType]) {
                stats[b.roomType].count++;
                stats[b.roomType].revenue += Number(b.grandTotal ?? b.totalPrice ?? 0);
                stats[b.roomType].nights += Number(b.durationNights || 1);
            }
        });
        const totalRev = Object.values(stats).reduce((s, x) => s + x.revenue, 0) || 1;
        return Object.entries(stats).map(([type, data]) => ({
            type,
            name: ROOM_TYPE[type].label,
            ...data,
            percentage: Math.round((data.revenue / totalRev) * 100),
            adr: data.nights > 0 ? Math.round(data.revenue / data.nights) : 0
        }));
    }, [filteredBookings, rooms]);

    const topRoomType = roomTypeStats.reduce((top, s) => (!top || s.revenue > top.revenue ? s : top), null);

    // 4. Dữ liệu biểu đồ theo ngày (bỏ đơn đã huỷ)
    const chartData = useMemo(() => {
        const daily = {};
        filteredBookings.filter(b => b.bookingStatus !== 'CANCELLED').forEach(b => {
            const d = parseAppDate(b.checkInDate || b.createdAt);
            if (!d) return;
            const key = dateKey(d);
            daily[key] ||= emptyDay(d);
            if (b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN') {
                daily[key].revenue += Number(b.grandTotal ?? b.totalPrice ?? 0);
            }
            daily[key].count++;
        });

        const keys = Object.keys(daily).sort();
        if (keys.length === 0) return [];

        // Một ngày duy nhất: thêm 2 ngày 0 đồng hai bên cho đường biểu đồ có độ dốc
        if (keys.length === 1) {
            const d = daily[keys[0]].dateObj;
            return [emptyDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)), daily[keys[0]], emptyDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))];
        }

        const first = daily[keys[0]].dateObj;
        const last = daily[keys[keys.length - 1]].dateObj;
        const span = Math.round((last - first) / (1000 * 3600 * 24));

        // Khoảng ngắn: vẽ liên tục từng ngày (kể cả ngày không có đơn)
        if (span <= 15) {
            const list = [];
            for (let cur = new Date(first.getFullYear(), first.getMonth(), first.getDate() - 1); cur <= last; cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)) {
                list.push(daily[dateKey(cur)] || emptyDay(cur));
            }
            return list;
        }
        // Khoảng dài: chỉ các ngày có đơn, tối đa 15 mốc gần nhất
        return keys.map(k => daily[k]).slice(-15);
    }, [filteredBookings]);

    const svgChart = useMemo(() => {
        const width = 760;
        const height = 240;
        const padding = { top: 16, right: 16, bottom: 28, left: 56 };
        if (chartData.length === 0) return null;

        const values = chartData.map(d => (chartMetric === 'revenue' ? d.revenue : d.count));
        const rawMax = Math.max(...values, 1);
        const maxY = chartMetric === 'revenue' ? Math.ceil((rawMax * 1.2) / 1_000_000) * 1_000_000 : Math.ceil(rawMax * 1.25);
        const innerW = width - padding.left - padding.right;
        const innerH = height - padding.top - padding.bottom;

        const points = chartData.map((d, i) => ({
            ...d,
            val: values[i],
            x: padding.left + (chartData.length === 1 ? innerW / 2 : (i / (chartData.length - 1)) * innerW),
            y: padding.top + innerH - (values[i] / maxY) * innerH
        }));

        let linePath = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const midX = (points[i].x + points[i + 1].x) / 2;
            linePath += ` C ${midX} ${points[i].y}, ${midX} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
        }
        const groundY = padding.top + innerH;
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${groundY} L ${points[0].x} ${groundY} Z`;
        const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: padding.top + innerH - t * innerH, value: Math.round(maxY * t) }));

        return { width, height, padding, points, linePath, areaPath, ticks, groundY };
    }, [chartData, chartMetric]);

    // 5. Top khách hàng chi tiêu nhiều nhất (theo chi tiêu tích luỹ = tiền đã thực trả)
    const topGuests = useMemo(() => {
        const bookingCount = {};
        bookings.forEach(b => { if (b.customerId) bookingCount[b.customerId] = (bookingCount[b.customerId] || 0) + 1; });
        return [...guests]
            .map(g => ({ id: g.id, name: g.fullName, membership: g.membership, totalSpent: Number(g.paidPrice || 0), bookingCount: bookingCount[g.id] || 0 }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
    }, [guests, bookings]);

    // Xuất các đơn trong khoảng thời gian đang chọn
    const handleExportCSV = () => {
        const headers = ['Mã đơn', 'Nhận phòng', 'Trả phòng', 'Khách hàng', 'Phòng', 'Hạng phòng', 'Số đêm', 'Tổng tiền (VND)', 'Đã thu (VND)', 'Trạng thái'];
        const rows = filteredBookings.map(b => [
            `#${b.id}`,
            b.checkInDate || '',
            b.checkOutDate || '',
            `"${b.customerName || `Khách #${b.customerId}`}"`,
            b.roomNumber,
            b.roomType,
            b.durationNights || 1,
            b.grandTotal ?? b.totalPrice ?? 0,
            b.paidAmount ?? 0,
            BOOKING_STATUS[b.bookingStatus]?.label || b.bookingStatus
        ]);
        const csv = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bao_Cao_Doanh_Thu_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Doanh thu"
                icon={TrendingUpIcon}
                tone="green"
                description="Tiền đã thu, công nợ và hiệu suất bán phòng."
                actions={
                    <>
                        <GlideSelect options={TIME_RANGE_OPTIONS} value={timeRange} onChange={setTimeRange} ariaLabel="Khoảng thời gian" menuWidth={180} align="right" />
                        <Button icon={RefreshIcon} iconClassName={isRefreshing ? 'animate-spin' : ''} onClick={handleRefresh} disabled={isRefreshing} aria-busy={isRefreshing}>{isRefreshing ? 'Đang làm mới' : 'Làm mới'}</Button>
                        <Button icon={ArrowDownTrayIcon} onClick={handleExportCSV}>Xuất CSV</Button>
                        <Button icon={PrinterIcon} onClick={() => window.print()}>In</Button>
                    </>
                }
            />

            {/* Chỉ số chính */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={BanknotesIcon} tone="green" label="Doanh thu thực nhận" value={<AnimatedNumber value={metrics.realizedRevenue} format={formatMoney} />} className="animate-rise" style={{ '--i': 0 }} hint={`${metrics.successfulBookingsCount} đơn · ${metrics.realizedNights} đêm phòng`} />
                <StatCard icon={CreditCardIcon} tone="amber" label="Còn phải thu" value={<AnimatedNumber value={metrics.pendingRevenue} format={formatMoney} />} className="animate-rise" style={{ '--i': 1 }} hint="Số khách còn nợ ở đơn đang hiệu lực" />
                <StatCard icon={BedIcon} tone="blue" label="Giá bình quân / đêm (ADR)" value={<AnimatedNumber value={metrics.adr} format={formatMoney} />} className="animate-rise" style={{ '--i': 2 }} hint="Doanh thu phòng chia số đêm đã bán" />
                <StatCard icon={TrendingUpIcon} tone="teal" label="Doanh thu / phòng (RevPAR)" value={<AnimatedNumber value={metrics.revPAR} format={formatMoney} />} className="animate-rise" style={{ '--i': 3 }} hint={`${rooms.length} phòng · công suất hiện tại ${metrics.occupancyRate}%`} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {/* Biểu đồ */}
                <Card className="xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <h3 className="text-sm font-semibold text-fg">Diễn biến theo ngày nhận phòng</h3>
                        <Segmented options={CHART_METRICS} value={chartMetric} onChange={setChartMetric} />
                    </div>
                    {svgChart ? (
                        <div className="relative p-4">
                            <svg viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} className="h-auto w-full" role="img" aria-label="Biểu đồ doanh thu theo ngày">
                                <defs>
                                    <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {svgChart.ticks.map(t => (
                                    <g key={t.y}>
                                        <line x1={svgChart.padding.left} x2={svgChart.width - svgChart.padding.right} y1={t.y} y2={t.y} stroke="var(--line)" strokeDasharray={t.value === 0 ? '' : '3 4'} />
                                        <text x={svgChart.padding.left - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="var(--faint)">
                                            {chartMetric === 'revenue' ? compactMoney(t.value) : t.value}
                                        </text>
                                    </g>
                                ))}
                                <path key={`area-${chartMetric}-${timeRange}`} d={svgChart.areaPath} fill="url(#revenue-area)" className="animate-fadeIn" />
                                <path key={`line-${chartMetric}-${timeRange}`} d={svgChart.linePath} pathLength="1" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" className="animate-draw" />
                                {svgChart.points.map((p, i) => (
                                    <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                                        <rect x={p.x - 16} y={svgChart.padding.top} width="32" height={svgChart.groundY - svgChart.padding.top} fill="transparent" />
                                        {hoveredPoint === i && <line x1={p.x} x2={p.x} y1={svgChart.padding.top} y2={svgChart.groundY} stroke="var(--line-strong)" />}
                                        <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 5 : 3} fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" style={{ transition: 'r 150ms ease' }} />
                                        <text x={p.x} y={svgChart.height - 8} textAnchor="middle" fontSize="11" fill="var(--faint)">{p.label}</text>
                                    </g>
                                ))}
                            </svg>
                            {hoveredPoint !== null && (() => {
                                const p = svgChart.points[hoveredPoint];
                                return (
                                    <div
                                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg"
                                        // Khung có p-4 nên vùng vẽ = 100% trừ 2rem; quy đổi toạ độ SVG sang vị trí trong khung
                                        style={{ left: `calc(1rem + (100% - 2rem) * ${p.x / svgChart.width})`, top: `calc(1rem + (100% - 2rem) * ${p.y / svgChart.height} - 6px)` }}
                                    >
                                        <p className="font-medium text-fg">{p.fullDate}</p>
                                        <p className="text-muted tabular">{formatMoney(p.revenue)} · {p.count} đơn</p>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <EmptyState title="Chưa có dữ liệu trong khoảng thời gian này" />
                    )}
                </Card>

                {/* Cơ cấu hạng phòng */}
                <Card>
                    <div className="border-b border-line px-4 py-3">
                        <h3 className="text-sm font-semibold text-fg">Cơ cấu theo hạng phòng</h3>
                    </div>
                    <div className="flex flex-col gap-4 p-4">
                        {roomTypeStats.map(s => (
                            <div key={s.type}>
                                <div className="flex items-baseline justify-between text-sm">
                                    <span className="font-medium text-fg">{s.name}</span>
                                    <span className="text-fg tabular">{formatMoney(s.revenue)}</span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
                                    <div key={`${s.type}-${timeRange}`} className={`h-full rounded-full animate-grow ${TYPE_BAR[s.type]}`} style={{ width: `${s.percentage}%` }} />
                                </div>
                                <p className="mt-1 text-xs text-muted tabular">
                                    {s.percentage}% · {s.count} đơn · {s.roomCount} phòng · ADR {formatMoney(s.adr)}
                                </p>
                            </div>
                        ))}
                        <p className="border-t border-line pt-3 text-xs text-muted">
                            {topRoomType && topRoomType.revenue > 0
                                ? `Hạng ${topRoomType.name} đóng góp nhiều nhất (${topRoomType.percentage}%). Tỷ lệ huỷ đơn: ${metrics.cancellationRate}%.`
                                : 'Chưa có doanh thu trong khoảng thời gian này.'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Top khách hàng */}
            <Card>
                <div className="border-b border-line px-4 py-3">
                    <h3 className="text-sm font-semibold text-fg">Khách hàng chi tiêu nhiều nhất</h3>
                </div>
                <Table head={['#', 'Khách hàng', 'Hạng', 'Số đơn', { label: 'Đã chi tiêu', className: 'text-right' }]}>
                    {topGuests.map((g, i) => {
                        const mem = MEMBERSHIP[g.membership] || MEMBERSHIP.CUSTOMER;
                        return (
                            <tr key={g.id}>
                                <td className="w-10 px-4 py-2.5 text-muted tabular">{i + 1}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-fg">{g.name}</td>
                                <td className="px-4 py-2.5"><Badge tone={mem.tone}>{mem.label}</Badge></td>
                                <td className="px-4 py-2.5 text-muted tabular">{g.bookingCount}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-fg tabular">{formatMoney(g.totalSpent)}</td>
                            </tr>
                        );
                    })}
                </Table>
            </Card>

        </div>
    );
}
