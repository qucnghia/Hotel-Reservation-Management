package in.nqn.hotelmanagement.entity.room;

import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.enums.RoomType;
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
