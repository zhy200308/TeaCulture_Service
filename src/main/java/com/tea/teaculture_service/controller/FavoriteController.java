package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.favorite.FavoriteAddRequest;
import com.tea.teaculture_service.dto.favorite.FavoriteItem;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.entity.TeaTopic;
import com.tea.teaculture_service.entity.UserFavorite;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaKnowledgeService;
import com.tea.teaculture_service.service.TeaScenarioService;
import com.tea.teaculture_service.service.TeaTopicService;
import com.tea.teaculture_service.service.UserFavoriteService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/favorite")
public class FavoriteController {

    private final UserFavoriteService userFavoriteService;
    private final TeaKnowledgeService teaKnowledgeService;
    private final TeaTopicService teaTopicService;
    private final TeaScenarioService teaScenarioService;
    private final TeaFoodMatchService teaFoodMatchService;

    public FavoriteController(UserFavoriteService userFavoriteService,
                              TeaKnowledgeService teaKnowledgeService,
                              TeaTopicService teaTopicService,
                              TeaScenarioService teaScenarioService,
                              TeaFoodMatchService teaFoodMatchService) {
        this.userFavoriteService = userFavoriteService;
        this.teaKnowledgeService = teaKnowledgeService;
        this.teaTopicService = teaTopicService;
        this.teaScenarioService = teaScenarioService;
        this.teaFoodMatchService = teaFoodMatchService;
    }

    @GetMapping("/list")
    public ApiResponse<PageResponse<FavoriteItem>> list(@RequestParam(required = false) String targetType,
                                                        @RequestParam(defaultValue = "1") Long pageNum,
                                                        @RequestParam(defaultValue = "20") Long pageSize) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }

        Page<UserFavorite> page = userFavoriteService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<UserFavorite>()
                        .eq(UserFavorite::getDeleted, false)
                        .eq(UserFavorite::getUserId, userId)
                        .eq(targetType != null && !targetType.isBlank(), UserFavorite::getTargetType, targetType)
                        .orderByDesc(UserFavorite::getCreateTime));

        Map<String, Map<Long, String>> titleMap = buildTitleMap(page.getRecords());
        Map<String, Map<Long, String>> coverMap = buildCoverMap(page.getRecords());

        List<FavoriteItem> items = page.getRecords().stream().map(f -> new FavoriteItem()
                .setId(f.getId())
                .setTargetType(f.getTargetType())
                .setTargetId(f.getTargetId())
                .setTargetTitle(titleMap.getOrDefault(f.getTargetType(), Collections.emptyMap()).get(f.getTargetId()))
                .setTargetCoverImage(coverMap.getOrDefault(f.getTargetType(), Collections.emptyMap()).get(f.getTargetId())))
                .toList();

        PageResponse<FavoriteItem> resp = new PageResponse<FavoriteItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> add(@RequestBody FavoriteAddRequest req) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        if (req == null || req.getTargetType() == null || req.getTargetId() == null) {
            return ApiResponse.badRequest("参数错误");
        }
        boolean exists = userFavoriteService.count(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getDeleted, false)
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getTargetType, req.getTargetType())
                .eq(UserFavorite::getTargetId, req.getTargetId())) > 0;
        if (exists) {
            return ApiResponse.ok();
        }
        UserFavorite fav = new UserFavorite()
                .setUserId(userId)
                .setTargetType(req.getTargetType())
                .setTargetId(req.getTargetId())
                .setDeleted(false);
        userFavoriteService.save(fav);
        return ApiResponse.ok();
    }

    @DeleteMapping
    public ApiResponse<Void> remove(@RequestParam String targetType, @RequestParam Long targetId) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        userFavoriteService.remove(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getTargetType, targetType)
                .eq(UserFavorite::getTargetId, targetId));
        return ApiResponse.ok();
    }

    @GetMapping("/check")
    public ApiResponse<Map<String, Object>> check(@RequestParam String targetType, @RequestParam Long targetId) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        boolean exists = userFavoriteService.count(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getDeleted, false)
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getTargetType, targetType)
                .eq(UserFavorite::getTargetId, targetId)) > 0;
        return ApiResponse.ok(Map.of("isFavorite", exists));
    }

    private Map<String, Map<Long, String>> buildTitleMap(List<UserFavorite> favorites) {
        Map<String, List<Long>> grouped = favorites.stream()
                .filter(f -> f.getTargetType() != null && f.getTargetId() != null)
                .collect(Collectors.groupingBy(UserFavorite::getTargetType, Collectors.mapping(UserFavorite::getTargetId, Collectors.toList())));

        Map<String, Map<Long, String>> map = new HashMap<>();
        for (Map.Entry<String, List<Long>> entry : grouped.entrySet()) {
            String type = entry.getKey();
            List<Long> ids = entry.getValue().stream().filter(Objects::nonNull).distinct().toList();
            if (ids.isEmpty()) {
                map.put(type, Collections.emptyMap());
                continue;
            }
            if ("knowledge".equals(type)) {
                map.put(type, teaKnowledgeService.listByIds(ids).stream().collect(Collectors.toMap(TeaKnowledge::getId, TeaKnowledge::getTitle, (a, b) -> a)));
            } else if ("topic".equals(type)) {
                map.put(type, teaTopicService.listByIds(ids).stream().collect(Collectors.toMap(TeaTopic::getId, TeaTopic::getTitle, (a, b) -> a)));
            } else if ("scenario".equals(type)) {
                map.put(type, teaScenarioService.listByIds(ids).stream().collect(Collectors.toMap(TeaScenario::getId, TeaScenario::getTitle, (a, b) -> a)));
            } else if ("food".equals(type)) {
                map.put(type, teaFoodMatchService.listByIds(ids).stream().collect(Collectors.toMap(TeaFoodMatch::getId, TeaFoodMatch::getTitle, (a, b) -> a)));
            } else {
                map.put(type, Collections.emptyMap());
            }
        }
        return map;
    }

    private Map<String, Map<Long, String>> buildCoverMap(List<UserFavorite> favorites) {
        Map<String, List<Long>> grouped = favorites.stream()
                .filter(f -> f.getTargetType() != null && f.getTargetId() != null)
                .collect(Collectors.groupingBy(UserFavorite::getTargetType, Collectors.mapping(UserFavorite::getTargetId, Collectors.toList())));

        Map<String, Map<Long, String>> map = new HashMap<>();
        for (Map.Entry<String, List<Long>> entry : grouped.entrySet()) {
            String type = entry.getKey();
            List<Long> ids = entry.getValue().stream().filter(Objects::nonNull).distinct().toList();
            if (ids.isEmpty()) {
                map.put(type, Collections.emptyMap());
                continue;
            }
            if ("knowledge".equals(type)) {
                map.put(type, teaKnowledgeService.listByIds(ids).stream().collect(Collectors.toMap(TeaKnowledge::getId, TeaKnowledge::getCoverImage, (a, b) -> a)));
            } else if ("topic".equals(type)) {
                map.put(type, teaTopicService.listByIds(ids).stream().collect(Collectors.toMap(TeaTopic::getId, TeaTopic::getCoverImage, (a, b) -> a)));
            } else if ("scenario".equals(type)) {
                map.put(type, teaScenarioService.listByIds(ids).stream().collect(Collectors.toMap(TeaScenario::getId, TeaScenario::getCoverImage, (a, b) -> a)));
            } else if ("food".equals(type)) {
                map.put(type, teaFoodMatchService.listByIds(ids).stream().collect(Collectors.toMap(TeaFoodMatch::getId, TeaFoodMatch::getCoverImage, (a, b) -> a)));
            } else {
                map.put(type, Collections.emptyMap());
            }
        }
        return map;
    }
}
