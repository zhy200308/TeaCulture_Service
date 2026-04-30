package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.admin.AdminUserUpdateRequest;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final SysUserService sysUserService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminUserController(SysUserService sysUserService) {
        this.sysUserService = sysUserService;
    }

    @GetMapping
    public ApiResponse<PageResponse<Map<String, Object>>> list(@RequestParam(required = false) String keyword,
                                                               @RequestParam(required = false) String role,
                                                               @RequestParam(required = false) Integer status,
                                                               @RequestParam(defaultValue = "1") Long pageNum,
                                                               @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<SysUser> page = sysUserService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getDeleted, false)
                        .eq(role != null && !role.isBlank(), SysUser::getRole, role)
                        .eq(status != null, SysUser::getStatus, status == 1)
                        .and(keyword != null && !keyword.isBlank(), w -> w.like(SysUser::getUsername, keyword).or().like(SysUser::getNickname, keyword))
                        .orderByDesc(SysUser::getCreateTime));

        List<Map<String, Object>> records = page.getRecords().stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "username", u.getUsername(),
                "nickname", u.getNickname(),
                "role", u.getRole(),
                "status", Boolean.TRUE.equals(u.getStatus()) ? 1 : 0,
                "avatar", u.getAvatar(),
                "tag", u.getTag(),
                "description", u.getDescription()
        )).toList();

        PageResponse<Map<String, Object>> resp = new PageResponse<Map<String, Object>>()
                .setRecords(records)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody AdminUserUpdateRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        SysUser exists = sysUserService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("用户不存在");
        }
        SysUser upd = new SysUser().setId(id);
        if (req.getRole() != null) upd.setRole(req.getRole());
        if (req.getStatus() != null) upd.setStatus(req.getStatus() == 1);
        sysUserService.updateById(upd);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        SysUser exists = sysUserService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("用户不存在");
        }
        sysUserService.updateById(new SysUser().setId(id).setPassword(passwordEncoder.encode("123456")));
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        sysUserService.removeById(id);
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
        sysUserService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
