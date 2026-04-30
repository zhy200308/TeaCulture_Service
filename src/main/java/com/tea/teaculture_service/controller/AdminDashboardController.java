package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.entity.TeaTopic;
import com.tea.teaculture_service.entity.UserFavorite;
import com.tea.teaculture_service.entity.UserLearningRecord;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaKnowledgeService;
import com.tea.teaculture_service.service.TeaScenarioService;
import com.tea.teaculture_service.service.TeaTopicService;
import com.tea.teaculture_service.service.UserFavoriteService;
import com.tea.teaculture_service.service.UserLearningRecordService;
import com.tea.teaculture_service.utils.UserContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardController {

    private final SysUserService sysUserService;
    private final TeaKnowledgeService teaKnowledgeService;
    private final TeaTopicService teaTopicService;
    private final TeaScenarioService teaScenarioService;
    private final TeaFoodMatchService teaFoodMatchService;
    private final UserFavoriteService userFavoriteService;
    private final UserLearningRecordService userLearningRecordService;

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Object>> stats() {
        if (!UserContext.isAdmin()) return ApiResponse.forbidden("无权限");

        long userCount = sysUserService.count(new QueryWrapper<SysUser>().eq("deleted", 0));
        long knowledgeCount = teaKnowledgeService.count(new QueryWrapper<TeaKnowledge>().eq("deleted", 0));
        long topicCount = teaTopicService.count(new QueryWrapper<TeaTopic>().eq("deleted", 0));
        long scenarioCount = teaScenarioService.count(new QueryWrapper<TeaScenario>().eq("deleted", 0));
        long foodCount = teaFoodMatchService.count(new QueryWrapper<TeaFoodMatch>().eq("deleted", 0));

        List<Map<String, Object>> favoriteAgg;
        try {
            favoriteAgg = userFavoriteService.listMaps(new QueryWrapper<UserFavorite>()
                    .select("target_type as targetType", "count(*) as favoriteCount", "count(distinct user_id) as userCount")
                    .eq("deleted", 0)
                    .groupBy("target_type"));
        } catch (Exception e) {
            log.error("dashboard favoriteAgg failed", e);
            favoriteAgg = List.of();
        }

        LocalDate startDay = LocalDate.now().minusDays(6);
        LocalDateTime startTime = startDay.atStartOfDay();

        List<Map<String, Object>> learningAgg;
        List<Map<String, Object>> learningByType;
        try {
            learningAgg = userLearningRecordService.listMaps(new QueryWrapper<UserLearningRecord>()
                    .select("DATE_FORMAT(create_time,'%Y-%m-%d') as day", "count(*) as cnt")
                    .eq("deleted", 0)
                    .ge("create_time", startTime)
                    .groupBy("DATE_FORMAT(create_time,'%Y-%m-%d')")
                    .orderByAsc("day"));
            learningByType = userLearningRecordService.listMaps(new QueryWrapper<UserLearningRecord>()
                    .select("target_type as targetType", "count(*) as cnt")
                    .eq("deleted", 0)
                    .ge("create_time", startTime)
                    .groupBy("target_type"));
        } catch (Exception e) {
            log.error("dashboard learningAgg failed", e);
            learningAgg = List.of();
            learningByType = List.of();
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("userCount", userCount);
        resp.put("knowledgeCount", knowledgeCount);
        resp.put("topicCount", topicCount);
        resp.put("scenarioCount", scenarioCount);
        resp.put("foodCount", foodCount);
        resp.put("favoriteAgg", favoriteAgg);
        resp.put("learningAgg", learningAgg);
        resp.put("learningByType", learningByType);
        resp.put("learningStartDay", startDay.toString());
        return ApiResponse.ok(resp);
    }
}
