package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.teafood.TeaFoodDetailResponse;
import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaTypeParam;
import com.tea.teaculture_service.service.TeaFoodMatchService;
import com.tea.teaculture_service.service.TeaTypeParamService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/detail/{key}")
    public ApiResponse<TeaFoodDetailResponse> detail(@PathVariable("key") String key) {
        TeaFoodMatch match = teaFoodMatchService.getOne(new LambdaQueryWrapper<TeaFoodMatch>()
                .eq(TeaFoodMatch::getMatchKey, key)
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
}

