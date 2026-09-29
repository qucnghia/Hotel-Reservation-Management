package in.nqn.hotelmanagement.service;

import in.nqn.hotelmanagement.dto.roomDTO.RoomRequest;
import in.nqn.hotelmanagement.dto.roomDTO.RoomResponse;
import in.nqn.hotelmanagement.entity.room.Room;
import in.nqn.hotelmanagement.enums.RoomStatus;
import in.nqn.hotelmanagement.exception.DuplicateResourceException;
import in.nqn.hotelmanagement.exception.ResourceNotFoundException;
import in.nqn.hotelmanagement.repository.BookingRepository;
import in.nqn.hotelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    public RoomResponse createRoom(RoomRequest room) {
        if (roomRepository.existsById(room.getRoomNumber())) {
            throw new DuplicateResourceException("Room #" + room.getRoomNumber() + " already exists. Try another room number.");
        }

        Room roomToSave = roomRepository.save(mapToEntity(room));
        return mapToDTO(roomToSave);
    }

    public Room getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));
    }

    public List<Room> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        LocalDate today = LocalDate.now();
        for (Room room : rooms) {
            if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
                continue;
            }
            boolean isOccupied = bookingRepository.hasOtherCheckedInBooking(room.getRoomNumber(), -1L);
            if (isOccupied) {
                if (room.getRoomStatus() != RoomStatus.OCCUPIED) {
                    room.setRoomStatus(RoomStatus.OCCUPIED);
                    roomRepository.save(room);
                }
            } else {
                boolean isBooked = bookingRepository.hasActiveConfirmedBooking(room.getRoomNumber(), -1L, today);
                if (isBooked) {
                    if (room.getRoomStatus() != RoomStatus.BOOKED) {
                        room.setRoomStatus(RoomStatus.BOOKED);
                        roomRepository.save(room);
                    }
                } else {
                    if (room.getRoomStatus() != RoomStatus.AVAILABLE) {
                        room.setRoomStatus(RoomStatus.AVAILABLE);
                        roomRepository.save(room);
                    }
                }
            }
        }
        return rooms;
    }

    public Room updateRoom(Long roomId, Room room) {
        Room roomToUpdate = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));

        roomToUpdate.setBasePrice(room.getBasePrice());
        roomToUpdate.setRoomType(room.getRoomType());
        if (room.getRoomStatus() != null) {
            roomToUpdate.setRoomStatus(room.getRoomStatus());
        }
        return roomRepository.save(roomToUpdate);
    }

    public void deleteRoom(Long roomId) {
        Room roomToDelete = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));
        roomRepository.delete(roomToDelete);
    }

    public boolean roomIDExists(Long roomId) {
        return roomRepository.existsById(roomId);
    }

    public Room mapToEntity(RoomRequest roomRequest) {
        Room room = new Room();
        room.setRoomNumber(roomRequest.getRoomNumber());
        room.setBasePrice(roomRequest.getBasePrice());
        room.setRoomType(roomRequest.getRoomType());
        room.setRoomStatus(RoomStatus.AVAILABLE);
        return room;
    }

    public RoomResponse mapToDTO(Room room) {
        RoomResponse roomResponse = new RoomResponse();
        roomResponse.setRoomNumber(room.getRoomNumber());
        roomResponse.setBasePrice(room.getBasePrice());
        roomResponse.setRoomType(room.getRoomType());
        roomResponse.setRoomStatus(room.getRoomStatus());
        return roomResponse;
    }
}
