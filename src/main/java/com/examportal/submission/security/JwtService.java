package com.examportal.submission.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    private final String secret;

    public JwtService(@Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret) {
        this.secret = secret;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);

        // Check creatorId claim
        Object creatorIdClaim = claims.get("creatorId");
        if (creatorIdClaim != null) {
            try {
                return UUID.fromString(creatorIdClaim.toString());
            } catch (IllegalArgumentException ignored) {}
        }

        // Check userId / id claim
        Object userIdClaim = claims.get("userId");
        if (userIdClaim == null) {
            userIdClaim = claims.get("id");
        }
        if (userIdClaim != null) {
            try {
                return UUID.fromString(userIdClaim.toString());
            } catch (IllegalArgumentException ignored) {}
        }

        // Check subject claim
        String subject = claims.getSubject();
        if (subject != null && !subject.isBlank()) {
            try {
                return UUID.fromString(subject);
            } catch (IllegalArgumentException e) {
                return UUID.nameUUIDFromBytes(subject.getBytes(StandardCharsets.UTF_8));
            }
        }

        return UUID.randomUUID();
    }

    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        String email = claims.get("email", String.class);
        if (email == null) {
            String subject = claims.getSubject();
            if (subject != null && subject.contains("@")) {
                email = subject;
            }
        }
        return email != null ? email : "creator@examportal.com";
    }

    public String extractRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object roleObj = claims.get("role");
            if (roleObj == null) {
                roleObj = claims.get("roles");
            }
            if (roleObj == null) {
                roleObj = claims.get("authorities");
            }
            if (roleObj instanceof java.util.List<?> list && !list.isEmpty()) {
                return String.valueOf(list.get(0));
            }
            if (roleObj != null) {
                return roleObj.toString();
            }
        } catch (Exception ignored) {}
        return "ROLE_CREATOR";
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                log.warn("JWT token has expired");
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}

