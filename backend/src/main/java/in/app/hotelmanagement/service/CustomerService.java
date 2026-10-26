package in.app.hotelmanagement.service;

import in.app.hotelmanagement.dto.customerDTO.CustomerRequest;
import in.app.hotelmanagement.dto.customerDTO.CustomerResponse;
import in.app.hotelmanagement.entity.Customer;
import in.app.hotelmanagement.enums.CustomerMembership;
import in.app.hotelmanagement.exception.DuplicateResourceException;
import in.app.hotelmanagement.exception.InvalidBookingException;
import in.app.hotelmanagement.exception.ResourceNotFoundException;
import in.app.hotelmanagement.repository.BookingRepository;
import in.app.hotelmanagement.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;

    public CustomerService(CustomerRepository customerRepository, BookingRepository bookingRepository) {
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
    }

    public CustomerResponse createGuest(CustomerRequest guest) {
        if (customerRepository.existsByEmail(guest.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + guest.getEmail() + " already exists");
        }
        Customer customer = mapToEntity(guest);
        customerRepository.save(customer);
        return mapToDTO(customer);
    }

    public CustomerResponse getCustomerById(Long id) {
        return mapToDTO
                (customerRepository
                .findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Customer with id " + id + " not found")));
    }

    public List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();

        return customers.stream().map(this::mapToDTO).toList();
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest customer) {
        Customer customerToUpdate = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));

        // Nếu email thay đổi, kiểm tra xem email mới có bị trùng không
        if (!customerToUpdate.getEmail().equalsIgnoreCase(customer.getEmail())
                && customerRepository.existsByEmail(customer.getEmail())) {
            throw new DuplicateResourceException("Email " + customer.getEmail() + " is already in use by another customer");
        }

        customerToUpdate.setFullName(customer.getFullName());
        customerToUpdate.setEmail(customer.getEmail());
        customerToUpdate.setDob(customer.getDob());
        return mapToDTO(customerRepository.save(customerToUpdate));
    }

    public void deleteCustomer(Long id) {
        Customer customerToDelete = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));

        // Xoá khách sẽ xoá dây chuyền các đơn của họ, nên chặn khi còn đơn đang hiệu lực để phòng không bị kẹt trạng thái
        if (bookingRepository.hasActiveBookingForCustomer(id)) {
            throw new InvalidBookingException("Khách hàng \"" + customerToDelete.getFullName() + "\" đang lưu trú hoặc có đơn đã xác nhận, không thể xoá. Hãy trả phòng hoặc huỷ đơn trước.");
        }
        customerRepository.delete(customerToDelete);
    }

    public Customer mapToEntity(CustomerRequest customerRequest) {
        Customer customer = new Customer();
        customer.setFullName(customerRequest.getFullName());
        customer.setEmail(customerRequest.getEmail());
        customer.setDob(customerRequest.getDob());
        customer.setMembership(CustomerMembership.CUSTOMER);
        customer.setPaidPrice(0L);
        return customer;
    }

    public CustomerResponse mapToDTO(Customer customer) {
        CustomerResponse customerResponse = new CustomerResponse();
        customerResponse.setId(customer.getId());
        customerResponse.setFullName(customer.getFullName());
        customerResponse.setEmail(customer.getEmail());
        customerResponse.setDob(customer.getDob());
        customerResponse.setMembership(customer.getMembership() != null ? customer.getMembership() : CustomerMembership.CUSTOMER);
        customerResponse.setPaidPrice(customer.getPaidPrice() != null ? customer.getPaidPrice() : 0L);
        return customerResponse;
    }
}
