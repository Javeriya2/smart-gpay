package com.smartgpay.service;

import com.smartgpay.dto.ContactResolutionResult;
import com.smartgpay.model.Contact;
import com.smartgpay.model.ContactAlias;
import com.smartgpay.repository.ContactAliasRepository;
import com.smartgpay.repository.ContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContactResolutionService {

    private static final Logger logger = LoggerFactory.getLogger(ContactResolutionService.class);

    private final ContactRepository contactRepository;
    private final ContactAliasRepository contactAliasRepository;

    public ContactResolutionService(ContactRepository contactRepository, ContactAliasRepository contactAliasRepository) {
        this.contactRepository = contactRepository;
        this.contactAliasRepository = contactAliasRepository;
    }

    /**
     * Resolves a recipient name against a user's contact list and contact aliases.
     * Handles exact matching, partial string matching, alias matching, and typo fuzzy matching.
     */
    public ContactResolutionResult resolveContact(Long userId, String recipientName) {
        if (userId == null || recipientName == null || recipientName.trim().isEmpty()) {
            logger.warn("Invalid parameters for resolveContact: userId={}, recipientName={}", userId, recipientName);
            ContactResolutionResult result = new ContactResolutionResult();
            result.setSearchName(recipientName);
            return result;
        }

        String search = recipientName.trim();
        logger.info("Resolving contact for userId={} with recipientName='{}'", userId, search);

        List<Contact> allUserContacts = contactRepository.findByUserId(userId);
        if (allUserContacts.isEmpty()) {
            logger.info("No contacts found for userId={}", userId);
            ContactResolutionResult result = new ContactResolutionResult();
            result.setSearchName(search);
            return result;
        }

        // Step 1: Exact Name Match (case-insensitive)
        List<Contact> exactMatches = allUserContacts.stream()
                .filter(c -> c.getName().equalsIgnoreCase(search))
                .collect(Collectors.toList());

        if (exactMatches.size() == 1) {
            logger.info("Found exact contact match: id={}, name='{}'", exactMatches.get(0).getId(), exactMatches.get(0).getName());
            return createResult(exactMatches.get(0), search);
        } else if (exactMatches.size() > 1) {
            logger.info("Found multiple exact contacts with name '{}': count={}", search, exactMatches.size());
            return createAmbiguousResult(exactMatches, search);
        }

        // Step 2: Contact Alias Match
        List<ContactAlias> aliasMatches = contactAliasRepository.findByUserIdAndAliasIgnoreCase(userId, search);
        if (!aliasMatches.isEmpty()) {
            List<Contact> aliasContacts = aliasMatches.stream()
                    .map(ContactAlias::getContact)
                    .distinct()
                    .collect(Collectors.toList());

            if (aliasContacts.size() == 1) {
                logger.info("Found alias match: alias='{}' -> contact id={}, name='{}'", search, aliasContacts.get(0).getId(), aliasContacts.get(0).getName());
                return createResult(aliasContacts.get(0), search);
            } else if (aliasContacts.size() > 1) {
                logger.info("Found multiple contacts matching alias '{}': count={}", search, aliasContacts.size());
                return createAmbiguousResult(aliasContacts, search);
            }
        }

        // Step 3: Partial Name Match (e.g. "Rahul" matching "Rahul Sharma")
        String lowerSearch = search.toLowerCase();
        List<Contact> partialMatches = allUserContacts.stream()
                .filter(c -> c.getName().toLowerCase().contains(lowerSearch) || lowerSearch.contains(c.getName().toLowerCase()))
                .collect(Collectors.toList());

        if (partialMatches.size() == 1) {
            logger.info("Found partial contact match: id={}, name='{}'", partialMatches.get(0).getId(), partialMatches.get(0).getName());
            return createResult(partialMatches.get(0), search);
        } else if (partialMatches.size() > 1) {
            logger.info("Found multiple partial contacts matching '{}': count={}", search, partialMatches.size());
            return createAmbiguousResult(partialMatches, search);
        }

        // Step 4: Fuzzy Match for Typos (Levenshtein distance)
        Contact bestFuzzy = null;
        int minDistance = Integer.MAX_VALUE;
        for (Contact c : allUserContacts) {
            int dist = computeLevenshteinDistance(lowerSearch, c.getName().toLowerCase());
            if (dist <= 2 && dist < minDistance) { // allow up to 2 character typos
                minDistance = dist;
                bestFuzzy = c;
            }
        }

        if (bestFuzzy != null) {
            logger.info("Found fuzzy typo match for '{}' -> contact id={}, name='{}'", search, bestFuzzy.getId(), bestFuzzy.getName());
            return createResult(bestFuzzy, search);
        }

        logger.info("No matching contact found for userId={} and name='{}'", userId, search);
        ContactResolutionResult notFound = new ContactResolutionResult();
        notFound.setSearchName(search);
        return notFound;
    }

    private ContactResolutionResult createResult(Contact contact, String searchName) {
        ContactResolutionResult result = new ContactResolutionResult(contact);
        result.setSearchName(searchName);
        return result;
    }

    private ContactResolutionResult createAmbiguousResult(List<Contact> contacts, String searchName) {
        ContactResolutionResult result = new ContactResolutionResult(contacts);
        result.setSearchName(searchName);
        return result;
    }

    private int computeLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                            dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
                    );
                }
            }
        }
        return dp[s1.length()][s2.length()];
    }
}
