package in.app.hotelmanagement.dto.customerDTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.app.hotelmanagement.enums.CustomerMembership;

import java.time.LocalDate;

public class CustomerResponse {

    private Long id;
    private String fullName;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dob;

    private String email;
    private CustomerMembership membership;
    private Long paidPrice;

    public Long getPaidPrice() {
        return paidPrice;
    }

    public void setPaidPrice(Long paidPrice) {
        this.paidPrice = paidPrice;
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
