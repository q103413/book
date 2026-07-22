# ====================================================================
# VitePress GitHub Source Sync Script (Final Pure Version)
# ====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ">>> Step 1: Locating VitePress Project Root..." -ForegroundColor Cyan

# 1. 智能切换到根目录
if (Test-Path ".\.vitepress") {
    Set-Location ..
}
$PROJECT_ROOT = (Get-Location).Path
Write-Host "Project Root: $PROJECT_ROOT" -ForegroundColor Yellow

# 2. 防线检测与设置
$GITIGNORE_FILE = ".gitignore"
if (-not (Test-Path $GITIGNORE_FILE)) {
    New-Item -Path $GITIGNORE_FILE -ItemType File -Force | Out-Null
}

$CurrentIgnore = Get-Content $GITIGNORE_FILE -Raw -ErrorAction SilentlyContinue
if ($CurrentIgnore -notmatch "docs/\.vitepress/dist/") {
    Add-Content -Path $GITIGNORE_FILE -Value "`nnode_modules/`ndocs/.vitepress/dist/`ndocs/.vitepress/cache/`n.vitepress/.vite/`ndist/`n*.log"
    Write-Host "✅ Updated .gitignore to exclude dist directory." -ForegroundColor Green
}

# 3. 准备 Git 仓库与分支
Write-Host ">>> Step 2: Preparing Git repository & remote..." -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    git init
    Write-Host "Initialized empty Git repository." -ForegroundColor Yellow
}

git branch -M main

# 4. 原生绑定远程仓库（用 git remote -v 优雅判断，零报错抛出）
$TARGET_REMOTE = "https://github.com/q103413/book.git"
$RemoteCheck = git remote
if ($RemoteCheck -contains "origin") {
    git remote set-url origin $TARGET_REMOTE
} else {
    git remote add origin $TARGET_REMOTE
}
Write-Host "Remote origin set to: $TARGET_REMOTE" -ForegroundColor Yellow

# 5. 扫描与暂存
Write-Host ">>> Step 3: Scanning and Staging Source Files..." -ForegroundColor Cyan
git add .

# 6. 提交（如果已提交，自动跳过）
$TIME_STAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$COMMIT_MSG = "docs: sync source files ($TIME_STAMP)"

Write-Host ">>> Step 4: Committing & Pushing to GitHub..." -ForegroundColor Cyan

$Uncommitted = git status -s
if ($Uncommitted) {
    git commit -m "$COMMIT_MSG"
    Write-Host "Commit message: $COMMIT_MSG" -ForegroundColor Yellow
} else {
    Write-Host "Previous commit found, proceeding to push..." -ForegroundColor Yellow
}

# 7. 执行推送
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "🎉 Success: Source code synced to GitHub smoothly!" -ForegroundColor Green
    Write-Host "Repo URL: https://github.com/q103413/book" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Cyan
} else {
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host "❌ Error: Push failed. Check your network or GitHub permissions." -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
}
