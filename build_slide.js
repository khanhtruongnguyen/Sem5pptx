// =============================================================================
// TRÌNH BIÊN DỊCH SLIDE MINH HỌA PRO (build_slide.js)
// Hỗ trợ tự động:
// - Nhúng inline các vector minh họa (core_assets/art/*.svg) với biến đổi màu sắc theo slide
// - Tự động tạo các họa tiết vẽ tay: Sun, Cloud, Hills, Bookstack, Underlines, Rings, Numeral Scribbles, Arrows, Sparks
// - Nhúng font chữ offline cục bộ (core_assets/fonts)
// Cách dùng:
//   node build_slide.js                    -> Biên dịch template_chuan.html ra slide_moi.html
//   node build_slide.js my_template.html my_output.html
// =============================================================================

const fs = require('fs');
const path = require('path');

const base = __dirname;
const inputFile = process.argv[2] ? path.resolve(process.argv[2]) : path.join(base, 'template_chuan.html');
const outputFile = process.argv[3] ? path.resolve(process.argv[3]) : path.join(base, 'slide_moi.html');

if (!fs.existsSync(inputFile)) {
  console.error('[LỖI] Không tìm thấy file template đầu vào:', inputFile);
  process.exit(1);
}

const art = name => {
  const artPath = path.join(base, 'core_assets', 'art', name + '.svg');
  if (!fs.existsSync(artPath)) {
    console.warn('[CẢNH BÁO] Không tìm thấy file art:', name);
    return `<!-- ART NOT FOUND: ${name} -->`;
  }
  let s = fs.readFileSync(artPath, 'utf8');
  s = s.replace(/<\?xml[^>]*\?>/g, '').trim();
  return s.replace('<svg ', '<svg class="art-svg" role="img" aria-label="' + name.replace(/-/g, ' ') + ' illustration" ');
};

const decor = {
  ART: n => art(n),

  // Mặt trời ấm áp có tia nắng xoay chậm mượt mà
  SUN: () => {
    let rays = '';
    const N = 16;
    for (let i = 0; i < N; i++) {
      const long = i % 2 === 0;
      rays += `<line x1="200" y1="${long ? 18 : 34}" x2="200" y2="${long ? 70 : 62}" stroke="#f4a62a" stroke-width="${long ? 15 : 12}" stroke-linecap="round" transform="rotate(${(360 / N) * i} 200 200)"/>`;
    }
    return `<svg class="sun-svg" viewBox="0 0 400 400" aria-hidden="true">
      <g class="sun-rays">${rays}</g>
      <circle cx="200" cy="200" r="112" fill="#f9c846"/>
      <circle cx="200" cy="200" r="112" fill="url(#sunShade)"/>
      <path d="M130 150 C 150 112, 196 98, 232 108" stroke="#fff3bf" stroke-width="12" stroke-linecap="round" fill="none" opacity=".75"/>
      <defs><radialGradient id="sunShade" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffe58a" stop-opacity=".9"/><stop offset="1" stop-color="#f08a24" stop-opacity=".55"/></radialGradient></defs>
    </svg>`;
  },

  // Đám mây bồng bềnh
  CLOUD: () => `<svg viewBox="0 0 240 130" aria-hidden="true"><g fill="#fff"><circle cx="70" cy="84" r="36"/><circle cx="122" cy="62" r="48"/><circle cx="176" cy="86" r="38"/><rect x="48" y="84" width="170" height="38" rx="19"/></g></svg>`,

  // Đồi uốn lượn nhiều tầng chiều sâu
  HILLS: (c1 = '#f4c98e', c2 = '#eab071', c3 = '#d99a58') => `<svg viewBox="0 0 1920 340" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 120 C 240 40, 480 60, 720 130 S 1200 200, 1440 110 S 1760 40, 1920 90 V340 H0Z" fill="${c1}"/>
    <path d="M0 200 C 300 120, 560 170, 860 210 S 1380 270, 1640 190 S 1840 160, 1920 180 V340 H0Z" fill="${c2}"/>
    <path d="M0 272 C 360 232, 700 292, 1040 272 S 1600 232, 1920 282 V340 H0Z" fill="${c3}"/>
  </svg>`,

  // Đường gạch chân vẽ tay tự động chạy hiệu ứng (draw-on underline)
  UL: (c = '#c2410c') => `<svg class="ul" viewBox="0 0 520 26" preserveAspectRatio="none" aria-hidden="true"><path class="draw" pathLength="1" d="M4 16 C 90 4, 170 22, 260 12 S 430 6, 516 14" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/></svg>`,

  // Vòng lặp khoanh chữ viết tay (hand-drawn loop ring)
  RING: (c = '#c2410c') => `<svg class="ring" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path class="dr" pathLength="1" d="M20 58 C 8 22, 120 4, 206 12 C 290 22, 300 66, 214 84 C 130 100, 24 92, 16 52 C 14 34, 40 20, 70 14" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Số thứ tự trong vòng khoanh tròn (handwritten number circle)
  NUM: (c = '#c2410c') => `<svg class="numring" viewBox="0 0 84 84" aria-hidden="true"><path class="dr" pathLength="1" d="M44 6 C 68 4, 80 26, 77 46 C 74 68, 54 80, 34 77 C 13 73, 4 52, 8 33 C 12 15, 30 7, 52 11" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`,

  // Mũi tên chỉ hướng vẽ tay
  ARROW: (c = '#2a2433') => `<svg class="arrow" viewBox="0 0 150 120" aria-hidden="true"><path class="dr" pathLength="1" d="M6 8 C 60 4, 112 30, 124 96" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path class="dr" pathLength="1" d="M104 76 L124 100 L146 80" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Ngôi sao lấp lánh (sparkle)
  SPARK: (c = '#f59e0b') => `<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9Z" fill="${c}"/></svg>`,

  // Đàn chim bay lượn trên trời
  BIRDS: () => `<svg viewBox="0 0 220 90" aria-hidden="true" fill="none" stroke="#3b3550" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 40 Q 24 8 44 36 Q 62 6 82 38"/><path d="M120 62 Q 134 40 150 58 Q 164 38 180 60" stroke-width="4"/></svg>`,

  // Nhánh lá học thuật
  LEAF: (c = '#2d6a4f') => `<svg viewBox="0 0 120 170" aria-hidden="true"><path d="M60 160 C 56 118, 64 74, 60 22" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M60 118 C 28 108, 18 78, 26 62 C 52 70, 62 94, 60 118Z" fill="${c}"/><path d="M60 84 C 92 74, 102 48, 94 32 C 68 40, 58 64, 60 84Z" fill="${c}" opacity=".78"/><path d="M60 24 C 46 12, 50 0, 60 -6 C 70 0, 74 12, 60 24Z" fill="${c}"/></svg>`,

  // Dấu kiểm tích vẽ tay
  CHECK: (c = '#2d6a4f') => `<svg class="chk" viewBox="0 0 28 28" style="width:28px;height:28px;vertical-align:middle;flex:none;display:inline-block;margin-right:8px" aria-hidden="true"><path d="M4 14 L10 20 L24 6" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Chồng sách 3 cuốn với mầm cây xanh mọc trên đỉnh
  BOOKSTACK: () => `<svg viewBox="0 0 320 250" aria-hidden="true">
    <ellipse cx="160" cy="232" rx="140" ry="12" fill="#000" opacity=".12"/>
    <g>
      <rect x="22" y="168" width="270" height="56" rx="10" fill="#c2410c"/>
      <rect x="44" y="176" width="240" height="40" rx="4" fill="#fff4dd"/>
      <path d="M58 188 H270 M58 198 H258 M58 208 H266" stroke="#e8d5ae" stroke-width="3" stroke-linecap="round"/>
      <rect x="22" y="168" width="26" height="56" rx="10" fill="#9a3412"/>
      <rect x="30" y="184" width="10" height="24" rx="3" fill="#fbbf24"/>
    </g>
    <g transform="rotate(-2 160 150)">
      <rect x="48" y="112" width="232" height="52" rx="10" fill="#2d6a4f"/>
      <rect x="68" y="120" width="204" height="36" rx="4" fill="#f4f8ef"/>
      <path d="M80 132 H258 M80 142 H246" stroke="#d3e2cf" stroke-width="3" stroke-linecap="round"/>
      <rect x="48" y="112" width="24" height="52" rx="10" fill="#1f4e3a"/>
      <rect x="56" y="126" width="8" height="22" rx="3" fill="#fde68a"/>
    </g>
    <g transform="rotate(3 170 90)">
      <rect x="70" y="64" width="200" height="46" rx="9" fill="#1e3a8a"/>
      <rect x="90" y="71" width="172" height="32" rx="4" fill="#fff"/>
      <path d="M102 82 H250 M102 92 H238" stroke="#d9e1f2" stroke-width="3" stroke-linecap="round"/>
      <rect x="70" y="64" width="22" height="46" rx="9" fill="#172b66"/>
    </g>
    <path d="M168 66 C 166 44, 172 30, 170 10" fill="none" stroke="#2d6a4f" stroke-width="5" stroke-linecap="round"/>
    <path d="M170 38 C 148 36, 138 20, 142 8 C 162 10, 170 24, 170 38Z" fill="#3a8c66"/>
    <path d="M170 24 C 192 22, 202 8, 198 -4 C 178 -2, 170 10, 170 24Z" fill="#2d6a4f"/>
  </svg>`
};

console.log('-> Đang đọc template:', inputFile);
let tpl = fs.readFileSync(inputFile, 'utf8');

// Nhúng fonts.css
const fontsCssPath = path.join(base, 'core_assets', 'fonts.css');
if (fs.existsSync(fontsCssPath)) {
  let fonts = fs.readFileSync(fontsCssPath, 'utf8').replace(/url\('fonts\//g, "url('core_assets/fonts/");
  tpl = tpl.replace('/*{{FONTS}}*/', fonts);
}

// Thay thế tất cả placeholder decor
tpl = tpl.replace(/\{\{(\w+)(?::([^}]*))?\}\}/g, (m, name, args) => {
  if (!decor[name]) {
    console.warn('[CẢNH BÁO] Không rõ placeholder:', name);
    return m;
  }
  return decor[name](...(args ? args.split('|') : []));
});

fs.writeFileSync(outputFile, tpl, 'utf8');
console.log('[THÀNH CÔNG] Đã tạo file slide hoàn chỉnh:', outputFile);
console.log('Dung lượng:', (tpl.length / 1024).toFixed(1) + ' KB');
