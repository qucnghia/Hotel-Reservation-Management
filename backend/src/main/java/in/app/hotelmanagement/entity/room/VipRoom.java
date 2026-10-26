package in.app.hotelmanagement.entity.room;

import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("VIP")
public class VipRoom extends Room {

    public VipRoom() {
        super(RoomType.VIP);
    }

    @Override
    public String getBedType() {
        return "Giường King Size Luxury";
    }

    @Override
    public int getAreaSquareMeters() {
        return 48;
    }
}
