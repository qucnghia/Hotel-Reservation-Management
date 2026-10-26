package in.app.hotelmanagement.dto.roomDTO;

import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;

public class RoomResponse {

    private Long roomNumber;
    private RoomType roomType;
    private Long basePrice;
    private RoomStatus roomStatus;
    private String bedType;
    private int areaSquareMeters;

    public static RoomResponse fromEntity(Room room) {
        RoomResponse res = new RoomResponse();
        res.setRoomNumber(room.getRoomNumber());
        res.setRoomType(room.getRoomType());
        res.setBasePrice(room.getBasePrice());
        res.setRoomStatus(room.getRoomStatus());
        res.setBedType(room.getBedType());
        res.setAreaSquareMeters(room.getAreaSquareMeters());
        return res;
    }

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

    public String getBedType() {
        return bedType;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public int getAreaSquareMeters() {
        return areaSquareMeters;
    }

    public void setAreaSquareMeters(int areaSquareMeters) {
        this.areaSquareMeters = areaSquareMeters;
    }
}
