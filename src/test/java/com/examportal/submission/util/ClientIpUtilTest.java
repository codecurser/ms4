package com.examportal.submission.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpUtilTest {

    @Test
    @DisplayName("Should extract first IP from X-Forwarded-For header chain")
    void testXForwardedForFirstIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18, 150.172.238.178");
        request.addHeader("CF-Connecting-IP", "198.51.100.1");
        request.setRemoteAddr("10.0.0.1");

        String clientIp = ClientIpUtil.getClientIp(request);
        assertEquals("203.0.113.195", clientIp);
    }

    @Test
    @DisplayName("Should extract CF-Connecting-IP when X-Forwarded-For is missing")
    void testCfConnectingIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("CF-Connecting-IP", "198.51.100.50");
        request.addHeader("X-Real-IP", "192.168.1.1");
        request.setRemoteAddr("10.0.0.1");

        String clientIp = ClientIpUtil.getClientIp(request);
        assertEquals("198.51.100.50", clientIp);
    }

    @Test
    @DisplayName("Should extract X-Real-IP when CF and X-Forwarded-For are missing")
    void testXRealIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Real-IP", "172.16.0.42");
        request.setRemoteAddr("10.0.0.1");

        String clientIp = ClientIpUtil.getClientIp(request);
        assertEquals("172.16.0.42", clientIp);
    }

    @Test
    @DisplayName("Should fall back to RemoteAddr when proxy headers are absent")
    void testRemoteAddrFallback() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.100");

        String clientIp = ClientIpUtil.getClientIp(request);
        assertEquals("192.168.1.100", clientIp);
    }

    @Test
    @DisplayName("Should normalize IPv6 loopback to 127.0.0.1")
    void testIpv6LoopbackNormalization() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("0:0:0:0:0:0:0:1");

        String clientIp = ClientIpUtil.getClientIp(request);
        assertEquals("127.0.0.1", clientIp);

        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRemoteAddr("::1");
        assertEquals("127.0.0.1", ClientIpUtil.getClientIp(request2));
    }
}

