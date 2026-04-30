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
 * 茶类设备参数表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("tea_type_param")
@Schema(name = "TeaTypeParam", description = "茶类设备参数表")
public class TeaTypeParam extends Model<TeaTypeParam> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "茶类编码（green/black/oolong/white）")
    @TableField("tea_type_code")
    private String teaTypeCode;


    @Schema(description = "茶类名称（绿茶/红茶/乌龙茶/白茶）")
    @TableField("tea_type_name")
    private String teaTypeName;


    @Schema(description = "水温")
    @TableField("water_temp")
    private String waterTemp;


    @Schema(description = "投茶量")
    @TableField("amount")
    private String amount;


    @Schema(description = "冲泡时长")
    @TableField("brew_time")
    private String brewTime;


    @Schema(description = "备注")
    @TableField("note")
    private String note;


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
