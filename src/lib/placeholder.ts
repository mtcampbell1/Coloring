// Creates SVG placeholder "generated" images for coloring pages and the cover.
// These deterministic SVGs stand in for results from the real image provider
// (e.g. OpenAI gpt-image-2). Swap `generatePage()` in `store.ts` to call the
// provider and return a real image URL.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface LineArtOptions {
  seed: string;
  title: string;
  characters: string[];
  setting: string;
  complexity: number; // 1..5
  caption?: string;
}

export function lineArtSVG(opts: LineArtOptions): string {
  const r = rng(hash(opts.seed));
  const w = 600;
  const h = 800;
  const stroke = "#1F2937";
  const sw = opts.complexity <= 2 ? 4.5 : opts.complexity === 3 ? 3.5 : 2.6;

  const ground = `M 30 ${h - 80} Q ${w / 2} ${h - 50} ${w - 30} ${h - 90}`;
  const sun = `<circle cx="${w - 110}" cy="110" r="56" fill="white" stroke="${stroke}" stroke-width="${sw}"/>
    ${Array.from({ length: 8 })
      .map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = w - 110 + Math.cos(a) * 78;
        const y1 = 110 + Math.sin(a) * 78;
        const x2 = w - 110 + Math.cos(a) * 110;
        const y2 = 110 + Math.sin(a) * 110;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
      })
      .join("")}`;

  const cloud = (cx: number, cy: number) => `
    <g stroke="${stroke}" stroke-width="${sw}" fill="white">
      <ellipse cx="${cx}" cy="${cy}" rx="38" ry="22"/>
      <ellipse cx="${cx + 32}" cy="${cy - 8}" rx="30" ry="20"/>
      <ellipse cx="${cx - 28}" cy="${cy - 4}" rx="26" ry="18"/>
    </g>`;

  const character = (cx: number, cy: number, scale: number, label: string) => {
    const s = scale;
    return `
      <g transform="translate(${cx} ${cy}) scale(${s})" stroke="${stroke}" stroke-width="${sw / s}" fill="white" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="0" cy="-72" r="44"/>
        <circle cx="-14" cy="-78" r="4" fill="${stroke}"/>
        <circle cx="14" cy="-78" r="4" fill="${stroke}"/>
        <path d="M -12 -58 Q 0 -50 12 -58" fill="none"/>
        <path d="M -36 -90 Q 0 -130 36 -90" />
        <path d="M -38 -28 Q -50 30 -36 90 L 36 90 Q 50 30 38 -28 Q 0 -10 -38 -28 Z"/>
        <line x1="-30" y1="0" x2="-60" y2="40"/>
        <line x1="30" y1="0" x2="60" y2="40"/>
        <text x="0" y="120" font-family="Inter, sans-serif" font-size="16" text-anchor="middle" fill="${stroke}" stroke="none">${label}</text>
      </g>`;
  };

  const pet = (cx: number, cy: number) => `
    <g transform="translate(${cx} ${cy})" stroke="${stroke}" stroke-width="${sw}" fill="white" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="60" ry="36"/>
      <circle cx="58" cy="-14" r="26"/>
      <path d="M 50 -32 L 46 -52 L 60 -42 Z"/>
      <path d="M 70 -32 L 78 -52 L 80 -36 Z"/>
      <circle cx="66" cy="-16" r="3" fill="${stroke}"/>
      <line x1="-50" y1="20" x2="-50" y2="40"/>
      <line x1="-20" y1="22" x2="-20" y2="42"/>
      <line x1="20" y1="22" x2="20" y2="42"/>
      <line x1="50" y1="22" x2="50" y2="42"/>
      <path d="M -64 -10 Q -86 -22 -76 -2"/>
    </g>`;

  // Setting flourishes
  const flourishes: string[] = [];
  flourishes.push(sun);
  flourishes.push(cloud(120, 130));
  flourishes.push(cloud(280, 90));
  if (opts.complexity >= 3) flourishes.push(cloud(420, 150));

  // simple "vet building" if vet keyword found
  const setting = (opts.setting || "").toLowerCase();
  if (setting.includes("vet") || setting.includes("clinic")) {
    flourishes.push(`
      <g stroke="${stroke}" stroke-width="${sw}" fill="white">
        <rect x="60" y="${h - 360}" width="280" height="200" rx="6"/>
        <polygon points="60,${h - 360} 200,${h - 430} 340,${h - 360}"/>
        <rect x="160" y="${h - 280}" width="80" height="100"/>
        <rect x="80" y="${h - 340}" width="50" height="50"/>
        <rect x="270" y="${h - 340}" width="50" height="50"/>
        <line x1="200" y1="${h - 410}" x2="200" y2="${h - 380}" stroke-width="${sw + 1}"/>
        <line x1="186" y1="${h - 395}" x2="214" y2="${h - 395}" stroke-width="${sw + 1}"/>
      </g>`);
  } else if (setting.includes("park") || setting.includes("outdoor")) {
    flourishes.push(`
      <g stroke="${stroke}" stroke-width="${sw}" fill="white">
        <path d="M 80 ${h - 180} L 80 ${h - 320}"/>
        <circle cx="80" cy="${h - 340}" r="40"/>
        <path d="M 460 ${h - 180} L 460 ${h - 280}"/>
        <circle cx="460" cy="${h - 300}" r="34"/>
      </g>`);
  } else if (setting.includes("home") || setting.includes("kitchen") || setting.includes("bedroom")) {
    flourishes.push(`
      <g stroke="${stroke}" stroke-width="${sw}" fill="white">
        <rect x="60" y="${h - 280}" width="480" height="180"/>
        <rect x="100" y="${h - 250}" width="100" height="100"/>
        <rect x="240" y="${h - 250}" width="100" height="100"/>
        <rect x="380" y="${h - 250}" width="100" height="100"/>
      </g>`);
  }

  // Characters in scene
  const charNodes: string[] = [];
  const labels = opts.characters.length ? opts.characters : ["Character"];
  if (labels.length === 1) {
    charNodes.push(character(w / 2, h / 2 + 40, 1.2, labels[0]));
  } else if (labels.length === 2) {
    charNodes.push(character(w / 2 - 100, h / 2 + 40, 1.0, labels[0]));
    charNodes.push(pet(w / 2 + 110, h / 2 + 70));
    if (labels[1]) {
      charNodes.push(`<text x="${w / 2 + 110}" y="${h / 2 + 200}" font-family="Inter, sans-serif" font-size="16" text-anchor="middle" fill="${stroke}">${labels[1]}</text>`);
    }
  } else {
    charNodes.push(character(150, h / 2 + 60, 0.85, labels[0] ?? ""));
    charNodes.push(character(w / 2, h / 2 + 30, 0.95, labels[1] ?? ""));
    charNodes.push(character(w - 150, h / 2 + 60, 0.85, labels[2] ?? ""));
  }

  // Optional caption
  const caption = opts.caption
    ? `<text x="${w / 2}" y="${h - 30}" text-anchor="middle" font-family="Fraunces, serif" font-size="22" fill="${stroke}">${escape(opts.caption)}</text>`
    : "";

  // Random little stars when complex
  const stars: string[] = [];
  if (opts.complexity >= 4) {
    for (let i = 0; i < 6; i++) {
      const x = 40 + r() * (w - 80);
      const y = 40 + r() * (h - 200);
      stars.push(
        `<g transform="translate(${x} ${y})" stroke="${stroke}" stroke-width="${sw - 0.5}" fill="white">
           <path d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 6 10 L 0 5 L -6 10 L -4 2 L -10 -3 L -3 -3 Z"/>
         </g>`,
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="white"/>
  ${flourishes.join("\n")}
  <path d="${ground}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
  ${charNodes.join("\n")}
  ${stars.join("\n")}
  ${caption}
  <text x="30" y="${h - 12}" font-family="Inter, sans-serif" font-size="11" fill="#9CA3AF">${escape(opts.title)}</text>
</svg>`;
}

export interface CoverOptions {
  title: string;
  subtitle?: string;
  authorName?: string;
  characters: string[];
  palette?: string[];
}

export function coverSVG(opts: CoverOptions): string {
  const w = 700;
  const h = 900;
  const palette = opts.palette ?? ["#FFB585", "#A9E5C0", "#8FC1FB", "#D5BEFF", "#FFE7D6"];
  const stroke = "#1F2937";

  const blob = (cx: number, cy: number, rx: number, ry: number, fill: string, rot: number) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rot} ${cx} ${cy})"/>`;

  const character = (cx: number, cy: number, scale: number, skin: string, shirt: string) => `
    <g transform="translate(${cx} ${cy}) scale(${scale})" stroke="${stroke}" stroke-width="${3 / scale}" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="0" cy="-70" rx="44" ry="48" fill="${skin}"/>
      <path d="M -36 -90 Q 0 -130 36 -90" fill="#5C3A2E"/>
      <circle cx="-14" cy="-72" r="4" fill="${stroke}"/>
      <circle cx="14" cy="-72" r="4" fill="${stroke}"/>
      <path d="M -10 -54 Q 0 -46 10 -54" fill="none"/>
      <path d="M -38 -28 Q -50 30 -36 90 L 36 90 Q 50 30 38 -28 Q 0 -10 -38 -28 Z" fill="${shirt}"/>
      <circle cx="0" cy="0" r="6" fill="white" stroke="${stroke}" stroke-width="2"/>
    </g>`;

  const pet = (cx: number, cy: number, fur: string) => `
    <g transform="translate(${cx} ${cy})" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="62" ry="38" fill="${fur}"/>
      <circle cx="60" cy="-12" r="28" fill="${fur}"/>
      <path d="M 50 -34 L 46 -54 L 60 -42 Z" fill="${fur}"/>
      <path d="M 72 -34 L 80 -54 L 82 -38 Z" fill="${fur}"/>
      <circle cx="68" cy="-14" r="3" fill="${stroke}"/>
      <line x1="-50" y1="22" x2="-50" y2="42"/>
      <line x1="-20" y1="24" x2="-20" y2="44"/>
      <line x1="20" y1="24" x2="20" y2="44"/>
      <line x1="50" y1="24" x2="50" y2="44"/>
    </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette[2]}"/>
      <stop offset="100%" stop-color="${palette[4]}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${blob(120, 760, 220, 110, palette[1], -10)}
  ${blob(560, 760, 200, 90, palette[0], 8)}
  ${blob(640, 200, 110, 80, palette[3], 16)}
  <circle cx="120" cy="180" r="60" fill="${palette[0]}"/>
  ${character(280, 580, 1.2, "#FFE7D6", palette[0])}
  ${pet(440, 660, palette[1])}
  <rect x="60" y="60" width="${w - 120}" height="120" rx="20" fill="white" stroke="${stroke}" stroke-width="3"/>
  <text x="${w / 2}" y="118" text-anchor="middle" font-family="Fraunces, serif" font-weight="700" font-size="42" fill="${stroke}">${escape(opts.title)}</text>
  ${opts.subtitle
      ? `<text x="${w / 2}" y="158" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="${stroke}" opacity="0.75">${escape(opts.subtitle)}</text>`
      : `<text x="${w / 2}" y="158" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="${stroke}" opacity="0.55">A Coloring Adventure</text>`}
  ${opts.authorName
      ? `<text x="${w / 2}" y="${h - 40}" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="${stroke}">by ${escape(opts.authorName)}</text>`
      : ""}
</svg>`;
}

function escape(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function characterSheetSVG(name: string, palette: string[] = ["#FFE7D6", "#FFB585", "#A9E5C0"]): string {
  const w = 1000;
  const h = 700;
  const stroke = "#1F2937";
  const tile = (x: number, y: number, label: string, body: string) => `
    <g transform="translate(${x} ${y})">
      <rect width="220" height="280" rx="14" fill="white" stroke="${stroke}" stroke-width="2"/>
      <text x="110" y="270" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" fill="${stroke}">${label}</text>
      ${body}
    </g>`;
  const figure = (skinTone: string, shirt: string, side: number) => `
    <g transform="translate(110 70) scale(0.85) rotate(${side === 1 ? 0 : side === 2 ? 0 : 0})" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="0" cy="60" rx="40" ry="44" fill="${skinTone}"/>
      <path d="M -32 40 Q 0 0 32 40" fill="#5C3A2E"/>
      <circle cx="-12" cy="60" r="3" fill="${stroke}"/>
      <circle cx="12" cy="60" r="3" fill="${stroke}"/>
      <path d="M -8 78 Q 0 86 8 78" fill="none"/>
      <path d="M -34 110 Q -46 170 -32 220 L 32 220 Q 46 170 34 110 Q 0 130 -34 110 Z" fill="${shirt}"/>
    </g>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#FFFDF8"/>
  <text x="32" y="44" font-family="Fraunces, serif" font-size="28" fill="${stroke}">${escape(name)} - Character Sheet</text>
  ${tile(32, 80, "Front", figure(palette[0], palette[1], 1))}
  ${tile(280, 80, "Side", figure(palette[0], palette[1], 2))}
  ${tile(528, 80, "Back", figure(palette[0], palette[2], 3))}
  ${tile(776, 80, "Pose A", figure(palette[0], palette[1], 1))}
  ${tile(32, 380, "Smile", figure(palette[0], palette[1], 1))}
  ${tile(280, 380, "Surprised", figure(palette[0], palette[1], 1))}
  ${tile(528, 380, "Worried", figure(palette[0], palette[2], 1))}
  ${tile(776, 380, "Pose B", figure(palette[0], palette[2], 1))}
</svg>`;
}
