import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons.jsx';
import { Button, Card } from '../ui';
import { parseAnyDate, formatToDDMMYYYY, isSameDay } from '../../utils/date.js';
import { BOOKING_STATUS, ROOM_TYPE, floorOf } from '../../utils/labels.js';

const DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Màu thanh đơn theo trạng thái
const BAR_STYLES = {
    CONFIRMED: 'bg-blue-100 text-blue-800 ring-blue-300 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-blue-400/30',
    CHECKED_IN: 'bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30',
    CHECKED_OUT: 'bg-gray-100 text-gray-600 ring-gray-300 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10'
};

const startOfToday = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

// Số ngày giữa 2 mốc 00:00 (làm tròn để không lệch khi đổi giờ mùa hè)
const daysBetween = (from, to) => Math.round((to - from) / DAY_MS);

// Xếp các đơn chồng ngày của cùng một phòng vào nhiều dòng để không vẽ đè lên nhau
const assignLanes = (bars) => {
    const laneEnds = [];
    return [...bars]
        .sort((a, b) => a.from - b.from)
        .map(bar => {
            let lane = laneEnds.findIndex(end => end <= bar.from);
            if (lane === -1) {
                lane = laneEnds.length;
                laneEnds.push(0);
            }
            laneEnds[lane] = bar.to;
            return { ...bar, lane };
        });
};

export default function RoomCalendar({ rooms = [], bookings = [], onBookRoom }) {
    const today = startOfToday();
    const [start, setStart] = useState(today);
    const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
    const gridTemplateColumns = `120px repeat(${DAYS}, minmax(48px, 1fr))`;

    // Thanh đơn của từng phòng, cắt theo khung 14 ngày đang xem
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

        (barsByRoom[b.roomNumber] ||= []).push({ booking: b, from: visibleFrom, to: visibleTo });
    });

    const isDayTaken = (roomNumber, dayIndex) =>
        (barsByRoom[roomNumber] || []).some(({ booking, from, to }) =>
            booking.bookingStatus !== 'CHECKED_OUT' && dayIndex >= from && dayIndex < to
        );

    const sortedRooms = [...rooms].sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));

    return (
        <Card>
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button size="icon" icon={ChevronLeftIcon} onClick={() => setStart(addDays(start, -7))} aria-label="Lùi 1 tuần" />
                    <Button size="sm" onClick={() => setStart(today)}>Hôm nay</Button>
                    <Button size="icon" icon={ChevronRightIcon} onClick={() => setStart(addDays(start, 7))} aria-label="Tiến 1 tuần" />
                    <span className="ml-1 text-sm font-medium text-fg tabular">
                        {formatToDDMMYYYY(days[0])} – {formatToDDMMYYYY(days[DAYS - 1])}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    {Object.keys(BAR_STYLES).map(status => (
                        <span key={status} className="inline-flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-sm ring-1 ring-inset ${BAR_STYLES[status]}`} />
                            {BOOKING_STATUS[status].label}
                        </span>
                    ))}
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-subtle ring-1 ring-inset ring-line-strong" />
                        Bảo trì
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[840px] text-sm">
                    {/* Hàng tiêu đề ngày */}
                    <div className="grid border-b border-line bg-subtle/60" style={{ gridTemplateColumns }}>
                        <div className="px-3 py-2 text-xs font-medium text-muted">Phòng</div>
                        {days.map((d) => {
                            const isToday = isSameDay(d, today);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                                <div key={d.getTime()} className={`border-l border-line py-1.5 text-center ${isToday ? 'bg-accent-soft' : ''}`}>
                                    <div className={`text-[11px] ${isWeekend ? 'text-amber-600 dark:text-amber-400' : 'text-faint'}`}>{WEEKDAYS[d.getDay()]}</div>
                                    <div className={`text-xs font-medium tabular ${isToday ? 'text-accent' : 'text-fg'}`}>
                                        {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {sortedRooms.length === 0 && <p className="py-10 text-center text-sm text-muted">Chưa có phòng nào.</p>}

                    {sortedRooms.map((room, idx) => {
                        const isMaintenance = room.roomStatus === 'UNDER_MAINTENANCE';
                        const newFloor = idx === 0 || floorOf(room.roomNumber) !== floorOf(sortedRooms[idx - 1].roomNumber);
                        const bars = assignLanes(barsByRoom[room.roomNumber] || []);
                        const lanes = Math.max(1, ...bars.map(b => b.lane + 1));
                        const rowSpan = `1 / span ${lanes}`;

                        return (
                            <div key={room.roomNumber}>
                                {newFloor && (
                                    <div className="border-b border-line bg-subtle/40 px-3 py-1 text-xs font-medium text-muted">Tầng {floorOf(room.roomNumber)}</div>
                                )}

                                <div
                                    className="grid border-b border-line last:border-b-0"
                                    style={{ gridTemplateColumns, gridTemplateRows: `repeat(${lanes}, minmax(36px, auto))` }}
                                >
                                    <div className="flex items-center gap-2 px-3" style={{ gridRow: rowSpan, gridColumn: 1 }}>
                                        <span className="font-semibold text-fg tabular">{room.roomNumber}</span>
                                        <span className="text-xs text-muted">{ROOM_TYPE[room.roomType]?.label}</span>
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
                                                aria-label={clickable ? `Đặt phòng ${room.roomNumber} từ ${formatToDDMMYYYY(d)}` : undefined}
                                                title={clickable ? `Đặt phòng ${room.roomNumber} từ ${formatToDDMMYYYY(d)}` : undefined}
                                                style={{ gridRow: rowSpan, gridColumn: i + 2 }}
                                                className={`border-l border-line transition-colors ${
                                                    isMaintenance
                                                        ? 'bg-[repeating-linear-gradient(135deg,var(--subtle)_0_6px,transparent_6px_12px)]'
                                                        : isPast
                                                            ? 'bg-subtle/40'
                                                            : clickable
                                                                ? 'hover:bg-accent-soft cursor-pointer'
                                                                : ''
                                                } ${isSameDay(d, today) ? 'bg-accent-soft/50' : ''}`}
                                            />
                                        );
                                    })}

                                    {isMaintenance && (
                                        <div className="pointer-events-none self-center px-2 text-xs text-muted" style={{ gridRow: 1, gridColumn: `2 / span ${DAYS}` }}>
                                            Đang bảo trì
                                        </div>
                                    )}

                                    {/* Thanh đơn đặt phòng */}
                                    {bars.map(({ booking, from, to, lane }) => (
                                        <div
                                            key={booking.id}
                                            title={`#${booking.id} · ${booking.customerName} · ${booking.checkInDate} → ${booking.checkOutDate} · ${BOOKING_STATUS[booking.bookingStatus].label}`}
                                            style={{ gridRow: lane + 1, gridColumn: `${from + 2} / ${to + 2}` }}
                                            className={`pointer-events-auto z-10 mx-0.5 my-1 self-center truncate rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${BAR_STYLES[booking.bookingStatus]}`}
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
            <p className="border-t border-line px-3 py-2 text-xs text-muted">Bấm vào một ô trống để tạo đơn đặt phòng bắt đầu từ ngày đó.</p>
        </Card>
    );
}
