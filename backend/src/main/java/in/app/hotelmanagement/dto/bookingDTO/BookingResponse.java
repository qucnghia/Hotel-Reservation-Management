package in.app.hotelmanagement.dto.bookingDTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.app.hotelmanagement.entity.Booking;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.RoomType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long roomNumber;
    private RoomType roomType;
    private Long basePrice;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkInDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkOutDate;

    private Long durationNights;
    private Long totalPrice;
    private BookingStatus bookingStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private long serviceTotal;
    private long grandTotal;
    private List<ServiceChargeResponse> services = List.of();

    public BookingResponse() {
    }

    public static BookingResponse fromEntity(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setId(booking.getId());

        if (booking.getCustomer() != null) {
            res.setCustomerId(booking.getCustomer().getId());
            res.setCustomerName(booking.getCustomer().getFullName());
            res.setCustomerEmail(booking.getCustomer().getEmail());
        }

        if (booking.getRoom() != null) {
            res.setRoomNumber(booking.getRoom().getRoomNumber());
            res.setRoomType(booking.getRoom().getRoomType());
            res.setBasePrice(booking.getRoom().getBasePrice());
        }

        res.setCheckInDate(booking.getCheckInDate());
        res.setCheckOutDate(booking.getCheckOutDate());
        res.setDurationNights(booking.getDurationNights());
        res.setTotalPrice(booking.getTotalPrice());
        res.setBookingStatus(booking.getBookingStatus());
        res.setCreatedAt(booking.getCreatedAt());
        res.serviceTotal = booking.getServiceTotal();
        res.grandTotal = booking.getGrandTotal();
        res.services = booking.getServices().stream().map(ServiceChargeResponse::fromEntity).toList();

        return res;
    }

    public long getServiceTotal() {
        return serviceTotal;
    }

    public long getGrandTotal() {
        return grandTotal;
    }

    public List<ServiceChargeResponse> getServices() {
        return services;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
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

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Long getDurationNights() {
        return durationNights;
    }

    public void setDurationNights(Long durationNights) {
        this.durationNights = durationNights;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
