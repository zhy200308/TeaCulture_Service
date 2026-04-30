package com.tea.teaculture_service.dto.favorite;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FavoriteAddRequest {

    private String targetType;
    private Long targetId;
    private String targetKey;
}

