package com.examportal.submission.util;

import com.examportal.submission.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static Optional<AuthenticatedUser> getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static Optional<UUID> getAuthenticatedUserId() {
        return getAuthenticatedUser().map(AuthenticatedUser::getId);
    }
}

