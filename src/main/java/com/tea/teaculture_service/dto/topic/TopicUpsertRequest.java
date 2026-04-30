package com.tea.teaculture_service.dto.topic;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TopicUpsertRequest {

    private String topicCode;
    private String title;
    private String summary;
    private String detailContent;
    private String coverImage;
    private String audioUrl;
    private Integer status;
}
