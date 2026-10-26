package in.app.hotelmanagement.entity;

import in.app.hotelmanagement.entity.room.Room;
import in.app.hotelmanagement.enums.CustomerMembership;
import in.app.hotelmanagement.enums.RoomType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PricingAndMembershipTest {

    private static final LocalDate DAY = LocalDate.of(2026, 11, 1);

    private Room room(long price) {
        Room room = Room.of(RoomType.VIP);
        room.setBasePrice(price);
        return room;
    }

    @Test
    void totalPriceAppliesMembershipDiscountPerNight() {
        Customer vip = new Customer("A", null, "a@x.vn");
        vip.setPaidPrice(10_000_000L); // đủ mốc VIP -> giảm 15%

        Booking booking = new Booking(vip, room(1_000_000L), DAY, DAY.plusDays(2));

        assertEquals(CustomerMembership.VIP, vip.getMembership());
        assertEquals(1_700_000L, booking.getTotalPrice());
    }

    @Test
    void sameDayStayIsChargedAsOneNight() {
        Booking booking = new Booking(new Customer("B", null, "b@x.vn"), room(500_000L), DAY, DAY);

        assertEquals(1, booking.getDurationNights());
        assertEquals(500_000L, booking.getTotalPrice());
    }

    @Test
    void membershipFollowsSpendingThresholds() {
        Customer c = new Customer("C", null, "c@x.vn");
        c.addPaidPrice(1_999_999L);
        assertEquals(CustomerMembership.CUSTOMER, c.getMembership());
        c.addPaidPrice(1L);
        assertEquals(CustomerMembership.ECONOMY, c.getMembership());
        c.addPaidPrice(3_000_000L);
        assertEquals(CustomerMembership.PLUS, c.getMembership());
        c.deductPaidPrice(10_000_000L); // không âm
        assertEquals(0L, c.getPaidPrice());
        assertEquals(CustomerMembership.CUSTOMER, c.getMembership());
    }
}
