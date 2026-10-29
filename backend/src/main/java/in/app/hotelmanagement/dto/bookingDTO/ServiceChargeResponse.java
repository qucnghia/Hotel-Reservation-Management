package in.app.hotelmanagement.dto.bookingDTO;

import in.app.hotelmanagement.entity.charge.ServiceCharge;

public record ServiceChargeResponse(Long id, String serviceName, int quantity, Long unitPrice, long cost) {

    public static ServiceChargeResponse fromEntity(ServiceCharge charge) {
        return new ServiceChargeResponse(
                charge.getId(),
                charge.getServiceName(),
                charge.getQuantity(),
                charge.getUnitPrice(),
                charge.calculateCost()
        );
    }
}
