package com.smartgpay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(excludeName = {
    "com.google.cloud.spring.autoconfigure.alloydb.GcpAlloydbAutoConfiguration",
    "com.google.cloud.spring.autoconfigure.sql.GcpCloudSqlAutoConfiguration"
})
@EnableScheduling
public class SmartGpayApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartGpayApplication.class, args);
    }
}
