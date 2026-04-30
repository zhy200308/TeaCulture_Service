package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaWareUpsertRequest {

    private String wareKey;
    private String name;
    private String image;
    private String detailContent;
    private String suitableTea;
    private Integer sortOrder;
}

