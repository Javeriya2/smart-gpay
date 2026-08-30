package com.smartgpay.repository;

import com.smartgpay.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private ContactAliasRepository contactAliasRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionStatusLogRepository transactionStatusLogRepository;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        contactRepository.deleteAll();
        contactAliasRepository.deleteAll();
        transactionRepository.deleteAll();
        transactionStatusLogRepository.deleteAll();

        sampleUser = userRepository.save(new User("Javeriya", "javi@okaxis", new BigDecimal("10000.00")));
    }

    @Test
    @DisplayName("User Persistence - Save user & retrieve by UPI ID")
    void testSaveAndFindUserByUpiId() {
        Optional<User> found = userRepository.findByUpiId("javi@okaxis");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Javeriya");
        assertThat(found.get().getBalance()).isEqualByComparingTo("10000.00");
        assertThat(found.get().getCreatedAt()).isNotNull();
        assertThat(found.get().getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Contact Persistence - Allow duplicate names for different contacts")
    void testSaveMultipleContactsSameName() {
        Contact rahulBlr = contactRepository.save(new Contact(sampleUser, "Rahul", "rahul.blr@okaxis"));
        Contact rahulDel = contactRepository.save(new Contact(sampleUser, "Rahul", "rahul.delhi@okaxis"));
        Contact rahulFam = contactRepository.save(new Contact(sampleUser, "Rahul", "rahul.fam@okaxis"));

        List<Contact> rahuls = contactRepository.findByUserIdAndNameIgnoreCase(sampleUser.getId(), "rahul");
        assertThat(rahuls).hasSize(3);
        assertThat(rahuls).extracting(Contact::getVpa)
                .containsExactlyInAnyOrder("rahul.blr@okaxis", "rahul.delhi@okaxis", "rahul.fam@okaxis");
    }

    @Test
    @DisplayName("Contact Aliases - Map multiple aliases to a single contact")
    void testContactAliasesMapping() {
        Contact prem = contactRepository.save(new Contact(sampleUser, "Prem Kumar", "prem@okaxis"));
        contactAliasRepository.save(new ContactAlias(prem, "Prem bhai"));
        contactAliasRepository.save(new ContactAlias(prem, "Premu"));

        List<ContactAlias> aliases = contactAliasRepository.findByContactId(prem.getId());
        assertThat(aliases).hasSize(2);
        assertThat(aliases).extracting(ContactAlias::getAlias)
                .containsExactlyInAnyOrder("Prem bhai", "Premu");

        List<ContactAlias> foundByAlias = contactAliasRepository.findByUserIdAndAliasIgnoreCase(sampleUser.getId(), "premu");
        assertThat(foundByAlias).hasSize(1);
        assertThat(foundByAlias.get(0).getContact().getVpa()).isEqualTo("prem@okaxis");
    }

    @Test
    @DisplayName("Transactions & Logs - Flow sequence of status changes")
    void testTransactionAndStatusLogTrail() {
        Contact receiver = contactRepository.save(new Contact(sampleUser, "Rahul Sharma", "rahul.blr@okaxis"));

        Transaction tx = new Transaction(sampleUser, receiver, new BigDecimal("500.00"), "send 500 to Rahul", TransactionStatus.INITIATED);
        tx = transactionRepository.save(tx);

        assertThat(tx.getId()).isNotNull();
        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.INITIATED);

        // Add audit logs
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.INITIATED, "Request received"));
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.INTENT_EXTRACTED, "Amount: 500, Recipient: Rahul"));
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.CONTACT_RESOLVED, "Matched contact rahul.blr@okaxis"));

        // Update tx status
        tx.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(tx);
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.SUCCESS, "Payment of ₹500 completed successfully"));

        List<TransactionStatusLog> logs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(tx.getId());
        assertThat(logs).hasSize(4);
        assertThat(logs.get(0).getStatus()).isEqualTo(TransactionStatus.INITIATED);
        assertThat(logs.get(3).getStatus()).isEqualTo(TransactionStatus.SUCCESS);
        assertThat(logs.get(3).getNote()).contains("₹500 completed");
    }
}
