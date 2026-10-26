package in.app.hotelmanagement.controller;

import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomResponse;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotel/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest room) {
        RoomResponse created = roomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{roomNumber}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long roomNumber) {
        Room room = roomService.getRoomById(roomNumber);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> roomList = roomService.getAllRooms();
        return ResponseEntity.ok(roomList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        Room updatedRoom = roomService.updateRoom(id, room);
        return ResponseEntity.ok(updatedRoom);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomById(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
