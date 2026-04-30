package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaTypeParamUpsertRequest {

    private String teaTypeCode;
    private String teaTypeName;
    private String waterTemp;
    private String amount;
    private String brewTime;
    private String note;
}

