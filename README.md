# dsh-mobile-topbar

A DeepSeek Harness (DSH) Web UI plugin that turns the **left sidebar into a top bar on phone-sized screens** (viewport ≤ 768px).

[中文说明](#中文说明) · [Install](#install) · [How it works](#how-it-works) · [Troubleshooting](#troubleshooting)

---

## What it does

On a phone the shipped shell collapses the left sidebar into a 56px icon rail that still occupies the left edge, squeezing the conversation. This plugin keeps the same controls but lays them out horizontally across the top of the screen:

| | Before | After |
|---|---|---|
| Sidebar | 56px column on the left | 48px bar across the top |
| Conversation | squeezed sideways | full width |
| Sidebar expanded | squeezes the conversation | floats over it as a left drawer |
| Icon alignment | shared the rail's own paddings | one 28px baseline, 18px glyphs |

Desktop and tablet layouts are untouched — the stylesheet is scoped to `@media (max-width: 768px)`.

## Install

The bundle lives outside `node_modules`, so a DSH upgrade never overwrites it.

```
plugin_manager install_bundle  target=<absolute path to this directory>
```

Then reload the page in the browser (the browser half is fetched at page load).

Disable / remove:

```
plugin_manager set_bundle     target=<package name> enabled=false
plugin_manager remove_bundle  target=<package name>
```

## Package layout

```
package.json           bundle manifest: dsh.bundle.patch + dsh.client
cordis.patch.yml       inserts one Loader row for the plugin
index.js               Host half (empty; it only puts the plugin in the inventory)
client.js              Browser half: injects the stylesheet and marks the shell
locale/en.json         Plugin title/description shown in the plugin list
locale/zh.json         same, Chinese
icon.svg               Plugin icon
```

## How it works

1. **Mark, don't restyle by class name.** The browser half locates the shell parts
   (`frame`, sidebar column, center column, rightbar column, bottom row, sidebar
   body) and tags them with `data-mtb-*` attributes.
   Data attributes are used on purpose: `className` belongs to React, so a
   re-render would drop any class this plugin added.
2. **One media query does the layout.** The shell's three-column grid becomes a
   single column of three rows — `48px / 1fr / auto` — so the sidebar rides row 1
   as a bar, the conversation keeps row 2 and its own scrolling, and the shell
   bottom stays in row 3.
3. **Every bar item is normalised.** Each direct child of the bar is pinned to
   `28px` height and centred, and every glyph (`svg` and `img`) to `18px`, so the
   icons sit on one baseline regardless of what each contributing plugin renders.
4. **Expanded sidebar becomes a drawer** (`position: absolute`, 280px) instead of
   squeezing the conversation.

No official DSH package is modified.

## Troubleshooting

Check that the browser half loaded — in the page console:

```js
document.querySelectorAll('style[data-plugin="@local/dsh-mobile-topbar"]').length
// 0 = not loaded (reload the page), 1 = injected
```

If a DSH upgrade changes the shell DOM and the bar stops working, only
`client.js` needs adjusting:

- **Locating**: `parts()` finds the shell, `descend()` walks from the sidebar
  column down to the element that actually holds the items. If the nesting depth
  changes, adjust the `children.length >= 3` test in `descend()`.
- **Styling**: the whole stylesheet targets `data-mtb-*` attributes — no hashed
  CSS-module class names — so selector churn in DSH does not break it.
- **New vertical containers** inside the sidebar: mirror the existing
  `[data-mtb-rail]>div>*>div` rules one level deeper.

## License

MIT — see [LICENSE](LICENSE).

---

## 中文说明

把 DeepSeek Harness Web 界面在**手机宽度（≤768px）**下的左侧图标栏改成**顶部横栏**。

- 侧栏从左侧 56px 竖条变成顶部 48px 横条，对话区回到全宽
- 侧栏展开时变成左侧抽屉浮层，不再挤压正文
- 所有图标统一到同一条基线（28px 行高 / 18px 图标）
- 桌面和平板布局不受影响（样式全部在 `@media (max-width: 768px)` 内）

**安装**：`plugin_manager install_bundle target=<本目录绝对路径>`，然后刷新浏览器页面。

**原理**：浏览器半给外壳各部件打 `data-mtb-*` 属性（不用 class，因为 `className` 归 React 管，重渲染会被抹掉），再用一段媒体查询把三列 grid 变成「48px / 1fr / auto」三行，侧栏因此落在第一行变成横条。

**dsh 升级后如果失效**：只需要改 `client.js` —— `descend()` 负责从侧栏列往下钻到真正装图标的那层，层数变了就调 `children.length >= 3` 这个判断；样式全部走 `data-mtb-*` 属性选择器，不依赖任何哈希类名。

**没有改动任何官方包**，插件装在 profile 里，升级只覆盖 `node_modules`。
