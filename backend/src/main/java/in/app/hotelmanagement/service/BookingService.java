package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.bookingDTO.BookingRequest;
import in.app.hotelmanagement.dto.bookingDTO.BookingResponse;
import in.app.hotelmanagement.dto.CustomerBookingHistoryResponse;
import in.app.hotelmanagement.entity.Booking;
import in.app.hotelmanagement.entity.Customer;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.BookingStatus;
import in.app.hotelmanagement.enums.CustomerMembership;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.exception.InvalidBookingException;
import in.app.hotelmanagement.exception.ResourceNotFoundException;
import in.app.hotelmanagement.repository.BookingRepository;
import in.app.hotelmanagement.repository.CustomerRepository;
import in.app.hotelmanagement.repository.RoomRepository;
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
        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Ngày nhận phòng (Check-in) không thể ở trong quá khứ");
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

        if (bookingRepository.hasActiveBookingForCustomer(customer.getId())) {
            throw new InvalidBookingException("Khách hàng \"" + customer.getFullName() + "\" hiện đang lưu trú hoặc đã có đơn đặt phòng được xác nhận, không thể tạo thêm đơn đặt phòng mới!");
        }

        if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
            throw new InvalidBookingException("Phòng #" + room.getRoomNumber() + " hiện đang được bảo trì, không thể tiếp nhận đặt phòng!");
        }

        // 1. Kiểm tra trùng lịch đặt phòng (Overlap Date Validation - hỗ trợ cả đặt trong ngày)
        LocalDate effectiveCheckOut = request.getCheckInDate().isEqual(request.getCheckOutDate())
                ? request.getCheckInDate().plusDays(1)
                : request.getCheckOutDate();

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getRoomNumber(),
                request.getCheckInDate(),
                effectiveCheckOut
        );

        if (!conflicts.isEmpty()) {
            Booking firstConflict = conflicts.get(0);
            String existingPeriod = firstConflict.getCheckInDate().format(DATE_FORMATTER) + " - " + firstConflict.getCheckOutDate().format(DATE_FORMATTER);
            throw new InvalidBookingException("Phòng #" + room.getRoomNumber() + " đã có đơn đặt phòng trong khoảng thời gian này (" + existingPeriod + "). Vui lòng chọn ngày khác hoặc đổi sang phòng khác!");
        }

        // 2. Tạo Booking mới & Tự động tính tiền theo hạng hội viên
        Booking booking = new Booking(customer, room, request.getCheckInDate(), request.getCheckOutDate());
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);

        // 3. Tích lũy tiền chi tiêu và tự động nâng hạng hội viên
        if (saved.getTotalPrice() != null && saved.getTotalPrice() > 0) {
            customer.addPaidPrice(saved.getTotalPrice());
            customerRepository.save(customer);
        }

        // 4. Đồng bộ trạng thái phòng
        syncRoomStatus(room, saved.getId(), saved.getBookingStatus());

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

        BookingStatus oldStatus = booking.getBookingStatus();
        if (oldStatus == newStatus) {
            return BookingResponse.fromEntity(booking);
        }
        if (!oldStatus.canMoveTo(newStatus)) {
            throw new InvalidBookingException("Không thể chuyển đơn #" + id + " từ " + oldStatus + " sang " + newStatus);
        }

        booking.setBookingStatus(newStatus);
        Room room = booking.getRoom();
        Customer customer = booking.getCustomer();

        // 1. Trừ chi tiêu tích luỹ khi huỷ đơn (đơn đã huỷ không thể khôi phục)
        if (newStatus == BookingStatus.CANCELLED && customer != null && booking.getTotalPrice() != null) {
            customer.deductPaidPrice(booking.getTotalPrice());
            customerRepository.save(customer);
        }

        // 2. Cập nhật trạng thái phòng an toàn và chính xác
        if (room != null) {
            syncRoomStatus(room, id, newStatus);
        }

        Booking updated = bookingRepository.save(booking);
        return BookingResponse.fromEntity(updated);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt phòng #" + id));

        // Hoàn lại tiền chi tiêu tích luỹ nếu đơn chưa bị huỷ trước đó
        if (booking.getBookingStatus() != BookingStatus.CANCELLED && booking.getCustomer() != null && booking.getTotalPrice() != null) {
            Customer customer = booking.getCustomer();
            customer.deductPaidPrice(booking.getTotalPrice());
            customerRepository.save(customer);
        }

        Room room = booking.getRoom();
        bookingRepository.delete(booking);

        // Đồng bộ lại trạng thái phòng sau khi xoá đơn
        if (room != null) {
            syncRoomStatus(room, id, null);
        }
    }

    private void syncRoomStatus(Room room, Long currentBookingId, BookingStatus newStatus) {
        if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
            return;
        }

        Long excludeId = currentBookingId != null ? currentBookingId : -1L;
        LocalDate today = LocalDate.now();

        boolean isOccupied = (newStatus == BookingStatus.CHECKED_IN)
                || bookingRepository.hasOtherCheckedInBooking(room.getRoomNumber(), excludeId);

        if (isOccupied) {
            room.setRoomStatus(RoomStatus.OCCUPIED);
        } else {
            boolean isBooked = (newStatus == BookingStatus.CONFIRMED)
                    || bookingRepository.hasActiveConfirmedBooking(room.getRoomNumber(), excludeId, today);

            if (isBooked) {
                room.setRoomStatus(RoomStatus.BOOKED);
            } else {
                room.setRoomStatus(RoomStatus.AVAILABLE);
            }
        }
        roomRepository.save(room);
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

        for (Booking b : bookings) {
            if (b.getBookingStatus() == BookingStatus.CANCELLED) {
                cancelledBookings++;
            } else if (b.getBookingStatus() == BookingStatus.CHECKED_OUT) {
                completedBookings++;
                if (b.getTotalPrice() != null) {
                    totalSpent += b.getTotalPrice();
                }
            } else if (b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.CHECKED_IN) {
                activeBookings++;
                if (b.getTotalPrice() != null) {
                    totalSpent += b.getTotalPrice();
                }
            }
            // Đơn PENDING: Không cộng vào totalSpent, không tính vào active/completed/cancelled
        }

        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        String formattedDob = customer.getDob() != null
                ? customer.getDob().format(DATE_FORMATTER)
                : null;

        CustomerMembership mem = customer.getMembership() != null
                ? customer.getMembership()
                : CustomerMembership.CUSTOMER;

        return new CustomerBookingHistoryResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                formattedDob,
                mem,
                totalBookings,
                totalSpent,
                completedBookings,
                activeBookings,
                cancelledBookings,
                bookingResponses
        );
    }
}
