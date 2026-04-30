package com.tea.teaculture_service.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import java.io.Serializable;
import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * 意见反馈表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("user_feedback")
@Schema(name = "UserFeedback", description = "意见反馈表")
public class UserFeedback extends Model<UserFeedback> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "逻辑关联 sys_user.id（无外键）")
    @TableField("user_id")
    private Long userId;


    @Schema(description = "反馈类型")
    @TableField("feedback_type")
    private String feedbackType;


    @Schema(description = "反馈内容")
    @TableField("content")
    private String content;


    @Schema(description = "联系方式")
    @TableField("contact")
    private String contact;


    @Schema(description = "截图URLs（逗号分隔）")
    @TableField("images")
    private String images;


    @Schema(description = "处理状态：0未处理 1处理中 2已处理")
    @TableField("status")
    private Integer status;


    @Schema(description = "管理员回复")
    @TableField("reply")
    private String reply;


    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;


    @Schema(description = "更新时间")
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;


    @Schema(description = "逻辑删除")
    @TableField("deleted")
    private Boolean deleted;

    @Override
    public Serializable pkVal() {
        return this.id;
    }
}
