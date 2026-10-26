package in.app.hotelmanagement.entity.room;

import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.PrimaryKeyJoinColumn;

//@Entity
@DiscriminatorValue("VIP")
@PrimaryKeyJoinColumn(name = "roomNumber")
public class VipRoom extends Room {

    public VipRoom() {
        super();
    }

    public VipRoom(Long roomNumber, RoomType roomType, Long basePrice, RoomStatus roomStatus) {
        super(roomNumber, roomType, basePrice, roomStatus);
    }
}
