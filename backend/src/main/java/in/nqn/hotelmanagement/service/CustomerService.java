package in.nqn.hotelmanagement.service;

import in.nqn.hotelmanagement.entity.Customer;
import in.nqn.hotelmanagement.exception.DuplicateResourceException;
import in.nqn.hotelmanagement.exception.ResourceNotFoundException;
import in.nqn.hotelmanagement.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer createGuest(Customer guest) {
        if (customerRepository.existsByEmail(guest.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + guest.getEmail() + " already exists");
        }
        return customerRepository.save(guest);
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer updateCustomer(Long id, Customer customer) {
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
        return customerRepository.save(customerToUpdate);
    }

    public void deleteCustomer(Long id) {
        Customer customerToDelete = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));

        customerRepository.delete(customerToDelete);
    }
}
