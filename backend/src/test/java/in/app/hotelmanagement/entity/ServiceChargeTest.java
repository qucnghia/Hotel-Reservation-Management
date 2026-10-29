package in.app.hotelmanagement.entity;

import in.app.hotelmanagement.entity.charge.PerItemCharge;
import in.app.hotelmanagement.entity.charge.PerNightCharge;
import in.app.hotelmanagement.entity.charge.ServiceCharge;
import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.ExtraServiceType;
import in.app.hotelmanagement.enums.RoomType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ServiceChargeTest {

    private static final LocalDate DAY = LocalDate.of(2026, 11, 1);

    // Khách VIP (giảm 15%) ở 3 đêm phòng 1.000.000 đ/đêm
    private Booking vipBooking() {
        Customer vip = new Customer("A", null, "a@x.vn");
        vip.setPaidPrice(10_000_000L);
        Room room = Room.of(RoomType.VIP);
        room.setBasePrice(1_000_000L);
        return new Booking(vip, room, DAY, DAY.plusDays(3));
    }

    @Test
    void factoryPicksSubclassByPricingMode() {
        assertInstanceOf(PerItemCharge.class, ServiceCharge.of(ExtraServiceType.MINIBAR, 1));
        assertInstanceOf(PerNightCharge.class, ServiceCharge.of(ExtraServiceType.BREAKFAST, 1));
    }

    @Test
    void perItemAndPerNightChargesCalculateTheirOwnCost() {
        Booking booking = vipBooking();
        ServiceCharge minibar = ServiceCharge.of(ExtraServiceType.MINIBAR, 4);
        ServiceCharge breakfast = ServiceCharge.of(ExtraServiceType.BREAKFAST, 2);
        booking.addService(minibar);
        booking.addService(breakfast);

        assertEquals(4 * 50_000L, minibar.calculateCost());
        assertEquals(2 * 3 * 150_000L, breakfast.calculateCost()); // 2 người × 3 đêm
    }

    @Test
    void membershipDiscountAppliesToRoomOnlyNotServices() {
        Booking booking = vipBooking();
        booking.addService(ServiceCharge.of(ExtraServiceType.AIRPORT_TRANSFER, 1));

        assertEquals(2_550_000L, booking.getTotalPrice()); // 3.000.000 - 15%
        assertEquals(300_000L, booking.getServiceTotal());
        assertEquals(2_850_000L, booking.getGrandTotal());
    }
}
