# ====================================================================
# VitePress Clean Deploy Script (Smart Path Version)
# ====================================================================

Write-Host ">>> Step 1: Starting VitePress build..." -ForegroundColor Cyan

# 执行打包
pnpm build

# 检查打包结果
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed! Process terminated." -ForegroundColor Red
    exit
}

# 2. 配置参数
$SERVER_IP   = "8.138.162.227"
$REMOTE_PATH = "/xp/www/book.aa520.cn"

Write-Host ">>> Step 2: Build success! Syncing to server: $SERVER_IP ..." -ForegroundColor Cyan

# 3. 智能路径兼容：无论在根目录还是 docs 目录都能精准锁定
if (Test-Path ".\docs\.vitepress\dist") {
    # 如果当前在项目根目录
    $LOCAL_DIST = ".\docs\.vitepress\dist\*"
} elseif (Test-Path ".\.vitepress\dist") {
    # 如果当前在 docs 子目录
    $LOCAL_DIST = ".\.vitepress\dist\*"
} else {
    Write-Host "Error: Cannot find VitePress build output directory (.vitepress/dist)!" -ForegroundColor Red
    exit
}

# 4. 执行免密同步
scp -i ~/.ssh/id_rsa -r $LOCAL_DIST root@${SERVER_IP}:${REMOTE_PATH}

# 5. 状态回执
if ($LASTEXITCODE -eq 0) {
    Write-Host "Success: Deploy finished smoothly!" -ForegroundColor Green
    Write-Host "URL: http://book.aa520.cn" -ForegroundColor Yellow
} else {
    Write-Host "Error: SCP sync failed! Check network or SSH keys." -ForegroundColor Red
}
