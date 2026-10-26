package in.app.hotelmanagement.dto.roomDTO;

import in.app.hotelmanagement.enums.RoomType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RoomRequest {

    @NotNull(message = "Vui lòng nhập số phòng")
    @Positive(message = "Số phòng phải là số dương")
    private Long roomNumber;

    @NotNull(message = "Vui lòng chọn hạng phòng")
    private RoomType roomType;

    @NotNull(message = "Vui lòng nhập giá phòng")
    @Positive(message = "Giá phòng phải lớn hơn 0")
    private Long basePrice;

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
}
