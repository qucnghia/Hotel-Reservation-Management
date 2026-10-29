package in.app.hotelmanagement.config;

import in.app.hotelmanagement.entity.Booking;
import in.app.hotelmanagement.entity.Customer;
import in.app.hotelmanagement.entity.Payment;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.PaymentMethod;
import in.app.hotelmanagement.enums.PaymentType;
import in.app.hotelmanagement.repository.BookingRepository;
import in.app.hotelmanagement.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Chuyển dữ liệu từ quy tắc cũ ("đặt là tính đã chi tiêu") sang quy tắc thanh toán mới.
 * Chạy mỗi lần khởi động nhưng an toàn khi chạy lại:
 * - Đơn đã trả phòng mà chưa có khoản thanh toán nào chắc chắn là dữ liệu cũ
 *   (quy tắc mới không cho trả phòng khi còn nợ) -> ghi nhận đã thanh toán đủ.
 * - Chi tiêu tích luỹ của khách = tổng tiền đã thực thu, nên tính lại luôn cho khớp.
 */
@Component
public class PaymentBackfill implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PaymentBackfill.class);

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public PaymentBackfill(BookingRepository bookingRepository, CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int backfilled = 0;
        for (Booking b : bookingRepository.findAll()) {
            if (b.getBookingStatus() == BookingStatus.CHECKED_OUT && b.getPayments().isEmpty() && b.getGrandTotal() > 0) {
                Payment payment = new Payment(b.getGrandTotal(), PaymentType.PAYMENT, PaymentMethod.CASH);
                payment.setPaidAt(b.getCheckOutDate().atTime(12, 0));
                b.addPayment(payment);
                backfilled++;
            }
        }

        for (Customer c : customerRepository.findAll()) {
            long paid = c.getBookings().stream().mapToLong(Booking::getPaidAmount).sum();
            if (c.getPaidPrice() != paid) {
                c.setPaidPrice(paid); // tự tính lại hạng hội viên
            }
        }

        if (backfilled > 0) {
            log.info("Đã ghi nhận thanh toán cho {} đơn đã trả phòng từ dữ liệu cũ", backfilled);
        }
    }
}
