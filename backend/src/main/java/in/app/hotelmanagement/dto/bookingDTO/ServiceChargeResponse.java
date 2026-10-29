package in.app.hotelmanagement.dto.bookingDTO;

import in.app.hotelmanagement.entity.charge.ServiceCharge;
import in.app.hotelmanagement.enums.ExtraServiceType;

public record ServiceChargeResponse(Long id, ExtraServiceType type, String displayName,
                                    int quantity, Long unitPrice, long cost) {

    public static ServiceChargeResponse fromEntity(ServiceCharge charge) {
        return new ServiceChargeResponse(
                charge.getId(),
                charge.getType(),
                charge.getType().getDisplayName(),
                charge.getQuantity(),
                charge.getUnitPrice(),
                charge.calculateCost()
        );
    }
}
