package in.app.hotelmanagement.entity;

import in.app.hotelmanagement.enums.PricingMode;
import jakarta.persistence.*;

/**
 * Danh mục dịch vụ phát sinh (minibar, giặt là...). Đơn đặt phòng chỉ chép lại tên và giá
 * lúc thêm, nên sửa hay xoá dịch vụ ở đây không làm thay đổi hoá đơn cũ.
 */
@Entity
@Table(name = "extra_services")
public class ExtraService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Long unitPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PricingMode pricingMode;

    protected ExtraService() {
    }

    public ExtraService(String name, long unitPrice, PricingMode pricingMode) {
        this.name = name;
        this.unitPrice = unitPrice;
        this.pricingMode = pricingMode;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Long unitPrice) {
        this.unitPrice = unitPrice;
    }

    public PricingMode getPricingMode() {
        return pricingMode;
    }

    public void setPricingMode(PricingMode pricingMode) {
        this.pricingMode = pricingMode;
    }
}
