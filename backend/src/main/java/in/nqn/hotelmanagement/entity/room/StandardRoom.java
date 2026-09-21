package in.nqn.hotelmanagement.entity.room;

import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.enums.RoomType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;

//@Entity
@DiscriminatorValue("STANDARD")
@PrimaryKeyJoinColumn(name = "roomNumer")
public class StandardRoom extends Room {

    public StandardRoom(Long roomNumber,
                        RoomType roomType,
                        Long basePrice,
                        RoomStatus roomStatus){
        super(roomNumber,roomType,basePrice,roomStatus);
    }
}
