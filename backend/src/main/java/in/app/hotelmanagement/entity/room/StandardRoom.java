package in.app.hotelmanagement.entity.room;

import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STANDARD")
public class StandardRoom extends Room {

    public StandardRoom() {
        super(RoomType.STANDARD);
    }

    @Override
    public String getBedType() {
        return "Giường Queen Size";
    }

    @Override
    public int getAreaSquareMeters() {
        return 32;
    }
}
