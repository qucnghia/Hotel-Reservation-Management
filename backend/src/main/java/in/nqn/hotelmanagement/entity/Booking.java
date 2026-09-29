package in.nqn.hotelmanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.nqn.hotelmanagement.entity.room.Room;
import in.nqn.hotelmanagement.enums.BookingStatus;
import in.nqn.hotelmanagement.enums.CustomerMembership;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "Bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_number", nullable = false)
    private Room room;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkInDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    private Long totalPrice;

    private Long payedPrice;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Booking() {
    }

    public Booking(Customer customer, Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        this.customer = customer;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.bookingStatus = BookingStatus.CONFIRMED;
        this.createdAt = LocalDateTime.now();
        calculateTotalPrice();
    }

    /**
     * Phương thức nghiệp vụ OOP: Tự tính toán tổng tiền dựa trên đơn giá phòng và số đêm lưu trú
     */
    public void calculateTotalPrice() {
        if (checkInDate != null && checkOutDate != null && room != null && room.getBasePrice() != null) {
            long days = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
            if (days <= 0) {
                days = 1; // Ít nhất tính 1 ngày nếu check-in và check-out cùng ngày
            }
        }
        if(customer.getMembership().equals(CustomerMembership.CUSTOMER)){
            totalPrice = room.getBasePrice() * room.getBasePrice();
        }
        else if(customer.getMembership().equals(CustomerMembership.ECONOMY)){
            totalPrice = room.getBasePrice() * room.getBasePrice() * 95/100;
        }
        else if (customer.getMembership().equals(CustomerMembership.PLUS)){
            totalPrice = room.getBasePrice() * room.getBasePrice() * 9/10;
        }
        else{
            totalPrice = room.getBasePrice() * room.getBasePrice() * 85/100;
        }
        payedPrice += totalPrice;

        if(payedPrice > 5000000) customer.setMembership(CustomerMembership.VIP);
        else if(payedPrice > 2500000)  customer.setMembership(CustomerMembership.PLUS);
        else if(payedPrice > 1000000) customer.setMembership(CustomerMembership.ECONOMY);
    }

    public long getDurationNights() {
        if (checkInDate != null && checkOutDate != null) {
            long days = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
            return days <= 0 ? 1 : days;
        }
        return 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
        calculateTotalPrice();
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
        calculateTotalPrice();
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
        calculateTotalPrice();
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
        calculateTotalPrice();
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getPayedPrice() {
        return payedPrice;
    }

    public void setPayedPrice(Long payedPrice) {
        this.payedPrice = payedPrice;
    }
}
