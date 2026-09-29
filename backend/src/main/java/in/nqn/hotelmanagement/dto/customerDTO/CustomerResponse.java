package in.nqn.hotelmanagement.dto.customerDTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.nqn.hotelmanagement.enums.CustomerMembership;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDate;

public class CustomerResponse {

    private Long id;
    private String fullName;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dob;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private CustomerMembership membership;

    private Long payedPrice;

    public Long getPayedPrice() {
        return payedPrice;
    }

    public void setPayedPrice(Long payedPrice) {
        this.payedPrice = payedPrice;
    }

    public Long getId() {
        return id;
    }

    public CustomerMembership getMembership() {
        return membership;
    }

    public void setMembership(CustomerMembership membership) {
        this.membership = membership;
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
}
