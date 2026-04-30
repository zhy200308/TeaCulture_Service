package com.tea.teaculture_service.dto.user;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class UpdateProfileRequest {

    private String nickname;
    private String avatar;
    private String description;
}

