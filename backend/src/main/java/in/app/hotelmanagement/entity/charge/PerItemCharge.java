package in.app.hotelmanagement.entity.charge;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Tính theo số lượng: minibar, giặt là, đưa đón
 */
@Entity
@DiscriminatorValue("PER_ITEM")
public class PerItemCharge extends ServiceCharge {

    @Override
    public long calculateCost() {
        return getQuantity() * getUnitPrice();
    }
}
