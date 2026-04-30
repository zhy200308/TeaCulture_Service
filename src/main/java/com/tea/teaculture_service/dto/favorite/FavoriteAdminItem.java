package com.tea.teaculture_service.dto.favorite;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Getter
@Setter
@Accessors(chain = true)
public class FavoriteAdminItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long userId;

    private String username;
    private String targetType;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long targetId;

    private String targetKey;
    private String targetTitle;
    private LocalDateTime createTime;
}

