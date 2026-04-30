package com.tea.teaculture_service.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tea.teaculture_service.dto.ApiResponse;
import com.tea.teaculture_service.dto.PageResponse;
import com.tea.teaculture_service.dto.common.IdListRequest;
import com.tea.teaculture_service.dto.feedback.FeedbackAdminItem;
import com.tea.teaculture_service.dto.feedback.FeedbackReplyRequest;
import com.tea.teaculture_service.dto.feedback.FeedbackSubmitRequest;
import com.tea.teaculture_service.entity.SysUser;
import com.tea.teaculture_service.entity.UserFeedback;
import com.tea.teaculture_service.service.SysUserService;
import com.tea.teaculture_service.service.UserFeedbackService;
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

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final UserFeedbackService userFeedbackService;
    private final SysUserService sysUserService;

    public FeedbackController(UserFeedbackService userFeedbackService, SysUserService sysUserService) {
        this.userFeedbackService = userFeedbackService;
        this.sysUserService = sysUserService;
    }

    @PostMapping
    public ApiResponse<Void> submit(@RequestBody FeedbackSubmitRequest req) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        if (req == null || req.getContent() == null || req.getContent().isBlank()) {
            return ApiResponse.badRequest("反馈内容不能为空");
        }
        UserFeedback fb = new UserFeedback()
                .setUserId(userId)
                .setFeedbackType(req.getFeedbackType())
                .setContent(req.getContent())
                .setContact(req.getContact())
                .setImages(req.getImages())
                .setStatus(0)
                .setDeleted(false);
        userFeedbackService.save(fb);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<UserFeedback>> listMine() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return ApiResponse.unauthorized("未登录");
        }
        List<UserFeedback> list = userFeedbackService.list(new LambdaQueryWrapper<UserFeedback>()
                .eq(UserFeedback::getDeleted, false)
                .eq(UserFeedback::getUserId, userId)
                .orderByDesc(UserFeedback::getCreateTime));
        return ApiResponse.ok(list);
    }

    @GetMapping("/admin/list")
    public ApiResponse<PageResponse<FeedbackAdminItem>> adminList(@RequestParam(required = false) Integer status,
                                                                  @RequestParam(required = false) String keyword,
                                                                  @RequestParam(defaultValue = "1") Long pageNum,
                                                                  @RequestParam(defaultValue = "20") Long pageSize) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        Page<UserFeedback> page = userFeedbackService.page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<UserFeedback>()
                        .eq(UserFeedback::getDeleted, false)
                        .eq(status != null, UserFeedback::getStatus, status)
                        .and(keyword != null && !keyword.isBlank(), w -> w.like(UserFeedback::getContent, keyword).or().like(UserFeedback::getContact, keyword))
                        .orderByDesc(UserFeedback::getCreateTime));

        List<Long> userIds = page.getRecords().stream().map(UserFeedback::getUserId).filter(Objects::nonNull).distinct().toList();
        Map<Long, SysUser> userMap = sysUserService.listByIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity(), (a, b) -> a));

        List<FeedbackAdminItem> items = page.getRecords().stream().map(f -> new FeedbackAdminItem()
                .setId(f.getId())
                .setUserId(f.getUserId())
                .setUsername(userMap.get(f.getUserId()) == null ? null : userMap.get(f.getUserId()).getUsername())
                .setFeedbackType(f.getFeedbackType())
                .setContent(f.getContent())
                .setStatus(f.getStatus())
                .setReply(f.getReply())
                .setContact(f.getContact())
                .setImages(f.getImages())).toList();

        PageResponse<FeedbackAdminItem> resp = new PageResponse<FeedbackAdminItem>()
                .setRecords(items)
                .setTotal(page.getTotal())
                .setPageNum(pageNum)
                .setPageSize(pageSize);
        return ApiResponse.ok(resp);
    }

    @PutMapping("/{id}/reply")
    public ApiResponse<Void> reply(@PathVariable("id") Long id, @RequestBody FeedbackReplyRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        UserFeedback exists = userFeedbackService.getById(id);
        if (exists == null || Boolean.TRUE.equals(exists.getDeleted())) {
            return ApiResponse.fail("反馈不存在");
        }
        UserFeedback upd = new UserFeedback().setId(id);
        if (req.getReply() != null) upd.setReply(req.getReply());
        if (req.getStatus() != null) upd.setStatus(req.getStatus());
        userFeedbackService.updateById(upd);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        userFeedbackService.removeById(id);
        return ApiResponse.ok();
    }

    @PostMapping("/admin/batch-delete")
    public ApiResponse<Void> adminBatchDelete(@RequestBody IdListRequest req) {
        if (!UserContext.isAdmin()) {
            return ApiResponse.forbidden("无权限");
        }
        if (req == null || req.getIds() == null || req.getIds().isEmpty()) {
            return ApiResponse.badRequest("ids不能为空");
        }
        userFeedbackService.removeByIds(req.getIds());
        return ApiResponse.ok();
    }
}
