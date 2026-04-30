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
 * 设备指令日志表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("device_command_log")
@Schema(name = "DeviceCommandLog", description = "设备指令日志表")
public class DeviceCommandLog extends Model<DeviceCommandLog> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "触发用户ID（逻辑关联 sys_user.id，无外键）")
    @TableField("user_id")
    private Long userId;


    @Schema(description = "设备ID（MQTT clientId）")
    @TableField("device_id")
    private String deviceId;


    @Schema(description = "指令类型")
    @TableField("command_type")
    private String commandType;


    @Schema(description = "MQTT主题")
    @TableField("topic")
    private String topic;


    @Schema(description = "茶类")
    @TableField("tea_type")
    private String teaType;


    @Schema(description = "投茶量")
    @TableField("amount")
    private String amount;


    @Schema(description = "水温")
    @TableField("water_temp")
    private String waterTemp;


    @Schema(description = "冲泡时长")
    @TableField("brew_time")
    private String brewTime;


    @Schema(description = "备注")
    @TableField("note")
    private String note;


    @Schema(description = "完整 JSON 消息体")
    @TableField("payload")
    private String payload;


    @Schema(description = "结果：0发送中 1成功 2失败")
    @TableField("result")
    private Integer result;


    @Schema(description = "错误信息")
    @TableField("error_msg")
    private String errorMsg;


    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @Override
    public Serializable pkVal() {
        return this.id;
    }
}
