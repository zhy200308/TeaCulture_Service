package com.tea.teaculture_service.config;

import com.tea.teaculture_service.utils.JwtUtils;
import com.tea.teaculture_service.utils.UserContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;

    public AuthInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String auth = request.getHeader("Authorization");
        if (auth == null || auth.isBlank()) {
            return true;
        }
        String prefix = "Bearer ";
        if (!auth.startsWith(prefix)) {
            return true;
        }
        String token = auth.substring(prefix.length()).trim();
        if (token.isEmpty() || !jwtUtils.isValid(token)) {
            return true;
        }
        UserContext.set(jwtUtils.getUserId(token), jwtUtils.getUsername(token), jwtUtils.getRole(token));
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}

