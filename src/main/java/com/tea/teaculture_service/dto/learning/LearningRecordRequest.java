package com.tea.teaculture_service.dto.learning;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class LearningRecordRequest {
    private String targetType;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long targetId;
}

