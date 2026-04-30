package com.tea.teaculture_service.dto.teafood;

import com.tea.teaculture_service.entity.TeaFoodMatch;
import com.tea.teaculture_service.entity.TeaTypeParam;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaFoodDetailResponse {

    private TeaFoodMatch match;
    private TeaTypeParam teaTypeParam;
}

