package in.app.hotelmanagement.controller;

import in.app.hotelmanagement.dto.roomDTO.RoomRequest;
import in.app.hotelmanagement.dto.roomDTO.RoomResponse;
import in.app.hotelmanagement.service.RoomService;
import jakarta.validation.Valid;
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
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest room) {
        RoomResponse created = roomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{roomNumber}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long roomNumber) {
        return ResponseEntity.ok(roomService.getRoomById(roomNumber));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest room) {
        return ResponseEntity.ok(roomService.updateRoom(id, room));
    }

    @PutMapping("/{id}/maintenance")
    public ResponseEntity<RoomResponse> setMaintenance(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(roomService.setMaintenance(id, enabled));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomById(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
