# Chrome 99 完整兼容性设计方案

**日期:** 2026-06-22
**状态:** 已批准
**目标:** 将 zashboard 项目改造为完全兼容 Chrome 99

---

## 1. 背景与问题

### 1.1 当前技术栈
- **前端框架:** Vue 3.5 + TypeScript 6
- **构建工具:** Vite 7
- **CSS 框架:** Tailwind CSS v4 + DaisyUI v5
- **其他依赖:** @vueuse/core v14、echarts v6、@xterm/xterm v6 等

### 1.2 Chrome 99 兼容性问题

#### JavaScript/TypeScript
源代码使用的现代 JS 特性（optional chaining、nullish coalescing、BigInt、async/await 等）在 Chrome 99 中已支持。但 Vite 7 默认目标是现代浏览器，需要显式设置构建目标。

#### CSS（主要问题）
项目大量使用了 Chrome 99 不支持的 CSS 特性：

1. **`oklch()`** — Chrome 111+ 才支持
   - 用于 DaisyUI v5 主题颜色定义（framework.css）
   - 用于自定义组件样式（components.css）
   - 用于 Tailwind 配置中的颜色值（tailwind.config.ts）

2. **`color-mix()`** — Chrome 111+ 才支持
   - 用于动态颜色混合（override.css）
   - 用于焦点状态、悬停效果
   - 用于动画关键帧（motion.css）

---

## 2. 设计方案

### 2.1 构建目标配置

**文件:** `vite.config.ts`

在 Vite 配置中添加 `build.target: 'chrome99'`，让 esbuild 将所有 JS 转译为 Chrome 99 兼容的语法。

```typescript
export default defineConfig({
  // ... 其他配置
  build: {
    target: 'chrome99',
  },
})
```

**影响范围:**
- 所有 `.ts`、`.vue` 文件
- 所有第三方依赖（@vueuse/core、echarts 等）
- 动态导入的模块

### 2.2 CSS 兼容性处理

**文件:** `postcss.config.js`

添加 PostCSS 插件来转换现代 CSS 特性：

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

**插件说明:**
- `@csstools/postcss-oklab-function`: 将 `oklch()` 转换为 `srgb` 格式
- `@csstools/postcss-color-mix-function`: 将 `color-mix()` 转换为兼容格式
- `preserve: false`: 不保留原始值，只输出兼容格式

**重要:** PostCSS 插件的顺序很重要 — 必须在 `@tailwindcss/postcss` 之后运行，这样 Tailwind 生成的 CSS 也会被转换。

### 2.3 依赖兼容性检查

**需要检查的关键依赖:**

| 依赖 | 版本 | Chrome 99 兼容性 | 处理方式 |
|------|------|-----------------|---------|
| @vueuse/core | v14 | ⚠️ 需要检查 | Vite build.target 会处理 JS 语法 |
| echarts | v6 | ⚠️ 需要检查 | Vite build.target 会处理 JS 语法 |
| @xterm/xterm | v6 | ⚠️ 需要检查 | Vite build.target 会处理 JS 语法 |
| @tanstack/vue-table | v8 | ✅ 应该兼容 | 无需处理 |
| @tanstack/vue-virtual | v3 | ⚠️ 需要检查 | Vite build.target 会处理 JS 语法 |
| vue | v3.5 | ✅ 兼容 | 无需处理 |
| vue-router | v5 | ✅ 兼容 | 无需处理 |
| vue-i18n | v11 | ⚠️ 需要检查 | Vite build.target 会处理 JS 语法 |
| axios | v1 | ✅ 兼容 | 无需处理 |

**处理策略:**
1. 设置 `build.target: 'chrome99'` 后，esbuild 会自动转译所有 JS 语法
2. 如果依赖使用了 Chrome 99 不支持的 **API**（不是语法），需要添加 polyfill
3. 构建后测试，如果发现 API 不兼容，添加相应的 polyfill

---

## 3. 实施步骤

### 步骤 1：修改 Vite 配置
- 文件: `vite.config.ts`
- 添加 `build.target: 'chrome99'`

### 步骤 2：安装 PostCSS 插件
```bash
pnpm add -D @csstools/postcss-oklab-function @csstools/postcss-color-mix-function
```

### 步骤 3：修改 PostCSS 配置
- 文件: `postcss.config.js`
- 添加 PostCSS 插件配置

### 步骤 4：构建测试
```bash
pnpm build
```

### 步骤 5：功能测试
- 在 Chrome 99 中打开构建后的应用
- 测试所有主要功能
- 检查视觉效果

### 步骤 6：修复问题
- 如果发现兼容性问题，添加相应的 polyfill 或调整配置

---

## 4. 风险与缓解

### 4.1 CSS 转换可能不完整
**风险:** 某些 `oklch()` 或 `color-mix()` 的复杂用法可能无法被 PostCSS 插件正确转换。

**缓解:** 构建后检查输出 CSS，如果发现未转换的值，手动替换为兼容格式。

### 4.2 依赖 API 不兼容
**风险:** 某些依赖可能使用了 Chrome 99 不支持的 API（如 `structuredClone`、`Array.prototype.at` 等）。

**缓解:** 添加相应的 polyfill（如 `core-js`）。

### 4.3 性能影响
**风险:** CSS fallback 值可能增加文件大小。

**缓解:** 启用 CSS 压缩，检查输出文件大小。

---

## 5. 验证标准

### 5.1 构建验证
- [ ] `pnpm build` 成功完成
- [ ] 输出文件大小合理（不超过原始大小的 150%）

### 5.2 功能验证
- [ ] 页面路由正常工作
- [ ] 代理列表正确显示
- [ ] 设置页面功能正常
- [ ] 连接列表正确显示
- [ ] 日志查看功能正常

### 5.3 视觉验证
- [ ] 主题颜色正确显示
- [ ] 动画效果正常
- [ ] 响应式布局正常

### 5.4 性能验证
- [ ] 页面加载速度合理
- [ ] 交互响应流畅

---

## 6. 附录

### 6.1 Chrome 99 支持的关键特性
- ES2022: top-level await、class fields、static blocks
- CSS: `@layer`、`backdrop-filter`、`gap` in flexbox
- API: `fetch`、`AbortController`、`IntersectionObserver`

### 6.2 Chrome 99 不支持的关键特性
- CSS: `oklch()`、`color-mix()`、`@property`、`@container`
- JS API: `structuredClone`（Chrome 98+）、`Array.prototype.group`（Chrome 117+）

### 6.3 相关文件
- `vite.config.ts` — Vite 配置
- `postcss.config.js` — PostCSS 配置
- `tailwind.config.ts` — Tailwind 配置
- `src/assets/styles/framework.css` — DaisyUI 主题定义
- `src/assets/styles/components.css` — 自定义组件样式
- `src/assets/styles/override.css` — 样式覆盖
- `src/assets/styles/motion.css` — 动画样式
