package com.examportal.submission.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class ClientIpUtil {

    private ClientIpUtil() {
    }

    /**
     * Extracts candidate's real Client IP address in strict priority order:
     * 1. X-Forwarded-For (first IP in chain)
     * 2. CF-Connecting-IP
     * 3. X-Real-IP
     * 4. Fallback to request.getRemoteAddr()
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        // 1. X-Forwarded-For: "client, proxy1, proxy2"
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (isValidIp(xForwardedFor)) {
            String firstIp = xForwardedFor.split(",")[0].trim();
            if (isValidIp(firstIp)) {
                log.debug("Extracted Client IP from X-Forwarded-For: {}", firstIp);
                return sanitizeIp(firstIp);
            }
        }

        // 2. CF-Connecting-IP (Cloudflare)
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (isValidIp(cfConnectingIp)) {
            log.debug("Extracted Client IP from CF-Connecting-IP: {}", cfConnectingIp);
            return sanitizeIp(cfConnectingIp.trim());
        }

        // 3. X-Real-IP (Nginx / Load Balancer)
        String xRealIp = request.getHeader("X-Real-IP");
        if (isValidIp(xRealIp)) {
            log.debug("Extracted Client IP from X-Real-IP: {}", xRealIp);
            return sanitizeIp(xRealIp.trim());
        }

        // 4. Remote Address fallback
        String remoteAddr = request.getRemoteAddr();
        log.debug("Extracted Client IP from RemoteAddr fallback: {}", remoteAddr);
        return sanitizeIp(remoteAddr);
    }

    public static String getUserAgent(HttpServletRequest request) {
        if (request == null) {
            return "Unknown";
        }
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua.trim() : "Unknown";
    }

    private static boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip.trim());
    }

    private static String sanitizeIp(String ip) {
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip.trim())) {
            return "127.0.0.1";
        }
        String clean = ip.trim();
        // Normalize IPv6 localhost
        if ("0:0:0:0:0:0:0:1".equals(clean) || "::1".equals(clean)) {
            return "127.0.0.1";
        }
        // If IP contains port (e.g., 192.168.1.1:8080 and not IPv6), strip port
        if (clean.contains(":") && !clean.contains("::") && clean.chars().filter(ch -> ch == ':').count() == 1) {
            clean = clean.split(":")[0];
        }
        return clean;
    }
}

