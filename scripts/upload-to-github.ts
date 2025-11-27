// GitHub Upload Script for SecureWatch SIEM
// Uses Replit's GitHub integration

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
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
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

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to include
const filesToUpload = [
  'package.json',
  'tsconfig.json',
  'tailwind.config.ts',
  'vite.config.ts',
  'drizzle.config.ts',
  'postcss.config.js',
  '.gitignore',
  'README.md',
  'client/index.html',
];

const dirsToUpload = [
  'client/src',
  'server',
  'shared',
];

// Files/dirs to skip
const skipPatterns = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.replit',
  'replit.nix',
  '.upm',
  'scripts/upload-to-github.ts',
  'SecureWatch-SIEM.zip',
];

function shouldSkip(filePath: string): boolean {
  return skipPatterns.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dirPath)) return files;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    
    if (shouldSkip(relativePath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const repoName = process.argv[2] || 'SecureWatch-SIEM';
  
  console.log('🔐 Connecting to GitHub...');
  const octokit = await getUncachableGitHubClient();
  
  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Authenticated as: ${user.login}`);
  
  // Check if repo exists
  let repoExists = false;
  try {
    await octokit.repos.get({ owner: user.login, repo: repoName });
    repoExists = true;
    console.log(`📁 Repository ${repoName} already exists, will update files...`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`📁 Creating new repository: ${repoName}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Enterprise SIEM Platform with GRC capabilities and OWASP ZAP integration',
        private: false,
        auto_init: true, // Initialize with README
      });
      console.log(`✅ Repository created: https://github.com/${user.login}/${repoName}`);
      // Wait for GitHub to initialize the repo
      console.log('⏳ Waiting for repository initialization...');
      await sleep(3000);
    } else {
      throw e;
    }
  }
  
  // Collect all files
  console.log('📂 Collecting files...');
  const allFiles: string[] = [];
  
  // Add individual files
  for (const file of filesToUpload) {
    if (fs.existsSync(file) && !shouldSkip(file)) {
      allFiles.push(file);
    }
  }
  
  // Add directory contents
  for (const dir of dirsToUpload) {
    const dirFiles = getAllFiles(dir, dir);
    allFiles.push(...dirFiles);
  }
  
  console.log(`📦 Found ${allFiles.length} files to upload`);
  
  // Upload files using the Contents API (works for empty repos)
  console.log('⬆️  Uploading files...');
  let uploadedCount = 0;
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file);
      const base64Content = content.toString('base64');
      
      // Check if file exists
      let existingSha: string | undefined;
      try {
        const { data: existing } = await octokit.repos.getContent({
          owner: user.login,
          repo: repoName,
          path: file,
        });
        if ('sha' in existing) {
          existingSha = existing.sha;
        }
      } catch (e) {
        // File doesn't exist, that's fine
      }
      
      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: repoName,
        path: file,
        message: `Add ${file}`,
        content: base64Content,
        sha: existingSha,
      });
      
      uploadedCount++;
      process.stdout.write(`\r⬆️  Uploaded ${uploadedCount}/${allFiles.length} files`);
    } catch (e: any) {
      console.error(`\n❌ Error uploading ${file}: ${e.message}`);
    }
  }
  
  console.log('');
  console.log('');
  console.log('🎉 Success! Your project is now on GitHub:');
  console.log(`   https://github.com/${user.login}/${repoName}`);
}

main().catch(console.error);
