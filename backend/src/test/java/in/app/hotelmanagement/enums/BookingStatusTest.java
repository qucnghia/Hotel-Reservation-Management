package in.app.hotelmanagement.enums;

import org.junit.jupiter.api.Test;

import static in.app.hotelmanagement.enums.BookingStatus.*;
import static org.junit.jupiter.api.Assertions.*;

class BookingStatusTest {

    @Test
    void allowsForwardFlowAndCancelBeforeCheckIn() {
        assertTrue(CONFIRMED.canMoveTo(CHECKED_IN));
        assertTrue(CHECKED_IN.canMoveTo(CHECKED_OUT));
        assertTrue(CONFIRMED.canMoveTo(CANCELLED));
    }

    @Test
    void rejectsGoingBackOrLeavingFinalStates() {
        assertFalse(CHECKED_OUT.canMoveTo(CONFIRMED));
        assertFalse(CANCELLED.canMoveTo(CHECKED_IN));
        assertFalse(CHECKED_IN.canMoveTo(CANCELLED));
        assertFalse(CONFIRMED.canMoveTo(CHECKED_OUT));
    }
}
