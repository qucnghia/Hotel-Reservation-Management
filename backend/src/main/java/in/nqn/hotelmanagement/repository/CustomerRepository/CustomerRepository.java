package in.nqn.hotelmanagement.repository.CustomerRepository;

import in.nqn.hotelmanagement.entity.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Boolean existsByEmail(String email);
}
