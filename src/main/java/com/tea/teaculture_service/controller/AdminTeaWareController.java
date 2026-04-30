package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.TeaWareUpsertRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.TeaWare;
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

@RestController
@RequestMapping("/admin/tea-wares")
public class AdminTeaWareController {

    private final TeaWareService teaWareService;

    public AdminTeaWareController(TeaWareService teaWareService) {
        this.teaWareService = teaWareService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TeaWare>> list(@RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "1") Long pageNum,
                                                   @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaWare> page = teaWareService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaWare>()
                        .eq(TeaWare::getDeleted, false)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaWare::getWareKey, keyword)
                                        .or().like(TeaWare::getName, keyword)
                                        .or().like(TeaWare::getSuitableTea, keyword))
                        .orderByAsc(TeaWare::getSortOrder)
                        .orderByDesc(TeaWare::getUpdateTime));
        PageResponse<TeaWare> resp = new PageResponse<TeaWare>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaWareUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getWareKey() == null || req.getWareKey().isBlank()) {
            return ApiResponse.badRequest("wareKey不能为空");
        }
        TeaWare entity = new TeaWare()
                .setWareKey(req.getWareKey())
                .setName(req.getName())
                .setImage(req.getImage())
                .setDetailContent(req.getDetailContent())
                .setSuitableTea(req.getSuitableTea())
                .setSortOrder(req.getSortOrder())
                .setDeleted(false);
        teaWareService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaWareUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaWare exists = teaWareService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaWare upd = new TeaWare().setId(id);
        if (req.getWareKey() != null) upd.setWareKey(req.getWareKey());
        if (req.getName() != null) upd.setName(req.getName());
        if (req.getImage() != null) upd.setImage(req.getImage());
        if (req.getDetailContent() != null) upd.setDetailContent(req.getDetailContent());
        if (req.getSuitableTea() != null) upd.setSuitableTea(req.getSuitableTea());
        if (req.getSortOrder() != null) upd.setSortOrder(req.getSortOrder());
        teaWareService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaWareService.removeById(id);
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
        teaWareService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}

