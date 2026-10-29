package in.app.hotelmanagement.dto.serviceDTO;

import in.app.hotelmanagement.enums.PricingMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ExtraServiceRequest(
        @NotBlank(message = "Vui lòng nhập tên dịch vụ")
        @Size(max = 100, message = "Tên dịch vụ tối đa 100 ký tự") String name,
        @NotNull(message = "Vui lòng nhập đơn giá")
        @Positive(message = "Đơn giá phải lớn hơn 0") Long unitPrice,
        @NotNull(message = "Vui lòng chọn cách tính tiền") PricingMode pricingMode) {
}
