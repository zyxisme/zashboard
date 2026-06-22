# Chrome 99 完整兼容性实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 zashboard 项目改造为完全兼容 Chrome 99，包括 JavaScript 和 CSS 的所有特性。

**Architecture:** 使用 PostCSS 插件自动转换现代 CSS 特性（oklch、color-mix），同时设置 Vite 构建目标为 chrome99 以确保 JavaScript 兼容性。

**Tech Stack:** Vite 7、Tailwind CSS v4、DaisyUI v5、PostCSS

## Global Constraints

- 构建目标: `chrome99`
- PostCSS 插件必须在 `@tailwindcss/postcss` 之后运行
- 不降级 Tailwind CSS 或 DaisyUI 版本
- 保持现有功能和视觉效果不变

---

### Task 1: 修改 Vite 构建目标

**Files:**
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: Vite 配置中的 `build.target: 'chrome99'`

- [ ] **Step 1: 读取当前 Vite 配置**

读取 `vite.config.ts` 文件，了解当前配置结构。

- [ ] **Step 2: 添加 build.target 配置**

在 `vite.config.ts` 的 `defineConfig` 中添加 `build` 配置：

```typescript
export default defineConfig({
  // ... 其他配置保持不变
  build: {
    target: 'chrome99',
  },
})
```

- [ ] **Step 3: 验证配置语法**

运行以下命令验证 TypeScript 配置没有语法错误：

```bash
npx tsc --noEmit vite.config.ts
```

Expected: 无错误输出

- [ ] **Step 4: 提交更改**

```bash
git add vite.config.ts
git commit -m "build: set Vite build target to chrome99"
```

---

### Task 2: 安装 PostCSS 兼容性插件

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: 新增的 devDependencies `@csstools/postcss-oklab-function` 和 `@csstools/postcss-color-mix-function`

- [ ] **Step 1: 安装 PostCSS oklab 插件**

```bash
pnpm add -D @csstools/postcss-oklab-function
```

- [ ] **Step 2: 安装 PostCSS color-mix 插件**

```bash
pnpm add -D @csstools/postcss-color-mix-function
```

- [ ] **Step 3: 验证安装**

检查 `package.json` 中是否包含新依赖：

```bash
grep -E "postcss-oklab-function|postcss-color-mix-function" package.json
```

Expected: 显示两个新依赖及其版本

- [ ] **Step 4: 提交更改**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add PostCSS plugins for CSS compatibility"
```

---

### Task 3: 配置 PostCSS 插件

**Files:**
- Modify: `postcss.config.js`

**Interfaces:**
- Produces: PostCSS 配置中的 oklab 和 color-mix 插件

- [ ] **Step 1: 读取当前 PostCSS 配置**

读取 `postcss.config.js` 文件，了解当前配置。

- [ ] **Step 2: 添加 PostCSS 插件**

修改 `postcss.config.js`，在 `@tailwindcss/postcss` 之后添加新插件：

```javascript
export default {
  plugins: {
    'postcss-for': {},
    'postcss-conditionals': {},
    '@tailwindcss/postcss': {},
    '@csstools/postcss-oklab-function': { preserve: false },
    '@csstools/postcss-color-mix-function': { preserve: false },
  },
}
```

- [ ] **Step 3: 验证配置语法**

```bash
node -e "import('./postcss.config.js').then(() => console.log('OK')).catch(e => console.error(e))"
```

Expected: 输出 "OK"

- [ ] **Step 4: 提交更改**

```bash
git add postcss.config.js
git commit -m "build: add PostCSS plugins for oklch and color-mix compatibility"
```

---

### Task 4: 构建测试

**Files:**
- None (构建输出)

**Interfaces:**
- Consumes: Tasks 1-3 的配置更改

- [ ] **Step 1: 运行构建**

```bash
pnpm build
```

Expected: 构建成功，无错误

- [ ] **Step 2: 检查输出文件**

```bash
ls -la dist/
```

Expected: 看到构建输出文件

- [ ] **Step 3: 检查 CSS 输出中的 oklch**

```bash
grep -r "oklch" dist/assets/*.css | head -5
```

Expected: 无输出（所有 oklch 应该被转换）

- [ ] **Step 4: 检查 CSS 输出中的 color-mix**

```bash
grep -r "color-mix" dist/assets/*.css | head -5
```

Expected: 无输出（所有 color-mix 应该被转换）

- [ ] **Step 5: 提交构建产物（可选）**

如果需要部署，可以提交构建产物：

```bash
git add dist/
git commit -m "build: Chrome 99 compatible build"
```

---

### Task 5: 功能验证

**Files:**
- None (手动测试)

**Interfaces:**
- Consumes: Task 4 的构建输出

- [ ] **Step 1: 启动预览服务器**

```bash
pnpm preview
```

- [ ] **Step 2: 在 Chrome 99 中测试页面加载**

在 Chrome 99 中打开预览服务器地址，验证：
- 页面正常加载
- 无 JavaScript 错误
- 无 CSS 错误

- [ ] **Step 3: 测试主题切换**

在设置页面中切换主题，验证：
- 主题颜色正确显示
- 无闪烁或异常

- [ ] **Step 4: 测试代理列表**

导航到代理页面，验证：
- 代理列表正确显示
- 延迟测试功能正常

- [ ] **Step 5: 测试设置页面**

导航到设置页面，验证：
- 所有设置项正确显示
- 切换设置功能正常

- [ ] **Step 6: 测试连接列表**

导航到连接页面，验证：
- 连接列表正确显示
- 连接详情功能正常

- [ ] **Step 7: 测试日志页面**

导航到日志页面，验证：
- 日志正确显示
- 日志筛选功能正常

---

### Task 6: 修复发现的问题

**Files:**
- 根据发现的问题确定

**Interfaces:**
- Consumes: Task 5 中发现的问题

- [ ] **Step 1: 记录发现的问题**

如果在 Task 5 中发现任何兼容性问题，记录在这里：

问题 1: [描述]
问题 2: [描述]

- [ ] **Step 2: 修复 CSS 兼容性问题**

如果发现 CSS 相关问题，可能需要：
- 手动替换某些 oklch 值为 hex/rgb
- 调整 PostCSS 插件配置

- [ ] **Step 3: 修复 JavaScript 兼容性问题**

如果发现 JavaScript 相关问题，可能需要：
- 添加 polyfill（如 core-js）
- 调整代码以避免使用不兼容的 API

- [ ] **Step 4: 重新构建和测试**

```bash
pnpm build
pnpm preview
```

在 Chrome 99 中重新测试所有功能。

- [ ] **Step 5: 提交修复**

```bash
git add .
git commit -m "fix: Chrome 99 compatibility issues"
```

---

## 验证清单

- [ ] `pnpm build` 成功完成
- [ ] 输出 CSS 中无 `oklch()` 值
- [ ] 输出 CSS 中无 `color-mix()` 值
- [ ] 在 Chrome 99 中页面正常加载
- [ ] 主题切换功能正常
- [ ] 代理列表功能正常
- [ ] 设置页面功能正常
- [ ] 连接列表功能正常
- [ ] 日志页面功能正常
- [ ] 动画效果正常
- [ ] 响应式布局正常
