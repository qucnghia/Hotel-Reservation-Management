package in.app.hotelmanagement.repository;

import in.app.hotelmanagement.entity.room.LuxuryRoom;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.entity.room.VipRoom;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RoomInheritanceTest {

    @Autowired
    RoomRepository roomRepository;

    @Autowired
    EntityManager entityManager;

    @Test
    void roomIsLoadedAsSubclassOfItsTypeAndCanChangeType() {
        Room room = Room.of(RoomType.VIP);
        room.setRoomNumber(501L);
        room.setBasePrice(1_000_000L);
        room.setRoomStatus(RoomStatus.AVAILABLE);
        roomRepository.saveAndFlush(room);
        entityManager.clear();

        assertInstanceOf(VipRoom.class, roomRepository.findById(501L).orElseThrow());

        roomRepository.updateRoom(501L, RoomType.LUXURY, 2_000_000L, RoomStatus.AVAILABLE);

        Room reloaded = roomRepository.findById(501L).orElseThrow();
        assertInstanceOf(LuxuryRoom.class, reloaded);
        assertEquals(RoomType.LUXURY, reloaded.getRoomType());
        assertEquals(68, reloaded.getAreaSquareMeters());
    }
}
