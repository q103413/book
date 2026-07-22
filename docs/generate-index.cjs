#!/usr/bin/env node
/**
 * 批量生成缺失的 index.md（修复 VitePress 目录 404）
 *
 * 原理：
 *   VitePress 访问 /目录名/ 这种路径时，实际请求的是 /目录名/index.md。
 *   如果目录下只有具体文章而没有 index.md，会导致该分类首页 404。
 *
 * 用法：
 *   node generate-index.js [docs目录路径] [--dry-run]
 *   默认扫描 ./docs
 *   加 --dry-run 只打印将要创建的文件，不实际写入（建议先跑一次预览）
 *
 * 行为：
 *   - 递归扫描 docs 下所有目录
 *   - 如果目录里包含至少一个 .md 文件（不含 index.md/README.md 自身）
 *     或包含非空子目录，且该目录缺少 index.md/README.md，则自动生成一份
 *     index.md，内容为标题 + 该目录下文章/子分类的自动索引列表
 *   - 已存在 index.md 或 README.md 的目录会被跳过，不会覆盖
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const dirArg = args.find(a => !a.startsWith('--'))
const targetDir = path.resolve(process.cwd(), dirArg || 'docs')

if (!fs.existsSync(targetDir)) {
  console.error(`❌ 目录不存在: ${targetDir}`)
  process.exit(1)
}

const created = []
const skippedExisting = []
const skippedEmpty = []

// 提取 md 文件的标题：优先取文件内第一行一级标题，否则用文件名
function extractTitle(fullPath, fallback) {
  try {
    const content = fs.readFileSync(fullPath, 'utf-8')
    const match = content.match(/^#\s+(.+)$/m)
    if (match && match[1]) return match[1].trim()
  } catch (e) {
    // 忽略读取失败
  }
  return fallback
}

function hasIndex(dir) {
  return fs.existsSync(path.join(dir, 'index.md')) ||
         fs.existsSync(path.join(dir, 'README.md')) ||
         fs.existsSync(path.join(dir, 'readme.md'))
}

// 递归处理，深度优先：先处理子目录，回溯时决定当前目录是否需要 index.md
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  const mdFiles = []
  const subDirs = []

  entries.forEach(entry => {
    if (entry.name.startsWith('.')) return // 跳过隐藏文件/目录

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const nonEmpty = processDirectory(fullPath) // 递归，先处理子目录
      if (nonEmpty) subDirs.push(entry.name)
    } else if (
      entry.name.endsWith('.md') &&
      !['index.md', 'readme.md'].includes(entry.name.toLowerCase())
    ) {
      mdFiles.push(entry.name)
    }
  })

  const relDir = path.relative(targetDir, dir) || '.'
  const isSelfEmpty = mdFiles.length === 0 && subDirs.length === 0

  if (isSelfEmpty) {
    skippedEmpty.push(relDir)
    return false // 通知父级：本目录无内容，不计入 subDirs
  }

  if (hasIndex(dir)) {
    skippedExisting.push(relDir)
    return true
  }

  // 生成 index.md 内容
  const dirName = path.basename(dir)
  const lines = [`# ${dirName}`, '']

  if (mdFiles.length > 0) {
    lines.push('## 📄 本栏目文章', '')
    mdFiles
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
      .forEach(file => {
        const fileNameWithoutExt = path.basename(file, '.md')
        const fullPath = path.join(dir, file)
        const title = extractTitle(fullPath, fileNameWithoutExt)
        lines.push(`- [${title}](./${fileNameWithoutExt})`)
      })
    lines.push('')
  }

  if (subDirs.length > 0) {
    lines.push('## 📂 子分类', '')
    subDirs
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
      .forEach(sub => {
        lines.push(`- [${sub}](./${sub}/)`)
      })
    lines.push('')
  }

  const indexPath = path.join(dir, 'index.md')
  const content = lines.join('\n')

  if (dryRun) {
    console.log(`[预览] 将创建: ${path.relative(targetDir, indexPath)}`)
  } else {
    fs.writeFileSync(indexPath, content, 'utf-8')
    console.log(`✅ 已创建: ${path.relative(targetDir, indexPath)}`)
  }

  created.push(relDir)
  return true
}

console.log(`🔍 扫描目录: ${targetDir}`)
if (dryRun) console.log('⚠️  当前为预览模式（--dry-run），不会实际写入文件\n')

processDirectory(targetDir)

console.log(`\n${'='.repeat(60)}`)
console.log(`📊 统计结果`)
console.log('='.repeat(60))
console.log(`✅ ${dryRun ? '将创建' : '已创建'}: ${created.length} 个 index.md`)
console.log(`⏭️  已存在，跳过: ${skippedExisting.length} 个目录`)
console.log(`🗑️  空目录，跳过: ${skippedEmpty.length} 个目录`)

if (dryRun && created.length > 0) {
  console.log(`\n💡 确认无误后，去掉 --dry-run 参数重新运行即可实际生成文件`)
}
