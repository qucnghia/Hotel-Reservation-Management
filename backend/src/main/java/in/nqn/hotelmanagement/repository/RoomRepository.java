package in.nqn.hotelmanagement.repository;

import in.nqn.hotelmanagement.entity.Room;
import in.nqn.hotelmanagement.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByRoomStatus(RoomStatus status);
}
