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
 * 基础茶识表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("tea_knowledge")
@Schema(name = "TeaKnowledge", description = "基础茶识表")
public class TeaKnowledge extends Model<TeaKnowledge> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "逻辑关联 tea_category.category_code（无外键）")
    @TableField("category_code")
    private String categoryCode;


    @Schema(description = "标题")
    @TableField("title")
    private String title;


    @Schema(description = "摘要描述（卡片desc）")
    @TableField("summary")
    private String summary;


    @Schema(description = "详情内容")
    @TableField("detail_content")
    private String detailContent;


    @Schema(description = "封面图URL")
    @TableField("cover_image")
    private String coverImage;


    @Schema(description = "浏览量")
    @TableField("view_count")
    private Integer viewCount;


    @Schema(description = "状态：1已发布 0草稿")
    @TableField("status")
    private Boolean status;


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
