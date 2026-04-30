package com.tea.teaculture_service.config;

import com.tea.teaculture_service.dto.ApiResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handle(Exception e) {
        return ApiResponse.fail(e.getMessage() == null ? "服务器异常" : e.getMessage());
    }
}

