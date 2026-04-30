package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.TeaTopicCategoryUpsertRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.TeaTopicCategory;
import com.tea.teaculture_service.service.TeaTopicCategoryService;
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

@RestController
@RequestMapping("/admin/topic-categories")
public class AdminTeaTopicCategoryController {

    private final TeaTopicCategoryService teaTopicCategoryService;

    public AdminTeaTopicCategoryController(TeaTopicCategoryService teaTopicCategoryService) {
        this.teaTopicCategoryService = teaTopicCategoryService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TeaTopicCategory>> list(@RequestParam(required = false) String keyword,
                                                            @RequestParam(defaultValue = "1") Long pageNum,
                                                            @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaTopicCategory> page = teaTopicCategoryService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaTopicCategory>()
                        .eq(TeaTopicCategory::getDeleted, false)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaTopicCategory::getTopicCode, keyword).or().like(TeaTopicCategory::getTopicName, keyword))
                        .orderByAsc(TeaTopicCategory::getSortOrder)
                        .orderByAsc(TeaTopicCategory::getId));
        PageResponse<TeaTopicCategory> resp = new PageResponse<TeaTopicCategory>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaTopicCategoryUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getTopicCode() == null || req.getTopicCode().isBlank()) {
            return ApiResponse.badRequest("topicCode不能为空");
        }
        TeaTopicCategory entity = new TeaTopicCategory()
                .setTopicCode(req.getTopicCode())
                .setTopicName(req.getTopicName())
                .setSortOrder(req.getSortOrder())
                .setDeleted(false);
        teaTopicCategoryService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaTopicCategoryUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaTopicCategory exists = teaTopicCategoryService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaTopicCategory upd = new TeaTopicCategory().setId(id);
        if (req.getTopicCode() != null) upd.setTopicCode(req.getTopicCode());
        if (req.getTopicName() != null) upd.setTopicName(req.getTopicName());
        if (req.getSortOrder() != null) upd.setSortOrder(req.getSortOrder());
        teaTopicCategoryService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaTopicCategoryService.removeById(id);
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
        teaTopicCategoryService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}

