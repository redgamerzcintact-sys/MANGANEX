package com.manganex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ManganexApplication {
    public static void main(String[] args) {
        SpringApplication.run(ManganexApplication.class, args);
    }
}

