package com.smartgpay.controller;


import com.smartgpay.service.BigQuerySyncService;
import com.smartgpay.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/reports")
public class ReportController {
     public final ReportService reportService;

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);


    public ReportController(ReportService reportService){
         this.reportService = reportService;
     }

    /**
     * Endpoint to download a dynamically generated PDF report for a user from BigQuery.
     * Example: GET /api/reports/user/1
     */
     @GetMapping("/user/{userId}")
    public ResponseEntity<byte[]> downloadUserReport(@PathVariable Long userId) {
        try {
            byte[] pdfBytes = reportService.generateUserActivityPdfReport(userId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "User_Report_" + userId + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            logger.error("Failed to generate user report for ID: " + userId, e);
            return ResponseEntity.internalServerError().build();

        }
    }


}
