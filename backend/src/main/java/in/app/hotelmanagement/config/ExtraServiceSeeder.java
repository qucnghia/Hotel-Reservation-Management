package in.app.hotelmanagement.config;

import in.app.hotelmanagement.entity.ExtraService;
import in.app.hotelmanagement.enums.PricingMode;
import in.app.hotelmanagement.repository.ExtraServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Tạo sẵn danh mục dịch vụ mặc định khi bảng còn trống (giống bảng giá cố định trước đây),
 * và điền tên cho các dịch vụ đã thêm vào đơn từ thời còn dùng enum (cột type cũ).
 */
@Component
public class ExtraServiceSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ExtraServiceSeeder.class);

    private final ExtraServiceRepository extraServiceRepository;
    private final JdbcTemplate jdbcTemplate;

    public ExtraServiceSeeder(ExtraServiceRepository extraServiceRepository, JdbcTemplate jdbcTemplate) {
        this.extraServiceRepository = extraServiceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (extraServiceRepository.count() == 0) {
            extraServiceRepository.saveAll(List.of(
                    new ExtraService("Minibar", 50_000L, PricingMode.PER_ITEM),
                    new ExtraService("Giặt là", 80_000L, PricingMode.PER_ITEM),
                    new ExtraService("Ăn sáng buffet", 150_000L, PricingMode.PER_NIGHT),
                    new ExtraService("Đưa đón sân bay", 300_000L, PricingMode.PER_ITEM)
            ));
            log.info("Đã tạo danh mục dịch vụ mặc định");
        }

        try {
            int updated = jdbcTemplate.update("""
                    UPDATE service_charges SET service_name = CASE type
                        WHEN 'MINIBAR' THEN 'Minibar'
                        WHEN 'LAUNDRY' THEN 'Giặt là'
                        WHEN 'BREAKFAST' THEN 'Ăn sáng buffet'
                        WHEN 'AIRPORT_TRANSFER' THEN 'Đưa đón sân bay'
                    END
                    WHERE service_name IS NULL AND type IS NOT NULL""");
            if (updated > 0) {
                log.info("Đã điền tên cho {} dịch vụ cũ trên đơn đặt phòng", updated);
            }
        } catch (DataAccessException e) {
            // DB mới (vd. H2 khi chạy test) không có cột type cũ: không có gì để chuyển
            log.debug("Bỏ qua chuyển dữ liệu dịch vụ cũ: {}", e.getMessage());
        }
    }
}
