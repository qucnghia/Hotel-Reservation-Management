package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.customerDTO.CustomerRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;
import in.app.hotelmanagement.exception.InvalidBookingException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RoomMaintenanceTest {

    @Autowired
    RoomService roomService;

    @Autowired
    CustomerService customerService;

    @Autowired
    BookingService bookingService;

    private Long newCustomer(String email) {
        CustomerRequest c = new CustomerRequest();
        c.setFullName("Khách test");
        c.setEmail(email);
        return customerService.createGuest(c).getId();
    }

    private BookingRequest booking(Long customerId) {
        LocalDate today = LocalDate.now();
        return new BookingRequest(customerId, 901L, today, today.plusDays(1));
    }

    @Test
    void maintenanceBlocksBookingAndCannotStartWhileRoomHasActiveBooking() {
        RoomRequest room = new RoomRequest();
        room.setRoomNumber(901L);
        room.setRoomType(RoomType.STANDARD);
        room.setBasePrice(500_000L);
        roomService.createRoom(room);

        // Có đơn đã xác nhận -> không được bảo trì
        Long bookingId = bookingService.createBooking(booking(newCustomer("a@test.vn"))).getId();
        assertThrows(InvalidBookingException.class, () -> roomService.setMaintenance(901L, true));

        // Huỷ đơn -> bảo trì được, và không ai đặt được phòng nữa
        bookingService.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
        assertEquals(RoomStatus.UNDER_MAINTENANCE, roomService.setMaintenance(901L, true).getRoomStatus());
        Long other = newCustomer("b@test.vn");
        assertThrows(InvalidBookingException.class, () -> bookingService.createBooking(booking(other)));

        // Kết thúc bảo trì -> phòng sẵn sàng trở lại
        assertEquals(RoomStatus.AVAILABLE, roomService.setMaintenance(901L, false).getRoomStatus());
    }
}
