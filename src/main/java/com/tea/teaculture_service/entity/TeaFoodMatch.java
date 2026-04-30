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
 * 茶食搭配表
 * </p>
 * tag:KMCC
 * @author YourName
 * @since 2026-04-30
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("tea_food_match")
@Schema(name = "TeaFoodMatch", description = "茶食搭配表")
public class TeaFoodMatch extends Model<TeaFoodMatch> {

    private static final long serialVersionUID = 1L;


    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;


    @Schema(description = "业务标识（green-bean等）")
    @TableField("match_key")
    private String matchKey;


    @Schema(description = "逻辑关联 tea_type_param.tea_type_code（无外键）")
    @TableField("tea_type_code")
    private String teaTypeCode;


    @Schema(description = "茶名")
    @TableField("tea_name")
    private String teaName;


    @Schema(description = "食物名")
    @TableField("food_name")
    private String foodName;


    @Schema(description = "完整标题（绿茶 + 绿豆糕）")
    @TableField("title")
    private String title;


    @Schema(description = "卡片简述")
    @TableField("summary")
    private String summary;


    @Schema(description = "封面图")
    @TableField("cover_image")
    private String coverImage;


    @Schema(description = "详情HTML（含搭配理由/食用建议/小贴士）")
    @TableField("detail_content")
    private String detailContent;


    @Schema(description = "状态")
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
