package in.nqn.hotelmanagement.repository;

import in.nqn.hotelmanagement.entity.Booking;
import in.nqn.hotelmanagement.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer_IdOrderByIdDesc(Long customerId);

    /**
     * Thuật toán kiểm tra trùng lịch đặt phòng (Overlap Check):
     * Tìm tất cả các đơn đặt phòng cho cùng một phòng mà:
     * - Trạng thái KHÔNG PHẢI CANCELLED hoặc CHECKED_OUT
     * - Khoảng thời gian bị giao nhau: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
     */
    @Query("SELECT b FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.bookingStatus NOT IN (in.nqn.hotelmanagement.enums.BookingStatus.CANCELLED, in.nqn.hotelmanagement.enums.BookingStatus.CHECKED_OUT) " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findConflictingBookings(@Param("roomNumber") Long roomNumber,
                                         @Param("checkInDate") LocalDate checkInDate,
                                         @Param("checkOutDate") LocalDate checkOutDate);

    /**
     * Kiểm tra trùng lịch khi sửa đơn: Loại trừ chính đơn đang sửa (id != :excludeBookingId)
     */
    @Query("SELECT b FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.id <> :excludeBookingId " +
           "AND b.bookingStatus NOT IN (in.nqn.hotelmanagement.enums.BookingStatus.CANCELLED, in.nqn.hotelmanagement.enums.BookingStatus.CHECKED_OUT) " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findConflictingBookingsExcludingCurrent(@Param("roomNumber") Long roomNumber,
                                                         @Param("excludeBookingId") Long excludeBookingId,
                                                         @Param("checkInDate") LocalDate checkInDate,
                                                         @Param("checkOutDate") LocalDate checkOutDate);
}
