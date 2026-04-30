package com.tea.teaculture_service.controller;

import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.learning.LearningRecordRequest;
import com.tea.teaculture_service.entity.UserLearningRecord;
import com.tea.teaculture_service.service.UserLearningRecordService;
import com.tea.teaculture_service.utils.UserContext;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/learning")
@RequiredArgsConstructor
public class LearningRecordController {

    private static final Set<String> ALLOWED_TYPES = Set.of("knowledge", "topic", "scenario", "food");

    private final UserLearningRecordService userLearningRecordService;

    @PostMapping("/record")
    public ApiResponse<Void> record(@RequestBody LearningRecordRequest req) {
        Long userId = UserContext.getUserId();
        if (userId == null) return ApiResponse.ok(null);
        if (req == null || req.getTargetId() == null || req.getTargetType() == null) return ApiResponse.fail("参数错误");
        if (!ALLOWED_TYPES.contains(req.getTargetType())) return ApiResponse.fail("参数错误");

        UserLearningRecord r = new UserLearningRecord()
                .setUserId(userId)
                .setTargetType(req.getTargetType())
                .setTargetId(req.getTargetId())
                .setCreateTime(LocalDateTime.now())
                .setDeleted(false);
        userLearningRecordService.save(r);
        return ApiResponse.ok(null);
    }
}

