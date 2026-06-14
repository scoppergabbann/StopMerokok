import {
  formatRupiah,
  statusLabels,
  type CheckinStatus,
  type Profile,
  type Summary,
} from "@/lib/mvp-store";

export type ShareCardTemplate = "daily" | "streak" | "savings";

export type ShareCardPrivacy = {
  showName: boolean;
  showNumbers: boolean;
};

export type ShareCardData = {
  dayNumber: number;
  latestStatus: CheckinStatus;
  profile: Profile | null;
  summary: Summary;
};

export const shareCardTemplates: {
  description: string;
  label: string;
  value: ShareCardTemplate;
}[] = [
  {
    description: "Clean Premium untuk check-in harian yang tenang.",
    label: "Clean Premium",
    value: "daily",
  },
  {
    description: "Soft Wellness untuk merayakan rentetan aktif.",
    label: "Soft Wellness",
    value: "streak",
  },
  {
    description: "Minimal Stats untuk uang dan batang yang dihindari.",
    label: "Minimal Stats",
    value: "savings",
  },
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text: string, maxLength = 30, maxLines = 3) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function renderLines({
  color,
  fontWeight = 800,
  lineGap = 10,
  lines,
  size,
  x,
  y,
}: {
  color: string;
  fontWeight?: number;
  lineGap?: number;
  lines: string[];
  size: number;
  x: number;
  y: number;
}) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * (size + lineGap)}" fill="${color}" font-size="${size}" font-weight="${fontWeight}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function getDisplayName(profile: Profile | null, privacy: ShareCardPrivacy) {
  if (!privacy.showName) {
    return "Anonim";
  }

  return profile?.name || "Teman StopMerokok";
}

function getDailyCopy(status: CheckinStatus, dayNumber: number) {
  if (status === "smoke_free") {
    return {
      eyebrow: "Daily Check-in",
      metric: `Hari ${dayNumber}`,
      metricLabel: "bebas rokok tercatat",
      message: "Satu hari lagi, satu napas lebih lega.",
      title: "Hari ini berhasil dilewati.",
    };
  }

  if (status === "reduced") {
    return {
      eyebrow: "Daily Check-in",
      metric: `Hari ${dayNumber}`,
      metricLabel: "progress tercatat",
      message: "Belum harus sempurna. Mengurangi tetap progress.",
      title: "Hari ini tetap bergerak.",
    };
  }

  return {
    eyebrow: "Comeback",
    metric: "Mulai lagi",
    metricLabel: "hadir kembali",
    message: "Mulai lagi bukan gagal. Itu tanda belum menyerah.",
    title: "Hari berat tetap tercatat.",
  };
}

export function getShareCaption(
  template: ShareCardTemplate,
  data: ShareCardData,
  privacy: ShareCardPrivacy,
) {
  const namePrefix = privacy.showName && data.profile?.name ? `${data.profile.name}: ` : "";

  if (template === "daily") {
    if (data.latestStatus === "smoke_free") {
      return `${namePrefix}Hari ini satu langkah kecil tercatat. Satu napas lebih lega.`;
    }

    if (data.latestStatus === "reduced") {
      return `${namePrefix}Belum harus sempurna. Mengurangi tetap progress.`;
    }

    return `${namePrefix}Aku mulai lagi hari ini. Tidak sempurna, tapi belum menyerah.`;
  }

  if (template === "streak") {
    return `${namePrefix}Pelan-pelan, satu hari dalam satu waktu. Perjalanan ini tetap berjalan.`;
  }

  return `${namePrefix}Uang yang dulu jadi asap, sekarang mulai punya arah.`;
}

export function buildShareCardSvg(
  template: ShareCardTemplate,
  data: ShareCardData,
  privacy: ShareCardPrivacy,
) {
  const name = getDisplayName(data.profile, privacy);
  const showNumbers = privacy.showNumbers;
  const dailyCopy = getDailyCopy(data.latestStatus, data.dayNumber);
  const streak = data.summary.currentStreak || data.summary.longestStreak;
  const savedMoney = formatRupiah(data.summary.savedMoney);
  const avoidedSticks = Math.round(data.summary.avoidedSticks);

  if (template === "streak") {
    return renderSoftWellnessCard({
      footer: name,
      hidden: !showNumbers,
      metric: showNumbers ? `${streak}` : "--",
      metricSuffix: showNumbers ? "hari" : "rentetan",
      message: "Tidak semua hari mudah, tapi perjalanan ini tetap tercatat.",
      title: showNumbers ? `${streak} Hari Berturut-turut` : "Rentetan masih berjalan",
    });
  }

  if (template === "savings") {
    return renderMinimalStatsCard({
      avoidedSticks,
      footer: name,
      hidden: !showNumbers,
      metric: showNumbers ? savedMoney : "Progress",
      message: showNumbers
        ? `${avoidedSticks} batang tidak jadi dibeli. Pelan-pelan, uangnya punya arah baru.`
        : "Ada uang dan energi yang pelan-pelan kembali punya arah.",
      title: "Uang yang dulu jadi asap.",
    });
  }

  return renderCleanPremiumCard({
    eyebrow: dailyCopy.eyebrow,
    footer: `${name} - ${statusLabels[data.latestStatus]}`,
    hidden: !showNumbers,
    metric: showNumbers ? dailyCopy.metric : "Hari ini",
    metricLabel: showNumbers ? dailyCopy.metricLabel : "angka disembunyikan",
    message: dailyCopy.message,
    title: dailyCopy.title,
  });
}

function brandHeader(x = 72, y = 54, color = "#123B3F", muted = "#4FAE7B") {
  return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="252" height="58" rx="29" fill="#FFFFFF" opacity="0.78"/>
      <path d="M34 35 C62 25 78 10 90 -10 C91 28 72 51 34 35 Z" fill="${muted}" opacity="0.94"/>
      <path d="M24 38 C49 50 72 50 96 32" fill="none" stroke="#42A9E8" stroke-width="8" stroke-linecap="round"/>
      <circle cx="29" cy="27" r="6" fill="#F5A623"/>
      <text x="108" y="38" fill="${color}" font-size="24" font-weight="900">StopMerokok</text>
    </g>
  `;
}

function renderCleanPremiumCard({
  eyebrow,
  footer,
  hidden,
  message,
  metric,
  metricLabel,
  title,
}: {
  eyebrow: string;
  footer: string;
  hidden: boolean;
  message: string;
  metric: string;
  metricLabel: string;
  title: string;
}) {
  const titleLines = renderLines({
    color: "#123B3F",
    fontWeight: 950,
    lines: wrapText(title, 21, 2),
    size: 49,
    x: 78,
    y: 329,
  });
  const messageLines = renderLines({
    color: "#426070",
    fontWeight: 750,
    lines: wrapText(message, 38, 2),
    size: 26,
    x: 78,
    y: 451,
  });

  return svgShell(`
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#F7FBF9"/>
        <stop offset="58%" stop-color="#EEF8F5"/>
        <stop offset="100%" stop-color="#F7FBFF"/>
      </linearGradient>
      <linearGradient id="hero" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#DFF3E8"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)"/>
    <circle cx="1038" cy="95" r="230" fill="#DFF3E8" opacity="0.85"/>
    <circle cx="1060" cy="114" r="150" fill="#FFFFFF" opacity="0.52"/>
    <path d="M-60 555 C162 450 330 468 492 565 C682 678 875 638 1265 456" fill="none" stroke="#42A9E8" stroke-width="38" opacity="0.11" stroke-linecap="round"/>
    <rect x="34" y="30" width="1132" height="615" rx="52" fill="#FFFFFF" opacity="0.77"/>
    ${brandHeader()}
    <text x="78" y="187" fill="#36798D" font-size="24" font-weight="950" letter-spacing="2">${escapeXml(eyebrow.toUpperCase())}</text>
    <text x="76" y="277" fill="#123B3F" font-size="${metric.length > 10 ? 58 : 84}" font-weight="950">${escapeXml(metric)}</text>
    <text x="82" y="307" fill="#2F7D57" font-size="22" font-weight="900">${escapeXml(metricLabel)}</text>
    ${titleLines}
    ${messageLines}
    <g transform="translate(732 155)">
      <rect x="0" y="0" width="350" height="300" rx="46" fill="url(#hero)" stroke="#CBEFE0" stroke-width="2"/>
      ${renderProgressRing(252, 96, hidden ? 0.42 : 0.78, "#4FAE7B", "#E3F3F7")}
      ${renderLeaf(70, 168, "#4FAE7B", 0.22, 1.2)}
      <text x="36" y="85" fill="#123B3F" font-size="28" font-weight="950">Kartu Perjalanan</text>
      <text x="36" y="128" fill="#426070" font-size="18" font-weight="800">Progress kecil hari ini</text>
      <rect x="34" y="226" width="280" height="42" rx="21" fill="#FFFFFF" opacity="0.78"/>
      <text x="54" y="254" fill="#2F7D57" font-size="18" font-weight="900">Tenang, bangga, tercatat.</text>
    </g>
    <text x="78" y="592" fill="#123B3F" font-size="24" font-weight="900">${escapeXml(footer)}</text>
    <text x="78" y="626" fill="#6A7E8A" font-size="18" font-weight="750">Kamu bebas membagikan atau menyimpan kartu ini.</text>
  `);
}

function renderSoftWellnessCard({
  footer,
  hidden,
  message,
  metric,
  metricSuffix,
  title,
}: {
  footer: string;
  hidden: boolean;
  message: string;
  metric: string;
  metricSuffix: string;
  title: string;
}) {
  const titleLines = renderLines({
    color: "#123B3F",
    fontWeight: 950,
    lines: wrapText(title, 22, 2),
    size: 48,
    x: 490,
    y: 264,
  });
  const messageLines = renderLines({
    color: "#426070",
    fontWeight: 750,
    lines: wrapText(message, 42, 2),
    size: 25,
    x: 492,
    y: 385,
  });

  return svgShell(`
    <defs>
      <linearGradient id="wellnessBg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#EAF8F1"/>
        <stop offset="50%" stop-color="#F8FCFA"/>
        <stop offset="100%" stop-color="#E3F3F7"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#9DE5BD" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#9DE5BD" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#wellnessBg)"/>
    <circle cx="315" cy="350" r="285" fill="url(#glow)"/>
    <path d="M44 535 C245 420 440 435 620 548 C780 648 970 630 1165 485" fill="none" stroke="#42A9E8" stroke-width="28" opacity="0.17" stroke-linecap="round"/>
    <rect x="34" y="30" width="1132" height="615" rx="52" fill="#FFFFFF" opacity="0.68"/>
    ${brandHeader()}
    <text x="492" y="167" fill="#2F7D57" font-size="24" font-weight="950" letter-spacing="2">SOFT WELLNESS</text>
    <g transform="translate(94 155)">
      <circle cx="180" cy="180" r="150" fill="none" stroke="#DFF3E8" stroke-width="30"/>
      <circle cx="180" cy="180" r="150" fill="none" stroke="#4FAE7B" stroke-width="30" stroke-linecap="round" stroke-dasharray="${hidden ? "190 753" : "650 293"}" transform="rotate(-90 180 180)"/>
      <text x="180" y="173" text-anchor="middle" fill="#123B3F" font-size="${metric.length > 3 ? 70 : 102}" font-weight="950">${escapeXml(metric)}</text>
      <text x="180" y="226" text-anchor="middle" fill="#36798D" font-size="27" font-weight="900">${escapeXml(metricSuffix)}</text>
    </g>
    ${renderLeaf(940, 182, "#4FAE7B", 0.21, 1.4)}
    ${titleLines}
    ${messageLines}
    <rect x="492" y="505" width="488" height="78" rx="39" fill="#FFFFFF" opacity="0.78" stroke="#D7ECE3" stroke-width="2"/>
    <text x="525" y="553" fill="#123B3F" font-size="23" font-weight="900">${escapeXml(footer)}</text>
    <text x="78" y="626" fill="#2F7D57" font-size="24" font-weight="950">Kartu Perjalanan</text>
  `);
}

function renderMinimalStatsCard({
  avoidedSticks,
  footer,
  hidden,
  message,
  metric,
  title,
}: {
  avoidedSticks: number;
  footer: string;
  hidden: boolean;
  message: string;
  metric: string;
  title: string;
}) {
  const messageLines = renderLines({
    color: "#D8E8E3",
    fontWeight: 750,
    lines: wrapText(message, 40, 2),
    size: 24,
    x: 78,
    y: 384,
  });

  return svgShell(`
    <defs>
      <linearGradient id="statsBg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#123B3F"/>
        <stop offset="65%" stop-color="#1F555B"/>
        <stop offset="100%" stop-color="#36798D"/>
      </linearGradient>
      <linearGradient id="statsPanel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.17"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.06"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#statsBg)"/>
    <circle cx="1042" cy="128" r="245" fill="#9DE5BD" opacity="0.14"/>
    <circle cx="145" cy="642" r="275" fill="#42A9E8" opacity="0.12"/>
    <path d="M70 542 C258 432 430 438 606 542 C798 656 970 608 1168 462" fill="none" stroke="#9DE5BD" stroke-width="28" opacity="0.18" stroke-linecap="round"/>
    <rect x="34" y="30" width="1132" height="615" rx="52" fill="url(#statsPanel)" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2"/>
    ${brandHeader(72, 54, "#FFFFFF", "#9DE5BD")}
    <text x="78" y="187" fill="#9DE5BD" font-size="24" font-weight="950" letter-spacing="2">MINIMAL STATS</text>
    <text x="76" y="292" fill="#FFFFFF" font-size="${metric.length > 11 ? 62 : 90}" font-weight="950">${escapeXml(metric)}</text>
    <text x="80" y="330" fill="#B8F1CE" font-size="23" font-weight="900">${escapeXml(hidden ? "angka disembunyikan" : "uang terselamatkan")}</text>
    <text x="78" y="466" fill="#FFFFFF" font-size="50" font-weight="950">${escapeXml(title)}</text>
    ${messageLines}
    <g transform="translate(760 172)">
      <rect x="0" y="0" width="330" height="296" rx="48" fill="#FFFFFF" opacity="0.1"/>
      <text x="42" y="82" fill="#D8E8E3" font-size="21" font-weight="850">Batang dihindari</text>
      <text x="42" y="172" fill="#FFFFFF" font-size="76" font-weight="950">${escapeXml(hidden ? "--" : String(avoidedSticks))}</text>
      <line x1="42" y1="210" x2="288" y2="210" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="2"/>
      <text x="42" y="257" fill="#B8F1CE" font-size="25" font-weight="900">arah baru lebih sehat</text>
    </g>
    <text x="78" y="590" fill="#D8E8E3" font-size="23" font-weight="900">${escapeXml(footer)}</text>
    <text x="78" y="626" fill="#9DE5BD" font-size="24" font-weight="950">Kartu Perjalanan</text>
  `);
}

function renderLeaf(x: number, y: number, color: string, opacity: number, scale = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">
      <path d="M8 82 C118 42 152 -32 174 -118 C202 42 132 138 8 82 Z" fill="${color}"/>
      <path d="M24 75 C83 37 124 -9 163 -89" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
    </g>
  `;
}

function renderProgressRing(
  cx: number,
  cy: number,
  progress: number,
  color: string,
  track: string,
) {
  const radius = 58;
  const circumference = Math.round(2 * Math.PI * radius);
  const active = Math.round(circumference * progress);

  return `
    <g>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${track}" stroke-width="15"/>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round" stroke-dasharray="${active} ${circumference - active}" transform="rotate(-90 ${cx} ${cy})"/>
    </g>
  `;
}

function svgShell(content: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <style>
    text {
      font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Arial, sans-serif;
      letter-spacing: 0;
    }
  </style>
  ${content}
</svg>`;
}
