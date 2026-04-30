package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.TeaTypeParamUpsertRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.TeaTypeParam;
import com.tea.teaculture_service.service.TeaTypeParamService;
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
@RequestMapping("/admin/tea-type-params")
public class AdminTeaTypeParamController {

    private final TeaTypeParamService teaTypeParamService;

    public AdminTeaTypeParamController(TeaTypeParamService teaTypeParamService) {
        this.teaTypeParamService = teaTypeParamService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TeaTypeParam>> list(@RequestParam(required = false) String keyword,
                                                        @RequestParam(defaultValue = "1") Long pageNum,
                                                        @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaTypeParam> page = teaTypeParamService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaTypeParam>()
                        .eq(TeaTypeParam::getDeleted, false)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaTypeParam::getTeaTypeCode, keyword)
                                        .or().like(TeaTypeParam::getTeaTypeName, keyword)
                                        .or().like(TeaTypeParam::getNote, keyword))
                        .orderByAsc(TeaTypeParam::getTeaTypeCode)
                        .orderByDesc(TeaTypeParam::getUpdateTime));
        PageResponse<TeaTypeParam> resp = new PageResponse<TeaTypeParam>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaTypeParamUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getTeaTypeCode() == null || req.getTeaTypeCode().isBlank()) {
            return ApiResponse.badRequest("teaTypeCode不能为空");
        }
        TeaTypeParam entity = new TeaTypeParam()
                .setTeaTypeCode(req.getTeaTypeCode())
                .setTeaTypeName(req.getTeaTypeName())
                .setWaterTemp(req.getWaterTemp())
                .setAmount(req.getAmount())
                .setBrewTime(req.getBrewTime())
                .setNote(req.getNote())
                .setDeleted(false);
        teaTypeParamService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaTypeParamUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaTypeParam exists = teaTypeParamService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaTypeParam upd = new TeaTypeParam().setId(id);
        if (req.getTeaTypeCode() != null) upd.setTeaTypeCode(req.getTeaTypeCode());
        if (req.getTeaTypeName() != null) upd.setTeaTypeName(req.getTeaTypeName());
        if (req.getWaterTemp() != null) upd.setWaterTemp(req.getWaterTemp());
        if (req.getAmount() != null) upd.setAmount(req.getAmount());
        if (req.getBrewTime() != null) upd.setBrewTime(req.getBrewTime());
        if (req.getNote() != null) upd.setNote(req.getNote());
        teaTypeParamService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaTypeParamService.removeById(id);
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
        teaTypeParamService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}

