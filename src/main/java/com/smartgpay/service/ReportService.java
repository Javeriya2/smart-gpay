package com.smartgpay.service;

import com.google.cloud.bigquery.*;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;
import com.google.cloud.bigquery.TableResult;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.lowagie.text.*;

import java.io.ByteArrayOutputStream;


@Service
public class ReportService {
    private final BigQuery bigQuery;
    public ReportService(BigQuery bigQuery) {
        this.bigQuery = bigQuery;
    }

    @Value("${spring.cloud.gcp.bigquery.project-id}")
    private String projectId;

    @Value("${spring.cloud.gcp.bigquery.dataset-name}")
    private String datasetName;

    public byte[] generateUserActivityPdfReport(Long userId) throws Exception {
        // Use the injected properties to build the exact BigQuery path
        String query = String.format(
                "SELECT " +
                        "(SELECT COUNT(1) FROM `%s.%s.transactions` WHERE sender_id = @userId) as total_transactions, " +
                        "(SELECT SUM(amount) FROM `%s.%s.transactions` WHERE sender_id = @userId) as total_spent, " +
                        "(SELECT COUNT(1) FROM `%s.%s.contacts` WHERE user_id = @userId) as total_contacts",
                projectId, datasetName,
                projectId, datasetName,
                projectId, datasetName
        );

        QueryJobConfiguration queryConfig = QueryJobConfiguration.newBuilder(query)
                .addNamedParameter("userId", QueryParameterValue.int64(userId))
                .build();

        TableResult results = bigQuery.query(queryConfig);

        long totalTransactions = 0;
        double totalSpent = 0.0;
        long totalContacts = 0;

        for (FieldValueList row : results.iterateAll()) {
            totalTransactions = row.get("total_transactions").isNull() ? 0 : row.get("total_transactions").getLongValue();
            totalSpent = row.get("total_spent").isNull() ? 0.0 : row.get("total_spent").getDoubleValue();
            totalContacts = row.get("total_contacts").isNull() ? 0 : row.get("total_contacts").getLongValue();
        }

        // Generate PDF bytes in memory using OpenPDF
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        document.add(new Paragraph("Smart GPay - User Activity Report", titleFont));
        document.add(new Paragraph("Generated for User ID: " + userId, bodyFont));
        document.add(new Paragraph("---------------------------------------------------------------------------------", bodyFont));
        document.add(new Paragraph("Total Transactions: " + totalTransactions, bodyFont));
        document.add(new Paragraph("Total Amount Processed: " + totalSpent, bodyFont));
        document.add(new Paragraph("Total Contacts Managed: " + totalContacts, bodyFont));
        document.add(new Paragraph("\nThis report was generated dynamically from BigQuery data warehouse.", bodyFont));

        document.close();
        return baos.toByteArray();
    }



}
