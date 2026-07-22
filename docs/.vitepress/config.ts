import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vitepress'

// ==================== 🤖 原生扫描函数：全自动生成左侧菜单（支持递归子目录） ====================
// 摆脱第三方 CJS 库的兼容大坑，用原生 Node.js 读盘，稳定、清爽、极其高效

interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

// 提取 markdown 文件内容中的第一行一级标题作为菜单文本，若无则使用文件名兜底
function extractTitle(fullPath: string, fallback: string): string {
  try {
    const content = fs.readFileSync(fullPath, 'utf-8')
    const match = content.match(/^#\s+(.+)$/m)
    if (match && match[1]) {
      return match[1].trim()
    }
  } catch (e) {
    // 读取失败则退化采用文件名
  }
  return fallback
}

// 递归扫描目录：当前层的 .md 文件生成为条目，子文件夹递归生成为可折叠分组
function scanDirectory(dirPath: string, urlPrefix: string): SidebarItem[] {
  if (!fs.existsSync(dirPath)) return []

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const fileItems: SidebarItem[] = []
  const folderItems: SidebarItem[] = []

  entries
    // 中文文件名按拼音/字典序排序，保证顺序稳定
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
    .forEach(entry => {
      // 跳过隐藏文件/文件夹（如 .vitepress、.git 等）
      if (entry.name.startsWith('.')) return

      if (entry.isDirectory()) {
        const subDirPath = path.join(dirPath, entry.name)
        const subUrlPrefix = `${urlPrefix}/${entry.name}`
        const children = scanDirectory(subDirPath, subUrlPrefix)

        // 子目录若为空（没有任何 md 文件）则跳过，避免生成空分组
        if (children.length > 0) {
          folderItems.push({
            text: entry.name,
            collapsed: true, // 子分组默认折叠，避免侧边栏过长
            items: children
          })
        }
      } else if (
        entry.name.endsWith('.md') &&
        !['index.md', 'readme.md'].includes(entry.name.toLowerCase())
      ) {
        const fileNameWithoutExt = path.basename(entry.name, '.md')
        const fullPath = path.join(dirPath, entry.name)
        const title = extractTitle(fullPath, fileNameWithoutExt)

        fileItems.push({
          text: title,
          link: `${urlPrefix}/${fileNameWithoutExt}`
        })
      }
    })

  // 当前目录直属文件排在前面，子目录分组排在后面
  return [...fileItems, ...folderItems]
}

// 对外暴露的入口函数：生成某个一级栏目的完整侧边栏结构
function autoGenerateSidebar(dirName: string): SidebarItem[] {
  const targetDir = path.resolve(process.cwd(), 'docs', dirName)
  if (!fs.existsSync(targetDir)) {
    console.warn(`[Sidebar Warning] 目录不存在: ${targetDir}`)
    return []
  }

  const items = scanDirectory(targetDir, `/${dirName}`)

  // 终端控制台实时打印扫描状态，方便定位未识别的文件
  console.log(`\x1b[32m[Sidebar Scan]\x1b[0m 栏目 /${dirName}/ 扫描成功，共载入 ${items.length} 个核心节点`)

  // 返回 VitePress 侧边栏的标准数据结构
  return [
    {
      text: `${dirName.replace('/', '')} 知识库`,
      collapsed: false,
      items
    }
  ]
}

// ==================== VitePress 核心配置 ====================
export default defineConfig({
  title: "张卫老师的技术与商业上演进",
  description: "全栈开发、大数据架构与个人思考记录",
  lang: 'zh-CN',
  cleanUrls: true,

  head: [
    // 强制关闭一些可能导致自动升级的 CSP 策略
    // 允许浏览器以不安全的明文 http 方式去加载图片源
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }]
  ],

  // ==================== 🛠️ Shiki 代码高亮与拦截补丁 ====================
  markdown: {
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    shikiSetup: async (shiki) => {
      await shiki.loadLanguage('sql')
      await shiki.loadLanguage('txt')
      await shiki.loadLanguage('properties')
    },
    languageAlias: {
      'hive': 'sql',
      'env': 'properties'
    },
    config(md) {
      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'ascii') {
          token.info = 'txt';
        }
        return defaultFence!(tokens, idx, options, env, self);
      };
    }
  },

  // 🚀 核心：让死链检查直接忽略本地测试脚本、配置模板及局域网/本地集群地址
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127\.0\.0\.1/,
    /^https?:\/\/0\.0\.0\.0/
  ],

  themeConfig: {
    // ---------------- 顶部大类导航栏 (Nav) ----------------
    nav: [
      { text: '🏠 首页', link: '/' },
      {
        text: '💻 核心开发',
        items: [
          { text: '✨ AIGC', link: '/AIGC/' }, // 💡 已为您优雅加上小图标
          { text: '🐹 Go 语言编程', link: '/go语言/' },
          { text: '🤖 AI 与编程自动化', link: '/AI编程/' },
          { text: '🌐 前端开发技术', link: '/前端开发/' },
          { text: '🐳 Docker 容器化', link: '/docker/' },
          { text: '🛠️ 自动化运维', link: '/运维/' },
          { text: '🧩 全栈解决方案', link: '/全栈解决方案/' }
        ]
      },
      {
        text: '📊 大数据技术',
        items: [
          { text: '🦣 Hadoop 大数据平台', link: '/Hadoop大数据/' },
          { text: '🐝 Hive 核心笔记', link: '/Hive笔记/' },
          { text: '⚡ Spark开发', link: '/Spark开发/' },
          { text: '✨ Scala 编程语言', link: '/Scala编程/' },
          { text: '📈 Python 数据分析', link: '/Python数据分析/' }
        ]
      },
      {
        text: '🏫 职业与教学',
        items: [
          { text: '🛠️ 运维实训', link: '/运维实训/' },
          { text: '📝 软件设计师（中级）', link: '/软件设计师/' },
          { text: '🐍 Python 基础编程', link: '/Python编程/' },
          { text: '💼 学校日常与工作 management', link: '/学校工作/' },
          { text: '📂 资源归档', link: '/Local/' }
        ]
      },
      {
        text: '🪙 商业与生活',
        items: [
          { text: '🚀 创业与商业笔记', link: '/创业笔记/' },
          { text: '⛓️ 加密货币与金融投资', link: '/加密货币/' },
          { text: '📈 美股与趋势投资', link: '/投资/' },
          { text: '🌍 海外发展探索', link: '/海外发展/' },
          { text: '🧘 健康养生', link: '/健康养生/' }
        ]
      }
    ],

    // ---------------- 🦾 原生无插件、免维护的侧边栏映射（自动递归扫描子目录） ----------------
    sidebar: {
      '/AIGC/': autoGenerateSidebar('AIGC'),
      '/go语言/': autoGenerateSidebar('go语言'),
      '/AI编程/': autoGenerateSidebar('AI编程'),
      '/前端开发/': autoGenerateSidebar('前端开发'),
      '/docker/': autoGenerateSidebar('docker'),
      '/运维/': autoGenerateSidebar('运维'),
      '/全栈解决方案/': autoGenerateSidebar('全栈解决方案'),

      '/Hadoop大数据/': autoGenerateSidebar('Hadoop大数据'),
      '/Hive笔记/': autoGenerateSidebar('Hive笔记'),
      '/Scala编程/': autoGenerateSidebar('Scala编程'),
      '/Spark开发/': autoGenerateSidebar('Spark开发'),
      '/Python数据分析/': autoGenerateSidebar('Python数据分析'),

      '/运维实训/': autoGenerateSidebar('运维实训'),
      '/软件设计师/': autoGenerateSidebar('软件设计师'),
      '/Python编程/': autoGenerateSidebar('Python编程'),
      '/学校工作/': autoGenerateSidebar('学校工作'),
      '/LocalFile/': autoGenerateSidebar('LocalFile'),

      '/创业笔记/': autoGenerateSidebar('创业笔记'),
      '/加密货币/': autoGenerateSidebar('加密货币'),
      '/投资/': autoGenerateSidebar('投资'),
      '/海外发展/': autoGenerateSidebar('海外发展'),
      '/健康养生/': autoGenerateSidebar('健康养生'),
    },

    outline: { level: [2, 4], label: '本页大纲' },
    footer: { message: '基于 Vite 强力驱动 | 纯静态轻量托管', copyright: 'Copyright © 2026-present 张卫老师' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/' }],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档' },
          modal: { noResultsText: '无法找到相关结果', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
        }
      }
    }
  }
})
