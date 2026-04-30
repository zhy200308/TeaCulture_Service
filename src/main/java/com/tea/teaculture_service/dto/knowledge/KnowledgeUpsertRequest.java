package com.tea.teaculture_service.dto.knowledge;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class KnowledgeUpsertRequest {

    private String knowledgeKey;
    private String categoryCode;
    private String title;
    private String summary;
    private String detailContent;
    private String coverImage;
    private Integer status;
}

