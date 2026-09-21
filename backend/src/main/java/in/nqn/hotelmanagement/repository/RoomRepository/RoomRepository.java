package in.nqn.hotelmanagement.repository.RoomRepository;


import in.nqn.hotelmanagement.entity.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room,Long> {
    
}
