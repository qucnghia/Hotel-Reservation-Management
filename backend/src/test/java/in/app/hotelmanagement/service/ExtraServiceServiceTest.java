package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceRequest;
import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceResponse;
import in.app.hotelmanagement.enums.PricingMode;
import in.app.hotelmanagement.exception.DuplicateResourceException;
import in.app.hotelmanagement.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ExtraServiceServiceTest {

    @Autowired
    ExtraServiceService extraServiceService;

    @Test
    void createUpdateDeleteAndRejectDuplicateNames() {
        // Danh mục mặc định được tạo sẵn lúc khởi động
        assertTrue(extraServiceService.getAll().stream().anyMatch(s -> s.name().equals("Minibar")));

        ExtraServiceResponse spa = extraServiceService.create(new ExtraServiceRequest("  Spa  ", 400_000L, PricingMode.PER_ITEM));
        assertEquals("Spa", spa.name());
        assertThrows(DuplicateResourceException.class,
                () -> extraServiceService.create(new ExtraServiceRequest("spa", 1L, PricingMode.PER_ITEM)), "trùng tên không phân biệt hoa thường");

        ExtraServiceResponse updated = extraServiceService.update(spa.id(), new ExtraServiceRequest("Spa thư giãn", 450_000L, PricingMode.PER_NIGHT));
        assertEquals(450_000L, updated.unitPrice());
        assertEquals(PricingMode.PER_NIGHT, updated.pricingMode());
        assertThrows(DuplicateResourceException.class,
                () -> extraServiceService.update(spa.id(), new ExtraServiceRequest("Minibar", 1L, PricingMode.PER_ITEM)));

        extraServiceService.delete(spa.id());
        assertThrows(ResourceNotFoundException.class, () -> extraServiceService.find(spa.id()));
    }
}
