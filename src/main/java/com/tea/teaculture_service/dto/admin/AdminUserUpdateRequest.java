package com.tea.teaculture_service.dto.admin;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class AdminUserUpdateRequest {

    private String role;
    private Integer status;
}

