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
 * 进阶专题表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("tea_topic")
@Schema(name = "TeaTopic", description = "进阶专题表")
public class TeaTopic extends Model<TeaTopic> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "业务标识（process-puer等）")
    @TableField("topic_key")
    private String topicKey;


    @Schema(description = "逻辑关联 tea_topic_category.topic_code（无外键）")
    @TableField("topic_code")
    private String topicCode;


    @Schema(description = "标题")
    @TableField("title")
    private String title;


    @Schema(description = "简述")
    @TableField("summary")
    private String summary;


    @Schema(description = "封面图URL")
    @TableField("cover_image")
    private String coverImage;


    @Schema(description = "详情HTML")
    @TableField("detail_content")
    private String detailContent;


    @Schema(description = "音频URL（养生类专题有音频）")
    @TableField("audio_url")
    private String audioUrl;


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
