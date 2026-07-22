#!/usr/bin/env node
/**
 * GitBook → VitePress 迁移问题批量检测脚本
 *
 * 用法：
 *   node check-migration.js [docs目录路径]
 *   默认扫描 ./docs
 *
 * 检测项：
 *   1. 双重后缀文件（xxx.md.md）
 *   2. 文件名/文件夹名含空格
 *   3. GitBook 专属语法残留（hint / tabs / embed / page-toc 等）
 *   4. gitbook.io 图床外链 及 .gitbook/assets 相对路径引用
 *   5. 图片本地路径引用但文件实际不存在（简单存在性检查）
 *   6. 内部 markdown 链接格式检查（是否带了 .md 后缀，与 cleanUrls:true 冲突）
 *   7. 空文件（可能是迁移过程中损坏或未写入内容）
 *
 * 输出：终端打印分类结果 + 生成 migration-report.md 报告文件
 */

const fs = require('fs')
const path = require('path')

const targetDir = path.resolve(process.cwd(), process.argv[2] || 'docs')

if (!fs.existsSync(targetDir)) {
  console.error(`❌ 目录不存在: ${targetDir}`)
  process.exit(1)
}

// ---------------- 结果容器 ----------------
const issues = {
  doubleExt: [],       // xxx.md.md
  spaceInName: [],      // 文件名/目录名含空格
  gitbookSyntax: [],    // {% hint %} 等残留语法
  gitbookAssets: [],    // gitbook.io 外链 / .gitbook/assets 引用
  brokenLocalImage: [], // 引用了本地图片但文件不存在
  mdSuffixLink: [],     // 内部链接带 .md 后缀
  emptyFile: []         // 空文件
}

// GitBook 常见语法正则
const GITBOOK_PATTERNS = [
  { name: 'hint 提示块', regex: /\{%\s*hint/g },
  { name: 'tabs 标签页', regex: /\{%\s*tabs/g },
  { name: 'embed 嵌入', regex: /\{%\s*embed/g },
  { name: 'content-ref', regex: /\{%\s*content-ref/g },
  { name: 'page-toc', regex: /\{%\s*page-toc/g },
  { name: 'GitBook 云端图床', regex: /https?:\/\/[^\s)]*gitbook\.io[^\s)]*/g },
  { name: '.gitbook/assets 引用', regex: /\.gitbook\/assets/g }
]

// 递归遍历所有文件（含目录名空格检测）
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(targetDir, fullPath)

    if (/\s/.test(entry.name)) {
      issues.spaceInName.push(relPath)
    }

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) return // 跳过隐藏目录
      walk(fullPath)
      return
    }

    if (!entry.name.endsWith('.md')) return

    // 1. 双重后缀检测
    if (entry.name.toLowerCase().endsWith('.md.md')) {
      issues.doubleExt.push(relPath)
    }

    const content = fs.readFileSync(fullPath, 'utf-8')

    // 7. 空文件检测
    if (content.trim().length === 0) {
      issues.emptyFile.push(relPath)
    }

    // 3+4. GitBook 语法及外链检测
    GITBOOK_PATTERNS.forEach(({ name, regex }) => {
      const matches = content.match(regex)
      if (matches) {
        const bucket = name.includes('图床') || name.includes('assets')
          ? issues.gitbookAssets
          : issues.gitbookSyntax
        bucket.push(`${relPath} — ${name} × ${matches.length}`)
      }
    })

    // 5. 本地图片引用存在性检查（markdown 图片语法 ![alt](path)）
    const imageMatches = [...content.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)]
    imageMatches.forEach(m => {
      const imgPath = m[1].split(' ')[0].trim() // 去掉可能的 title
      if (/^https?:\/\//.test(imgPath)) return // 跳过网络图片（另有 gitbook.io 检测覆盖）
      if (imgPath.startsWith('data:')) return

      // 相对路径解析（相对于当前 md 文件所在目录）
      const resolvedPath = path.resolve(path.dirname(fullPath), decodeURIComponent(imgPath))
      if (!fs.existsSync(resolvedPath)) {
        issues.brokenLocalImage.push(`${relPath} → 引用了不存在的图片: ${imgPath}`)
      }
    })

    // 6. 内部链接带 .md 后缀检测（与 cleanUrls:true 配置冲突）
    const linkMatches = [...content.matchAll(/\[[^\]]+]\(([^)]+\.md)\)/g)]
    linkMatches.forEach(m => {
      const linkPath = m[1]
      if (/^https?:\/\//.test(linkPath)) return // 跳过外部链接
      issues.mdSuffixLink.push(`${relPath} → 内部链接带 .md 后缀: ${linkPath}`)
    })
  })
}

walk(targetDir)

// ---------------- 输出结果 ----------------
function printSection(title, list, hint) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`${title}（共 ${list.length} 处）`)
  if (hint) console.log(`💡 ${hint}`)
  console.log('─'.repeat(60))
  if (list.length === 0) {
    console.log('  ✅ 未发现问题')
  } else {
    list.slice(0, 50).forEach(item => console.log(`  - ${item}`))
    if (list.length > 50) console.log(`  ...以及其他 ${list.length - 50} 处（详见报告文件）`)
  }
}

console.log(`\n🔍 扫描目录: ${targetDir}`)

printSection('1️⃣  双重后缀文件 (.md.md)', issues.doubleExt, '重命名为单一 .md 后缀')
printSection('2️⃣  文件/目录名含空格', issues.spaceInName, 'URL 中会变成 %20，建议改用中划线或直接去掉空格')
printSection('3️⃣  GitBook 专属语法残留', issues.gitbookSyntax, '需转换为 VitePress 自定义容器语法 (::: tip ... :::)')
printSection('4️⃣  GitBook 图床/资源引用', issues.gitbookAssets, '建议下载图片到本地 public/ 目录并改为相对路径')
printSection('5️⃣  本地图片引用但文件缺失', issues.brokenLocalImage, '检查图片是否随迁移一起复制过来')
printSection('6️⃣  内部链接带 .md 后缀', issues.mdSuffixLink, 'cleanUrls:true 下建议去掉 .md 后缀，否则可能出现路径不一致')
printSection('7️⃣  空文件', issues.emptyFile, '可能是迁移过程未写入内容，建议核实是否需要补充或删除')

// ---------------- 生成 Markdown 报告 ----------------
const reportLines = [
  '# GitBook → VitePress 迁移问题检测报告',
  '',
  `扫描目录: \`${targetDir}\``,
  `扫描时间: ${new Date().toLocaleString('zh-CN')}`,
  ''
]

function addReportSection(title, list) {
  reportLines.push(`## ${title}（共 ${list.length} 处）`, '')
  if (list.length === 0) {
    reportLines.push('✅ 未发现问题', '')
    return
  }
  list.forEach(item => reportLines.push(`- ${item}`))
  reportLines.push('')
}

addReportSection('1. 双重后缀文件 (.md.md)', issues.doubleExt)
addReportSection('2. 文件/目录名含空格', issues.spaceInName)
addReportSection('3. GitBook 专属语法残留', issues.gitbookSyntax)
addReportSection('4. GitBook 图床/资源引用', issues.gitbookAssets)
addReportSection('5. 本地图片引用但文件缺失', issues.brokenLocalImage)
addReportSection('6. 内部链接带 .md 后缀', issues.mdSuffixLink)
addReportSection('7. 空文件', issues.emptyFile)

const reportPath = path.join(process.cwd(), 'migration-report.md')
fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8')

const total = Object.values(issues).reduce((sum, list) => sum + list.length, 0)
console.log(`\n${'='.repeat(60)}`)
console.log(`📄 完整报告已生成: ${reportPath}`)
console.log(`📊 共发现 ${total} 处问题`)
console.log('='.repeat(60))
