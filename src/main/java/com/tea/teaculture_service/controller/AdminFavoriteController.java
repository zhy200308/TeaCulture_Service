package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.favorite.FavoriteAdminDetailResponse;
import com.tea.teaculture_service.dto.favorite.FavoriteAdminItem;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.entity.TeaTopic;
import com.tea.teaculture_service.entity.UserFavorite;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaKnowledgeService;
import com.tea.teaculture_service.service.TeaScenarioService;
import com.tea.teaculture_service.service.TeaTopicService;
import com.tea.teaculture_service.service.UserFavoriteService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/admin/favorites")
public class AdminFavoriteController {

    private final UserFavoriteService userFavoriteService;
    private final SysUserService sysUserService;
    private final TeaKnowledgeService teaKnowledgeService;
    private final TeaTopicService teaTopicService;
    private final TeaScenarioService teaScenarioService;
    private final TeaFoodMatchService teaFoodMatchService;

    public AdminFavoriteController(UserFavoriteService userFavoriteService,
                                   SysUserService sysUserService,
                                   TeaKnowledgeService teaKnowledgeService,
                                   TeaTopicService teaTopicService,
                                   TeaScenarioService teaScenarioService,
                                   TeaFoodMatchService teaFoodMatchService) {
        this.userFavoriteService = userFavoriteService;
        this.sysUserService = sysUserService;
        this.teaKnowledgeService = teaKnowledgeService;
        this.teaTopicService = teaTopicService;
        this.teaScenarioService = teaScenarioService;
        this.teaFoodMatchService = teaFoodMatchService;
    }

    @GetMapping
    public ApiResponse<PageResponse<FavoriteAdminItem>> list(@RequestParam(required = false) Long userId,
                                                             @RequestParam(required = false) String username,
                                                             @RequestParam(required = false) String targetType,
                                                             @RequestParam(defaultValue = "1") Long pageNum,
                                                             @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }

        List<Long> userIds = null;
        if (username != null && !username.isBlank()) {
            userIds = sysUserService.list(new LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getDeleted, false)
                            .and(w -> w.like(SysUser::getUsername, username).or().like(SysUser::getNickname, username)))
                    .stream()
                    .map(SysUser::getId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            if (userIds.isEmpty()) {
                return ApiResponse.ok(new PageResponse<FavoriteAdminItem>().setRecords(List.of()).setTotal(0L).setPageNum(pageNum).setPageSize(pageSize));
            }
        }

        Page<UserFavorite> page = userFavoriteService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<UserFavorite>()
                        .eq(UserFavorite::getDeleted, false)
                        .eq(userId != null, UserFavorite::getUserId, userId)
                        .in(userIds != null && !userIds.isEmpty(), UserFavorite::getUserId, userIds)
                        .eq(targetType != null && !targetType.isBlank(), UserFavorite::getTargetType, targetType)
                        .orderByDesc(UserFavorite::getCreateTime));

        List<Long> pageUserIds = page.getRecords().stream().map(UserFavorite::getUserId).filter(Objects::nonNull).distinct().toList();
        Map<Long, SysUser> userMap = pageUserIds.isEmpty()
                ? Collections.emptyMap()
                : sysUserService.listByIds(pageUserIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity(), (a, b) -> a));

        Map<String, Map<Long, String>> titleMap = buildTitleMap(page.getRecords());

        List<FavoriteAdminItem> items = page.getRecords().stream().map(f -> new FavoriteAdminItem()
                .setId(f.getId())
                .setUserId(f.getUserId())
                .setUsername(userMap.get(f.getUserId()) == null ? null : userMap.get(f.getUserId()).getUsername())
                .setTargetType(f.getTargetType())
                .setTargetId(f.getTargetId())
                .setTargetTitle(titleMap.getOrDefault(f.getTargetType(), Collections.emptyMap()).get(f.getTargetId()))
                .setCreateTime(f.getCreateTime())).toList();

        PageResponse<FavoriteAdminItem> resp = new PageResponse<FavoriteAdminItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/{id}/detail")
    public ApiResponse<FavoriteAdminDetailResponse> detail(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        UserFavorite fav = userFavoriteService.getOne(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getId, id)
                .eq(UserFavorite::getDeleted, false)
                .last("limit 1"));
        if (fav == null) {
            return ApiResponse.fail("记录不存在");
        }

        SysUser user = fav.getUserId() == null ? null : sysUserService.getById(fav.getUserId());
        FavoriteAdminDetailResponse resp = new FavoriteAdminDetailResponse()
                .setId(fav.getId())
                .setUserId(fav.getUserId())
                .setUsername(user == null ? null : user.getUsername())
                .setTargetType(fav.getTargetType())
                .setTargetId(fav.getTargetId())
                .setCreateTime(fav.getCreateTime());

        if (fav.getTargetType() == null || fav.getTargetId() == null) {
            return ApiResponse.ok(resp);
        }

        if ("knowledge".equals(fav.getTargetType())) {
            TeaKnowledge k = teaKnowledgeService.getOne(new LambdaQueryWrapper<TeaKnowledge>()
                    .eq(TeaKnowledge::getId, fav.getTargetId())
                    .eq(TeaKnowledge::getDeleted, false)
                    .last("limit 1"));
            if (k != null) {
                resp.setTargetTitle(k.getTitle())
                        .setTargetSummary(k.getSummary())
                        .setTargetCoverImage(k.getCoverImage())
                        .setTargetDetailContent(k.getDetailContent());
            }
        } else if ("topic".equals(fav.getTargetType())) {
            TeaTopic t = teaTopicService.getOne(new LambdaQueryWrapper<TeaTopic>()
                    .eq(TeaTopic::getId, fav.getTargetId())
                    .eq(TeaTopic::getDeleted, false)
                    .last("limit 1"));
            if (t != null) {
                resp.setTargetTitle(t.getTitle())
                        .setTargetSummary(t.getSummary())
                        .setTargetCoverImage(t.getCoverImage())
                        .setTargetDetailContent(t.getDetailContent())
                        .setTargetAudioUrl(t.getAudioUrl());
            }
        } else if ("scenario".equals(fav.getTargetType())) {
            TeaScenario s = teaScenarioService.getOne(new LambdaQueryWrapper<TeaScenario>()
                    .eq(TeaScenario::getId, fav.getTargetId())
                    .eq(TeaScenario::getDeleted, false)
                    .last("limit 1"));
            if (s != null) {
                resp.setTargetTitle(s.getTitle())
                        .setTargetSummary(s.getSummary())
                        .setTargetCoverImage(s.getCoverImage())
                        .setTargetDetailContent(s.getDetailContent());
            }
        } else if ("food".equals(fav.getTargetType())) {
            TeaFoodMatch m = teaFoodMatchService.getOne(new LambdaQueryWrapper<TeaFoodMatch>()
                    .eq(TeaFoodMatch::getId, fav.getTargetId())
                    .eq(TeaFoodMatch::getDeleted, false)
                    .last("limit 1"));
            if (m != null) {
                resp.setTargetTitle(m.getTitle())
                        .setTargetSummary(m.getSummary())
                        .setTargetCoverImage(m.getCoverImage())
                        .setTargetDetailContent(m.getDetailContent());
            }
        }

        return ApiResponse.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        userFavoriteService.removeById(id);
        return ApiResponse.ok();
    }

    @PostMapping("/batch-delete")
    public ApiResponse<Void> batchDelete(@RequestBody IdListRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getIds() == null || req.getIds().isEmpty()) {
            return ApiResponse.badRequest("ids不能为空");
        }
        userFavoriteService.removeByIds(req.getIds());
        return ApiResponse.ok();
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
}
