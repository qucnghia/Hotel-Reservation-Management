package in.nqn.hotelmanagement.dto.roomDTO;

import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.enums.RoomType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public class RoomResponse {

    private Long roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    private Long basePrice;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;

    public Long getRoomNumber() {
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
