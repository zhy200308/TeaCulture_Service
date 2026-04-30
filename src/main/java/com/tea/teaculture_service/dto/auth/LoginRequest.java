package com.tea.teaculture_service.dto.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class LoginRequest {

    private String username;
    private String password;
    private String role;
}

