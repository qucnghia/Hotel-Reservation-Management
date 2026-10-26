package in.app.hotelmanagement.entity.room;

import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("LUXURY")
public class LuxuryRoom extends Room {

    public LuxuryRoom() {
        super(RoomType.LUXURY);
    }

    @Override
    public String getBedType() {
        return "Giường Hoàng Gia Suite";
    }

    @Override
    public int getAreaSquareMeters() {
        return 68;
    }
}
