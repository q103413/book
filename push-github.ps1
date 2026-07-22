# ====================================================================
# VitePress GitHub Source Sync Script (Token Preserved Version)
# ====================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ">>> Step 1: Locating VitePress Project Root..." -ForegroundColor Cyan

# 1. 定位根目录
if (Test-Path ".\.vitepress") { Set-Location .. }
$PROJECT_ROOT = (Get-Location).Path
Write-Host "Project Root: $PROJECT_ROOT" -ForegroundColor Yellow

# 2. 检查并补全 .gitignore
if (-not (Test-Path ".\.gitignore")) {
    New-Item -Path ".\.gitignore" -ItemType File -Force | Out-Null
}

$CurrentIgnore = Get-Content ".\.gitignore" -Raw -ErrorAction SilentlyContinue
if ($CurrentIgnore -notmatch "docs/\.vitepress/dist/") {
    Add-Content -Path ".\.gitignore" -Value "`nnode_modules/`ndocs/.vitepress/dist/`ndocs/.vitepress/cache/`n.vitepress/.vite/`ndist/`n*.log"
    Write-Host "✅ Updated .gitignore to exclude dist directory." -ForegroundColor Green
}

# 3. 准备 Git 仓库与暂存
Write-Host ">>> Step 2: Staging & Committing Source Files..." -ForegroundColor Cyan
if (-not (Test-Path ".\.git")) {
    git init | Out-Null
    git branch -M main
}

git add .

$TIME_STAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$COMMIT_MSG = "docs: sync source files ($TIME_STAMP)"

$Uncommitted = git status -s
if ($Uncommitted) {
    git commit -m "$COMMIT_MSG"
    Write-Host "Commit message: $COMMIT_MSG" -ForegroundColor Yellow
} else {
    Write-Host "No local changes to commit, pushing to GitHub..." -ForegroundColor Yellow
}

# 4. 直接推送（使用本地已配置好的远程 URL）
Write-Host ">>> Step 3: Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "🎉 Success: Source code synced to GitHub smoothly!" -ForegroundColor Green
    Write-Host "Repo URL: https://github.com/q103413/book" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Cyan
} else {
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host "❌ Push Failed! Check network or permissions." -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
}
