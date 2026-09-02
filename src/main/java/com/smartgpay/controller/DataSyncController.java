package com.smartgpay.controller;

import com.smartgpay.service.BigQuerySyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class DataSyncController {

    private static final Logger logger = LoggerFactory.getLogger(DataSyncController.class);
    private final BigQuerySyncService bigQuerySyncService;

    public DataSyncController(BigQuerySyncService bigQuerySyncService) {
        this.bigQuerySyncService = bigQuerySyncService;
    }

    /**
     * On-demand endpoint to sync the entire PostgreSQL database to BigQuery
     * Endpoint: POST /api/admin/sync-bigquery
     */
    @PostMapping("/sync-bigquery")
    public ResponseEntity<String> triggerManualSync() {
        logger.info("Manual BigQuery synchronization triggered via API endpoint.");
        try {
            bigQuerySyncService.syncAllTables();
            return ResponseEntity.ok("Database synchronization to BigQuery completed successfully!");
        } catch (Exception e) {
            logger.error("Manual BigQuery sync failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Sync failed due to an error: " + e.getMessage());
        }
    }

}
