package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.teafood.TeaFoodDetailResponse;
import com.tea.teaculture_service.dto.teafood.TeaFoodUpsertRequest;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaTypeParam;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaTypeParamService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/tea-food")
public class TeaFoodController {

    private final TeaFoodMatchService teaFoodMatchService;
    private final TeaTypeParamService teaTypeParamService;

    public TeaFoodController(TeaFoodMatchService teaFoodMatchService, TeaTypeParamService teaTypeParamService) {
        this.teaFoodMatchService = teaFoodMatchService;
        this.teaTypeParamService = teaTypeParamService;
    }

    @GetMapping("/list")
    public ApiResponse<List<TeaFoodMatch>> list(@RequestParam(required = false) String teaTypeCode) {
        List<TeaFoodMatch> list = teaFoodMatchService.list(new LambdaQueryWrapper<TeaFoodMatch>()
                .eq(TeaFoodMatch::getDeleted, false)
                .eq(teaTypeCode != null && !teaTypeCode.isBlank(), TeaFoodMatch::getTeaTypeCode, teaTypeCode)
                .orderByAsc(TeaFoodMatch::getSortOrder)
                .orderByDesc(TeaFoodMatch::getUpdateTime));
        return ApiResponse.ok(list);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse<TeaFoodDetailResponse> detail(@PathVariable("id") Long id) {
        TeaFoodMatch match = teaFoodMatchService.getOne(new LambdaQueryWrapper<TeaFoodMatch>()
                .eq(TeaFoodMatch::getId, id)
                .eq(TeaFoodMatch::getDeleted, false)
                .last("limit 1"));
        if (match == null) {
            return ApiResponse.fail("内容不存在");
        }
        TeaTypeParam param = null;
        if (match.getTeaTypeCode() != null) {
            param = teaTypeParamService.getOne(new LambdaQueryWrapper<TeaTypeParam>()
                    .eq(TeaTypeParam::getTeaTypeCode, match.getTeaTypeCode())
                    .eq(TeaTypeParam::getDeleted, false)
                    .last("limit 1"));
        }
        return ApiResponse.ok(new TeaFoodDetailResponse().setMatch(match).setTeaTypeParam(param));
    }

    @GetMapping("/tea-params")
    public ApiResponse<List<TeaTypeParam>> teaParams() {
        List<TeaTypeParam> list = teaTypeParamService.list(new LambdaQueryWrapper<TeaTypeParam>()
                .eq(TeaTypeParam::getDeleted, false)
                .orderByAsc(TeaTypeParam::getTeaTypeCode)
                .orderByAsc(TeaTypeParam::getId));
        return ApiResponse.ok(list);
    }

    @GetMapping("/tea-params/{teaTypeCode}")
    public ApiResponse<TeaTypeParam> teaParam(@PathVariable("teaTypeCode") String teaTypeCode) {
        TeaTypeParam param = teaTypeParamService.getOne(new LambdaQueryWrapper<TeaTypeParam>()
                .eq(TeaTypeParam::getTeaTypeCode, teaTypeCode)
                .eq(TeaTypeParam::getDeleted, false)
                .last("limit 1"));
        return ApiResponse.ok(param);
    }

    @GetMapping("/admin/list")
    public ApiResponse<PageResponse<TeaFoodMatch>> adminList(@RequestParam(required = false) String teaTypeCode,
                                                             @RequestParam(required = false) String keyword,
                                                             @RequestParam(defaultValue = "1") Long pageNum,
                                                             @RequestParam(defaultValue = "10") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<TeaFoodMatch> page = teaFoodMatchService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<TeaFoodMatch>()
                        .eq(TeaFoodMatch::getDeleted, false)
                        .eq(teaTypeCode != null && !teaTypeCode.isBlank(), TeaFoodMatch::getTeaTypeCode, teaTypeCode)
                        .and(keyword != null && !keyword.isBlank(),
                                w -> w.like(TeaFoodMatch::getTitle, keyword)
                                        .or().like(TeaFoodMatch::getSummary, keyword)
                                        .or().like(TeaFoodMatch::getTeaName, keyword)
                                        .or().like(TeaFoodMatch::getFoodName, keyword))
                        .orderByAsc(TeaFoodMatch::getSortOrder)
                        .orderByDesc(TeaFoodMatch::getUpdateTime));
        PageResponse<TeaFoodMatch> resp = new PageResponse<TeaFoodMatch>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody TeaFoodUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getTitle() == null || req.getTitle().isBlank()) {
            return ApiResponse.badRequest("标题不能为空");
        }
        TeaFoodMatch entity = new TeaFoodMatch()
                .setTeaTypeCode(req.getTeaTypeCode())
                .setTeaName(req.getTeaName())
                .setFoodName(req.getFoodName())
                .setTitle(req.getTitle())
                .setSummary(req.getSummary())
                .setCoverImage(req.getCoverImage())
                .setDetailContent(req.getDetailContent())
                .setStatus(req.getStatus() == null ? true : req.getStatus() == 1)
                .setSortOrder(req.getSortOrder())
                .setDeleted(false);
        teaFoodMatchService.save(entity);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody TeaFoodUpsertRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        TeaFoodMatch exists = teaFoodMatchService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("内容不存在");
        }
        TeaFoodMatch upd = new TeaFoodMatch().setId(id);
        if (req.getTeaTypeCode() != null) upd.setTeaTypeCode(req.getTeaTypeCode());
        if (req.getTeaName() != null) upd.setTeaName(req.getTeaName());
        if (req.getFoodName() != null) upd.setFoodName(req.getFoodName());
        if (req.getTitle() != null) upd.setTitle(req.getTitle());
        if (req.getSummary() != null) upd.setSummary(req.getSummary());
        if (req.getCoverImage() != null) upd.setCoverImage(req.getCoverImage());
        if (req.getDetailContent() != null) upd.setDetailContent(req.getDetailContent());
        if (req.getStatus() != null) upd.setStatus(req.getStatus() == 1);
        if (req.getSortOrder() != null) upd.setSortOrder(req.getSortOrder());
        teaFoodMatchService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        teaFoodMatchService.removeById(id);
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
        teaFoodMatchService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
