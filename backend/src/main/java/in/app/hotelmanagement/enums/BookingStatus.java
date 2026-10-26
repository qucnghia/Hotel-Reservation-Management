package in.app.hotelmanagement.enums;

public enum BookingStatus {
    PENDING,
    CONFIRMED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED;

    // Luồng 1 chiều: PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT; chỉ huỷ được khi chưa nhận phòng
    public boolean canMoveTo(BookingStatus next) {
        return switch (this) {
            case PENDING -> next == CONFIRMED || next == CANCELLED;
            case CONFIRMED -> next == CHECKED_IN || next == CANCELLED;
            case CHECKED_IN -> next == CHECKED_OUT;
            case CHECKED_OUT, CANCELLED -> false;
        };
    }
}
