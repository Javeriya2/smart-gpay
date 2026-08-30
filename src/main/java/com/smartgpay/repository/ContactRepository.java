package com.smartgpay.repository;

import com.smartgpay.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByUserId(Long userId);
    List<Contact> findByUserIdAndNameIgnoreCase(Long userId, String name);
    Optional<Contact> findByUserIdAndVpa(Long userId, String vpa);
}
