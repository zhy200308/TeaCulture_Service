package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.topic.TopicListItem;
import com.tea.teaculture_service.dto.topic.TopicUpsertRequest;
import com.tea.teaculture_service.entity.TeaTopic;
import com.tea.teaculture_service.entity.TeaTopicCategory;
import com.tea.teaculture_service.service.TeaTopicCategoryService;
import com.tea.teaculture_service.service.TeaTopicService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/topic")
public class TopicController {

    private final TeaTopicService teaTopicService;
    private final TeaTopicCategoryService teaTopicCategoryService;

    public TopicController(TeaTopicService teaTopicService, TeaTopicCategoryService teaTopicCategoryService) {
        this.teaTopicService = teaTopicService;
        this.teaTopicCategoryService = teaTopicCategoryService;
    }

    @GetMapping("/categories")
    public ApiResponse<List<TeaTopicCategory>> categories() {
        List<TeaTopicCategory> list = teaTopicCategoryService.list(new LambdaQueryWrapper<TeaTopicCategory>()
                .eq(TeaTopicCategory::getDeleted, false)
                .orderByAsc(TeaTopicCategory::getSortOrder)
                .orderByAsc(TeaTopicCategory::getId));
        return ApiResponse.ok(list);
    }

    @GetMapping("/list")
    public ApiResponse<PageResponse<TopicListItem>> list(@RequestParam(required = false) String topicCode,
                                                         @RequestParam(required = false) String keyword,
                                                         @RequestParam(defaultValue = "1") Long pageNum,
                                                         @RequestParam(defaultValue = "10") Long pageSize) {
        Page<TeaTopic> page = teaTopicService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaTopic>()
                        .eq(TeaTopic::getDeleted, false)
                        .eq(topicCode != null && !topicCode.isBlank(), TeaTopic::getTopicCode, topicCode)
                        .and(keyword != null && !keyword.isBlank(), w -> w.like(TeaTopic::getTitle, keyword).or().like(TeaTopic::getSummary, keyword))
                        .orderByAsc(TeaTopic::getSortOrder)
                        .orderByDesc(TeaTopic::getUpdateTime));

        List<String> codes = page.getRecords().stream().map(TeaTopic::getTopicCode).filter(Objects::nonNull).distinct().toList();
        Map<String, TeaTopicCategory> categoryMap = teaTopicCategoryService.list(new LambdaQueryWrapper<TeaTopicCategory>()
                        .eq(TeaTopicCategory::getDeleted, false)
                        .in(!codes.isEmpty(), TeaTopicCategory::getTopicCode, codes))
                .stream()
                .collect(Collectors.toMap(TeaTopicCategory::getTopicCode, Function.identity(), (a, b) -> a));

        List<TopicListItem> items = page.getRecords().stream().map(t -> new TopicListItem()
                .setId(t.getId())
                .setTopicKey(t.getTopicKey())
                .setTopicCode(t.getTopicCode())
                .setTopicName(categoryMap.get(t.getTopicCode()) == null ? null : categoryMap.get(t.getTopicCode()).getTopicName())
                .setTitle(t.getTitle())
                .setSummary(t.getSummary())
                .setCoverImage(t.getCoverImage())
                .setAudioUrl(t.getAudioUrl())
                .setViewCount(t.getViewCount())
                .setStatus(Boolean.TRUE.equals(t.getStatus()) ? 1 : 0)).toList();

        PageResponse<TopicListItem> resp = new PageResponse<TopicListItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/detail/{key}")
    public ApiResponse<TeaTopic> detail(@PathVariable("key") String key) {
        TeaTopic topic = teaTopicService.getOne(new LambdaQueryWrapper<TeaTopic>()
                .eq(TeaTopic::getTopicKey, key)
                .eq(TeaTopic::getDeleted, false)
                .last("limit 1"));
        if (topic == null) {
            return ApiResponse.fail("内容不存在");
        }
        Integer view = topic.getViewCount() == null ? 0 : topic.getViewCount();
        teaTopicService.updateById(new TeaTopic().setId(topic.getId()).setViewCount(view + 1));
        topic.setViewCount(view + 1);
        return ApiResponse.ok(topic);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TopicUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getTopicKey() == null || req.getTopicKey().isBlank()) {
            return ApiResponse.badRequest("topicKey不能为空");
        }
        TeaTopic entity = new TeaTopic()
                .setTopicKey(req.getTopicKey())
                .setTopicCode(req.getTopicCode())
                .setTitle(req.getTitle())
                .setSummary(req.getSummary())
                .setDetailContent(req.getDetailContent())
                .setCoverImage(req.getCoverImage())
                .setAudioUrl(req.getAudioUrl())
                .setStatus(req.getStatus() == null ? true : req.getStatus() == 1)
                .setDeleted(false);
        teaTopicService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TopicUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaTopic exists = teaTopicService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaTopic upd = new TeaTopic().setId(id);
        if (req.getTopicKey() != null) upd.setTopicKey(req.getTopicKey());
        if (req.getTopicCode() != null) upd.setTopicCode(req.getTopicCode());
        if (req.getTitle() != null) upd.setTitle(req.getTitle());
        if (req.getSummary() != null) upd.setSummary(req.getSummary());
        if (req.getDetailContent() != null) upd.setDetailContent(req.getDetailContent());
        if (req.getCoverImage() != null) upd.setCoverImage(req.getCoverImage());
        if (req.getAudioUrl() != null) upd.setAudioUrl(req.getAudioUrl());
        if (req.getStatus() != null) upd.setStatus(req.getStatus() == 1);
        teaTopicService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaTopicService.removeById(id);
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
        teaTopicService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
