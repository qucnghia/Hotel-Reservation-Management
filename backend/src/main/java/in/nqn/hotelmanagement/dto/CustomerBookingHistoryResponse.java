package in.nqn.hotelmanagement.dto;

import in.nqn.hotelmanagement.dto.bookingDTO.BookingResponse;

import java.util.List;

public class CustomerBookingHistoryResponse {

    private Long customerId;
    private String customerName;
    private String email;
    private String dob;

    // Các chỉ số thống kê nghiệp vụ
    private int totalBookings;      // Tổng số lần đặt phòng
    private Long totalSpent;        // Tổng số tiền đã thanh toán (không tính các đơn CANCELLED)
    private int completedBookings;  // Số đơn đã hoàn tất (CHECKED_OUT)
    private int activeBookings;     // Số đơn đang có hiệu lực (CONFIRMED hoặc CHECKED_IN)
    private int cancelledBookings;  // Số đơn đã hủy (CANCELLED)
    // Danh sách chi tiết các đơn đặt phòng
    private List<BookingResponse> bookings;

    public CustomerBookingHistoryResponse() {
    }

    public CustomerBookingHistoryResponse(Long customerId, String customerName, String email, String dob,
                                          int totalBookings, Long totalSpent, int completedBookings,
                                          int activeBookings, int cancelledBookings,
                                          List<BookingResponse> bookings) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.email = email;
        this.dob = dob;
        this.totalBookings = totalBookings;
        this.totalSpent = totalSpent;
        this.completedBookings = completedBookings;
        this.activeBookings = activeBookings;
        this.cancelledBookings = cancelledBookings;
        this.bookings = bookings;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Long totalSpent) {
        this.totalSpent = totalSpent;
    }

    public int getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(int completedBookings) {
        this.completedBookings = completedBookings;
    }

    public int getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(int activeBookings) {
        this.activeBookings = activeBookings;
    }

    public int getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(int cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public List<BookingResponse> getBookings() {
        return bookings;
    }

    public void setBookings(List<BookingResponse> bookings) {
        this.bookings = bookings;
    }
}
