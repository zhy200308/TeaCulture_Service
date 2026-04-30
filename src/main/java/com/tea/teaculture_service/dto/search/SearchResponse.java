package com.tea.teaculture_service.dto.search;

import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaKnowledge;
import com.tea.teaculture_service.entity.TeaScenario;
import com.tea.teaculture_service.entity.TeaTopic;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Getter
@Setter
@Accessors(chain = true)
public class SearchResponse {

    private List<TeaKnowledge> knowledge;
    private List<TeaTopic> topics;
    private List<TeaScenario> scenarios;
    private List<TeaFoodMatch> foodMatches;
}

