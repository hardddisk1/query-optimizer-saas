import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { analyzeSlowQuery } from './ai-analyzer.js';
import { createOptimizationPullRequest } from './github-service.js'; // Import our new GitHub module

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const verifyApiKey = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const masterKey = process.env.OPTIMIZER_API_KEY || 'dev-secret-key-123';

  if (!authHeader || authHeader !== `Bearer ${masterKey}`) {
     res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
     return;
  }
  next();
};

app.post('/v1/telemetry', verifyApiKey, async (req: Request, res: Response) => {
  const { sqlQuery, executionTimeMs } = req.body;

  if (!sqlQuery || typeof executionTimeMs !== 'number') {
     res.status(400).json({ error: 'Bad Request: Missing sqlQuery or executionTimeMs' });
     return;
  }

  console.log('\n==================================================');
  console.log(`⚠️ [SLOW QUERY INGESTED] Execution Time: ${executionTimeMs.toFixed(2)}ms`);
  console.log(`📜 Raw SQL: ${sqlQuery.trim()}`);
  console.log('==================================================');

  console.log('🤖 Contacting Claude Tuning Engine for optimization strategies...');
  try {
    // 1. Get the SQL fix from Claude
    const aiAnalysis = await analyzeSlowQuery(sqlQuery);
    
    console.log('✨ [CLAUDE OPTIMIZATION GENERATED]');
    console.log(`💡 Rationale: ${aiAnalysis.explanation}`);
    console.log(`🛠️ Proposed Fix: ${aiAnalysis.suggestedIndexSql}`);
    console.log(`📊 Risk Index: ${aiAnalysis.riskAssessment}`);
    console.log('==================================================');
    
    // 2. Automatically dispatch the Pull Request to GitHub
    console.log('🐙 Dispatching automated Pull Request loop...');
    
    const prUrl = await createOptimizationPullRequest({
      repoOwner: 'azi-tyto',                  // Your GitHub username
      repoName: 'query-optimizer-saas',       // The repository name we are working in
      baseBranch: 'main',                     // Your target branch
      suggestedSql: aiAnalysis.suggestedIndexSql,
      explanation: aiAnalysis.explanation
    });

    console.log(`🎉 SUCCESS: Pull Request deployed live!`);
    console.log(`🔗 Link: ${prUrl}`);
    console.log('==================================================\n');
    
  } catch (err) {
    console.error('⚠️ Could not complete full automated engineering pipeline.', err);
  }
  
  res.status(202).json({ 
    status: 'accepted', 
    message: 'Telemetry processed and automation executed.' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Telemetry Ingestion Engine online on port ${PORT}`);
});