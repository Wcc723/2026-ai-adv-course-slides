/**
 * 簡報稽核腳本 — 逐頁檢查「內容溢出」與「文字對比度」。
 *
 * 用法（瀏覽器 console，或 Chrome MCP 的 javascript_tool）：
 *   1. 貼上整份檔案內容執行一次，註冊 window.__slideAudit
 *   2. await __slideAudit('#/showcase/layouts', 10)
 *      第一個參數是路由 hash，第二個是總步驟數
 *
 * 也可以只跑目前這一頁：
 *   __slideAuditOnce()
 *
 * 為什麼用瀏覽器內量測而不是截圖：在高 DPR 螢幕上截圖會被裁切與非等比縮放，
 * 看起來像溢出但其實沒有；而且截圖可能是上一幀的快取。量測不會騙人。
 */
(function () {
  /**
   * 舞台底色：往上找不到不透明背景時的合成基準。
   *
   * 一定要從執行期讀 --color-ink，不能寫死。寫死深色值的話，
   * 換成亮色主題之後「沒有不透明祖先」的元素會被拿近黑去比對，
   * 淺色文字反而被判成通過 —— 量尺歪了，後面所有「通過」都不算數。
   * 字面值只當讀不到變數時的最後備援。
   */
  const STAGE_BG = (() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-ink')
      .trim();
    const m = raw.match(/^#?([\da-f]{6})$/i);
    if (m) {
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
    }
    const parts = raw.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [+parts[0], +parts[1], +parts[2], 1];
    }
    console.warn('[audit] 讀不到 --color-ink，改用備援值');
    return [244, 241, 232, 1]; // 備援：目前的 --color-ink
  })();

  const parseColor = (value) => {
    const parts = String(value).match(/[\d.]+/g);
    if (!parts || parts.length < 3) return null;
    return [
      +parts[0],
      +parts[1],
      +parts[2],
      parts[3] === undefined ? 1 : +parts[3],
    ];
  };

  const composite = (fg, bg) => [
    fg[0] * fg[3] + bg[0] * (1 - fg[3]),
    fg[1] * fg[3] + bg[1] * (1 - fg[3]),
    fg[2] * fg[3] + bg[2] * (1 - fg[3]),
    1,
  ];

  /** 往上找第一個不透明背景，沿路把半透明背景疊回去 */
  const backgroundOf = (el) => {
    const stack = [];
    let node = el;
    while (node && node !== document.documentElement) {
      const color = parseColor(getComputedStyle(node).backgroundColor);
      if (color && color[3] > 0) {
        stack.push(color);
        if (color[3] === 1) break;
      }
      node = node.parentElement;
    }
    let base = STAGE_BG;
    for (let i = stack.length - 1; i >= 0; i--) base = composite(stack[i], base);
    return base;
  };

  const luminance = (color) => {
    const channel = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return (
      0.2126 * channel(color[0]) +
      0.7152 * channel(color[1]) +
      0.0722 * channel(color[2])
    );
  };

  const contrast = (a, b) => {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  /** 只有 overflow 不是 visible 的容器才真的會裁切內容 */
  const findOverflow = () =>
    [...document.querySelectorAll('main *')]
      .filter((el) => {
        const style = getComputedStyle(el);
        if (style.overflowY === 'visible' && style.overflowX === 'visible') {
          return false;
        }
        return (
          el.scrollHeight > el.clientHeight + 2 ||
          el.scrollWidth > el.clientWidth + 2
        );
      })
      .map(
        (el) =>
          `${String(el.className).split(' ').slice(0, 3).join(' ')} → 超出 ${
            el.scrollWidth - el.clientWidth
          }w / ${el.scrollHeight - el.clientHeight}h`,
      );

  /** DOM 文字：color vs 疊算後的背景 */
  const findLowContrastText = () => {
    const issues = [];
    document.querySelectorAll('#root *').forEach((el) => {
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join('')
        .trim();
      if (!text) return;

      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0') return;

      const fg = parseColor(style.color);
      if (!fg) return;

      const bg = backgroundOf(el);
      const ratio = contrast(composite(fg, bg), bg);
      const size = parseFloat(style.fontSize);
      const isLarge = size >= 24 || (size >= 18.66 && +style.fontWeight >= 700);
      const required = isLarge ? 3 : 4.5;

      if (ratio < required) {
        issues.push(
          `${ratio.toFixed(2)} < ${required}　${Math.round(size)}px ${style.color}　「${text.slice(0, 24)}」`,
        );
      }
    });
    return issues;
  };

  /** SVG 文字用的是 fill，不是 color，要另外驗 */
  const findLowContrastSvgText = () => {
    const issues = [];
    document.querySelectorAll('svg text').forEach((el) => {
      const text = el.textContent.trim();
      if (!text) return;

      const style = getComputedStyle(el);
      const fg = parseColor(style.fill);
      if (!fg) return;

      const svg = el.closest('svg');
      const bg = backgroundOf(svg.parentElement);
      const ratio = contrast(composite(fg, bg), bg);

      if (ratio < 4.5) {
        issues.push(
          `${ratio.toFixed(2)} < 4.5　fill ${style.fill}　「${text.slice(0, 24)}」`,
        );
      }
    });
    return issues;
  };

  const stepTitle = () =>
    document.querySelector('header h1')?.textContent ?? '(無頁首)';

  window.__slideAuditOnce = function () {
    return {
      title: stepTitle(),
      overflow: findOverflow(),
      contrast: findLowContrastText(),
      svgContrast: findLowContrastSvgText(),
    };
  };

  window.__slideAudit = async function (base, total, waitMs = 350) {
    const lines = [];
    let failed = 0;

    for (let i = 1; i <= total; i++) {
      location.hash = `${base}?s=${i}`;
      await new Promise((resolve) => setTimeout(resolve, waitMs));

      const result = window.__slideAuditOnce();
      const problems = [
        ...result.overflow.map((m) => `溢出：${m}`),
        ...result.contrast.map((m) => `對比：${m}`),
        ...result.svgContrast.map((m) => `SVG 對比：${m}`),
      ];

      if (problems.length) {
        failed++;
        lines.push(`✗ ${i} 「${result.title}」\n    ` + problems.join('\n    '));
      } else {
        lines.push(`✓ ${i} 「${result.title}」`);
      }
    }

    const summary =
      failed === 0
        ? `\n全部 ${total} 頁通過。`
        : `\n${failed} / ${total} 頁有問題，必須修到全部通過。`;

    return lines.join('\n') + summary;
  };

  return 'ready — 執行 await __slideAudit("#/路由", 頁數)';
})();
