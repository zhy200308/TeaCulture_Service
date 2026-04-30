package com.tea.teaculture_service.dto.knowledge;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class KnowledgeListItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    private String knowledgeKey;
    private String categoryCode;
    private String categoryName;
    private String title;
    private String summary;
    private String coverImage;
    private Integer viewCount;
    private Integer status;
}

