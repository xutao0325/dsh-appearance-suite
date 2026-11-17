# dsh-appearance-suite — 外观增强套件

npm 包名：`dsh-appearance-suite` · 发布步骤见 [PUBLISH.md](./PUBLISH.md)

面向 **DeepSeek Harness 桌面端（DSH）0.2.2-rc.x** 的零侵入外观插件：
全部 UI 经官方 slots 扩展点注入，不改任何内置包文件、无外部上报。

## 功能

### 1. 对话界面顶部 · 剩余金额显示（小眼睛开关）

- 位置：会话头右侧工具区（`conversation.session.header.utilities`，追加式 list 槽）
- 展示：`🪙 余额 ¥12.34 👁`——金额后的**小眼睛按钮**控制显示/隐藏：
  睁眼=显示金额，闭眼=金额变为 `••••`；偏好持久化（localStorage）
- 金额与主题强调色为 **DeepSeek 品牌蓝 `#4D6BFE`**（深浅主题均适配）
- 多币种时 `¥… · $…` 并列，赠金在悬浮提示中展示
- 每 60 秒自动刷新；账户状态变化（`account-ui/change`）时立即刷新
- 数据链（逐级降级，全部只读本机，不外发凭据，整链 12s 超时兜底）：
  1. 官方 RPC `remote.account.getBalance`（Host 持有平台凭据，浏览器侧零凭据；
     返回 `{ok, value}` 包装结果，与官方账户页用法一致）
  2. 账户设置页已取到的快照（`accountUi.details.balance`，零网络先上屏）
  3. 同源网关 unary RPC `POST /api/account/getBalance`（8s abort，HttpOnly cookie 自动携带）
- 未登录 / 失败 / 服务缺失时显示「未登录 / — 」，不报错、不阻塞

### 2. 组合包图标（已安装列表）· 插件市场入口

- **v1.0.8**：红圈目标在「插件 → 已安装」列表行左侧图标，不是侧栏 tab。
  在 `package.json` 设置 `"icon": "assets/icon.svg"`（Q 版蓝色鲨鱼娘 512×512，
  与 v1.0.7 素材同源），并随包发布；插件管理 UI 经 `pkg.meta.icon` 渲染
  `PackageArtwork`。
- **插件市场**：使用 profile 已安装的 **`dshmarket`**（侧栏 `sidebar.panellist`
  id=`dsh-market`）。本套件 **v1.0.8 起已移除** 自制 `plugin-market` tab 与
  npm 外链面板，避免与官方市场重复。

### 3. 整体背景壁纸 · 海浪 Q 版蓝色鲨鱼娘（1920×1080 插画）

- 整个应用背景铺一幅 **海浪场景插画**：纵向海洋渐变天空 + 四层波浪 + 三条浪尖
  高光线，**Q 版蓝色鲨鱼娘站在画面左侧中部**（裙摆水色、粉色腮红、挥手姿态），
  1920×1080 全景构图
- 实现方式：SVG 压缩（空白折叠 + 坐标 1 位小数 + 去无用 clipPath，623KB→468KB）
  后以 data URL 内联进 client.js（编码后约 617KB，**不依赖任何静态资源**——
  DSH 不给插件提供静态文件服务，内联是唯一可靠途径；本地盘加载无网络开销）
- **壁纸画在独立的 `position:fixed` 伪元素层**（`html body::before`，`z-index:-1`、
  `pointer-events:none`，inset 铺满视口），而不是 body 背景：body 背景 = 根背景 +
  `background-attachment:fixed`，在桌面端的**透明窗口**（Electron
  `backgroundColor:"#00000000"` + `vibrancy:"sidebar"`）合成路径下不渲染——
  v1.0.2/v1.0.3 的壁纸在真实应用里从未显示过（桌面透出的是毛玻璃化的系统壁纸，
  症状是"一层淡灰绿"）；fixed 伪元素与应用自身的菜单/浮层走同一条普通合成路径，
  可靠。浏览器预览（不透明窗口）测不出该失败，此坑只能在真机复现
- 内容可读性：壁纸上叠一层白/暗色蒙版（`--das-bg-veil`），浅色主题
  `rgba(255,255,255,0.80)`，暗色主题 `rgba(15,17,21,0.88)`——壁纸退为隐约衬底，
  只能"隐约看到一点"，不与正文争对比度（v1.0.5 按用户反馈从 0.62/0.82 加重）
- 透明化策略：只把**页面级底色** token（`--dsw-alias-bg-base` 与
  `--dsw-specific-sidebar-fill`）置为 `transparent`——应用外壳 AppFrame 的主区域
  与侧栏消费的正是这两个 token，壁纸由此透出；**浮层表面 token
  `--dsw-alias-bg-layer-1/2/3` 保持原值**（官方把它们用作设置面板、卡片、
  悬浮预览的表面，以及红底徽章/tooltip 的反色文字色，置透明会导致浮层失底、
  文字消失），卡片与浮层照常不透明地浮在壁纸上
- 位置 `left bottom` + `cover`：新画稿角色在左侧中部，窗口比例变化时保住角色主体
- 所有 body 级 token 覆写统一用 `html body` / `html body[data-ds-dark-theme]`
  前缀——官方包的 CSS 也是运行时动态注入（`style[data-plugin]`，与插件存在
  注入顺序竞速），加前缀后级联与注入先后无关
- v1.0.4 表面修复（官方 CSS 的类名/属性均已从 0.2.2-rc.3 构建产物核实，子串匹配耐受 hash）：
  1. **插件页吸顶条**：官方吸顶白条画在 `--dsw-alias-bg-base` 上，被透明化后滚动时
     正文从标题下穿过。改为白玻璃（`backdrop-filter: blur`）+ 底部投影。官方实现是
     "单条 sticky bar + 属性切换"（`data-natural` 常驻，`data-compact` 由滚动在同一条上
     toggle），玻璃面同时覆盖两态
  2. **「更多」弹层菜单**：官方 `_menu_*` 面板只有边框没画底色（vanilla 主题靠白色
     侧栏遮底），壁纸上会露出下层文字。给所有 `_menu_*` 面板不透明白底（暗色主题
     `#303136`）+ 圆角 + 官方 `--dsw-elevation-prominent` 投影
  3. **输入卡片与代码块半透明模态框**：输入卡片族共用 token
     `--dsw-specific-input-major`（输入框/附件托盘/审批卡/提问卡），代码块走
     `--dsw-alias-markdown-code-block` 及 banner 变体，统一改为半透明
     （浅 `rgba(255,255,255,0.55)` / 暗 `rgba(27..30,27..30,28..32,0.6..0.62)`；
     banner 语言条更透：浅 0.38 / 暗 0.5），
     并按运行时类名/结构（`ZLxKW_card`、`[class]:has(>[data-code-block-banner])`）
     叠加 backdrop blur——hash 是版本增强，token 半透明不依赖它
  4. **评审修复（对抗式评审工作流确认）**：账户通知牌堆的后排卡会透过半透明前排卡
     显影，钉回近不透明（`_62bJbq_card`，浅 0.92 / 暗 0.92）；图片灯箱底面/关闭钮/
     弹出箭头恢复官方不透明表面色；聊天回合触发条 hover 从"瞬间近透明"改为更实的
     玻璃面（官方语义是 hover 微加深）
  5. **「+」弹出层与全部 menu 表面（v1.0.5）**：命令弹层、docks 等消费
     `--dsw-specific-menu` / `--dsw-menu-surface-fill`（官方浅 `#f8f9faf0`、深
     `#303136f0`，均带透明度），壁纸下透字。钉为不透明：浅 `#fff` / 深 `#303136`

### 4. 侧栏顶部 · 浅/暗主题切换 switch（v1.0.6 重做落位）

- 位置：**侧栏品牌行**（最顶部 DeepSeek 字标旁）。宿主 `sidebar.brand.name`
  是 single 槽：`lowest renders`（同槽不同 priority 共存，只渲染最低者；同
  priority 会 throw）。官方占位者注册在默认 priority 0，本插件以 **priority -1**
  遮蔽之，并通过官方原语包（`@deepseek-ai/dsh-client-ui-primitives`，静态内嵌
  模块）**原样重渲染**同一个 `BrandWordmark`（`includeMark:false`）再追加
  switch —— 视觉与官方零差异，多出一颗 26×14 的 switch（暗色时轨道染
  DeepSeek 蓝、滑块右移）。替换语义是官方 API 文档明示的用法（该槽
  `replaceRisk: shadows-shipped-ui`，"deployments may replace … without
  replacing the surrounding controls"）
- 点击走**官方 `theme` 服务** `setTheme('light'|'dark')`——与设置页「外观」同一
  写入通道：持久化到 Host 用户设置文档、广播 `theme/change`、全应用（含开机
  boot script）一致生效；官方服务缺失时兜底直接切 body 属性（会话内生效）
- 状态对齐：监听 `theme/change` 中继 + 2s 轮询兜底（系统偏好/设置页改动也能跟上）
- 侧栏收起为 56px 栏轨时品牌行不渲染，switch 随之隐藏（栏轨无空间，属预期）
- ⚠️ **v1.0.5 事故记录**：最初把 switch 注册进 `shell.leading`（窗口 chrome
  座位）——它也是 single 槽且官方 `dsh-client-ui-sidebar` 以默认 priority 0
  占用，同优先级注册使该 **required entry 激活失败，整个 web boot 中止**，
  应用弹「无法启动」对话框。教训：① 给 single 槽注册必须显式传**不同
  priority**；② `shell.leading` 还只在侧栏收起/抽屉模式挂载
  （`leadingMounted = drawer || darwin && sidebarCollapsed`），正常展开态
  根本不渲染，本来就不是常驻控件的家。v1.0.6 根治：不同优先级 + 换座位
- 已知取舍（bg-base 透明带来的次要影响，均不影响可读性）：
  compaction 折叠吸顶钮的遮罩（聊天页 sticky，非插件页吸顶条）与输入框上方正文的
  渐隐淡出会失效——正文改为从毛玻璃输入卡片后穿过，可读性由玻璃面保证；
  实验性 stats 页的 failPill 反色文字不可见；附件缩略图轨道两端的圆形滚动箭头
  随 input-major 玻璃化，叠图处轻微透底（图标仍清晰）

## 安装

**已发布（npm）：**

```bash
dsh plugin --profile desktop add dsh-appearance-suite
```

**本机开发（link）：**

```bash
dsh plugin --profile desktop add "/path/to/dsh-appearance-suite"
```

安装后**重启 DeepSeek Harness**（desktop profile 无 HMR）。

若 profile 里仍是旧的 `@local/dsh-appearance-suite`，请先 `remove` 再按上面对应方式 `add`。

## 卸载

```bash
dsh plugin --profile desktop remove dsh-appearance-suite
```

或在「插件」页关闭该组合包后重启。

## 兼容性

- `engines.dsh: >=0.2.2-rc.0 <0.3.0-0`（0.2.2-rc.3 实测目标版本）
- 仅依赖官方扩展点：`conversation.session.header.utilities`、
  `sidebar.brand.name`（priority -1 遮蔽占位，
  重渲染官方字标 + 追加 switch）——list 槽均为追加式；brand.name 是 single 槽
  的**遮蔽式替换**（官方文档明示用法，不同 priority 共存，不炸启动）；
  主题切换额外调用官方 `theme` 服务（与设置页同通道），并 require 官方原语包
  重渲染字标（静态内嵌模块，缺失时文本兜底）
- 背景功能额外让位 2 个页面级底色 token，并覆写 3 个表面 token（输入卡片/代码块/
  banner，见上）与 `_menu_*`/`pageBar` 运行时类名——均为 CSS 变量与选择器层面的
  覆写，不改任何内置包文件；卸载插件即完全恢复
- 唯一 cordis inject 为 `slots`；其余服务经 `ctx.get()` 无门禁读取，缺失即降级

## 文件结构

```
dsh-appearance-suite/
├── package.json        # dsh.bundle.patch + dsh.client(platform=web)
├── cordis.patch.yml    # insert: 组合行 id=dsh-appearance-suite
├── lib/index.js        # 宿主半边（浏览器-only 模式，无宿主行为）
├── lib/client.js       # 浏览器半边（背景壁纸 + 余额胶囊 + 主题 switch + 表面修复）
├── assets/icon.svg         # 组合包图标（已安装列表；package.json icon）
├── assets/shark-bg.svg     # 壁纸源稿（1920×1080，仅作创作底稿）
├── assets/shark-bg.min.svg # 压缩产物（已内联进 client.js）
└── locale/zh.json      # 「插件」页展示元信息
```
