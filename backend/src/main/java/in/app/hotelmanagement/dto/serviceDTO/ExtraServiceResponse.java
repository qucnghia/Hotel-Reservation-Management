package in.app.hotelmanagement.dto.serviceDTO;

import in.app.hotelmanagement.entity.ExtraService;
import in.app.hotelmanagement.enums.PricingMode;

public record ExtraServiceResponse(Long id, String name, Long unitPrice, PricingMode pricingMode) {

    public static ExtraServiceResponse fromEntity(ExtraService s) {
        return new ExtraServiceResponse(s.getId(), s.getName(), s.getUnitPrice(), s.getPricingMode());
    }
}
