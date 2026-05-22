package com.optimizer.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class QueryInterceptor {

    private final String backendUrl;
    private final String apiKey;
    private final long slowQueryThresholdMs;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Dedicated background thread pool so we never block the client's main application
    private final ExecutorService backgroundWorkerPool;

    public QueryInterceptor(String apiKey) {
        this.backendUrl = "http://localhost:3000/v1/telemetry";
        this.apiKey = apiKey;
        this.slowQueryThresholdMs = 200; // 200ms default threshold
        this.objectMapper = new ObjectMapper();

        // standard single-threaded background executor for low memory overhead
        this.backgroundWorkerPool = Executors.newSingleThreadExecutor();

        // Native Java 11+ asynchronous HTTP client
        this.httpClient = HttpClient.newBuilder().build();

        System.out.println("✨ AI-DB-Optimizer Java Interceptor initialized successfully.");
    }

    /**
     * This method is called by the application's database wrapper layer
     * to log and track execution times.
     */
    public void inspectQuery(String sqlQuery, long executionTimeMs) {
        if (executionTimeMs > this.slowQueryThresholdMs) {
            // Instantly hand off to background worker thread so the user's request isn't delayed
            backgroundWorkerPool.submit(() -> shipTelemetry(sqlQuery, executionTimeMs));
        }
    }

    private void shipTelemetry(String sqlQuery, long executionTimeMs) {
        try {
            // Structure payload map matching our Node.js endpoint schema
            Map<String, Object> payload = Map.of(
                    "sqlQuery", sqlQuery,
                    "executionTimeMs", executionTimeMs
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(this.backendUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + this.apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            // Fire the request synchronously inside the background thread
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 202) {
                System.err.println("⚠️ Optimizer Telemetry Warning: Received status code " + response.statusCode());
            }

        } catch (Exception e) {
            // Silent fail inside production to ensure customer app safety remains unbothered
        }
    }

    // Clean shutdown hook for enterprise application lifecycles
    public void shutdown() {
        this.backgroundWorkerPool.shutdown();
    }
}