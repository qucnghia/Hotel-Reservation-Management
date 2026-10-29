package in.app.hotelmanagement.entity.charge;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Tính theo số người × số đêm lưu trú: ăn sáng
 */
@Entity
@DiscriminatorValue("PER_NIGHT")
public class PerNightCharge extends ServiceCharge {

    @Override
    public long calculateCost() {
        return getQuantity() * getBooking().getDurationNights() * getUnitPrice();
    }
}
