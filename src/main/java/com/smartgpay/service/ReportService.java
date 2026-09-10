package com.smartgpay.service;

import com.google.cloud.bigquery.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;


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

        // =========================
        // 1. FETCH TRANSACTIONS
        // =========================

        String query = String.format(
                "SELECT " +
                        "t.id, " +
                        "t.original_request_id, " +
                        "t.sender_id, " +
                        "t.receiver_id, " +
                        "t.amount, " +
                        "t.raw_query, " +
                        "t.status, " +
                        "t.created_at, " +
                        "t.updated_at, " +
                        "c.name AS receiver_name " +
                        "FROM `%s.%s.transactions` t " +
                        "LEFT JOIN `%s.%s.contacts` c " +
                        "ON t.receiver_id = c.id " +
                        "WHERE t.sender_id = @userId " +
                        "ORDER BY t.created_at DESC",
                projectId, datasetName,
                projectId, datasetName
        );
        // =========================
        // 2. FETCH USER NAME
        // =========================

        String userName = null;

        String userQuery = String.format(
                "SELECT name " +
                        "FROM `%s.%s.users` " +
                        "WHERE id = @userId",
                projectId, datasetName
        );

        QueryJobConfiguration userConfig =
                QueryJobConfiguration.newBuilder(userQuery)
                        .addNamedParameter(
                                "userId",
                                QueryParameterValue.int64(userId)
                        )
                        .build();

        TableResult userResults = bigQuery.query(userConfig);

        for (FieldValueList row : userResults.iterateAll()) {
            userName = row.get("name").getStringValue();
            break;
        }

        if (userName == null) {
            throw new IllegalArgumentException(
                    "User not found for ID: " + userId
            );
        }


        // =========================
        // 3. EXECUTE TRANSACTION QUERY
        // =========================

        QueryJobConfiguration queryConfig =
                QueryJobConfiguration.newBuilder(query)
                        .addNamedParameter(
                                "userId",
                                QueryParameterValue.int64(userId)
                        )
                        .build();

        TableResult results = bigQuery.query(queryConfig);


        long totalTransactions = 0;
        double totalSpent = 0.0;
        long successfulTransactions = 0;

        List<FieldValueList> transactionRows = new ArrayList<>();


        for (FieldValueList row : results.iterateAll()) {

            transactionRows.add(row);

            totalTransactions++;

            if (!row.get("amount").isNull()) {
                totalSpent += row.get("amount").getDoubleValue();
            }

            if (!row.get("status").isNull()
                    && "SUCCESS".equalsIgnoreCase(
                    row.get("status").getStringValue())) {

                successfulTransactions++;
            }
        }


        // =========================
        // 4. FETCH CONTACT COUNT
        // =========================

        String contactsQuery = String.format(
                "SELECT COUNT(1) AS total_contacts " +
                        "FROM `%s.%s.contacts` " +
                        "WHERE user_id = @userId",
                projectId, datasetName
        );

        QueryJobConfiguration contactsConfig =
                QueryJobConfiguration.newBuilder(contactsQuery)
                        .addNamedParameter(
                                "userId",
                                QueryParameterValue.int64(userId)
                        )
                        .build();

        TableResult contactsResults =
                bigQuery.query(contactsConfig);

        long totalContacts = 0;

        for (FieldValueList row : contactsResults.iterateAll()) {

            totalContacts = row.get("total_contacts").isNull()
                    ? 0
                    : row.get("total_contacts").getLongValue();
        }


        // =========================
        // 5. CREATE PDF
        // =========================

        ByteArrayOutputStream baos =
                new ByteArrayOutputStream();

        Document document = new Document(
                PageSize.A4,
                40,
                40,
                40,
                40
        );

        PdfWriter.getInstance(document, baos);

        document.open();


        // =========================
        // 6. FONTS
        // =========================

        Font titleFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                24
        );

        Font subtitleFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                11
        );

        Font sectionFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                14
        );

        Font cardTitleFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                9
        );

        Font cardValueFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                15
        );

        Font bodyFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                9
        );

        Font tableHeaderFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,
                8
        );

        Font tableBodyFont = FontFactory.getFont(
                FontFactory.HELVETICA,
                8
        );


        // =========================
        // 7. HEADER
        // =========================

        Paragraph title = new Paragraph(
                "SMART GPAY",
                titleFont
        );

        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);

        document.add(title);


        Paragraph subtitle = new Paragraph(
                "User Activity & Spending Analytics",
                subtitleFont
        );

        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(8);

        document.add(subtitle);


        Paragraph userInfo = new Paragraph(
                "User: " + userName + "  |  User ID: " + userId,
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        10
                )
        );

        userInfo.setAlignment(Element.ALIGN_CENTER);

        document.add(userInfo);


        Paragraph reportInfo = new Paragraph(
                "Generated from Smart GPay analytics data",
                bodyFont
        );

        reportInfo.setAlignment(Element.ALIGN_CENTER);
        reportInfo.setSpacingAfter(18);

        document.add(reportInfo);


        // =========================
        // 8. ACCOUNT OVERVIEW
        // =========================

        Paragraph overviewTitle = new Paragraph(
                "ACCOUNT OVERVIEW",
                sectionFont
        );

        overviewTitle.setSpacingAfter(8);

        document.add(overviewTitle);


        PdfPTable overviewTable =
                new PdfPTable(3);

        overviewTable.setWidthPercentage(100);

        overviewTable.setWidths(
                new float[]{1, 1, 1}
        );

        overviewTable.setSpacingAfter(20);


        overviewTable.addCell(
                createMetricCell(
                        "TOTAL TRANSACTIONS",
                        String.valueOf(totalTransactions),
                        cardTitleFont,
                        cardValueFont
                )
        );

        overviewTable.addCell(
                createMetricCell(
                        "TOTAL AMOUNT SENT",
                        "₹" + formatAmount(totalSpent),
                        cardTitleFont,
                        cardValueFont
                )
        );

        overviewTable.addCell(
                createMetricCell(
                        "TOTAL CONTACTS",
                        String.valueOf(totalContacts),
                        cardTitleFont,
                        cardValueFont
                )
        );

        document.add(overviewTable);


        // =========================
        // 9. ACTIVITY SUMMARY
        // =========================

        Paragraph activityTitle = new Paragraph(
                "ACTIVITY SUMMARY",
                sectionFont
        );

        activityTitle.setSpacingAfter(8);

        document.add(activityTitle);


        PdfPTable activityTable =
                new PdfPTable(2);

        activityTable.setWidthPercentage(100);

        activityTable.setWidths(
                new float[]{2, 1}
        );

        activityTable.setSpacingAfter(20);


        activityTable.addCell(
                createLabelCell(
                        "Successful Transactions",
                        bodyFont
                )
        );

        activityTable.addCell(
                createValueCell(
                        String.valueOf(successfulTransactions),
                        bodyFont
                )
        );


        activityTable.addCell(
                createLabelCell(
                        "Average Transaction Amount",
                        bodyFont
                )
        );


        double averageAmount =
                totalTransactions > 0
                        ? totalSpent / totalTransactions
                        : 0.0;


        activityTable.addCell(
                createValueCell(
                        "₹" + formatAmount(averageAmount),
                        bodyFont
                )
        );


        activityTable.addCell(
                createLabelCell(
                        "Total Contacts Managed",
                        bodyFont
                )
        );

        activityTable.addCell(
                createValueCell(
                        String.valueOf(totalContacts),
                        bodyFont
                )
        );


        document.add(activityTable);


        // =========================
        // 10. TRANSACTION HISTORY
        // =========================

        Paragraph transactionTitle = new Paragraph(
                "RECENT TRANSACTIONS",
                sectionFont
        );

        transactionTitle.setSpacingAfter(8);

        document.add(transactionTitle);


        PdfPTable transactionTable =
                new PdfPTable(5);

        transactionTable.setWidthPercentage(100);

        transactionTable.setWidths(
                new float[]{
                        1.2f,
                        2.2f,
                        2.4f,
                        1.4f,
                        1.4f
                }
        );


        transactionTable.addCell(
                createHeaderCell(
                        "ID",
                        tableHeaderFont
                )
        );

        transactionTable.addCell(
                createHeaderCell(
                        "DATE",
                        tableHeaderFont
                )
        );

        transactionTable.addCell(
                createHeaderCell(
                        "RECIPIENT",
                        tableHeaderFont
                )
        );

        transactionTable.addCell(
                createHeaderCell(
                        "AMOUNT",
                        tableHeaderFont
                )
        );

        transactionTable.addCell(
                createHeaderCell(
                        "STATUS",
                        tableHeaderFont
                )
        );


        int transactionLimit =
                Math.min(
                        transactionRows.size(),
                        15
                );


        for (int i = 0;
             i < transactionLimit;
             i++) {

            FieldValueList row =
                    transactionRows.get(i);


            String id =
                    row.get("id").isNull()
                            ? "-"
                            : row.get("id").getStringValue();


            String recipient =
                    row.get("receiver_name").isNull()
                            ? "Unknown"
                            : row.get("receiver_name")
                            .getStringValue();


            String amount =
                    row.get("amount").isNull()
                            ? "₹0.00"
                            : "₹" + formatAmount(
                            row.get("amount")
                                    .getDoubleValue()
                    );


            String status =
                    row.get("status").isNull()
                            ? "-"
                            : row.get("status")
                            .getStringValue();


            String date = "-";


            if (!row.get("created_at").isNull()) {

                long timestampMicros =
                        row.get("created_at")
                                .getTimestampValue();


                Instant instant =
                        Instant.ofEpochSecond(
                                timestampMicros / 1_000_000,
                                (timestampMicros % 1_000_000) * 1_000
                        );


                date =
                        DateTimeFormatter.ofPattern(
                                        "dd MMM yyyy, hh:mm a"
                                )
                                .withZone(
                                        ZoneId.of("Asia/Kolkata")
                                )
                                .format(instant);
            }


            transactionTable.addCell(
                    createBodyCell(
                            id,
                            tableBodyFont
                    )
            );

            transactionTable.addCell(
                    createBodyCell(
                            date,
                            tableBodyFont
                    )
            );

            transactionTable.addCell(
                    createBodyCell(
                            recipient,
                            tableBodyFont
                    )
            );

            transactionTable.addCell(
                    createBodyCell(
                            amount,
                            tableBodyFont
                    )
            );

            transactionTable.addCell(
                    createBodyCell(
                            status,
                            tableBodyFont
                    )
            );
        }


        document.add(transactionTable);


        // =========================
        // 11. FOOTER INFORMATION
        // =========================

        document.add(
                new Paragraph(" ")
        );


        Paragraph footer = new Paragraph(
                "This report was generated dynamically from Smart GPay BigQuery analytics data.",
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        8
                )
        );

        footer.setAlignment(
                Element.ALIGN_CENTER
        );

        document.add(footer);


        document.close();

        return baos.toByteArray();
    }


    private PdfPCell createMetricCell(
            String title,
            String value,
            Font titleFont,
            Font valueFont
    ) {

        PdfPCell cell =
                new PdfPCell();

        cell.setBackgroundColor(
                new java.awt.Color(
                        245,
                        247,
                        250
                )
        );

        cell.setBorderColor(
                new java.awt.Color(
                        220,
                        224,
                        230
                )
        );

        cell.setPadding(10);

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );


        Paragraph titleParagraph =
                new Paragraph(
                        title,
                        titleFont
                );

        titleParagraph.setAlignment(
                Element.ALIGN_CENTER
        );


        Paragraph valueParagraph =
                new Paragraph(
                        value,
                        valueFont
                );

        valueParagraph.setAlignment(
                Element.ALIGN_CENTER
        );


        cell.addElement(titleParagraph);
        cell.addElement(valueParagraph);


        return cell;
    }


    private PdfPCell createLabelCell(
            String text,
            Font font
    ) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                text,
                                font
                        )
                );

        cell.setPadding(7);

        return cell;
    }


    private PdfPCell createValueCell(
            String text,
            Font font
    ) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                text,
                                font
                        )
                );

        cell.setPadding(7);

        cell.setHorizontalAlignment(
                Element.ALIGN_RIGHT
        );

        return cell;
    }


    private PdfPCell createHeaderCell(
            String text,
            Font font
    ) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                text,
                                font
                        )
                );

        cell.setPadding(6);

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        return cell;
    }


    private PdfPCell createBodyCell(
            String text,
            Font font
    ) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                text,
                                font
                        )
                );

        cell.setPadding(5);

        return cell;
    }


    private String formatAmount(
            double amount
    ) {

        DecimalFormat formatter =
                new DecimalFormat(
                        "#,##0.00"
                );

        return formatter.format(amount);
    }
}