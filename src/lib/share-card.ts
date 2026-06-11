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
    description: "Untuk absen hari ini dengan tone ringan dan suportif.",
    label: "Daily Check-in",
    value: "daily",
  },
  {
    description: "Untuk merayakan rentetan tanpa rokok yang sedang berjalan.",
    label: "Streak",
    value: "streak",
  },
  {
    description: "Untuk menampilkan uang dan batang yang berhasil dihindari.",
    label: "Savings",
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

function wrapText(text: string, maxLength = 30) {
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

  return lines.slice(0, 4);
}

function renderLines(lines: string[], x: number, y: number, size: number, color: string) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * (size + 18)}" fill="${color}" font-size="${size}" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join("");
}

function getDisplayName(profile: Profile | null, privacy: ShareCardPrivacy) {
  if (!privacy.showName) {
    return "Teman StopMerokok";
  }

  return profile?.name || "Teman StopMerokok";
}

function getDailyCopy(status: CheckinStatus, dayNumber: number) {
  if (status === "smoke_free") {
    return {
      accent: "Satu napas lebih lega",
      body: "Hari ini aku berhasil bebas rokok.",
      emoji: "🌱",
      stat: `Hari ke-${dayNumber}`,
      title: `Hari ke-${dayNumber} tercatat`,
    };
  }

  if (status === "reduced") {
    return {
      accent: "Progress kecil tetap progress",
      body: "Hari ini aku berhasil mengurangi.",
      emoji: "🌿",
      stat: `Hari ke-${dayNumber}`,
      title: `Hari ke-${dayNumber} tercatat`,
    };
  }

  return {
    accent: "Tidak sempurna, tapi belum menyerah",
    body: "Hari ini aku mulai lagi.",
    emoji: "🤍",
    stat: "Mulai lagi",
    title: "Langkah hari ini tercatat",
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
      return `${namePrefix}Aku lagi mencoba berhenti merokok pelan-pelan. Hari ini satu langkah kecil tercatat. 🌱`;
    }

    if (data.latestStatus === "reduced") {
      return `${namePrefix}Hari ini belum sempurna, tapi aku berhasil mengurangi. Progress kecil tetap progress.`;
    }

    return `${namePrefix}Aku mulai lagi hari ini. Tidak sempurna, tapi belum menyerah.`;
  }

  if (template === "streak") {
    return `${namePrefix}Beberapa hari terakhir tidak selalu mudah, tapi aku masih berjalan.`;
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
  const savedMoney = formatRupiah(data.summary.savedMoney);
  const avoidedSticks = Math.round(data.summary.avoidedSticks);

  if (template === "streak") {
    const streakValue = showNumbers ? `${data.summary.currentStreak || data.summary.longestStreak}` : "••";
    const title = showNumbers
      ? `${streakValue} Hari Perjalanan`
      : "Perjalanan masih berjalan";

    return cardFrame({
      accent: "#9DE5BD",
      background: "#10231D",
      body: "Pelan-pelan, satu hari dalam satu waktu.",
      footer: name,
      foreground: "#FFFFFF",
      metric: streakValue,
      metricLabel: showNumbers ? "hari berturut-turut" : "rentetan disembunyikan",
      title,
      variant: "dark",
    });
  }

  if (template === "savings") {
    return cardFrame({
      accent: "#36798D",
      background: "#F7FBF9",
      body: showNumbers
        ? `Aku sudah menghindari ${avoidedSticks} batang rokok.`
        : "Ada uang dan energi yang pelan-pelan kembali punya arah.",
      footer: name,
      foreground: "#063D43",
      metric: showNumbers ? savedMoney : "Progress",
      metricLabel: showNumbers ? "terselamatkan" : "angka disembunyikan",
      title: "Uang yang dulu jadi asap, sekarang bisa jadi sesuatu yang berarti.",
      variant: "light",
    });
  }

  return cardFrame({
    accent: data.latestStatus === "relapsed" ? "#B8C7D6" : "#4FAE7B",
    background: "#EEF8F5",
    body: dailyCopy.body,
    footer: `${name} • ${statusLabels[data.latestStatus]}`,
    foreground: "#063D43",
    metric: showNumbers ? dailyCopy.stat : dailyCopy.emoji,
    metricLabel: dailyCopy.accent,
    title: dailyCopy.title,
    variant: "calm",
  });
}

function cardFrame({
  accent,
  background,
  body,
  footer,
  foreground,
  metric,
  metricLabel,
  title,
  variant,
}: {
  accent: string;
  background: string;
  body: string;
  footer: string;
  foreground: string;
  metric: string;
  metricLabel: string;
  title: string;
  variant: "calm" | "dark" | "light";
}) {
  const titleLines = renderLines(wrapText(title, 25), 108, 560, 58, foreground);
  const bodyLines = renderLines(wrapText(body, 34), 108, 875, 38, variant === "dark" ? "#D8E8E3" : "#315E62");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <style>
    text {
      font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Arial, sans-serif;
      letter-spacing: 0;
    }
  </style>
  <rect width="1080" height="1920" fill="${background}"/>
  <circle cx="910" cy="220" r="260" fill="${accent}" opacity="${variant === "dark" ? "0.22" : "0.18"}"/>
  <circle cx="120" cy="1700" r="330" fill="#42A9E8" opacity="${variant === "dark" ? "0.16" : "0.11"}"/>
  <rect x="64" y="72" width="952" height="1776" rx="72" fill="${variant === "dark" ? "#123B3F" : "#FFFFFF"}" opacity="${variant === "calm" ? "0.78" : "0.92"}"/>
  <rect x="108" y="128" width="248" height="72" rx="36" fill="${variant === "dark" ? "#FFFFFF" : "#E3F3F7"}" opacity="${variant === "dark" ? "0.12" : "1"}"/>
  <circle cx="150" cy="164" r="18" fill="${accent}"/>
  <path d="M153 167 C190 154 207 123 218 96 C224 144 203 181 153 167 Z" fill="${variant === "dark" ? "#9DE5BD" : "#4FAE7B"}"/>
  <text x="188" y="174" fill="${variant === "dark" ? "#FFFFFF" : "#063D43"}" font-size="28" font-weight="800">StopMerokok</text>
  <text x="108" y="386" fill="${accent}" font-size="34" font-weight="900" letter-spacing="3">${escapeXml(metricLabel.toUpperCase())}</text>
  <text x="108" y="500" fill="${foreground}" font-size="${metric.length > 12 ? "82" : "116"}" font-weight="900">${escapeXml(metric)}</text>
  ${titleLines}
  ${bodyLines}
  <rect x="108" y="1280" width="864" height="260" rx="44" fill="${variant === "dark" ? "#FFFFFF" : "#F7FBF9"}" opacity="${variant === "dark" ? "0.08" : "1"}"/>
  <text x="156" y="1365" fill="${variant === "dark" ? "#D8E8E3" : "#315E62"}" font-size="30" font-weight="800">Progress ini milikku.</text>
  <text x="156" y="1430" fill="${variant === "dark" ? "#D8E8E3" : "#315E62"}" font-size="30" font-weight="700">Aku bebas membagikannya atau</text>
  <text x="156" y="1485" fill="${variant === "dark" ? "#D8E8E3" : "#315E62"}" font-size="30" font-weight="700">menyimpannya sendiri.</text>
  <text x="108" y="1735" fill="${variant === "dark" ? "#D8E8E3" : "#315E62"}" font-size="28" font-weight="800">${escapeXml(footer)}</text>
  <text x="108" y="1794" fill="${variant === "dark" ? "#9DE5BD" : "#4FAE7B"}" font-size="28" font-weight="900">Kartu Perjalanan</text>
</svg>`;
}
