package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.knowledge.KnowledgeListItem;
import com.tea.teaculture_service.dto.knowledge.KnowledgeUpsertRequest;
import com.tea.teaculture_service.entity.TeaCategory;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaWare;
import com.tea.teaculture_service.service.TeaCategoryService;
import com.tea.teaculture_service.service.TeaKnowledgeService;
import com.tea.teaculture_service.service.TeaWareService;
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
@RequestMapping("/knowledge")
public class KnowledgeController {

    private final TeaCategoryService teaCategoryService;
    private final TeaKnowledgeService teaKnowledgeService;
    private final TeaWareService teaWareService;

    public KnowledgeController(TeaCategoryService teaCategoryService, TeaKnowledgeService teaKnowledgeService, TeaWareService teaWareService) {
        this.teaCategoryService = teaCategoryService;
        this.teaKnowledgeService = teaKnowledgeService;
        this.teaWareService = teaWareService;
    }

    @GetMapping("/categories")
    public ApiResponse<List<TeaCategory>> categories() {
        List<TeaCategory> list = teaCategoryService.list(new LambdaQueryWrapper<TeaCategory>()
                .eq(TeaCategory::getDeleted, false)
                .orderByAsc(TeaCategory::getSortOrder)
                .orderByAsc(TeaCategory::getId));
        return ApiResponse.ok(list);
    }

    @GetMapping("/list")
    public ApiResponse<PageResponse<KnowledgeListItem>> list(@RequestParam(required = false) String categoryCode,
                                                             @RequestParam(required = false) String keyword,
                                                             @RequestParam(defaultValue = "1") Long pageNum,
                                                             @RequestParam(defaultValue = "10") Long pageSize) {
        Page<TeaKnowledge> page = teaKnowledgeService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaKnowledge>()
                        .eq(TeaKnowledge::getDeleted, false)
                        .eq(categoryCode != null && !categoryCode.isBlank(), TeaKnowledge::getCategoryCode, categoryCode)
                        .and(keyword != null && !keyword.isBlank(), w -> w.like(TeaKnowledge::getTitle, keyword).or().like(TeaKnowledge::getSummary, keyword))
                        .orderByAsc(TeaKnowledge::getSortOrder)
                        .orderByDesc(TeaKnowledge::getUpdateTime));

        List<String> codes = page.getRecords().stream().map(TeaKnowledge::getCategoryCode).filter(Objects::nonNull).distinct().toList();
        Map<String, TeaCategory> categoryMap = teaCategoryService.list(new LambdaQueryWrapper<TeaCategory>()
                        .eq(TeaCategory::getDeleted, false)
                        .in(!codes.isEmpty(), TeaCategory::getCategoryCode, codes))
                .stream()
                .collect(Collectors.toMap(TeaCategory::getCategoryCode, Function.identity(), (a, b) -> a));

        List<KnowledgeListItem> items = page.getRecords().stream().map(k -> new KnowledgeListItem()
                .setId(k.getId())
                .setKnowledgeKey(k.getKnowledgeKey())
                .setCategoryCode(k.getCategoryCode())
                .setCategoryName(categoryMap.get(k.getCategoryCode()) == null ? null : categoryMap.get(k.getCategoryCode()).getCategoryName())
                .setTitle(k.getTitle())
                .setSummary(k.getSummary())
                .setCoverImage(k.getCoverImage())
                .setViewCount(k.getViewCount())
                .setStatus(Boolean.TRUE.equals(k.getStatus()) ? 1 : 0)).toList();

        PageResponse<KnowledgeListItem> resp = new PageResponse<KnowledgeListItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/detail/{key}")
    public ApiResponse<TeaKnowledge> detail(@PathVariable("key") String key) {
        TeaKnowledge k = teaKnowledgeService.getOne(new LambdaQueryWrapper<TeaKnowledge>()
                .eq(TeaKnowledge::getKnowledgeKey, key)
                .eq(TeaKnowledge::getDeleted, false)
                .last("limit 1"));
        if (k == null) {
            return ApiResponse.fail("内容不存在");
        }
        Integer view = k.getViewCount() == null ? 0 : k.getViewCount();
        teaKnowledgeService.updateById(new TeaKnowledge().setId(k.getId()).setViewCount(view + 1));
        k.setViewCount(view + 1);
        return ApiResponse.ok(k);
    }

    @GetMapping("/wares")
    public ApiResponse<List<TeaWare>> wares() {
        List<TeaWare> list = teaWareService.list(new LambdaQueryWrapper<TeaWare>()
                .eq(TeaWare::getDeleted, false)
                .orderByAsc(TeaWare::getSortOrder)
                .orderByAsc(TeaWare::getId));
        return ApiResponse.ok(list);
    }

    @GetMapping("/wares/{key}")
    public ApiResponse<TeaWare> wareDetail(@PathVariable("key") String key) {
        TeaWare ware = teaWareService.getOne(new LambdaQueryWrapper<TeaWare>()
                .eq(TeaWare::getWareKey, key)
                .eq(TeaWare::getDeleted, false)
                .last("limit 1"));
        if (ware == null) {
            return ApiResponse.fail("内容不存在");
        }
        return ApiResponse.ok(ware);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody KnowledgeUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getKnowledgeKey() == null || req.getKnowledgeKey().isBlank()) {
            return ApiResponse.badRequest("knowledgeKey不能为空");
        }
        TeaKnowledge entity = new TeaKnowledge()
                .setKnowledgeKey(req.getKnowledgeKey())
                .setCategoryCode(req.getCategoryCode())
                .setTitle(req.getTitle())
                .setSummary(req.getSummary())
                .setDetailContent(req.getDetailContent())
                .setCoverImage(req.getCoverImage())
                .setStatus(req.getStatus() == null ? true : req.getStatus() == 1)
                .setDeleted(false);
        teaKnowledgeService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody KnowledgeUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaKnowledge exists = teaKnowledgeService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaKnowledge upd = new TeaKnowledge().setId(id);
        if (req.getKnowledgeKey() != null) upd.setKnowledgeKey(req.getKnowledgeKey());
        if (req.getCategoryCode() != null) upd.setCategoryCode(req.getCategoryCode());
        if (req.getTitle() != null) upd.setTitle(req.getTitle());
        if (req.getSummary() != null) upd.setSummary(req.getSummary());
        if (req.getDetailContent() != null) upd.setDetailContent(req.getDetailContent());
        if (req.getCoverImage() != null) upd.setCoverImage(req.getCoverImage());
        if (req.getStatus() != null) upd.setStatus(req.getStatus() == 1);
        teaKnowledgeService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaKnowledgeService.removeById(id);
        return ApiResponse.ok();
    }
}

