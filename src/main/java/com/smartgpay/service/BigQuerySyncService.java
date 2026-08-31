package com.smartgpay.service;

import com.google.cloud.bigquery.*;
import com.smartgpay.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class BigQuerySyncService {

    private static final Logger logger = LoggerFactory.getLogger(BigQuerySyncService.class);
    private final BigQuery bigQuery;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final ContactAliasRepository contactAliasRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionStatusLogRepository transactionStatusLogRepository;

    @Value("${spring.cloud.gcp.bigquery.dataset-name}")
    private String datasetName;

    public BigQuerySyncService(BigQuery bigQuery,
                               UserRepository userRepository,
                               ContactRepository contactRepository,
                               ContactAliasRepository contactAliasRepository,
                               TransactionRepository transactionRepository,
                               TransactionStatusLogRepository transactionStatusLogRepository) {
        this.bigQuery = bigQuery;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.contactAliasRepository = contactAliasRepository;
        this.transactionRepository = transactionRepository;
        this.transactionStatusLogRepository = transactionStatusLogRepository;
    }

    /**
     * Synchronizes the entire relational database to BigQuery
     */
    public void syncAllTables() {
        logger.info("Starting full database synchronization to BigQuery...");
        syncUsers();
        syncContacts();
        syncContactAliases();
        syncTransactions();
        syncTransactionStatusLogs();
        logger.info("Full database synchronization to BigQuery completed successfully.");
    }

    private void syncUsers() {
        String tableName = "users";
        truncateBigQueryTable(tableName);
        var users = userRepository.findAll();
        if (users.isEmpty()) return;

        TableId tableId = TableId.of(datasetName, tableName);
        InsertAllRequest.Builder requestBuilder = InsertAllRequest.newBuilder(tableId);

        for (var user : users) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", user.getId());
            row.put("name", user.getName());
            row.put("upi_id", user.getUpiId());
            row.put("balance", user.getBalance() != null ? user.getBalance().doubleValue() : 0.0);
            row.put("created_at", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
            row.put("updated_at", user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null);

            requestBuilder.addRow(InsertAllRequest.RowToInsert.of(user.getId().toString(), row));
        }
        executeInsert(tableName, requestBuilder.build(), users.size());
    }
    private void syncContacts() {
        String tableName = "contacts";
        truncateBigQueryTable(tableName);
        var contacts = contactRepository.findAll();
        if (contacts.isEmpty()) return;

        TableId tableId = TableId.of(datasetName, tableName);
        InsertAllRequest.Builder requestBuilder = InsertAllRequest.newBuilder(tableId);

        for (var contact : contacts) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", contact.getId());
            row.put("user_id", contact.getUser() != null ? contact.getUser().getId() : null);
            row.put("name", contact.getName());
            row.put("vpa", contact.getVpa());
            row.put("created_at", contact.getCreatedAt() != null ? contact.getCreatedAt().toString() : null);
            row.put("updated_at", contact.getUpdatedAt() != null ? contact.getUpdatedAt().toString() : null);

            requestBuilder.addRow(InsertAllRequest.RowToInsert.of(contact.getId().toString(), row));
        }
        executeInsert(tableName, requestBuilder.build(), contacts.size());
    }

    private void syncContactAliases() {
        String tableName = "contact_aliases";
        truncateBigQueryTable(tableName);
        var aliases = contactAliasRepository.findAll();
        if (aliases.isEmpty()) return;

        TableId tableId = TableId.of(datasetName, tableName);
        InsertAllRequest.Builder requestBuilder = InsertAllRequest.newBuilder(tableId);

        for (var alias : aliases) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", alias.getId());
            row.put("contact_id", alias.getContact() != null ? alias.getContact().getId() : null);
            row.put("alias", alias.getAlias());
            row.put("created_at", alias.getCreatedAt() != null ? alias.getCreatedAt().toString() : null);

            requestBuilder.addRow(InsertAllRequest.RowToInsert.of(alias.getId().toString(), row));
        }
        executeInsert(tableName, requestBuilder.build(), aliases.size());
    }

    private void syncTransactions() {
        String tableName = "transactions";
        truncateBigQueryTable(tableName);
        var transactions = transactionRepository.findAll();
        if (transactions.isEmpty()) return;

        TableId tableId = TableId.of(datasetName, tableName);
        InsertAllRequest.Builder requestBuilder = InsertAllRequest.newBuilder(tableId);

        for (var tx : transactions) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", tx.getId());
            row.put("original_request_id", tx.getOriginalRequestId());
            row.put("sender_id", tx.getSender() != null ? tx.getSender().getId() : null);
            row.put("receiver_id", tx.getReceiver() != null ? tx.getReceiver().getId() : null);
            row.put("amount", tx.getAmount() != null ? tx.getAmount().doubleValue() : 0.0);
            row.put("raw_query", tx.getRawQuery());
            row.put("status", tx.getStatus() != null ? tx.getStatus().name() : null);
            row.put("created_at", tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null);
            row.put("updated_at", tx.getUpdatedAt() != null ? tx.getUpdatedAt().toString() : null);

            requestBuilder.addRow(InsertAllRequest.RowToInsert.of(tx.getId().toString(), row));
        }
        executeInsert(tableName, requestBuilder.build(), transactions.size());
    }

    private void syncTransactionStatusLogs() {
        String tableName = "transaction_status_log";
        truncateBigQueryTable(tableName);
        var logs = transactionStatusLogRepository.findAll();
        if (logs.isEmpty()) return;

        TableId tableId = TableId.of(datasetName, tableName);
        InsertAllRequest.Builder requestBuilder = InsertAllRequest.newBuilder(tableId);

        for (var log : logs) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", log.getId());
            row.put("transaction_id", log.getTransaction() != null ? log.getTransaction().getId() : null);
            row.put("status", log.getStatus() != null ? log.getStatus().name() : null);
            row.put("note", log.getNote());
            row.put("created_at", log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);

            requestBuilder.addRow(InsertAllRequest.RowToInsert.of(log.getId().toString(), row));
        }
        executeInsert(tableName, requestBuilder.build(), logs.size());
    }

    private void truncateBigQueryTable(String tableName) {
        try {
            String query = String.format("DELETE FROM `%s.%s` WHERE true", datasetName, tableName);
            QueryJobConfiguration queryConfig = QueryJobConfiguration.newBuilder(query).build();
            bigQuery.query(queryConfig);
            logger.info("Cleared old data from BigQuery table: {}", tableName);
        } catch (Exception e) {
            logger.warn("Could not clear BigQuery table {}: {}", tableName, e.getMessage());
        }
    }

    private void executeInsert(String tableName, InsertAllRequest request, int count) {
        InsertAllResponse response = bigQuery.insertAll(request);
        if (response.hasErrors()) {
            logger.error("Errors occurred while syncing table '{}': {}", tableName, response.getInsertErrors());
        } else {
            logger.info("Successfully synced {} rows to BigQuery table '{}'.", count, tableName);
        }
    }
}
