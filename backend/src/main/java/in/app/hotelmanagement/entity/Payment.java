package in.app.hotelmanagement.entity;

import in.app.hotelmanagement.enums.PaymentMethod;
import in.app.hotelmanagement.enums.PaymentType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Luôn dương; khoản hoàn tiền được trừ đi nhờ loại REFUND
    private Long amount;

    @Enumerated(EnumType.STRING)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    private LocalDateTime paidAt = LocalDateTime.now();

    protected Payment() {
    }

    public Payment(long amount, PaymentType type, PaymentMethod method) {
        this.amount = amount;
        this.type = type;
        this.method = method;
    }

    // Số tiền tính vào "đã thu": thu thì cộng, hoàn thì trừ
    public long getSignedAmount() {
        return type == PaymentType.REFUND ? -amount : amount;
    }

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Long getAmount() {
        return amount;
    }

    public PaymentType getType() {
        return type;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
