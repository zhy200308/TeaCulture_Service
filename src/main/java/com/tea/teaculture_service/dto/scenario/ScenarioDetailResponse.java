package com.tea.teaculture_service.dto.scenario;

import com.tea.teaculture_service.entity.TeaBrewingParam;
import com.tea.teaculture_service.entity.TeaScenario;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class ScenarioDetailResponse {

    private TeaScenario scenario;
    private TeaBrewingParam brewingParam;
}

