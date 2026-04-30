package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaCategoryUpsertRequest {

    private String categoryCode;
    private String categoryName;
    private String icon;
    private Integer sortOrder;
}

