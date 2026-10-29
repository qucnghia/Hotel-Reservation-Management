package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.bookingDTO.BookingResponse;
import in.app.hotelmanagement.dto.customerDTO.CustomerRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.ExtraServiceType;
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
class BookingServiceChargeTest {

    @Autowired
    RoomService roomService;

    @Autowired
    CustomerService customerService;

    @Autowired
    BookingService bookingService;

    @Test
    void addAndRemoveServicesOnActiveBookingOnly() {
        RoomRequest room = new RoomRequest();
        room.setRoomNumber(921L);
        room.setRoomType(RoomType.STANDARD);
        room.setBasePrice(500_000L);
        roomService.createRoom(room);

        CustomerRequest c = new CustomerRequest();
        c.setFullName("Khách test");
        c.setEmail("svc@test.vn");
        Long customerId = customerService.createGuest(c).getId();

        LocalDate in = LocalDate.now().plusDays(1);
        Long bookingId = bookingService.createBooking(new BookingRequest(customerId, 921L, in, in.plusDays(2))).getId();

        BookingResponse withBreakfast = bookingService.addService(bookingId, ExtraServiceType.BREAKFAST, 2);
        assertEquals(1, withBreakfast.getServices().size());
        assertEquals(2 * 2 * 150_000L, withBreakfast.getServiceTotal());
        assertEquals(1_000_000L + 600_000L, withBreakfast.getGrandTotal());

        Long serviceId = withBreakfast.getServices().get(0).id();
        BookingResponse removed = bookingService.removeService(bookingId, serviceId);
        assertTrue(removed.getServices().isEmpty());
        assertEquals(1_000_000L, removed.getGrandTotal());

        bookingService.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
        assertThrows(InvalidBookingException.class,
                () -> bookingService.addService(bookingId, ExtraServiceType.MINIBAR, 1));
    }
}
