package com.tea.teaculture_service.config;

import com.tea.teaculture_service.dto.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLIntegrityConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({DuplicateKeyException.class, DataIntegrityViolationException.class, SQLIntegrityConstraintViolationException.class})
    public ApiResponse<Void> handleDuplicate(Exception e) {
        Throwable root = rootCause(e);
        String msg = root.getMessage() == null ? "" : root.getMessage();
        String tip = toDuplicateTip(msg);
        return ApiResponse.badRequest(tip);
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handle(Exception e) {
        return ApiResponse.fail("服务器异常");
    }

    private static Throwable rootCause(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        return cur;
    }

    private static String toDuplicateTip(String msg) {
        if (msg.contains("uk_scenario_id")) return "该场景已存在冲泡参数记录";
        if (msg.contains("uk_user_target")) return "已收藏";
        if (msg.contains("uk_category_code")) return "分类编码已存在";
        if (msg.contains("uk_topic_code")) return "分类编码已存在";
        if (msg.contains("uk_tea_type_code")) return "茶类编码已存在";
        if (msg.contains("Duplicate entry")) return "唯一标识重复，请修改后重试";
        return "数据重复，请修改后重试";
    }
}
