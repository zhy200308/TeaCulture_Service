package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaBrewingParamUpsertRequest {

    private String scenarioKey;
    private String teaType;
    private String amount;
    private String waterTemp;
    private String brewTime;
    private String note;
}

