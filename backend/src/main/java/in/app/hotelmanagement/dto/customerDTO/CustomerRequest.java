package in.app.hotelmanagement.dto.customerDTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public class CustomerRequest {
    @NotBlank(message = "Vui lòng nhập họ tên khách hàng")
    private String fullName;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Past(message = "Ngày sinh phải ở trong quá khứ")
    private LocalDate dob;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không đúng định dạng")
    private String email;

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
