package in.nqn.hotelmanagement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import in.nqn.hotelmanagement.enums.CustomerMembership;
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

    private Long payedPrice = 0L;

    @Enumerated(EnumType.STRING)
    private CustomerMembership membership;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();

    public Customer() {
        this.payedPrice = 0L;
        this.membership = CustomerMembership.CUSTOMER;
    }

    public Customer(String fullName, LocalDate dob, String email) {
        this.fullName = fullName;
        this.dob = dob;
        this.email = email;
        this.payedPrice = 0L;
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

    public Long getPayedPrice() {
        return payedPrice != null ? payedPrice : 0L;
    }

    public void setPayedPrice(Long payedPrice) {
        this.payedPrice = payedPrice != null ? payedPrice : 0L;
        recalculateMembership();
    }

    public void addPayedPrice(Long amount) {
        if (amount == null || amount <= 0) return;
        if (this.payedPrice == null) {
            this.payedPrice = 0L;
        }
        this.payedPrice += amount;
        recalculateMembership();
    }

    public void deductPayedPrice(Long amount) {
        if (amount == null || amount <= 0) return;
        if (this.payedPrice == null) {
            this.payedPrice = 0L;
        }
        this.payedPrice = Math.max(0L, this.payedPrice - amount);
        recalculateMembership();
    }

    public void recalculateMembership() {
        long total = this.payedPrice != null ? this.payedPrice : 0L;
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
