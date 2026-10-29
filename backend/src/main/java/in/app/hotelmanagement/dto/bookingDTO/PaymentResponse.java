package in.app.hotelmanagement.dto.bookingDTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.app.hotelmanagement.entity.Payment;
import in.app.hotelmanagement.enums.PaymentMethod;
import in.app.hotelmanagement.enums.PaymentType;

import java.time.LocalDateTime;

public record PaymentResponse(Long id, Long amount, PaymentType type, PaymentMethod method,
                              @JsonFormat(pattern = "dd/MM/yyyy HH:mm") LocalDateTime paidAt) {

    public static PaymentResponse fromEntity(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getAmount(), payment.getType(),
                payment.getMethod(), payment.getPaidAt());
    }
}
