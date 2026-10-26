package in.app.hotelmanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import in.app.hotelmanagement.enums.CustomerMembership;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dob;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "payed_price") // giữ tên cột cũ để không mất dữ liệu
    private Long paidPrice = 0L;

    @Enumerated(EnumType.STRING)
    private CustomerMembership membership;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();

    public Customer() {
        this.paidPrice = 0L;
        this.membership = CustomerMembership.CUSTOMER;
    }

    public Customer(String fullName, LocalDate dob, String email) {
        this.fullName = fullName;
        this.dob = dob;
        this.email = email;
        this.paidPrice = 0L;
        this.membership = CustomerMembership.CUSTOMER;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CustomerMembership getMembership() {
        return membership != null ? membership : CustomerMembership.CUSTOMER;
    }

    public void setMembership(CustomerMembership membership) {
        this.membership = membership;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public Long getPaidPrice() {
        return paidPrice != null ? paidPrice : 0L;
    }

    public void setPaidPrice(Long paidPrice) {
        this.paidPrice = paidPrice != null ? paidPrice : 0L;
        recalculateMembership();
    }

    public void addPaidPrice(Long amount) {
        if (amount == null || amount <= 0) return;
        if (this.paidPrice == null) {
            this.paidPrice = 0L;
        }
        this.paidPrice += amount;
        recalculateMembership();
    }

    public void deductPaidPrice(Long amount) {
        if (amount == null || amount <= 0) return;
        if (this.paidPrice == null) {
            this.paidPrice = 0L;
        }
        this.paidPrice = Math.max(0L, this.paidPrice - amount);
        recalculateMembership();
    }

    public void recalculateMembership() {
        long total = this.paidPrice != null ? this.paidPrice : 0L;
        if (total >= 10000000L) {
            this.membership = CustomerMembership.VIP;
        } else if (total >= 5000000L) {
            this.membership = CustomerMembership.PLUS;
        } else if (total >= 2000000L) {
            this.membership = CustomerMembership.ECONOMY;
        } else {
            this.membership = CustomerMembership.CUSTOMER;
        }
    }
}
