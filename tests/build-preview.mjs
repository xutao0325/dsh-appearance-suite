// 生成 assets/preview-light.html / preview-dark.html：
// 烘焙 lib/client.js 的真实 CSS 数组（含内联壁纸），配官方 hashed 类名的 mock DOM
// 与官方对手规则子集，用于静态验证 v1.0.3 三项表面修复 + 壁纸效果。
// 运行：node tests/build-preview.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(root + "lib/client.js", "utf8");

const arrStart = src.indexOf("var CSS = [");
const arrEnd = src.indexOf('].join("")', arrStart);
if (arrStart === -1 || arrEnd === -1) throw new Error("CSS array not found");
const bgm = src.match(/var BG_SVG = "((?:[^"\\]|\\.)*)";/);
if (!bgm) throw new Error("BG_SVG literal not found");
const realCss = new Function(
  'var ACCENT = "#4D6BFE";\n' +
    'var BG_SVG = "' + bgm[1] + '";\n' +
    'var BG_URL = "data:image/svg+xml," + encodeURIComponent(BG_SVG);\n' +
    src.slice(arrStart, arrEnd + 1) +
    "\nreturn CSS;",
)();
const realCssStr = Array.isArray(realCss) ? realCss.join("") : realCss;

// 官方规则子集（specificity 与真实产物一致；真实插件 CSS 会追加在本段之后）
const officialCss = `
  :root { color-scheme: light; }
  body{ --dsw-alias-bg-base:#ffffff; --dsw-specific-sidebar-fill:#f7f8fa;
    --dsw-specific-input-major:#ffffff; --dsw-alias-markdown-code-block:#f9fafb;
    --dsw-alias-markdown-code-block-banner:#f9fafb;
    --dsw-alias-border-l1:#eceef1; --dsw-alias-border-l2:#e4e7eb; --dsw-alias-border-l3:#d8dce2;
    --dsw-alias-label-primary:#17181a; --dsw-alias-label-secondary:#4c4f55; --dsw-alias-label-tertiary:#82868d;
    --dsw-alias-interactive-bg-hover:rgba(0,0,0,.05);
    --dsw-radius-lg:12px; --dsw-radius-panel:16px; --dsw-radius-md:8px;
    --dsw-elevation-soft:0 1px 3px rgba(15,23,42,.08),0 0 0 .5px var(--dsw-alias-border-l2);
    --dsw-elevation-prominent:0 12px 32px rgba(15,23,42,.16),0 0 0 .5px var(--dsw-alias-border-l1);
    --ds-font-family-code:ui-monospace,SFMono-Regular,Menlo,monospace;
    margin:0; font:14px/1.5 -apple-system,"PingFang SC",sans-serif; color:var(--dsw-alias-label-primary); }
  /* 官方 body 对手规则（宿主 bundle / 主题包构建产物原样摘录）：
     静态 link 的两条 background 简写 + 主题动态注入的 token dump 尾部长写与 isolation。 */
  body{font-family:var(--dsw-font-family,-apple-system);background:var(--dsw-alias-bg-base,#fff);text-autospace:normal;}
  body{background:transparent;}
  body{background-color:var(--dsw-alias-bg-base);}
  body{isolation:isolate;}
  body[data-ds-dark-theme]{--dsw-alias-bg-base:#17181a; --dsw-specific-sidebar-fill:#1c1d20;
    --dsw-specific-input-major:#2c2c2e; --dsw-alias-markdown-code-block:#1b1b1c;
    --dsw-alias-markdown-code-block-banner:#2c2c2e;
    --dsw-alias-border-l1:#2e3033; --dsw-alias-border-l2:#383a3e; --dsw-alias-border-l3:#46484d;
    --dsw-alias-label-primary:#f2f3f5; --dsw-alias-label-secondary:#b4b8be; --dsw-alias-label-tertiary:#7e838a;
    --dsw-alias-interactive-bg-hover:rgba(255,255,255,.08);
    --dsw-elevation-soft:0 1px 3px rgba(0,0,0,.5),0 0 0 .5px var(--dsw-alias-border-l2);
    --dsw-elevation-prominent:0 12px 32px rgba(0,0,0,.55),0 0 0 .5px var(--dsw-alias-border-l1); }

  /* —— 官方对手规则（0.2.2-rc.3 构建产物原样摘录，类名同 hash） —— */
  .w6M7KW_pageBar{position:relative;display:flex;flex-direction:column;width:100%;box-sizing:border-box;padding-inline:32px}
  .w6M7KW_pageBar[data-natural]{height:64px;z-index:2;pointer-events:none;position:sticky;top:0}
  .w6M7KW_pageBar[data-natural]:before{content:"";height:var(--plugin-header-paint-height,64px);background:var(--dsw-alias-bg-base);pointer-events:none;position:absolute;inset:0 0 auto}
  .w6M7KW_pageBar[data-natural] .w6M7KW_pageHead{pointer-events:auto;padding-top:0;height:64px;position:relative;display:flex;align-items:center;justify-content:space-between}
  .w6M7KW_pageBar[data-compact]:not([data-natural]){padding-bottom:12px}
  .w6M7KW_pageBar[data-compact]:not([data-natural]):after{content:"";position:absolute;inset-inline:0;bottom:0;border-bottom:.5px solid var(--dsw-alias-border-l3);pointer-events:none}
  ._menu_123xe_576{position:fixed;z-index:70;display:flex;flex-direction:column;min-width:96px;padding:4px;border:.5px solid var(--dsw-alias-border-l2)}
  ._menuItem_123xe_590{padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:13px;text-align:left;background:transparent;border:none;border-radius:var(--dsw-radius-md);cursor:pointer;font:inherit}
  .ZLxKW_card{box-sizing:border-box;width:100%;border-radius:var(--dsw-radius-panel);background:var(--dsw-specific-input-major);box-shadow:var(--dsw-elevation-soft)}
  .dasCodeCard{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font-family:var(--ds-font-family-code);font-size:12.5px;overflow:hidden}
  .dasCodeBanner{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:var(--dsw-alias-markdown-code-block-banner);border-bottom:.5px solid var(--dsw-alias-border-l2);font-size:11px;color:var(--dsw-alias-label-tertiary)}
  .dasCodeBody{margin:0;padding:12px 14px;white-space:pre;color:var(--dsw-alias-label-primary)}

  /* —— mock 布局（仅演示骨架，非官方） —— */
  .frame{display:grid;grid-template-columns:240px 1fr;height:100vh}
  .sidebar{background:var(--dsw-specific-sidebar-fill);border-right:.5px solid var(--dsw-alias-border-l2);padding:16px 12px;position:relative}
  .wsLabel{font-weight:600;margin:0 0 4px}
  .wsRow{display:flex;gap:8px;align-items:center;color:var(--dsw-alias-label-tertiary);font-size:12px;margin:10px 0}
  .main{position:relative;display:flex;flex-direction:column;min-width:0}
  .scroller{flex:1;overflow-y:auto;scrollbar-width:thin}
  .pageCol{max-width:760px;margin:0 auto;padding:0 32px}
  .pageCol h2{font-size:20px;margin:0}
  .demoCard{padding:14px 16px;border-radius:12px;margin:10px 0;color:var(--dsw-alias-label-secondary)}
  .composerRow{padding:12px 32px 16px}
  .composerRow .ZLxKW_card{padding:12px 14px;color:var(--dsw-alias-label-tertiary)}
  .chipRow{display:flex;justify-content:flex-end}
  .moreMenu{left:150px;top:210px;width:220px}
  .underMenu{position:absolute;left:12px;top:216px;width:200px;color:var(--dsw-alias-label-tertiary);font-size:12px;z-index:1}
  .note{font-size:11px;color:var(--dsw-alias-label-tertiary);padding:6px 2px}
`;

const dom = `
  <div class="frame">
    <aside class="sidebar">
      <p class="wsLabel">deepseek</p>
      <div class="wsRow">⊕ 工作区</div>
      <div class="wsRow">⌕ 搜索</div>
      <div class="underMenu">（菜单后面的侧栏文字：这一行不应透过菜单面板显示）</div>
    </aside>
    <main class="main">
      <div class="scroller" id="scroller">
        <div class="pageCol">
          <div class="w6M7KW_pageBar" data-natural>
            <div class="w6M7KW_pageHead">
              <h2>插件</h2><span style="color:var(--dsw-alias-label-tertiary)">已安装 · 浏览</span>
            </div>
          </div>
          <div style="height:24px"></div>
          <p class="note">↓ 页面已滚动：吸顶条应为白玻璃 + 底部投影，正文不得穿过标题</p>
          <div class="demoCard">内置插件配置 · 卡片一 —— 滚动内容从吸顶条下经过</div>
          <div class="demoCard">dsh-bash · 卡片二 —— 已启用</div>
          <div class="demoCard">dsh-appearance-suite · 卡片三 —— 已启用</div>
          <div class="dasCodeCard">
            <div class="dasCodeBanner" data-code-block-banner><span>bash</span><span>复制</span></div>
            <pre class="dasCodeBody">echo "code block should be a translucent modal"
dsh plugin --profile desktop list</pre>
          </div>
          <div class="demoCard">更多内容…… 保证滚动距离</div>
          <div class="demoCard">底部卡片</div>
        </div>
      </div>
      <div class="composerRow">
        <div class="ZLxKW_card">输入消息给 DeepSeek…（输入卡片应为半透明毛玻璃模态框）</div>
      </div>
    </main>
  </div>
  <div class="_menu_123xe_576 moreMenu">
    <button class="_menuItem_123xe_590">浏览更多插件</button>
    <button class="_menuItem_123xe_590">创建你的插件</button>
  </div>
  <script>
    document.getElementById("scroller").scrollTop = 220; // 静置在滚动态以展示吸顶玻璃
  <\/script>
`;

function page(dark) {
  const attr = dark ? ' data-ds-dark-theme="true"' : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>dsh-appearance-suite preview (${dark ? "dark" : "light"})</title>
<style>
${officialCss}
/* ==== 真实插件 CSS（client.js 的 CSS 数组，追加在官方子集之后 = 真实注入顺序） ==== */
${realCssStr}
</style>
</head>
<body${attr}>
${dom}
</body>
</html>
`;
}

writeFileSync(root + "assets/preview-light.html", page(false));
writeFileSync(root + "assets/preview-dark.html", page(true));
console.log(
  "preview written:",
  "light",
  page(false).length,
  "bytes; dark",
  page(true).length,
  "bytes",
);
