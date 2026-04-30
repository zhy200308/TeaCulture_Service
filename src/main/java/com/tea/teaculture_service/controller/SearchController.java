package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.search.SearchResponse;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.entity.TeaTopic;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaKnowledgeService;
import com.tea.teaculture_service.service.TeaScenarioService;
import com.tea.teaculture_service.service.TeaTopicService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final TeaKnowledgeService teaKnowledgeService;
    private final TeaTopicService teaTopicService;
    private final TeaScenarioService teaScenarioService;
    private final TeaFoodMatchService teaFoodMatchService;

    public SearchController(TeaKnowledgeService teaKnowledgeService,
                            TeaTopicService teaTopicService,
                            TeaScenarioService teaScenarioService,
                            TeaFoodMatchService teaFoodMatchService) {
        this.teaKnowledgeService = teaKnowledgeService;
        this.teaTopicService = teaTopicService;
        this.teaScenarioService = teaScenarioService;
        this.teaFoodMatchService = teaFoodMatchService;
    }

    @GetMapping
    public ApiResponse<SearchResponse> search(@RequestParam String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return ApiResponse.ok(new SearchResponse()
                    .setKnowledge(Collections.emptyList())
                    .setTopics(Collections.emptyList())
                    .setScenarios(Collections.emptyList())
                    .setFoodMatches(Collections.emptyList()));
        }

        List<TeaKnowledge> knowledge = teaKnowledgeService.list(new LambdaQueryWrapper<TeaKnowledge>()
                .eq(TeaKnowledge::getDeleted, false)
                .eq(TeaKnowledge::getStatus, true)
                .and(w -> w.like(TeaKnowledge::getTitle, keyword).or().like(TeaKnowledge::getSummary, keyword))
                .orderByDesc(TeaKnowledge::getUpdateTime)
                .last("limit 20"));

        List<TeaTopic> topics = teaTopicService.list(new LambdaQueryWrapper<TeaTopic>()
                .eq(TeaTopic::getDeleted, false)
                .eq(TeaTopic::getStatus, true)
                .and(w -> w.like(TeaTopic::getTitle, keyword).or().like(TeaTopic::getSummary, keyword))
                .orderByDesc(TeaTopic::getUpdateTime)
                .last("limit 20"));

        List<TeaScenario> scenarios = teaScenarioService.list(new LambdaQueryWrapper<TeaScenario>()
                .eq(TeaScenario::getDeleted, false)
                .eq(TeaScenario::getStatus, true)
                .and(w -> w.like(TeaScenario::getTitle, keyword).or().like(TeaScenario::getSummary, keyword))
                .orderByDesc(TeaScenario::getUpdateTime)
                .last("limit 20"));

        List<TeaFoodMatch> foodMatches = teaFoodMatchService.list(new LambdaQueryWrapper<TeaFoodMatch>()
                .eq(TeaFoodMatch::getDeleted, false)
                .eq(TeaFoodMatch::getStatus, true)
                .and(w -> w.like(TeaFoodMatch::getTitle, keyword).or().like(TeaFoodMatch::getSummary, keyword))
                .orderByDesc(TeaFoodMatch::getUpdateTime)
                .last("limit 20"));

        return ApiResponse.ok(new SearchResponse()
                .setKnowledge(knowledge)
                .setTopics(topics)
                .setScenarios(scenarios)
                .setFoodMatches(foodMatches));
    }
}

