package in.app.hotelmanagement.controller;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.bookingDTO.BookingResponse;
import in.app.hotelmanagement.dto.bookingDTO.PaymentRequest;
import in.app.hotelmanagement.dto.bookingDTO.ServiceChargeRequest;
import jakarta.validation.Valid;
import in.app.hotelmanagement.dto.CustomerBookingHistoryResponse;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotel/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        BookingResponse created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        BookingResponse updated = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/services")
    public ResponseEntity<BookingResponse> addService(@PathVariable Long id, @Valid @RequestBody ServiceChargeRequest request) {
        return ResponseEntity.ok(bookingService.addService(id, request.serviceId(), request.quantity()));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<BookingResponse> addPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(bookingService.addPayment(id, request.amount(), request.method()));
    }

    @DeleteMapping("/{id}/services/{serviceId}")
    public ResponseEntity<BookingResponse> removeService(@PathVariable Long id, @PathVariable Long serviceId) {
        return ResponseEntity.ok(bookingService.removeService(id, serviceId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/customer/{customerId}"})
    public ResponseEntity<CustomerBookingHistoryResponse> getCustomerBookingHistory(@PathVariable Long customerId) {
        CustomerBookingHistoryResponse history = bookingService.getCustomerBookingHistory(customerId);
        return ResponseEntity.ok(history);
    }
}
