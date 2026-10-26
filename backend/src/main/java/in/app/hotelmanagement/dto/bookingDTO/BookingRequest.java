package in.app.hotelmanagement.dto.bookingDTO;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class BookingRequest {

    private Long customerId;
    private Long roomNumber;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkInDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkOutDate;

    public BookingRequest() {
    }

    public BookingRequest(Long customerId, Long roomNumber, LocalDate checkInDate, LocalDate checkOutDate) {
        this.customerId = customerId;
        this.roomNumber = roomNumber;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Long roomNumber) {
        this.roomNumber = roomNumber;
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
}
