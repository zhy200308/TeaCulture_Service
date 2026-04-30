package com.tea.teaculture_service.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
@TableName("user_learning_record")
@Schema(name = "UserLearningRecord", description = "用户学习记录表")
public class UserLearningRecord extends Model<UserLearningRecord> {

    private static final long serialVersionUID = 1L;

    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @Schema(description = "逻辑关联 sys_user.id（无外键）")
    @TableField("user_id")
    private Long userId;

    @Schema(description = "学习类型：knowledge/topic/scenario/food")
    @TableField("target_type")
    private String targetType;

    @Schema(description = "目标ID（对应业务表主键）")
    @TableField("target_id")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long targetId;

    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @Schema(description = "逻辑删除")
    @TableField("deleted")
    private Boolean deleted;
}

