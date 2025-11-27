// GitHub Sync Script for SecureWatch SIEM
// Automatically syncs local changes to GitHub repository

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to sync
const filesToSync = [
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

const dirsToSync = [
  'client/src',
  'server',
  'shared',
];

const skipPatterns = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.replit',
  'replit.nix',
  '.upm',
  'scripts/',
  'SecureWatch-SIEM.zip',
  '.replit.workflow',
  'replit.md',
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

function getFileSha(content: Buffer): string {
  const header = `blob ${content.length}\0`;
  const store = Buffer.concat([Buffer.from(header), content]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

async function main() {
  const repoName = 'SecureWatch-SIEM';
  
  console.log('🔄 Syncing changes to GitHub...');
  console.log('');
  
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  
  // Get current tree from GitHub
  console.log('📥 Fetching current repository state...');
  const { data: ref } = await octokit.git.getRef({
    owner: user.login,
    repo: repoName,
    ref: 'heads/main',
  });
  
  const { data: tree } = await octokit.git.getTree({
    owner: user.login,
    repo: repoName,
    tree_sha: ref.object.sha,
    recursive: 'true',
  });
  
  // Create map of existing files
  const existingFiles = new Map<string, string>();
  for (const item of tree.tree) {
    if (item.type === 'blob' && item.path && item.sha) {
      existingFiles.set(item.path, item.sha);
    }
  }
  
  // Collect all local files
  const allFiles: string[] = [];
  for (const file of filesToSync) {
    if (fs.existsSync(file) && !shouldSkip(file)) {
      allFiles.push(file);
    }
  }
  for (const dir of dirsToSync) {
    const dirFiles = getAllFiles(dir, dir);
    allFiles.push(...dirFiles);
  }
  
  // Find changed files
  const changedFiles: string[] = [];
  const newFiles: string[] = [];
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file);
    const localSha = getFileSha(content);
    const remoteSha = existingFiles.get(file);
    
    if (!remoteSha) {
      newFiles.push(file);
    } else if (localSha !== remoteSha) {
      changedFiles.push(file);
    }
  }
  
  if (changedFiles.length === 0 && newFiles.length === 0) {
    console.log('✅ Everything is up to date! No changes to sync.');
    return;
  }
  
  console.log('');
  if (newFiles.length > 0) {
    console.log(`📝 New files (${newFiles.length}):`);
    newFiles.forEach(f => console.log(`   + ${f}`));
  }
  if (changedFiles.length > 0) {
    console.log(`📝 Modified files (${changedFiles.length}):`);
    changedFiles.forEach(f => console.log(`   ~ ${f}`));
  }
  console.log('');
  
  // Upload changed files
  const filesToUpload = [...newFiles, ...changedFiles];
  console.log(`⬆️  Uploading ${filesToUpload.length} files...`);
  
  let uploadedCount = 0;
  for (const file of filesToUpload) {
    const content = fs.readFileSync(file);
    const base64Content = content.toString('base64');
    
    // Get existing SHA if file exists
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
      // File doesn't exist
    }
    
    await octokit.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: repoName,
      path: file,
      message: `Update ${file}`,
      content: base64Content,
      sha: existingSha,
    });
    
    uploadedCount++;
    process.stdout.write(`\r⬆️  Uploaded ${uploadedCount}/${filesToUpload.length} files`);
  }
  
  console.log('');
  console.log('');
  console.log('🎉 Sync complete!');
  console.log(`   ${newFiles.length} new files, ${changedFiles.length} updated files`);
  console.log(`   https://github.com/${user.login}/${repoName}`);
}

main().catch(console.error);
