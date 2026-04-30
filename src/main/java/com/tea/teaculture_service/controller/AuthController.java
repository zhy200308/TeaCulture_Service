package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.auth.LoginRequest;
import com.tea.teaculture_service.dto.auth.LoginResponse;
import com.tea.teaculture_service.dto.auth.RegisterRequest;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.utils.JwtUtils;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final SysUserService sysUserService;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(SysUserService sysUserService, JwtUtils jwtUtils) {
        this.sysUserService = sysUserService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return ApiResponse.badRequest("用户名或密码不能为空");
        }

        SysUser user = sysUserService.getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, req.getUsername())
                .eq(SysUser::getDeleted, false)
                .last("limit 1"));
        if (user == null) {
            return ApiResponse.fail("用户名或密码错误");
        }
        if (user.getStatus() != null && !user.getStatus()) {
            return ApiResponse.forbidden("账号已被禁用");
        }
        if (req.getRole() != null && !req.getRole().isBlank() && user.getRole() != null && !req.getRole().equals(user.getRole())) {
            return ApiResponse.forbidden("角色不匹配");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ApiResponse.fail("用户名或密码错误");
        }

        sysUserService.updateById(new SysUser().setId(user.getId()).setLastLoginTime(LocalDateTime.now()));

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());
        LoginResponse resp = new LoginResponse()
                .setToken(token)
                .setUserInfo(new LoginResponse.UserInfo()
                        .setId(user.getId())
                        .setUsername(user.getUsername())
                        .setNickname(user.getNickname())
                        .setRole(user.getRole())
                        .setAvatar(user.getAvatar())
                        .setTag(user.getTag())
                        .setDescription(user.getDescription()));
        return ApiResponse.ok(resp);
    }

    @PostMapping("/register")
    public ApiResponse<Void> register(@RequestBody RegisterRequest req) {
        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            return ApiResponse.badRequest("用户名或密码不能为空");
        }
        if (req.getPassword().length() < 6) {
            return ApiResponse.badRequest("密码至少6位");
        }
        boolean exists = sysUserService.count(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, req.getUsername())
                .eq(SysUser::getDeleted, false)) > 0;
        if (exists) {
            return ApiResponse.fail("用户名已存在");
        }

        String role = (req.getRole() == null || req.getRole().isBlank()) ? "user" : req.getRole();
        SysUser user = new SysUser()
                .setUsername(req.getUsername())
                .setNickname(req.getUsername())
                .setPassword(passwordEncoder.encode(req.getPassword()))
                .setRole(role)
                .setStatus(true)
                .setDeleted(false);
        sysUserService.save(user);
        return ApiResponse.ok();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok();
    }

    @GetMapping("/me")
    public ApiResponse<LoginResponse.UserInfo> me() {
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
}

