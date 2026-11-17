// 纯静态断言：不解构 DSH，只对 lib/client.js 与 lib/index.js 做文本/提取级校验。
// 运行：node tests/appearance-pure.test.mjs
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(root + "lib/client.js", "utf8");
let fail = 0;
const ok = (cond, name) => {
  console.log((cond ? "PASS" : "FAIL") + "  " + name);
  if (!cond) fail += 1;
};

// ---- CSS 数组可提取（与宿主运行时等价的拼接） ----
const arrStart = src.indexOf("var CSS = [");
const arrEnd = src.indexOf('].join("")', arrStart);
ok(arrStart !== -1 && arrEnd !== -1, "CSS array located");
let css = "";
try {
  const bgm = src.match(/var BG_SVG = "((?:[^"\\]|\\.)*)";/);
  const prelude =
    'var ACCENT = "#4D6BFE";\n' +
    (bgm ? 'var BG_SVG = "' + bgm[1] + '";\n' : "") +
    'var BG_URL = "data:image/svg+xml," + encodeURIComponent(BG_SVG || "");\n';
  css = new Function(prelude + src.slice(arrStart, arrEnd + 1) + "\nreturn CSS;")();
  if (Array.isArray(css)) css = css.join("");
  ok(true, "CSS array evaluates");
} catch (e) {
  ok(false, "CSS array evaluates (" + e.message + ")");
}

// ---- 壁纸：独立 fixed 伪元素层（透明窗口下 body 背景/attachment:fixed 不渲染） ----
ok(css.includes('html body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;'), "wallpaper on html body::before fixed layer");
ok(!css.includes("background-attachment"), "no background-attachment anywhere");
ok(css.includes("background-position:left bottom"), "wallpaper anchored left bottom");
ok(css.includes("html body{--das-bg-veil:rgba(255,255,255,0.80);"), "light veil strengthened on html body");
ok(css.includes("html body[data-ds-dark-theme]{--das-bg-veil:rgba(15,17,21,0.88);"), "dark veil strengthened on html body dark");
ok(
  css.includes("html body,html body[data-ds-dark-theme]{--dsw-alias-bg-base:transparent") &&
    css.includes("--dsw-specific-sidebar-fill:transparent"),
  "page-level tokens transparent (html body prefix)",
);
ok(!css.includes("--dsw-alias-bg-layer-1:transparent"), "layer tokens untouched");
ok(
  src.includes('var BG_URL = "data:image/svg+xml," + encodeURIComponent(BG_SVG)'),
  "BG_URL builder intact",
);

// ---- 新画稿内联 ----
const m = src.match(/var BG_SVG = "((?:[^"\\]|\\.)*)";/);
ok(!!m, "BG_SVG literal found");
if (m) {
  const svg = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  ok(svg.startsWith("<svg") && svg.endsWith("</svg>"), "svg literal well-formed");
  ok(svg.includes('id="paint0_linear_4_3"'), "new art gradient paint0 present");
  ok(svg.includes('fill="url(#paint0_linear_4_3)"'), "background rect consumes paint0");
  ok(!svg.includes("das-sky") && !svg.includes("das-wave1"), "no old-art ids");
  ok(!svg.includes("<clipPath") && !svg.includes("clip-path"), "no clip residue");
  ok((svg.match(/<svg/g) || []).length === 1, "single svg root");
}

// ---- 修复一：插件页吸顶条（单条 sticky bar，data-natural 常驻，覆盖两态） ----
ok(
  css.includes(
    "[class*=pageBar][data-natural]::before{background:rgba(255,255,255,0.78)",
  ),
  "sticky bar glass (light)",
);
ok(
  css.includes("body[data-ds-dark-theme] [class*=pageBar][data-natural]::before"),
  "sticky bar glass (dark)",
);
ok(css.includes("box-shadow:0 14px 24px -18px"), "sticky bar bottom shadow");
ok(
  !css.includes("[data-compact]:not([data-natural])"),
  "dead compact-only rule removed",
);

// ---- 修复二：更多菜单不透明 ----
ok(css.includes("[class*=_menu_]{background:#fff"), "menu opaque white (light)");
ok(
  css.includes("body[data-ds-dark-theme] [class*=_menu_]{background:#303136"),
  "menu opaque (dark)",
);

// ---- 修复三：输入卡片 / 代码块半透明（html body 前缀，顺序无关） ----
ok(
  css.includes(
    "html body,html body[data-ds-dark-theme]{--dsw-specific-input-major:var(--das-input-glass)",
  ),
  "input-major token glassed",
);
ok(
  css.includes("--dsw-alias-markdown-code-block:var(--das-code-glass)"),
  "code block token glassed",
);
ok(
  css.includes(
    "--dsw-alias-markdown-code-block-banner:var(--das-code-banner-glass)",
  ),
  "code banner token glassed",
);
ok(
  css.includes("html body{--das-input-glass:rgba(255,255,255,0.55)") &&
    css.includes("html body[data-ds-dark-theme]{--das-input-glass:rgba(30,30,32,0.62)"),
  "glass alphas light+dark",
);
ok(
  css.includes("[class]:has(>[data-code-block-banner])") &&
    css.includes("[class*=ZLxKW_card]"),
  "blur enhancers present",
);

// ---- v1.0.4 评审修复：牌堆 / 灯箱 / 触发条 hover ----
ok(css.includes("body [class*=_62bJbq_card]{background:rgba(255,255,255,0.92);"), "notification deck near-opaque (light)");
ok(css.includes("body[data-ds-dark-theme] [class*=_62bJbq_card]{background:rgba(30,30,32,0.92);"), "notification deck near-opaque (dark)");
ok(css.includes("[class*=_image_19zw2_26]") && css.includes("[class*=jWVBHG_arrow]"), "lightbox surface restored");
ok(css.includes("body [class*=CuF05a_root]:hover{background:rgba(255,255,255,0.72);"), "turn-trigger hover glass (light)");
ok(css.includes("body[data-ds-dark-theme] [class*=CuF05a_root]:hover"), "turn-trigger hover glass (dark)");

// ---- v1.0.5：+ 弹层 menu token 钉白底 / 主题切换 switch ----
ok(
  css.includes("html body{--dsw-specific-menu:#fff;--dsw-menu-surface-fill:#fff;") &&
    css.includes("html body[data-ds-dark-theme]{--dsw-specific-menu:#303136;--dsw-menu-surface-fill:#303136;}"),
  "menu surface tokens opaque (light+dark)",
);
ok(
  css.includes(".das-theme-switch{") &&
    css.includes(".das-theme-switch[data-dark=true] .das-theme-switch__knob{transform:translateX(12px);"),
  "theme switch css present",
);
// ---- v1.0.6：主题 switch 落位 sidebar.brand.name（single 槽 priority -1 遮蔽）----
ok(
  !src.includes('ctx.slots.inject("shell.leading"'),
  "no shell.leading registration (v1.0.5 boot-crash regression)",
);
ok(
  src.includes('ctx.slots.inject("sidebar.brand.name"') &&
    src.includes("priority: -1") &&
    src.includes('registrant: "dsh-appearance-suite"'),
  "sidebar.brand.name occupied at priority -1 with registrant stamp",
);
ok(
  src.includes('require("@deepseek-ai/dsh-client-ui-primitives")') &&
    src.includes("DSH_PRIMITIVES.BrandWordmark") &&
    src.includes("includeMark: false"),
  "official BrandWordmark re-rendered via primitives",
);
ok(css.includes(".das-brandrow{"), "brand row container css present");
ok(
  src.includes('ctx.on("theme/change"') && src.includes('APP_CTX = ctx;') &&
    src.includes('svc.setTheme(next)'),
  "official theme service toggle wired",
);

// ---- 回归：余额胶囊 / slots（无自制 plugin-market） ----
ok(css.includes(".das-chip{"), "chip css intact");
ok(!css.includes(".das-market__"), "custom npm market panel css removed");
ok(
  src.includes("conversation.session.header.utilities") &&
    src.includes("sidebar.brand.name") &&
    !src.includes('key: PANEL_ID') &&
    !src.includes('id: PANEL_ID') &&
    !src.includes('ctx.slots.inject("main"'),
  "slot registrations: balance + brand only",
);

// ---- v1.0.8：组合包图标走 package.json icon（已安装列表 artwork）----
const pkg = JSON.parse(readFileSync(root + "package.json", "utf8"));
ok(pkg.icon === "assets/icon.svg", "package.json icon field");
ok(existsSync(root + "assets/icon.svg"), "assets/icon.svg shipped");
ok(pkg.version === "1.0.9", "package version 1.0.9");
ok(pkg.name === "dsh-appearance-suite", "npm package name");

console.log(fail ? `\n${fail} FAILED` : "\nall green");
process.exit(fail ? 1 : 0);
