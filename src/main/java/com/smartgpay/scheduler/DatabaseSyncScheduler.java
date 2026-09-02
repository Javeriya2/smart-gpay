package com.smartgpay.scheduler;

import com.smartgpay.service.BigQuerySyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSyncScheduler.class);
    private final BigQuerySyncService bigQuerySyncService;

    public DatabaseSyncScheduler(BigQuerySyncService bigQuerySyncService) {
        this.bigQuerySyncService = bigQuerySyncService;
    }

    @Scheduled(cron = "0 15 22 * * *", zone = "Asia/Kolkata")
    public void scheduleDailyBigQuerySync() {
        logger.info("Triggering scheduled daily database sync to BigQuery (9:00 PM IST)...");
        try {
            bigQuerySyncService.syncAllTables();
            logger.info("Scheduled daily BigQuery sync finished successfully.");
        } catch (Exception e) {
            logger.error("Scheduled daily BigQuery sync encountered an error", e);
        }
    }
}
