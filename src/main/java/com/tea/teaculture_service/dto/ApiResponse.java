package com.tea.teaculture_service.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class ApiResponse<T> {

    private Integer code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<T>().setCode(200).setMessage("OK").setData(data);
    }

    public static <T> ApiResponse<T> ok() {
        return ok(null);
    }

    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<T>().setCode(400).setMessage(message);
    }

    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<T>().setCode(401).setMessage(message);
    }

    public static <T> ApiResponse<T> forbidden(String message) {
        return new ApiResponse<T>().setCode(403).setMessage(message);
    }

    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<T>().setCode(500).setMessage(message);
    }
}

