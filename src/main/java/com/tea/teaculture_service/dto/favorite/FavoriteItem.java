package com.tea.teaculture_service.dto.favorite;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FavoriteItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    private String targetType;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long targetId;
    private String targetKey;
    private String targetTitle;
}

