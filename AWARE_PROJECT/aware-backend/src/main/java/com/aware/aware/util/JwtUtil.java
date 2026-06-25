package com.aware.aware.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "aware-project-super-secret-key-1234567890";
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);

    public static String generateToken(String username, String role) {
        return JWT.create()
                .withSubject(username)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .sign(ALGORITHM);
    }

    public static String verifyTokenAndGetUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7).trim();
        DecodedJWT jwt = JWT.require(ALGORITHM).build().verify(token);
        return jwt.getSubject();
    }

    public static String verifyAdminAndGetUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7).trim();
        DecodedJWT jwt = JWT.require(ALGORITHM).build().verify(token);
        String role = jwt.getClaim("role").asString();
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Forbidden: Admin access required");
        }
        return jwt.getSubject();
    }
}
