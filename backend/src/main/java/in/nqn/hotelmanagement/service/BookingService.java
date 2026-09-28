package in.nqn.hotelmanagement.service;

import in.nqn.hotelmanagement.dto.BookingRequest;
import in.nqn.hotelmanagement.dto.BookingResponse;
import in.nqn.hotelmanagement.dto.CustomerBookingHistoryResponse;
import in.nqn.hotelmanagement.entity.Booking;
import in.nqn.hotelmanagement.entity.Customer;
import in.nqn.hotelmanagement.entity.Room;
import in.nqn.hotelmanagement.enums.BookingStatus;
import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.exception.InvalidBookingException;
import in.nqn.hotelmanagement.exception.ResourceNotFoundException;
import in.nqn.hotelmanagement.repository.BookingRepository;
import in.nqn.hotelmanagement.repository.CustomerRepository;
import in.nqn.hotelmanagement.repository.RoomRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public BookingService(BookingRepository bookingRepository,
                          CustomerRepository customerRepository,
                          RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
    }

    public BookingResponse createBooking(BookingRequest request) {
        if (request.getCustomerId() == null) {
            throw new InvalidBookingException("Vui lòng chọn khách hàng đặt phòng");
        }
        if (request.getRoomNumber() == null) {
            throw new InvalidBookingException("Vui lòng chọn số phòng cần đặt");
        }
        if (request.getCheckInDate() == null || request.getCheckOutDate() == null) {
            throw new InvalidBookingException("Vui lòng nhập đầy đủ ngày nhận phòng (Check-in) và ngày trả phòng (Check-out)");
        }
        if (request.getCheckOutDate().isBefore(request.getCheckInDate())) {
            throw new InvalidBookingException("Ngày trả phòng (Check-out) không thể trước ngày nhận phòng (Check-in)");
        }

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(()
                        -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã #" + request.getCustomerId()));

        Room room = roomRepository
                .findById(request.getRoomNumber())
                .orElseThrow(()
                        -> new ResourceNotFoundException("Không tìm thấy phòng số #" + request.getRoomNumber()));

        if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
            throw new InvalidBookingException("Phòng #" + room.getRoomNumber() + " hiện đang được bảo trì, không thể tiếp nhận đặt phòng!");
        }

        // 1. Kiểm tra trùng lịch đặt phòng (Overlap Date Validation)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getRoomNumber(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!conflicts.isEmpty()) {
            Booking firstConflict = conflicts.get(0);
            String existingPeriod = firstConflict.getCheckInDate().format(DATE_FORMATTER) + " - " + firstConflict.getCheckOutDate().format(DATE_FORMATTER);
            throw new InvalidBookingException("Phòng #" + room.getRoomNumber() + " đã có đơn đặt phòng trong khoảng thời gian này (" + existingPeriod + "). Vui lòng chọn ngày khác hoặc đổi sang phòng khác!");
        }

        // 2. Tạo Booking mới & Tự động tính tiền qua phương thức nghiệp vụ
        Booking booking = new Booking(customer, room, request.getCheckInDate(), request.getCheckOutDate());
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        // Nếu nhận phòng ngay hôm nay, cập nhật trạng thái phòng thành BOOKED (hoặc OCCUPIED)
        if (!request.getCheckInDate().isAfter(LocalDate.now())) {
            room.setRoomStatus(RoomStatus.BOOKED);
            roomRepository.save(room);
        }

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository
                .findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt phòng #" + id));
        return BookingResponse.fromEntity(booking);
    }

    public BookingResponse updateBookingStatus(Long id, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt phòng #" + id));

        booking.setBookingStatus(newStatus);
        Room room = booking.getRoom();

        if (room != null) {
            if (newStatus == BookingStatus.CHECKED_IN) {
                room.setRoomStatus(RoomStatus.OCCUPIED);
                roomRepository.save(room);
            } else if (newStatus == BookingStatus.CHECKED_OUT || newStatus == BookingStatus.CANCELLED) {
                // Kiểm tra xem phòng có đang còn đơn nào khác đang CHECKED_IN không
                room.setRoomStatus(RoomStatus.AVAILABLE);
                roomRepository.save(room);
            }
        }

        Booking updated = bookingRepository.save(booking);
        return BookingResponse.fromEntity(updated);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt phòng #" + id));

        // Khôi phục trạng thái phòng nếu cần
        if (booking.getRoom() != null && booking.getBookingStatus() != BookingStatus.CHECKED_OUT) {
            Room room = booking.getRoom();
            room.setRoomStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        bookingRepository.delete(booking);
    }

    @Transactional(readOnly = true)
    public CustomerBookingHistoryResponse getCustomerBookingHistory(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã #" + customerId));

        List<Booking> bookings = bookingRepository.findByCustomer_IdOrderByIdDesc(customerId);

        int totalBookings = bookings.size();
        long totalSpent = 0L;
        int completedBookings = 0;
        int activeBookings = 0;
        int cancelledBookings = 0;
        String message = "";

        for (Booking b : bookings) {
            if (b.getBookingStatus() == BookingStatus.CANCELLED) {
                cancelledBookings++;
            } else {
                if (b.getTotalPrice() != null) {
                    totalSpent += b.getTotalPrice();
                }
                if (b.getBookingStatus() == BookingStatus.CHECKED_OUT) {
                    completedBookings++;
                } else if (b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.CHECKED_IN) {
                    activeBookings++;
                }
            }
        }

        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        String formattedDob = customer.getDob() != null
                ? customer.getDob().format(DATE_FORMATTER)
                : null;

        return new CustomerBookingHistoryResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                formattedDob,
                totalBookings,
                totalSpent,
                completedBookings,
                activeBookings,
                cancelledBookings,
                message,
                bookingResponses
        );
    }
}
