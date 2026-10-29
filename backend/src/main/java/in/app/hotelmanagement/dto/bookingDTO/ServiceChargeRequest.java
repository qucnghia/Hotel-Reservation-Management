package in.app.hotelmanagement.dto.bookingDTO;

import in.app.hotelmanagement.enums.ExtraServiceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ServiceChargeRequest(
        @NotNull(message = "Vui lòng chọn loại dịch vụ") ExtraServiceType type,
        @Min(value = 1, message = "Số lượng phải từ 1 trở lên")
        @Max(value = 100, message = "Số lượng tối đa là 100") int quantity) {
}
