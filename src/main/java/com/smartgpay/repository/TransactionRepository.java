package com.smartgpay.repository;

import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderId(Long senderId);
    List<Transaction> findByReceiverId(Long receiverId);
    List<Transaction> findBySenderIdAndStatus(Long senderId, TransactionStatus status);
    Optional<Transaction> findByOriginalRequestId(String originalRequestId);

     List<Transaction> findBySenderIdAndStatusAndCreatedAtAfter(Long senderId, TransactionStatus status, LocalDateTime after);
    List<Transaction> findBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, TransactionStatus status);
    List<Transaction> findBySenderIdAndCreatedAtAfter(Long senderId, LocalDateTime after);
}
