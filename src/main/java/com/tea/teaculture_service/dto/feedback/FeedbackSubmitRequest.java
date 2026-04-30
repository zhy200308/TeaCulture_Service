package com.tea.teaculture_service.dto.feedback;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FeedbackSubmitRequest {

    private String feedbackType;
    private String content;
    private String contact;
    private String images;
}

