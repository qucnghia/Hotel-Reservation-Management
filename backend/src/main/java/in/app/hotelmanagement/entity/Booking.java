package in.app.hotelmanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.app.hotelmanagement.entity.charge.ServiceCharge;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.CustomerMembership;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

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

    // Tiền phòng sau giảm giá hội viên (không gồm dịch vụ)
    private Long totalPrice;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<ServiceCharge> services = new ArrayList<>();

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

            CustomerMembership mem = (customer != null && customer.getMembership() != null)
                    ? customer.getMembership()
                    : CustomerMembership.CUSTOMER;

            totalPrice = mem.applyDiscount(room.getBasePrice() * days);
        }
    }

    public void addService(ServiceCharge charge) {
        charge.setBooking(this);
        services.add(charge);
    }

    public List<ServiceCharge> getServices() {
        return services;
    }

    // Giảm giá hội viên chỉ áp vào tiền phòng, dịch vụ tính nguyên giá
    public long getServiceTotal() {
        return services.stream().mapToLong(ServiceCharge::calculateCost).sum();
    }

    public long getGrandTotal() {
        return (totalPrice != null ? totalPrice : 0L) + getServiceTotal();
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
}
