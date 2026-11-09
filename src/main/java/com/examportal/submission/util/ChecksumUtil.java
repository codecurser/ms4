package com.examportal.submission.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class ChecksumUtil {

    private ChecksumUtil() {
    }

    public static String generateReceiptChecksum(
            String receiptId,
            String studentEmail,
            String clientIp,
            String examId,
            Double totalScore,
            String submittedAt
    ) {
        String payload = String.format("%s|%s|%s|%s|%.2f|%s",
                receiptId != null ? receiptId : "",
                studentEmail != null ? studentEmail : "",
                clientIp != null ? clientIp : "",
                examId != null ? examId : "",
                totalScore != null ? totalScore : 0.0,
                submittedAt != null ? submittedAt : ""
        );

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 32).toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(payload.hashCode()).toUpperCase();
        }
    }
}

