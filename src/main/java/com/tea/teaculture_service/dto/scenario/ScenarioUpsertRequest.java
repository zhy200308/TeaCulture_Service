package com.tea.teaculture_service.dto.scenario;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class ScenarioUpsertRequest {

    private String scenarioType;
    private String title;
    private String summary;
    private String detailContent;
    private String coverImage;
    private Integer status;
}
