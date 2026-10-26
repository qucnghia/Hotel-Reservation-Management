package in.app.hotelmanagement.enums;


public enum CustomerMembership {
    CUSTOMER(0),
    ECONOMY(5),
    PLUS(10),
    VIP(15);

    private final int discountPercent;

    CustomerMembership(int discountPercent) {
        this.discountPercent = discountPercent;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    /**
     * Mỗi hạng hội viên tự áp dụng mức giảm giá của mình lên số tiền gốc
     */
    public long applyDiscount(long amount) {
        return amount * (100 - discountPercent) / 100;
    }
}
