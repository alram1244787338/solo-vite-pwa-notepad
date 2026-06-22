# PWA 离线笔记本

Service Worker 缓存 + IndexedDB 存储，断网也能读写笔记。

## 技术栈

Vite · 原生 JS · Service Worker · IndexedDB · Vitest

## 目录结构

```
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── manifest.json        # PWA 清单
│   └── sw.js                # Service Worker
├── src/
│   ├── css/
│   │   └── style.css        # 响应式样式
│   └── js/
│       ├── main.js           # 入口，初始化流程
│       ├── db.js             # IndexedDB 封装（addNote / getAllNotes / updateNote / deleteNote）
│       ├── render.js         # DOM 渲染 + escapeHtml
│       ├── sw-register.js    # SW 注册 + 离线横幅
│       └── sw-utils.js      # SW 纯函数（isHTMLRequest / APP_SHELL）
└── test/
    ├── db.test.js
    ├── render.test.js
    ├── sw-register.test.js
    └── sw.test.js
```

## 安装运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，首次加载后 Service Worker 会自动注册并缓存页面资源。

## 怎么用

- **写笔记**：在顶部输入标题和内容，点「保存」
- **笔记列表**：下方卡片按修改时间降序排列
- **编辑**：点击卡片加载内容到编辑区，修改后保存
- **删除**：点卡片右上角 × 按钮，渐隐后移除
- **离线使用**：断网后刷新页面，界面和已有笔记照常可用；新笔记保存到本地，联网后无感同步

## 测试

```bash
npm test
```

28 个用例，覆盖：

| 模块 | 测试内容 |
|------|---------|
| `db.js` | 插入记录完整性（id / createdAt / updatedAt）、降序排列、updateNote merge 不覆盖 createdAt、deleteNote 删除验证 |
| `render.js` | escapeHtml 转义 `<script>` 等特殊字符、renderNotes 生成 `.note-card` DOM |
| `sw-register.js` | registerServiceWorker 注册行为、showOfflineBanner 创建 `.offline-banner` 元素及 3 秒自动消失 |
| `sw-utils.js` | isHTMLRequest 使用 `request.mode === 'navigate'` 判断、APP_SHELL 包含 `/` 和 `/index.html` |

使用 `fake-indexeddb` 对 IndexedDB 做真实集成测试，`jsdom` 模拟 DOM 环境。
