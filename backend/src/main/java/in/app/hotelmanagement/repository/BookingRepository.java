package in.app.hotelmanagement.repository;

import in.app.hotelmanagement.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer_IdOrderByIdDesc(Long customerId);

    boolean existsByRoom_RoomNumber(Long roomNumber);

    @Query("SELECT DISTINCT b.room.roomNumber FROM Booking b " +
           "WHERE b.bookingStatus = in.app.hotelmanagement.enums.BookingStatus.CHECKED_IN")
    Set<Long> findCheckedInRoomNumbers();

    @Query("SELECT DISTINCT b.room.roomNumber FROM Booking b " +
           "WHERE b.bookingStatus = in.app.hotelmanagement.enums.BookingStatus.CONFIRMED " +
           "AND b.checkOutDate >= :today")
    Set<Long> findActiveConfirmedRoomNumbers(@Param("today") LocalDate today);

    /**
     * Thuật toán kiểm tra trùng lịch đặt phòng (Overlap Check):
     * Tìm tất cả các đơn đặt phòng cho cùng một phòng mà:
     * - Trạng thái KHÔNG PHẢI CANCELLED hoặc CHECKED_OUT
     * - Khoảng thời gian bị giao nhau: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
     */
    @Query("SELECT b FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.bookingStatus NOT IN (in.app.hotelmanagement.enums.BookingStatus.CANCELLED, in.app.hotelmanagement.enums.BookingStatus.CHECKED_OUT) " +
           "AND b.checkInDate < :checkOutDate " +
           "AND (b.checkOutDate > :checkInDate OR (b.checkOutDate = b.checkInDate AND b.checkInDate >= :checkInDate))")
    List<Booking> findConflictingBookings(@Param("roomNumber") Long roomNumber,
                                         @Param("checkInDate") LocalDate checkInDate,
                                         @Param("checkOutDate") LocalDate checkOutDate);

    // Cùng điều kiện trùng lịch như findConflictingBookings nhưng cho mọi phòng
    @Query("SELECT DISTINCT b.room.roomNumber FROM Booking b " +
           "WHERE b.bookingStatus NOT IN (in.app.hotelmanagement.enums.BookingStatus.CANCELLED, in.app.hotelmanagement.enums.BookingStatus.CHECKED_OUT) " +
           "AND b.checkInDate < :checkOutDate " +
           "AND (b.checkOutDate > :checkInDate OR (b.checkOutDate = b.checkInDate AND b.checkInDate >= :checkInDate))")
    Set<Long> findBookedRoomNumbers(@Param("checkInDate") LocalDate checkInDate,
                                    @Param("checkOutDate") LocalDate checkOutDate);

    /**
     * Kiểm tra trùng lịch khi sửa đơn: Loại trừ chính đơn đang sửa (id != :excludeBookingId)
     */
    @Query("SELECT b FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.id <> :excludeBookingId " +
           "AND b.bookingStatus NOT IN (in.app.hotelmanagement.enums.BookingStatus.CANCELLED, in.app.hotelmanagement.enums.BookingStatus.CHECKED_OUT) " +
           "AND b.checkInDate < :checkOutDate " +
           "AND (b.checkOutDate > :checkInDate OR (b.checkOutDate = b.checkInDate AND b.checkInDate >= :checkInDate))")
    List<Booking> findConflictingBookingsExcludingCurrent(@Param("roomNumber") Long roomNumber,
                                                         @Param("excludeBookingId") Long excludeBookingId,
                                                         @Param("checkInDate") LocalDate checkInDate,
                                                         @Param("checkOutDate") LocalDate checkOutDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.id <> :excludeBookingId " +
           "AND b.bookingStatus = in.app.hotelmanagement.enums.BookingStatus.CHECKED_IN")
    boolean hasOtherCheckedInBooking(@Param("roomNumber") Long roomNumber,
                                     @Param("excludeBookingId") Long excludeBookingId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.room.roomNumber = :roomNumber " +
           "AND b.id <> :excludeBookingId " +
           "AND b.bookingStatus = in.app.hotelmanagement.enums.BookingStatus.CONFIRMED " +
           "AND b.checkOutDate >= :today")
    boolean hasActiveConfirmedBooking(@Param("roomNumber") Long roomNumber,
                                      @Param("excludeBookingId") Long excludeBookingId,
                                      @Param("today") LocalDate today);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.customer.id = :customerId " +
           "AND b.bookingStatus IN (in.app.hotelmanagement.enums.BookingStatus.CONFIRMED, in.app.hotelmanagement.enums.BookingStatus.CHECKED_IN)")
    boolean hasActiveBookingForCustomer(@Param("customerId") Long customerId);
}
