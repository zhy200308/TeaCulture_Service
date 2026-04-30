package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.scenario.ScenarioDetailResponse;
import com.tea.teaculture_service.dto.scenario.ScenarioUpsertRequest;
import com.tea.teaculture_service.entity.TeaBrewingParam;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.service.TeaBrewingParamService;
import com.tea.teaculture_service.service.TeaScenarioService;
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
@RequestMapping("/scenario")
public class ScenarioController {

    private final TeaScenarioService teaScenarioService;
    private final TeaBrewingParamService teaBrewingParamService;

    public ScenarioController(TeaScenarioService teaScenarioService, TeaBrewingParamService teaBrewingParamService) {
        this.teaScenarioService = teaScenarioService;
        this.teaBrewingParamService = teaBrewingParamService;
    }

    @GetMapping("/list")
    public ApiResponse<PageResponse<TeaScenario>> list(@RequestParam(required = false) String scenarioType,
                                                      @RequestParam(required = false) String keyword,
                                                      @RequestParam(defaultValue = "1") Long pageNum,
                                                      @RequestParam(defaultValue = "10") Long pageSize) {
        Page<TeaScenario> page = teaScenarioService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaScenario>()
                        .eq(TeaScenario::getDeleted, false)
                        .eq(scenarioType != null && !scenarioType.isBlank(), TeaScenario::getScenarioType, scenarioType)
                        .and(keyword != null && !keyword.isBlank(), w -> w.like(TeaScenario::getTitle, keyword).or().like(TeaScenario::getSummary, keyword))
                        .orderByAsc(TeaScenario::getSortOrder)
                        .orderByDesc(TeaScenario::getUpdateTime));
        PageResponse<TeaScenario> resp = new PageResponse<TeaScenario>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse<ScenarioDetailResponse> detail(@PathVariable("id") Long id) {
        TeaScenario scenario = teaScenarioService.getOne(new LambdaQueryWrapper<TeaScenario>()
                .eq(TeaScenario::getId, id)
                .eq(TeaScenario::getDeleted, false)
                .last("limit 1"));
        if (scenario == null) {
            return ApiResponse.fail("内容不存在");
        }
        TeaBrewingParam param = teaBrewingParamService.getOne(new LambdaQueryWrapper<TeaBrewingParam>()
                .eq(TeaBrewingParam::getScenarioId, scenario.getId())
                .eq(TeaBrewingParam::getDeleted, false)
                .last("limit 1"));

        Integer view = scenario.getViewCount() == null ? 0 : scenario.getViewCount();
        teaScenarioService.updateById(new TeaScenario().setId(scenario.getId()).setViewCount(view + 1));
        scenario.setViewCount(view + 1);

        return ApiResponse.ok(new ScenarioDetailResponse().setScenario(scenario).setBrewingParam(param));
    }

    @GetMapping("/params/{scenarioId}")
    public ApiResponse<TeaBrewingParam> params(@PathVariable("scenarioId") Long scenarioId) {
        TeaBrewingParam param = teaBrewingParamService.getOne(new LambdaQueryWrapper<TeaBrewingParam>()
                .eq(TeaBrewingParam::getScenarioId, scenarioId)
                .eq(TeaBrewingParam::getDeleted, false)
                .last("limit 1"));
        return ApiResponse.ok(param);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody ScenarioUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getTitle() == null || req.getTitle().isBlank()) {
            return ApiResponse.badRequest("标题不能为空");
        }
        TeaScenario entity = new TeaScenario()
                .setScenarioType(req.getScenarioType())
                .setTitle(req.getTitle())
                .setSummary(req.getSummary())
                .setDetailContent(req.getDetailContent())
                .setCoverImage(req.getCoverImage())
                .setStatus(req.getStatus() == null ? true : req.getStatus() == 1)
                .setDeleted(false);
        teaScenarioService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody ScenarioUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaScenario exists = teaScenarioService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaScenario upd = new TeaScenario().setId(id);
        if (req.getScenarioType() != null) upd.setScenarioType(req.getScenarioType());
        if (req.getTitle() != null) upd.setTitle(req.getTitle());
        if (req.getSummary() != null) upd.setSummary(req.getSummary());
        if (req.getDetailContent() != null) upd.setDetailContent(req.getDetailContent());
        if (req.getCoverImage() != null) upd.setCoverImage(req.getCoverImage());
        if (req.getStatus() != null) upd.setStatus(req.getStatus() == 1);
        teaScenarioService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaScenarioService.removeById(id);
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
        teaScenarioService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
