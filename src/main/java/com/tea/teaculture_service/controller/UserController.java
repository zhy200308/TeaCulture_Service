package com.tea.teaculture_service.controller;

import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.auth.LoginResponse;
import com.tea.teaculture_service.dto.user.ChangePasswordRequest;
import com.tea.teaculture_service.dto.user.UpdateProfileRequest;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    private final SysUserService sysUserService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserController(SysUserService sysUserService) {
        this.sysUserService = sysUserService;
    }

    @GetMapping("/profile")
    public ApiResponse<LoginResponse.UserInfo> profile() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        SysUser user = sysUserService.getById(userId);
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return ApiResponse.unauthorized("未登录");
        }
        LoginResponse.UserInfo info = new LoginResponse.UserInfo()
                .setId(user.getId())
                .setUsername(user.getUsername())
                .setNickname(user.getNickname())
                .setRole(user.getRole())
                .setAvatar(user.getAvatar())
                .setTag(user.getTag())
                .setDescription(user.getDescription());
        return ApiResponse.ok(info);
    }

    @PutMapping("/profile")
    public ApiResponse<Void> updateProfile(@RequestBody UpdateProfileRequest req) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        SysUser user = sysUserService.getById(userId);
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return ApiResponse.unauthorized("未登录");
        }
        SysUser upd = new SysUser().setId(userId);
        if (req.getNickname() != null) upd.setNickname(req.getNickname());
        if (req.getAvatar() != null) upd.setAvatar(req.getAvatar());
        if (req.getDescription() != null) upd.setDescription(req.getDescription());
        sysUserService.updateById(upd);
        return ApiResponse.ok();
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@RequestBody ChangePasswordRequest req) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        if (req == null || req.getOldPassword() == null || req.getNewPassword() == null) {
            return ApiResponse.badRequest("参数错误");
        }
        if (req.getNewPassword().length() < 6) {
            return ApiResponse.badRequest("新密码至少6位");
        }
        SysUser user = sysUserService.getById(userId);
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return ApiResponse.unauthorized("未登录");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            return ApiResponse.fail("原密码错误");
        }
        sysUserService.updateById(new SysUser().setId(userId).setPassword(passwordEncoder.encode(req.getNewPassword())));
        return ApiResponse.ok();
    }
}

