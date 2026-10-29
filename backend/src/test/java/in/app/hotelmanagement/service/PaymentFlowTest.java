package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.bookingDTO.BookingResponse;
import in.app.hotelmanagement.dto.customerDTO.CustomerRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceRequest;
import in.app.hotelmanagement.enums.*;
import in.app.hotelmanagement.exception.InvalidBookingException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PaymentFlowTest {

    private static final LocalDate DAY = LocalDate.now().plusDays(1);

    @Autowired
    RoomService roomService;

    @Autowired
    CustomerService customerService;

    @Autowired
    BookingService bookingService;

    @Autowired
    ExtraServiceService extraServiceService;

    private Long setUpCustomerAndRoom() {
        RoomRequest room = new RoomRequest();
        room.setRoomNumber(931L);
        room.setRoomType(RoomType.STANDARD);
        room.setBasePrice(1_000_000L);
        roomService.createRoom(room);

        CustomerRequest c = new CustomerRequest();
        c.setFullName("Khách test");
        c.setEmail("pay@test.vn");
        return customerService.createGuest(c).getId();
    }

    private long paidPriceOf(Long customerId) {
        return customerService.getCustomerById(customerId).getPaidPrice();
    }

    @Test
    void spendingGrowsOnlyWithPaymentsAndCheckoutNeedsFullPayment() {
        Long customerId = setUpCustomerAndRoom();
        Long bookingId = bookingService.createBooking(new BookingRequest(customerId, 931L, DAY, DAY.plusDays(2))).getId();
        assertEquals(0L, paidPriceOf(customerId), "đặt phòng chưa trả tiền thì chưa tính chi tiêu");

        BookingResponse deposit = bookingService.addPayment(bookingId, 500_000L, PaymentMethod.CASH);
        assertEquals(PaymentType.DEPOSIT, deposit.getPayments().get(0).type());
        assertEquals(1_500_000L, deposit.getBalanceDue());
        assertEquals(500_000L, paidPriceOf(customerId));
        assertThrows(InvalidBookingException.class,
                () -> bookingService.addPayment(bookingId, 2_000_000L, PaymentMethod.CASH), "không được trả quá số còn nợ");

        bookingService.updateBookingStatus(bookingId, BookingStatus.CHECKED_IN);
        Long minibarId = extraServiceService.create(new ExtraServiceRequest("Minibar test", 50_000L, PricingMode.PER_ITEM)).id();
        bookingService.addService(bookingId, minibarId, 2); // +100.000
        assertThrows(InvalidBookingException.class,
                () -> bookingService.updateBookingStatus(bookingId, BookingStatus.CHECKED_OUT), "còn nợ thì không trả phòng được");

        BookingResponse settled = bookingService.addPayment(bookingId, 1_600_000L, PaymentMethod.CARD);
        assertEquals(PaymentType.PAYMENT, settled.getPayments().get(1).type());
        assertEquals(0L, settled.getBalanceDue());
        assertEquals(BookingStatus.CHECKED_OUT, bookingService.updateBookingStatus(bookingId, BookingStatus.CHECKED_OUT).getBookingStatus());
        assertEquals(2_100_000L, paidPriceOf(customerId));
        assertEquals(CustomerMembership.ECONOMY, customerService.getCustomerById(customerId).getMembership());
    }

    @Test
    void cancellingRefundsTheDeposit() {
        Long customerId = setUpCustomerAndRoom();
        Long bookingId = bookingService.createBooking(new BookingRequest(customerId, 931L, DAY, DAY.plusDays(2))).getId();
        bookingService.addPayment(bookingId, 300_000L, PaymentMethod.TRANSFER);

        BookingResponse cancelled = bookingService.updateBookingStatus(bookingId, BookingStatus.CANCELLED);

        assertEquals(PaymentType.REFUND, cancelled.getPayments().get(1).type());
        assertEquals(300_000L, cancelled.getPayments().get(1).amount());
        assertEquals(0L, cancelled.getPaidAmount());
        assertEquals(0L, cancelled.getBalanceDue());
        assertEquals(0L, paidPriceOf(customerId));
    }
}
