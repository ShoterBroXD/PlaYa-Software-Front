package com.playa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.playa"})
public class PlaYaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlaYaApplication.class, args);
    }

}
