import { useState } from 'react';
import { CalendarIcon } from '../icons/Icons.jsx';
import { parseAnyDate, formatToDDMMYYYY, isSameDay } from '../../utils/date.js';

const DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Màu thanh đơn theo trạng thái (cùng bảng màu với BookingTable)
const BAR_STYLES = {
    CONFIRMED: { bar: 'bg-blue-500/25 border-blue-500/50 text-blue-200', label: 'Đã xác nhận' },
    CHECKED_IN: { bar: 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200', label: 'Đang lưu trú' },
    CHECKED_OUT: { bar: 'bg-purple-500/20 border-purple-500/40 text-purple-200', label: 'Đã trả phòng' }
};

const startOfToday = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

// Số ngày giữa 2 mốc 00:00 (làm tròn để không lệch khi đổi giờ mùa hè)
const daysBetween = (from, to) => Math.round((to - from) / DAY_MS);

export default function RoomCalendar({ rooms = [], bookings = [], onBookRoom }) {
    const today = startOfToday();
    const [start, setStart] = useState(today);
    const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
    const gridTemplateColumns = `150px repeat(${DAYS}, minmax(52px, 1fr))`;

    // Thanh đơn đặt phòng của từng phòng, cắt theo khung 14 ngày đang xem
    const barsByRoom = {};
    bookings.forEach((b) => {
        if (!BAR_STYLES[b.bookingStatus]) return;
        const checkIn = parseAnyDate(b.checkInDate);
        const checkOut = parseAnyDate(b.checkOutDate);
        if (!checkIn || !checkOut) return;

        const from = daysBetween(start, checkIn);
        // Đặt trong ngày vẫn chiếm 1 ô; ngày trả phòng không tính là đêm ở
        const to = isSameDay(checkIn, checkOut) ? from + 1 : daysBetween(start, checkOut);
        const visibleFrom = Math.max(0, from);
        const visibleTo = Math.min(DAYS, to);
        if (visibleTo <= visibleFrom) return;

        (barsByRoom[b.roomNumber] ||= []).push({ booking: b, visibleFrom, visibleTo });
    });

    const isDayTaken = (roomNumber, dayIndex) =>
        (barsByRoom[roomNumber] || []).some(({ booking, visibleFrom, visibleTo }) =>
            booking.bookingStatus !== 'CHECKED_OUT' && dayIndex >= visibleFrom && dayIndex < visibleTo
        );

    const sortedRooms = [...rooms].sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));
    const floorOf = (n) => (Number(n) >= 100 ? Math.floor(Number(n) / 100) : 1);

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
            {/* Thanh điều hướng thời gian */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lịch Phòng</h3>
                        <p className="text-xs text-slate-400">
                            {formatToDDMMYYYY(days[0])} – {formatToDDMMYYYY(days[DAYS - 1])} • Bấm ô trống để đặt phòng
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setStart(addDays(start, -7))}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
                        aria-label="Lùi 1 tuần"
                    >
                        ◄
                    </button>
                    <button
                        type="button"
                        onClick={() => setStart(today)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-bold cursor-pointer"
                    >
                        Hôm nay
                    </button>
                    <button
                        type="button"
                        onClick={() => setStart(addDays(start, 7))}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
                        aria-label="Tiến 1 tuần"
                    >
                        ►
                    </button>
                </div>
            </div>

            {/* Chú thích màu */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {Object.entries(BAR_STYLES).map(([status, s]) => (
                    <span key={status} className={`px-2.5 py-1 rounded-lg border ${s.bar}`}>{s.label}</span>
                ))}
                <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-400">Bảo trì</span>
            </div>

            {/* Lưới lịch */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <div className="min-w-[880px]">
                    {/* Hàng tiêu đề ngày */}
                    <div className="grid bg-slate-950/70 border-b border-slate-800" style={{ gridTemplateColumns }}>
                        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Phòng</div>
                        {days.map((d) => {
                            const isToday = isSameDay(d, today);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                                <div
                                    key={d.getTime()}
                                    className={`py-2 text-center border-l border-slate-800/70 ${isToday ? 'bg-indigo-500/15' : ''}`}
                                >
                                    <div className={`text-[11px] font-bold ${isWeekend ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {WEEKDAYS[d.getDay()]}
                                    </div>
                                    <div className={`text-sm font-extrabold ${isToday ? 'text-indigo-300' : 'text-slate-200'}`}>
                                        {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {sortedRooms.length === 0 && (
                        <div className="py-10 text-center text-sm text-slate-400">Chưa có phòng nào.</div>
                    )}

                    {sortedRooms.map((room, idx) => {
                        const isMaintenance = room.roomStatus === 'UNDER_MAINTENANCE';
                        const newFloor = idx === 0 || floorOf(room.roomNumber) !== floorOf(sortedRooms[idx - 1].roomNumber);

                        return (
                            <div key={room.roomNumber}>
                                {newFloor && (
                                    <div className="px-3 py-1.5 bg-slate-950/50 border-b border-slate-800 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Tầng {floorOf(room.roomNumber)}
                                    </div>
                                )}

                                <div className="grid border-b border-slate-800/70 last:border-b-0" style={{ gridTemplateColumns }}>
                                    {/* Nhãn phòng */}
                                    <div className="px-3 py-2.5 flex items-center gap-2 whitespace-nowrap" style={{ gridRow: 1, gridColumn: 1 }}>
                                        <span className="font-extrabold text-slate-900 dark:text-white">{room.roomNumber}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{room.roomType}</span>
                                    </div>

                                    {/* Ô ngày (bấm để đặt) */}
                                    {days.map((d, i) => {
                                        const isPast = d < today;
                                        const clickable = !isMaintenance && !isPast && !isDayTaken(room.roomNumber, i) && onBookRoom;
                                        return (
                                            <button
                                                key={d.getTime()}
                                                type="button"
                                                disabled={!clickable}
                                                onClick={() => onBookRoom(room, formatToDDMMYYYY(d))}
                                                title={clickable ? `Đặt phòng ${room.roomNumber} từ ${formatToDDMMYYYY(d)}` : undefined}
                                                style={{ gridRow: 1, gridColumn: i + 2 }}
                                                className={`min-h-[44px] border-l border-slate-800/70 transition-colors ${
                                                    isMaintenance
                                                        ? 'bg-slate-800/60'
                                                        : isPast
                                                            ? 'bg-slate-950/40'
                                                            : clickable
                                                                ? 'hover:bg-indigo-500/15 cursor-pointer'
                                                                : ''
                                                } ${isSameDay(d, today) ? 'bg-indigo-500/5' : ''}`}
                                            />
                                        );
                                    })}

                                    {isMaintenance && (
                                        <div
                                            className="self-center mx-1 px-2 py-1 rounded-lg text-xs font-bold text-slate-400 pointer-events-none"
                                            style={{ gridRow: 1, gridColumn: `2 / span ${DAYS}` }}
                                        >
                                            Đang bảo trì
                                        </div>
                                    )}

                                    {/* Thanh đơn đặt phòng */}
                                    {(barsByRoom[room.roomNumber] || []).map(({ booking, visibleFrom, visibleTo }) => (
                                        <div
                                            key={booking.id}
                                            title={`#${booking.id} • ${booking.customerName} • ${booking.checkInDate} → ${booking.checkOutDate} • ${BAR_STYLES[booking.bookingStatus].label}`}
                                            style={{ gridRow: 1, gridColumn: `${visibleFrom + 2} / ${visibleTo + 2}` }}
                                            className={`self-center mx-1 px-2 py-1.5 rounded-lg border text-xs font-bold truncate pointer-events-auto z-10 ${BAR_STYLES[booking.bookingStatus].bar}`}
                                        >
                                            {booking.customerName || `Khách #${booking.customerId}`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
