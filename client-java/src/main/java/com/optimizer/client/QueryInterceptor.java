package com.optimizer.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class QueryInterceptor {

    private final String backendUrl;
    private final String apiKey;
    private final long slowQueryThresholdMs;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ExecutorService backgroundWorkerPool;

    public QueryInterceptor(String apiKey) {
        this.backendUrl = "http://localhost:3001/api/telemetry";
        this.apiKey = apiKey;
        this.slowQueryThresholdMs = 200;
        this.objectMapper = new ObjectMapper();
        this.backgroundWorkerPool = Executors.newSingleThreadExecutor();

        // FIX: Configure HTTP client with a explicit timeout to prevent hanging
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .version(HttpClient.Version.HTTP_1_1) // Explicitly force HTTP/1.1
                .build();

        System.out.println("✨ AI-DB-Optimizer Java Interceptor initialized successfully.");
    }

    public void inspectQuery(String sqlQuery, long executionTimeMs) {
        if (executionTimeMs > this.slowQueryThresholdMs) {
            backgroundWorkerPool.submit(() -> shipTelemetry(sqlQuery, executionTimeMs));
        }
    }

    private void shipTelemetry(String sqlQuery, long executionTimeMs) {
        try {
            Map<String, Object> payload = Map.of(
                    "query", sqlQuery,
                    "executionTime", executionTimeMs,
                    "appName", "Java Client Application"
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(this.backendUrl))
                    .timeout(Duration.ofSeconds(5))
                    // FIX: Ensure headers match your successful curl test
                    .header("Content-Type", "application/json")
                    // Only send Auth if needed, otherwise it can cause issues on some servers
                    .header("Authorization", "Bearer " + this.apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            System.out.println("🚀 Shipping telemetry to: " + this.backendUrl);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 202) {
                System.out.println("✅ Telemetry ingested successfully!");
            } else {
                System.err.println("⚠️ Warning: Server responded with " + response.statusCode());
            }

        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR: Could not reach backend: " + e.getMessage());
            // This stack trace will now pinpoint if it's a timeout, connection loss, or protocol error
            e.printStackTrace();
        }
    }

    public void shutdown() {
        this.backgroundWorkerPool.shutdown();
    }
}