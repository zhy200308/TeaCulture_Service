package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.TeaBrewingParamUpsertRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.TeaBrewingParam;
import com.tea.teaculture_service.service.TeaBrewingParamService;
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
@RequestMapping("/admin/brewing-params")
public class AdminTeaBrewingParamController {

    private final TeaBrewingParamService teaBrewingParamService;

    public AdminTeaBrewingParamController(TeaBrewingParamService teaBrewingParamService) {
        this.teaBrewingParamService = teaBrewingParamService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TeaBrewingParam>> list(@RequestParam(required = false) Long scenarioId,
                                                           @RequestParam(required = false) String keyword,
                                                           @RequestParam(defaultValue = "1") Long pageNum,
                                                           @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaBrewingParam> page = teaBrewingParamService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaBrewingParam>()
                        .eq(TeaBrewingParam::getDeleted, false)
                        .eq(scenarioId != null, TeaBrewingParam::getScenarioId, scenarioId)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaBrewingParam::getTeaType, keyword)
                                        .or().like(TeaBrewingParam::getNote, keyword))
                        .orderByDesc(TeaBrewingParam::getUpdateTime));
        PageResponse<TeaBrewingParam> resp = new PageResponse<TeaBrewingParam>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaBrewingParamUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getScenarioId() == null) {
            return ApiResponse.badRequest("scenarioId不能为空");
        }
        TeaBrewingParam entity = new TeaBrewingParam()
                .setScenarioId(req.getScenarioId())
                .setTeaType(req.getTeaType())
                .setAmount(req.getAmount())
                .setWaterTemp(req.getWaterTemp())
                .setBrewTime(req.getBrewTime())
                .setNote(req.getNote())
                .setDeleted(false);
        teaBrewingParamService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaBrewingParamUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaBrewingParam exists = teaBrewingParamService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaBrewingParam upd = new TeaBrewingParam().setId(id);
        if (req.getScenarioId() != null) upd.setScenarioId(req.getScenarioId());
        if (req.getTeaType() != null) upd.setTeaType(req.getTeaType());
        if (req.getAmount() != null) upd.setAmount(req.getAmount());
        if (req.getWaterTemp() != null) upd.setWaterTemp(req.getWaterTemp());
        if (req.getBrewTime() != null) upd.setBrewTime(req.getBrewTime());
        if (req.getNote() != null) upd.setNote(req.getNote());
        teaBrewingParamService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaBrewingParamService.removeById(id);
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
        teaBrewingParamService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
