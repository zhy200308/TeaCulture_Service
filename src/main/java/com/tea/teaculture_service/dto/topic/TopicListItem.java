package com.tea.teaculture_service.dto.topic;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TopicListItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    private String topicCode;
    private String topicName;
    private String title;
    private String summary;
    private String coverImage;
    private String audioUrl;
    private Integer viewCount;
    private Integer status;
}
