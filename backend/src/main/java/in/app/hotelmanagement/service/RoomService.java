package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomResponse;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.exception.DuplicateResourceException;
import in.app.hotelmanagement.exception.InvalidBookingException;
import in.app.hotelmanagement.exception.ResourceNotFoundException;
import in.app.hotelmanagement.repository.BookingRepository;
import in.app.hotelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsById(request.getRoomNumber())) {
            throw new DuplicateResourceException("Room #" + request.getRoomNumber() + " already exists. Try another room number.");
        }

        Room room = Room.of(request.getRoomType());
        room.setRoomNumber(request.getRoomNumber());
        room.setBasePrice(request.getBasePrice());
        room.setRoomStatus(RoomStatus.AVAILABLE);
        return RoomResponse.fromEntity(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        return RoomResponse.fromEntity(findRoom(roomId));
    }

    public List<RoomResponse> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        // 2 truy vấn cho cả danh sách thay vì 2 truy vấn cho mỗi phòng
        Set<Long> occupied = bookingRepository.findCheckedInRoomNumbers();
        Set<Long> booked = bookingRepository.findActiveConfirmedRoomNumbers(LocalDate.now());

        for (Room room : rooms) {
            if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
                continue;
            }
            // Gán trạng thái mới; Hibernate chỉ ghi xuống DB khi giá trị thực sự thay đổi
            if (occupied.contains(room.getRoomNumber())) {
                room.setRoomStatus(RoomStatus.OCCUPIED);
            } else if (booked.contains(room.getRoomNumber())) {
                room.setRoomStatus(RoomStatus.BOOKED);
            } else {
                room.setRoomStatus(RoomStatus.AVAILABLE);
            }
        }
        return rooms.stream().map(RoomResponse::fromEntity).toList();
    }

    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        Room current = findRoom(roomId);
        RoomStatus status = request.getRoomStatus() != null ? request.getRoomStatus() : current.getRoomStatus();

        // Cập nhật bằng câu lệnh UPDATE để đổi được cả hạng phòng (tức là đổi lớp con), rồi đọc lại đúng lớp mới
        roomRepository.updateRoom(roomId, request.getRoomType(), request.getBasePrice(), status);
        return RoomResponse.fromEntity(findRoom(roomId));
    }

    public void deleteRoom(Long roomId) {
        Room roomToDelete = findRoom(roomId);
        if (bookingRepository.existsByRoom_RoomNumber(roomId)) {
            throw new InvalidBookingException("Phòng #" + roomId + " đã có đơn đặt phòng, không thể xoá. Hãy chuyển phòng sang trạng thái bảo trì thay vì xoá.");
        }
        roomRepository.delete(roomToDelete);
    }

    private Room findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));
    }
}
