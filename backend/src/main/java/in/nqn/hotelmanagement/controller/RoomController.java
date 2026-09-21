package in.nqn.hotelmanagement.controller;
import in.nqn.hotelmanagement.entity.room.Room;
import in.nqn.hotelmanagement.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotel/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        roomService.createRoom(room);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(room);
    }

    @GetMapping("/{roomNumber}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long roomNumber) {
        Room room = roomService.getRoomById(roomNumber);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> roomlist = roomService.getAllRooms();
        return ResponseEntity.ok(roomlist);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        Room UpdatedRoom = roomService.updateRoom(id,room);
        return ResponseEntity.ok(UpdatedRoom);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoomById(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
