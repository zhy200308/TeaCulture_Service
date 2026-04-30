package com.tea.teaculture_service;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.tea.teaculture_service.mapper")
public class TeaCultureServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeaCultureServiceApplication.class, args);
    }

}
