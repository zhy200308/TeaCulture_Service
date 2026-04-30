package com.tea.teaculture_service.dto.feedback;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FeedbackReplyRequest {

    private String reply;
    private Integer status;
}

