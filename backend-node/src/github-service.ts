import { Octokit } from '@octokit/rest';

interface CreatePrOptions {
  repoOwner: string;
  repoName: string;
  baseBranch: string;
  suggestedSql: string;
  explanation: string;
}

export async function createOptimizationPullRequest(options: CreatePrOptions) {
  const { repoOwner, repoName, baseBranch, suggestedSql, explanation } = options;
  
  // 🔍 Dynamic token loading: Read it precisely when the function is called
  const cleanToken = process.env.GITHUB_TOKEN?.trim();

  console.log('--- 🐙 Live PR Dispatch Verification ---');
  console.log('Token Runtime Status:', cleanToken ? 'LOADED ✅' : 'NOT FOUND ❌');
  console.log('---------------------------------------');

  if (!cleanToken || cleanToken.startsWith('your_')) {
    console.log('📦 [GitHub Simulation] Skipping real API call. No valid token found.');
    return 'https://github.com/mock-repo/pull/42';
  }

  // Initialize Octokit dynamically inside the runtime thread
  const octokit = new Octokit({
    auth: cleanToken
  });

  const branchName = `optimize/db-index-${Date.now()}`;
  const filePath = 'migrations/add_performance_index.sql';

  try {
    // 1. Get the latest commit SHA from the main/master branch
    const { data: refData } = await octokit.git.getRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = refData.object.sha;

    // 2. Spin up a brand new Git branch off that SHA
    console.log(`🌿 Creating new Git branch: ${branchName}...`);
    await octokit.git.createRef({
      owner: repoOwner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // 3. Drop Claude's SQL code straight into a physical migration file on that branch
    console.log(`💾 Writing migration file: ${filePath}...`);
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: 'perf: automated database index optimization via Claude AI',
      content: Buffer.from(suggestedSql).toString('base64'),
      branch: branchName,
    });

    // 4. Ship a fully written, professional Pull Request directly to the repository
    console.log(`🚀 Shipping automated Pull Request to ${repoOwner}/${repoName}...`);
    const { data: prData } = await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: '⚡ Performance Optimization: Automated Database Index Proposal',
      head: branchName,
      base: baseBranch,
      body: `### 🤖 Automated Query Optimization Report
      
#### 💡 Performance Analysis
${explanation}

#### 🛠️ Suggested Migration Fix
\`\`\`sql
${suggestedSql}
\`\`\`

*Generated automatically by AI-Query-Optimizer-SaaS.*`,
    });

    return prData.html_url;

  } catch (error) {
    console.error('❌ Failed to execute automated GitHub loop:', error);
    throw error;
  }
}