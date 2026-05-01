package com.tea.teaculture_service.dto.favorite;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FavoriteAdminDetailResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long userId;

    private String username;
    private String targetType;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long targetId;

    private String targetTitle;
    private String targetSummary;
    private String targetCoverImage;
    private String targetDetailContent;
    private String targetAudioUrl;
    private LocalDateTime createTime;
}

