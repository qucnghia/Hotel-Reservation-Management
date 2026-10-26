package in.app.hotelmanagement.repository;

import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByRoomStatus(RoomStatus status);
}
