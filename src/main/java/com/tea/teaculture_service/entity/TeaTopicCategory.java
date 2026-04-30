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
 * 进阶专题分类表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("tea_topic_category")
@Schema(name = "TeaTopicCategory", description = "进阶专题分类表")
public class TeaTopicCategory extends Model<TeaTopicCategory> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "编码（process/region/taste/health/culture）")
    @TableField("topic_code")
    private String topicCode;


    @Schema(description = "名称（制作工艺/核心产区等）")
    @TableField("topic_name")
    private String topicName;


    @Schema(description = "排序")
    @TableField("sort_order")
    private Integer sortOrder;


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
