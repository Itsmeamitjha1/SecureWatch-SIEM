import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to exclude
const EXCLUDE = new Set([
  'node_modules',
  '.git',
  '.replit',
  '.cache',
  '.config',
  'dist',
  '.upm',
  'scripts/push-to-github.ts',
  'replit.nix',
  '.breakpoints',
  'generated-icon.png'
]);

function shouldInclude(filePath: string): boolean {
  const parts = filePath.split('/');
  return !parts.some(part => EXCLUDE.has(part));
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{path: string, content: string}[]> {
  const files: {path: string, content: string}[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (!shouldInclude(relativePath)) continue;
    
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (e) {
        // Skip binary or unreadable files
      }
    }
  }
  
  return files;
}

async function main() {
  const owner = 'Gautam-Mathur';
  const repo = 'SecureWatch-SIEM';
  
  try {
    const octokit = await getGitHubClient();
    console.log(`Pushing changes to ${owner}/${repo}...`);
    
    // Get the default branch and its latest commit
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;
    console.log(`Default branch: ${defaultBranch}`);
    
    // Get the latest commit SHA
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`
    });
    const latestCommitSha = refData.object.sha;
    console.log(`Latest commit: ${latestCommitSha.substring(0, 7)}`);
    
    // Get the tree from the latest commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });
    const baseTreeSha = commitData.tree.sha;
    
    // Get all files from local directory
    console.log('Reading local files...');
    const files = await getAllFiles('.');
    console.log(`Found ${files.length} files to sync`);
    
    // Create blobs for each file
    console.log('Creating blobs...');
    const treeItems: any[] = [];
    
    for (const file of files) {
      try {
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });
        
        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
      } catch (e: any) {
        console.log(`  Skipped: ${file.path}`);
      }
    }
    
    console.log(`Created ${treeItems.length} blobs`);
    
    // Create a new tree
    console.log('Creating tree...');
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: treeItems,
      base_tree: baseTreeSha
    });
    
    // Create a new commit
    console.log('Creating commit...');
    const commitMessage = 'Add AI Security Analyst chatbot and enhanced events page\n\n' +
      '- Added AI-powered security log analysis chatbot using OpenAI\n' +
      '- Enhanced Events page with detailed expandable dialog (4 tabs: Overview, Network, Threat Intel, Raw Log)\n' +
      '- Added AI Analysis navigation to sidebar\n' +
      '- Implemented session management for chat history\n' +
      '- Added security improvements for AI response handling\n' +
      '- Fixed accessibility warnings';
    
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommitSha]
    });
    
    // Update the reference
    console.log('Updating branch...');
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha
    });
    
    console.log(`\n✅ Successfully pushed to ${owner}/${repo}`);
    console.log(`   Commit: ${newCommit.sha.substring(0, 7)}`);
    console.log(`   URL: https://github.com/${owner}/${repo}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
