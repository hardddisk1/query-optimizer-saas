package com.optimizer.client;

public class TestClientApp {
    public static void main(String[] args) {
        System.out.println("☕ Launching Mock Enterprise Java Application...");

        // Initialize the interceptor with our development fallback API key
        QueryInterceptor interceptor = new QueryInterceptor("dev-secret-key-123");

        // 1. Simulate a fast, healthy query (Should be ignored by the library)
        System.out.println("🏃 Running fast query...");
        interceptor.inspectQuery("SELECT * FROM users WHERE id = 42;", 12);

        // 2. Simulate a heavy, slow query (Should cross our 200ms bar and fire telemetry)
        System.out.println("🐢 Running heavy, unoptimized enterprise query...");
        String heavySqlQuery = "SELECT company_id, SUM(revenue) FROM billing_reports GROUP BY company_id HAVING SUM(revenue) > 500000;";
        interceptor.inspectQuery(heavySqlQuery, 745);

        // Allow a second for the background async thread to complete the dispatch before JVM exit
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        interceptor.shutdown();
        System.out.println("👋 Mock application shutdown.");
    }
}