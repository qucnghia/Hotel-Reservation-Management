package in.app.hotelmanagement.entity.charge;

import in.app.hotelmanagement.entity.Booking;
import in.app.hotelmanagement.enums.ExtraServiceType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_charges")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "pricing_mode")
public abstract class ServiceCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private ExtraServiceType type;

    private int quantity;

    // Chốt đơn giá lúc thêm để đổi bảng giá sau này không làm sai hoá đơn cũ
    private Long unitPrice;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected ServiceCharge() {
    }

    /**
     * Factory: tạo đúng lớp con theo cách tính tiền của loại dịch vụ
     */
    public static ServiceCharge of(ExtraServiceType type, int quantity) {
        ServiceCharge charge = switch (type.getPricingMode()) {
            case PER_ITEM -> new PerItemCharge();
            case PER_NIGHT -> new PerNightCharge();
        };
        charge.type = type;
        charge.quantity = quantity;
        charge.unitPrice = type.getUnitPrice();
        return charge;
    }

    // Đa hình: mỗi cách tính tiền tự quyết định thành tiền của mình
    public abstract long calculateCost();

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public ExtraServiceType getType() {
        return type;
    }

    public int getQuantity() {
        return quantity;
    }

    public Long getUnitPrice() {
        return unitPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
