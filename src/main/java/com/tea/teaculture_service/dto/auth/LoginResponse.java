package com.tea.teaculture_service.dto.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class LoginResponse {

    private String token;
    private UserInfo userInfo;

    @Getter
    @Setter
    @Accessors(chain = true)
    public static class UserInfo {
        private Long id;
        private String username;
        private String nickname;
        private String role;
        private String avatar;
        private String tag;
        private String description;
    }
}

