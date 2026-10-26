package in.app.hotelmanagement.entity.room;

import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.*;
import org.hibernate.annotations.DiscriminatorFormula;

@Entity
@Table(name = "Rooms")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
// Hạng phòng (cột room_type) quyết định lớp con khi đọc từ DB, nên dữ liệu cũ dùng được ngay
@DiscriminatorFormula("room_type")
public abstract class Room {

    @Id
    private Long roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    private Long basePrice;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;

    protected Room() {
    }

    protected Room(RoomType roomType) {
        this.roomType = roomType;
    }

    /**
     * Factory: tạo đúng lớp con theo hạng phòng
     */
    public static Room of(RoomType roomType) {
        return switch (roomType) {
            case STANDARD -> new StandardRoom();
            case VIP -> new VipRoom();
            case LUXURY -> new LuxuryRoom();
        };
    }

    // Đa hình: mỗi hạng phòng tự mô tả loại giường và diện tích của mình
    public abstract String getBedType();

    public abstract int getAreaSquareMeters();

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
