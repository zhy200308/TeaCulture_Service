package com.tea.teaculture_service.dto.feedback;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class FeedbackAdminItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long userId;
    private String username;
    private String feedbackType;
    private String content;
    private Integer status;
    private String reply;
    private String contact;
    private String images;
}

