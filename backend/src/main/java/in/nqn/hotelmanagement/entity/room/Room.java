package in.nqn.hotelmanagement.entity.room;

import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.enums.RoomType;
import jakarta.persistence.*;

@Entity
@Table(name = "Rooms")
public class Room {
    @Id
    private Long roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    private Long basePrice;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;

    public Room(Long roomNumber,
                RoomType roomType,
                Long basePrice,
                RoomStatus roomStatus) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.basePrice = basePrice;
        this.roomStatus = roomStatus;
    }

    public Room() {
    }

    public long getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Long roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public Long getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Long basePrice) {
        this.basePrice = basePrice;
    }

    public RoomStatus getRoomStatus() {
        return roomStatus;
    }

    public void setRoomStatus(RoomStatus roomStatus) {
        this.roomStatus = roomStatus;
    }
}
