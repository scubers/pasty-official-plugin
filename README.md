# Template Plugin

`plugins/template-plugin/` 是给 Pasty 插件作者准备的最小全功能模板工程。

它保留了 `all-plugin-demo` 的核心开发体验：

- manifest + source-based runtime / UI 构建流程
- 内嵌源码版 runtime SDK 与 UI bridge SDK
- detector / attachment renderer / `auto-run action` / `draft action + UI`
- `npm run build` + `npm test` + `scripts/verify-build.mjs`

但它去掉了 demo 业务依赖和示例逻辑，只保留能直接改造的模板骨架。

## 1. 适合拿它做什么

这个模板适合直接作为新插件起点：

- 改 `manifest.json` 里的 `plugin.id`、`title`、`attachmentType`
- 替换 `src/runtime/` 里的 detector / renderer / action 逻辑
- 替换 `src/ui/` 里的 renderer 页面和 draft action 页面
- 保留 `src/runtime/sdk/` 与 `src/ui/sdk/` 作为内嵌 helper

如果你想看更完整、更像“功能演示”的作者案例，再看 `plugins/all-plugin-demo/`。

## 2. 工程结构

```text
template-plugin/
├── README.md
├── manifest.json
├── package.json
├── package-lock.json
├── scripts/
│   ├── build-runtime.mjs
│   ├── build-ui.mjs
│   ├── install.mjs
│   └── verify-build.mjs
├── src/
│   ├── runtime/
│   │   ├── index.js
│   │   ├── sdk/
│   │   ├── detectors/
│   │   │   └── templateDetector.js
│   │   ├── renderers/
│   │   │   └── templateRenderer.js
│   │   ├── actions/
│   │   │   ├── templateAutoAction.js
│   │   │   └── templateDraftAction.js
│   │   └── shared/
│   │       └── templateAttachmentPayload.js
│   └── ui/
│       ├── AttachmentTemplateApp.vue
│       ├── DraftActionTemplateApp.vue
│       ├── sdk/
│       ├── composables/
│       ├── shared/
│       ├── renderers/template-renderer/
│       └── actions/template-draft-action/
├── tests/runtime/
│   └── templateCapabilities.test.cjs
└── dist/
```

## 3. 模板里已经演示的能力

### detector

- 文件：`src/runtime/detectors/templateDetector.js`
- 输入：`text`
- 输出：一个 `plugin.template.full.preview` attachment
- 作用：演示如何从 `input.content.payload.text` 生成结构化 payload

### attachment renderer

- 文件：`src/runtime/renderers/templateRenderer.js`
- UI：`src/ui/renderers/template-renderer/`
- 作用：演示 `resolveAttachment()`、`invokeOperation()`、按钮回调和 attachment bootstrap

### auto-run action

- 文件：`src/runtime/actions/templateAutoAction.js`
- 作用：演示无 UI action 如何读取 item 文本并返回 `text` 结果

### draft action

- 文件：`src/runtime/actions/templateDraftAction.js`
- UI：`src/ui/actions/template-draft-action/`
- 作用：演示 `resolveSession()`、draft bootstrap、draft 更新、button invoke、`setTags` / `setPinned`

## 4. 开发流程

安装依赖并构建：

```bash
cd plugins/template-plugin
npm install
npm run build
```

运行测试：

```bash
npm test
```

本地开发时，把 `plugins/template-plugin/` 作为 `Developer Plugins` 的路径加入宿主即可。

## 5. 开始改造时优先改哪些文件

建议最先一起改这几处，避免 manifest 和 runtime 脱节：

1. `manifest.json`
2. `src/runtime/index.js`
3. `src/runtime/shared/templateAttachmentPayload.js`
4. `src/runtime/detectors/templateDetector.js`
5. `src/runtime/renderers/templateRenderer.js`
6. `src/runtime/actions/templateAutoAction.js`
7. `src/runtime/actions/templateDraftAction.js`

如果你改了下面这些 ID / 类型名，记得同步改全套引用：

- `plugin.id`
- `attachmentRenderers[].id`
- `detectors[].id`
- `actions[].id`
- `attachmentType`
- UI 入口路径 `uiEntry`

## 6. 哪些文件通常不需要改

除非你要换构建链路，否则一般直接保留：

- `src/runtime/sdk/**`
- `src/ui/sdk/**`
- `src/ui/composables/**`
- `scripts/build-runtime.mjs`
- `scripts/install.mjs`

## 7. 验证约定

模板自带了三层验证：

- `npm test`
  - 校验 manifest、runtime handler、最小行为
- `npm run build`
  - 产出 runtime bundle 和 UI bundle
- `node ./scripts/verify-build.mjs`
  - 校验构建产物路径和关键 runtime 注册项

如果你替换了页面名称、action ID 或 renderer ID，记得同步更新对应测试和 `verify-build.mjs`。
