const SaaSBackendUrl = 'http://localhost:3000/v1/telemetry';
// This matches the fallback secret key we set up in our server code
const devApiKey = 'dev-secret-key-123'; 

async function simulateDatabaseCollector() {
  console.log('🔌 Booting local Database Client simulation...');

  // Mocking an unoptimized, massive database join query
  const fakeSlowQuery = `
    SELECT users.id, profiles.bio, orders.total_amount 
    FROM users 
    LEFT JOIN profiles ON users.id = profiles.user_id 
    LEFT JOIN orders ON users.id = orders.user_id 
    WHERE users.created_at < '2025-01-01' 
    ORDER BY orders.total_amount DESC 
    LIMIT 100;
  `;

  // Mocking an expensive execution time of 422 milliseconds
  const payload = {
    sqlQuery: fakeSlowQuery,
    executionTimeMs: 422.84
  };

  try {
    console.log('📡 Slow query caught on client application! Shipping telemetry...');

    const response = await fetch(SaaSBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devApiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('✨ Server Response Received:', data);
  } catch (error) {
    console.error('❌ Network error communicating with telemetry server:', error);
  }
}

simulateDatabaseCollector();