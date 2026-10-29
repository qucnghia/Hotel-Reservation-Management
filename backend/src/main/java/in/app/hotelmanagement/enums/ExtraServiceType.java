package in.app.hotelmanagement.enums;

/**
 * Danh mục dịch vụ phát sinh với đơn giá cố định và cách tính tiền
 */
public enum ExtraServiceType {
    MINIBAR("Minibar", 50_000L, PricingMode.PER_ITEM),
    LAUNDRY("Giặt là", 80_000L, PricingMode.PER_ITEM),
    BREAKFAST("Ăn sáng buffet (người/đêm)", 150_000L, PricingMode.PER_NIGHT),
    AIRPORT_TRANSFER("Đưa đón sân bay", 300_000L, PricingMode.PER_ITEM);

    public enum PricingMode {
        PER_ITEM,
        PER_NIGHT
    }

    private final String displayName;
    private final long unitPrice;
    private final PricingMode pricingMode;

    ExtraServiceType(String displayName, long unitPrice, PricingMode pricingMode) {
        this.displayName = displayName;
        this.unitPrice = unitPrice;
        this.pricingMode = pricingMode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public long getUnitPrice() {
        return unitPrice;
    }

    public PricingMode getPricingMode() {
        return pricingMode;
    }
}
