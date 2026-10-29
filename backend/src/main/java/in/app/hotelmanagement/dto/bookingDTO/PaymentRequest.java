package in.app.hotelmanagement.dto.bookingDTO;

import in.app.hotelmanagement.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PaymentRequest(
        @NotNull(message = "Vui lòng nhập số tiền")
        @Positive(message = "Số tiền phải lớn hơn 0") Long amount,
        @NotNull(message = "Vui lòng chọn phương thức thanh toán") PaymentMethod method) {
}
