package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceRequest;
import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceResponse;
import in.app.hotelmanagement.entity.ExtraService;
import in.app.hotelmanagement.exception.DuplicateResourceException;
import in.app.hotelmanagement.exception.ResourceNotFoundException;
import in.app.hotelmanagement.repository.ExtraServiceRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExtraServiceService {

    private final ExtraServiceRepository extraServiceRepository;

    public ExtraServiceService(ExtraServiceRepository extraServiceRepository) {
        this.extraServiceRepository = extraServiceRepository;
    }

    @Transactional(readOnly = true)
    public List<ExtraServiceResponse> getAll() {
        return extraServiceRepository.findAll(Sort.by("name")).stream().map(ExtraServiceResponse::fromEntity).toList();
    }

    public ExtraServiceResponse create(ExtraServiceRequest request) {
        String name = request.name().trim();
        if (extraServiceRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Dịch vụ \"" + name + "\" đã tồn tại");
        }
        ExtraService saved = extraServiceRepository.save(new ExtraService(name, request.unitPrice(), request.pricingMode()));
        return ExtraServiceResponse.fromEntity(saved);
    }

    public ExtraServiceResponse update(Long id, ExtraServiceRequest request) {
        ExtraService service = find(id);
        String name = request.name().trim();
        if (extraServiceRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Dịch vụ \"" + name + "\" đã tồn tại");
        }
        service.setName(name);
        service.setUnitPrice(request.unitPrice());
        service.setPricingMode(request.pricingMode());
        return ExtraServiceResponse.fromEntity(service);
    }

    // Đơn cũ đã chép tên và giá nên xoá khỏi danh mục không ảnh hưởng hoá đơn
    public void delete(Long id) {
        extraServiceRepository.delete(find(id));
    }

    @Transactional(readOnly = true)
    public ExtraService find(Long id) {
        return extraServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ #" + id));
    }
}
