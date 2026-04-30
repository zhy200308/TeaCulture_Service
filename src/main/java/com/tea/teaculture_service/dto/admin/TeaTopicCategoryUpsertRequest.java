package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class TeaTopicCategoryUpsertRequest {

    private String topicCode;
    private String topicName;
    private Integer sortOrder;
}

