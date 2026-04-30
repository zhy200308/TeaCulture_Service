package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.TeaCategoryUpsertRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.TeaCategory;
import com.tea.teaculture_service.service.TeaCategoryService;
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
@RequestMapping("/admin/knowledge-categories")
public class AdminTeaCategoryController {

    private final TeaCategoryService teaCategoryService;

    public AdminTeaCategoryController(TeaCategoryService teaCategoryService) {
        this.teaCategoryService = teaCategoryService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TeaCategory>> list(@RequestParam(required = false) String keyword,
                                                       @RequestParam(defaultValue = "1") Long pageNum,
                                                       @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaCategory> page = teaCategoryService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaCategory>()
                        .eq(TeaCategory::getDeleted, false)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaCategory::getCategoryCode, keyword).or().like(TeaCategory::getCategoryName, keyword))
                        .orderByAsc(TeaCategory::getSortOrder)
                        .orderByAsc(TeaCategory::getId));
        PageResponse<TeaCategory> resp = new PageResponse<TeaCategory>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaCategoryUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getCategoryCode() == null || req.getCategoryCode().isBlank()) {
            return ApiResponse.badRequest("categoryCode不能为空");
        }
        TeaCategory entity = new TeaCategory()
                .setCategoryCode(req.getCategoryCode())
                .setCategoryName(req.getCategoryName())
                .setIcon(req.getIcon())
                .setSortOrder(req.getSortOrder())
                .setDeleted(false);
        teaCategoryService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaCategoryUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaCategory exists = teaCategoryService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaCategory upd = new TeaCategory().setId(id);
        if (req.getCategoryCode() != null) upd.setCategoryCode(req.getCategoryCode());
        if (req.getCategoryName() != null) upd.setCategoryName(req.getCategoryName());
        if (req.getIcon() != null) upd.setIcon(req.getIcon());
        if (req.getSortOrder() != null) upd.setSortOrder(req.getSortOrder());
        teaCategoryService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaCategoryService.removeById(id);
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
        teaCategoryService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}

