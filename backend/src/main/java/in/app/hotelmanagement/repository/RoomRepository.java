package in.app.hotelmanagement.repository;

import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.RoomStatus;
import in.app.hotelmanagement.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Room r SET r.roomType = :roomType, r.basePrice = :basePrice, r.roomStatus = :roomStatus " +
           "WHERE r.roomNumber = :roomNumber")
    void updateRoom(@Param("roomNumber") Long roomNumber,
                    @Param("roomType") RoomType roomType,
                    @Param("basePrice") Long basePrice,
                    @Param("roomStatus") RoomStatus roomStatus);
}
