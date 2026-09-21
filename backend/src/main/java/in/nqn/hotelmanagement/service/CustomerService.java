package in.nqn.hotelmanagement.service;

import in.nqn.hotelmanagement.entity.customer.Customer;
import in.nqn.hotelmanagement.exception.DuplicateResourceException;
import in.nqn.hotelmanagement.exception.ResourceNotFoundException;
import in.nqn.hotelmanagement.repository.CustomerRepository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class CustomerService {

    private CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer createGuest(Customer guest) {
        if(customerRepository.existsByEmail(guest.getEmail())) {
            throw new DuplicateResourceException
                    ("Customer with email " + guest.getEmail() + " already exists");
        }

        return customerRepository.save(guest);
    }

    public Customer getCustomerById(Long id) {
        Customer customer = customerRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException
                                ("Customer with id " + id + " not found"));
        return customer;
    }

    public List<Customer> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();

        return customers.stream().toList();
    }

    public Customer updateCustomer(Long id, @RequestBody Customer customer) {
        Customer customerToUpdate = customerRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));

        customerToUpdate.setFullName(customer.getFullName());
        customerToUpdate.setEmail(customer.getEmail());
        customerToUpdate.setDOB(customer.getDOB());
        return customerRepository.save(customerToUpdate);
    }

    public void deleteCustomer(Long id) {
        Customer customerToDelete = customerRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " not found"));

        customerRepository.delete(customerToDelete);
    }

    private boolean emailExists(Customer customer) {
        return customerRepository.existsByEmail(customer.getEmail());
    }
}
