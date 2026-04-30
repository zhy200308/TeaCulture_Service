package com.tea.teaculture_service.dto.user;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class ChangePasswordRequest {

    private String oldPassword;
    private String newPassword;
}

