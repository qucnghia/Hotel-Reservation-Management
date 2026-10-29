package in.app.hotelmanagement.entity.charge;

import in.app.hotelmanagement.entity.Booking;
import in.app.hotelmanagement.entity.ExtraService;
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

    // Chép tên dịch vụ lúc thêm, để đổi tên / xoá trong danh mục không làm sai hoá đơn cũ
    private String serviceName;

    private int quantity;

    // Chốt đơn giá lúc thêm để đổi bảng giá sau này không làm sai hoá đơn cũ
    private Long unitPrice;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected ServiceCharge() {
    }

    /**
     * Factory: tạo đúng lớp con theo cách tính tiền của loại dịch vụ
     */
    public static ServiceCharge of(ExtraService service, int quantity) {
        ServiceCharge charge = switch (service.getPricingMode()) {
            case PER_ITEM -> new PerItemCharge();
            case PER_NIGHT -> new PerNightCharge();
        };
        charge.serviceName = service.getName();
        charge.quantity = quantity;
        charge.unitPrice = service.getUnitPrice();
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

    public String getServiceName() {
        return serviceName;
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
