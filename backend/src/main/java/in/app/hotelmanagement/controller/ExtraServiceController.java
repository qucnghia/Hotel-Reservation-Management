package in.app.hotelmanagement.controller;

import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceRequest;
import in.app.hotelmanagement.dto.serviceDTO.ExtraServiceResponse;
import in.app.hotelmanagement.service.ExtraServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotel/services")
@CrossOrigin(origins = "http://localhost:5173")
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;

    public ExtraServiceController(ExtraServiceService extraServiceService) {
        this.extraServiceService = extraServiceService;
    }

    @GetMapping
    public ResponseEntity<List<ExtraServiceResponse>> getAll() {
        return ResponseEntity.ok(extraServiceService.getAll());
    }

    @PostMapping
    public ResponseEntity<ExtraServiceResponse> create(@Valid @RequestBody ExtraServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(extraServiceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExtraServiceResponse> update(@PathVariable Long id, @Valid @RequestBody ExtraServiceRequest request) {
        return ResponseEntity.ok(extraServiceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        extraServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
