package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.device.DeviceCommandRequest;
import com.tea.teaculture_service.entity.DeviceCommandLog;
import com.tea.teaculture_service.service.DeviceCommandLogService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/device")
public class DeviceController {

    private final DeviceCommandLogService deviceCommandLogService;

    public DeviceController(DeviceCommandLogService deviceCommandLogService) {
        this.deviceCommandLogService = deviceCommandLogService;
    }

    @PostMapping("/command")
    public ApiResponse<Void> report(@RequestBody DeviceCommandRequest req) {
        if (req == null || req.getDeviceId() == null || req.getDeviceId().isBlank()) {
            return ApiResponse.badRequest("deviceId不能为空");
        }
        DeviceCommandLog log = new DeviceCommandLog()
                .setUserId(UserContext.getUserId())
                .setDeviceId(req.getDeviceId())
                .setCommandType(req.getCommandType())
                .setTopic(req.getTopic())
                .setTeaType(req.getTeaType())
                .setAmount(req.getAmount())
                .setWaterTemp(req.getWaterTemp())
                .setBrewTime(req.getBrewTime())
                .setNote(req.getNote())
                .setPayload(req.getPayload())
                .setResult(req.getResult() == null ? 0 : req.getResult())
                .setErrorMsg(req.getErrorMsg());
        deviceCommandLogService.save(log);
        return ApiResponse.ok();
    }

    @GetMapping("/history")
    public ApiResponse<PageResponse<DeviceCommandLog>> history(@RequestParam(defaultValue = "1") Long pageNum,
                                                              @RequestParam(defaultValue = "20") Long pageSize) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        Page<DeviceCommandLog> page = deviceCommandLogService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<DeviceCommandLog>()
                        .eq(DeviceCommandLog::getUserId, userId)
                        .orderByDesc(DeviceCommandLog::getCreateTime));
        PageResponse<DeviceCommandLog> resp = new PageResponse<DeviceCommandLog>()
                .setRecords(page.getRecords())
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }
}

