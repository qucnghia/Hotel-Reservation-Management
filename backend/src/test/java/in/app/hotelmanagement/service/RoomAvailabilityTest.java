package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.customerDTO.CustomerRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomResponse;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.RoomType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RoomAvailabilityTest {

    private static final LocalDate DAY = LocalDate.now().plusDays(10);

    @Autowired
    RoomService roomService;

    @Autowired
    CustomerService customerService;

    @Autowired
    BookingService bookingService;

    private void room(long number) {
        RoomRequest r = new RoomRequest();
        r.setRoomNumber(number);
        r.setRoomType(RoomType.STANDARD);
        r.setBasePrice(500_000L);
        roomService.createRoom(r);
    }

    private Long book(String email, long room, LocalDate in, LocalDate out) {
        CustomerRequest c = new CustomerRequest();
        c.setFullName("Khách test");
        c.setEmail(email);
        Long customerId = customerService.createGuest(c).getId();
        return bookingService.createBooking(new BookingRequest(customerId, room, in, out)).getId();
    }

    private Set<Long> available(LocalDate in, LocalDate out) {
        return roomService.getAvailableRooms(in, out).stream()
                .map(RoomResponse::getRoomNumber)
                .collect(Collectors.toSet());
    }

    @Test
    void excludesOverlappingBookingsAndMaintenanceButNotCancelledOrAdjacentStays() {
        room(911);
        room(912);
        room(913);
        book("a@test.vn", 911, DAY, DAY.plusDays(3));
        Long cancelled = book("b@test.vn", 912, DAY, DAY.plusDays(3));
        bookingService.updateBookingStatus(cancelled, BookingStatus.CANCELLED);
        roomService.setMaintenance(913L, true);

        Set<Long> overlapping = available(DAY.plusDays(1), DAY.plusDays(2));
        assertFalse(overlapping.contains(911L), "phòng có đơn chồng ngày phải bị loại");
        assertTrue(overlapping.contains(912L), "đơn đã huỷ không được chặn phòng");
        assertFalse(overlapping.contains(913L), "phòng bảo trì phải bị loại");

        // Ngày trả phòng của đơn cũ là ngày nhận phòng được của đơn mới
        assertTrue(available(DAY.plusDays(3), DAY.plusDays(5)).contains(911L));
    }
}
