package in.nqn.hotelmanagement.service;

import in.nqn.hotelmanagement.entity.Room;
import in.nqn.hotelmanagement.exception.DuplicateResourceException;
import in.nqn.hotelmanagement.exception.ResourceNotFoundException;
import in.nqn.hotelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(Room room) {
        if (roomRepository.existsById(room.getRoomNumber())) {
            throw new DuplicateResourceException("Room #" + room.getRoomNumber() + " already exists. Try another room number.");
        }
        return roomRepository.save(room);
    }

    public Room getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room updateRoom(Long roomId, Room room) {
        Room roomToUpdate = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with number " + roomId + " not found"));

        roomToUpdate.setBasePrice(room.getBasePrice());
        roomToUpdate.setRoomType(room.getRoomType());
        roomToUpdate.setRoomStatus(room.getRoomStatus());
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
}
