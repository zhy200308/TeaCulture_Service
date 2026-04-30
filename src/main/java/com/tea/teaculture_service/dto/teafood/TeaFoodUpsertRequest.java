package com.tea.teaculture_service.dto.teafood;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaFoodUpsertRequest {

    private String teaTypeCode;
    private String teaName;
    private String foodName;
    private String title;
    private String summary;
    private String coverImage;
    private String detailContent;
    private Integer status;
    private Integer sortOrder;
}
