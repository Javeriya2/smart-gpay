package com.smartgpay.repository;

import com.smartgpay.model.ContactAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactAliasRepository extends JpaRepository<ContactAlias, Long> {
    List<ContactAlias> findByContactId(Long contactId);

    @Query("SELECT ca FROM ContactAlias ca WHERE ca.contact.user.id = :userId AND LOWER(ca.alias) = LOWER(:alias)")
    List<ContactAlias> findByUserIdAndAliasIgnoreCase(@Param("userId") Long userId, @Param("alias") String alias);
}
