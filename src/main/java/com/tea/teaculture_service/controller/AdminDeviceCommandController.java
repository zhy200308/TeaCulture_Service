package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.device.DeviceCommandAdminItem;
import com.tea.teaculture_service.entity.DeviceCommandLog;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.service.DeviceCommandLogService;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
@RequestMapping("/admin/device-commands")
public class AdminDeviceCommandController {

    private final DeviceCommandLogService deviceCommandLogService;
    private final SysUserService sysUserService;

    public AdminDeviceCommandController(DeviceCommandLogService deviceCommandLogService, SysUserService sysUserService) {
        this.deviceCommandLogService = deviceCommandLogService;
        this.sysUserService = sysUserService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DeviceCommandAdminItem>> list(@RequestParam(required = false) Long userId,
                                                                  @RequestParam(required = false) String username,
                                                                  @RequestParam(required = false) String deviceId,
                                                                  @RequestParam(required = false) String commandType,
                                                                  @RequestParam(defaultValue = "1") Long pageNum,
                                                                  @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }

        List<Long> userIds = null;
        if (username != null && !username.isBlank()) {
            userIds = sysUserService.list(new LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getDeleted, false)
                            .and(w -> w.like(SysUser::getUsername, username).or().like(SysUser::getNickname, username)))
                    .stream()
                    .map(SysUser::getId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            if (userIds.isEmpty()) {
                return ApiResponse.ok(new PageResponse<DeviceCommandAdminItem>().setRecords(List.of()).setTotal(0L).setPageNum(pageNum).setPageSize(pageSize));
            }
        }

        Page<DeviceCommandLog> page = deviceCommandLogService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<DeviceCommandLog>()
                        .eq(userId != null, DeviceCommandLog::getUserId, userId)
                        .in(userIds != null, DeviceCommandLog::getUserId, userIds)
                        .eq(deviceId != null && !deviceId.isBlank(), DeviceCommandLog::getDeviceId, deviceId)
                        .eq(commandType != null && !commandType.isBlank(), DeviceCommandLog::getCommandType, commandType)
                        .orderByDesc(DeviceCommandLog::getCreateTime));

        List<Long> pageUserIds = page.getRecords().stream().map(DeviceCommandLog::getUserId).filter(Objects::nonNull).distinct().toList();
        Map<Long, SysUser> userMap = sysUserService.listByIds(pageUserIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity(), (a, b) -> a));

        List<DeviceCommandAdminItem> items = page.getRecords().stream().map(log -> new DeviceCommandAdminItem()
                .setId(log.getId())
                .setUserId(log.getUserId())
                .setUsername(userMap.get(log.getUserId()) == null ? null : userMap.get(log.getUserId()).getUsername())
                .setDeviceId(log.getDeviceId())
                .setCommandType(log.getCommandType())
                .setTopic(log.getTopic())
                .setTeaType(log.getTeaType())
                .setAmount(log.getAmount())
                .setWaterTemp(log.getWaterTemp())
                .setBrewTime(log.getBrewTime())
                .setResult(log.getResult())
                .setErrorMsg(log.getErrorMsg())
                .setCreateTime(log.getCreateTime())).toList();

        PageResponse<DeviceCommandAdminItem> resp = new PageResponse<DeviceCommandAdminItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        deviceCommandLogService.removeById(id);
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
        deviceCommandLogService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}

